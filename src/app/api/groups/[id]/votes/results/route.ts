import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  VoteAPIResponse,
  VotingResults,
  HotelVoteSummary,
} from "@/services/group/voting/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check if user is member of the group
    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, name, status, selected_hotel_id, selected_hotel_data")
      .eq("id", groupId)
      .single();

    if (groupError) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Group not found" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Get all votes for the group with user details
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select(
        `
        *,
        user:users(
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (votesError) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: votesError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Process votes into hotel summaries with weighted calculations
    const hotelVotesMap = new Map<string, HotelVoteSummary>();
    const votersSet = new Set<string>();

    votes.forEach((vote: any) => {
      votersSet.add(vote.user_id);

      if (!hotelVotesMap.has(vote.hotel_id)) {
        hotelVotesMap.set(vote.hotel_id, {
          hotel_id: vote.hotel_id,
          hotel_name: vote.hotel_name,
          hotel_data: vote.hotel_data,
          upvotes: 0,
          downvotes: 0,
          net_score: 0,
          weighted_score: 0,
          total_votes: 0,
          upvote_percentage: 0,
          vote_breakdown: [
            {
              weight: "1",
              upvotes: 0,
              downvotes: 0,
              net_score: 0,
              total_votes: 0,
            },
            {
              weight: "2",
              upvotes: 0,
              downvotes: 0,
              net_score: 0,
              total_votes: 0,
            },
            {
              weight: "3",
              upvotes: 0,
              downvotes: 0,
              net_score: 0,
              total_votes: 0,
            },
          ],
          voters: {
            upvoters: [],
            downvoters: [],
          },
          user_votes: [],
        });
      }

      const hotelSummary = hotelVotesMap.get(vote.hotel_id)!;
      const weight = parseInt(vote.weight);

      // Update overall counts
      if (vote.is_upvote) {
        hotelSummary.upvotes++;
        hotelSummary.voters.upvoters.push({
          id: vote.user.id,
          full_name: vote.user.full_name,
          avatar_url: vote.user.avatar_url,
          weight: vote.weight,
        });
      } else {
        hotelSummary.downvotes++;
        hotelSummary.voters.downvoters.push({
          id: vote.user.id,
          full_name: vote.user.full_name,
          avatar_url: vote.user.avatar_url,
          weight: vote.weight,
        });
      }

      // Update breakdown by weight
      const weightIndex = weight - 1;
      if (vote.is_upvote) {
        hotelSummary.vote_breakdown[weightIndex].upvotes++;
      } else {
        hotelSummary.vote_breakdown[weightIndex].downvotes++;
      }
      hotelSummary.vote_breakdown[weightIndex].total_votes++;
      hotelSummary.vote_breakdown[weightIndex].net_score =
        hotelSummary.vote_breakdown[weightIndex].upvotes -
        hotelSummary.vote_breakdown[weightIndex].downvotes;

      // Add to user's votes for this hotel
      if (vote.user_id === user.id) {
        hotelSummary.user_votes.push({
          id: vote.id,
          is_upvote: vote.is_upvote,
          weight: vote.weight,
          created_at: vote.created_at,
        });
      }

      // Update calculated fields
      hotelSummary.total_votes = hotelSummary.upvotes + hotelSummary.downvotes;
      hotelSummary.net_score = hotelSummary.upvotes - hotelSummary.downvotes;

      // Calculate weighted score (weight 1 = 1x, weight 2 = 2x, weight 3 = 3x)
      hotelSummary.weighted_score = hotelSummary.vote_breakdown.reduce(
        (sum, breakdown) => {
          const weight = parseInt(breakdown.weight);
          return sum + breakdown.net_score * weight;
        },
        0
      );

      hotelSummary.upvote_percentage =
        hotelSummary.total_votes > 0
          ? (hotelSummary.upvotes / hotelSummary.total_votes) * 100
          : 0;
    });

    // Sort hotels by weighted score (highest first)
    const hotelSummaries = Array.from(hotelVotesMap.values()).sort(
      (a, b) => b.weighted_score - a.weighted_score
    );

    // Determine winner (if voting is closed)
    let winner: HotelVoteSummary | undefined;
    if (group.status === "voting_closed" && hotelSummaries.length > 0) {
      winner = hotelSummaries[0];
    }

    const votingResults: VotingResults = {
      group_id: groupId,
      group_name: group.name,
      group_status: group.status,
      total_hotels: hotelSummaries.length,
      total_votes: votes.length,
      total_voters: votersSet.size,
      hotels: hotelSummaries,
      winner,
      is_voting_open: ["planning", "voting"].includes(group.status),
    };

    return NextResponse.json<VoteAPIResponse<VotingResults>>({
      success: true,
      data: votingResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get voting results API error:", error);
    return NextResponse.json<VoteAPIResponse<null>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
