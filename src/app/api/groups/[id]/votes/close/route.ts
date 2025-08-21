import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  CloseVotingRequest,
  VoteAPIResponse,
} from "@/services/group/voting/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body: CloseVotingRequest = await request.json();

    // Check if user is admin or owner of the group
    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (
      membershipError ||
      !membership ||
      !["owner", "admin"].includes(membership.role)
    ) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only group owners and admins can close voting",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Get current group status
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("status")
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

    if (!["planning", "voting"].includes(group.status)) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Voting is already closed for this group",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    let selectedHotelId = body.selected_hotel_id;
    let selectedHotelData = null;

    // If no manual selection, find the winner automatically
    if (!selectedHotelId) {
      // Get vote counts per hotel
      const { data: voteCounts, error: voteCountsError } = await supabase
        .from("votes")
        .select("hotel_id, hotel_name, hotel_data, is_upvote, weight")
        .eq("group_id", groupId);

      if (voteCountsError) {
        return NextResponse.json<VoteAPIResponse<null>>(
          {
            success: false,
            error: { code: "DATABASE_ERROR", message: voteCountsError.message },
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }

      if (voteCounts.length === 0) {
        return NextResponse.json<VoteAPIResponse<null>>(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "No votes found. Cannot close voting without any votes.",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Calculate weighted scores for each hotel
      const hotelScores = new Map<
        string,
        {
          hotel_id: string;
          hotel_name: string;
          hotel_data: any;
          weighted_score: number;
        }
      >();

      voteCounts.forEach((vote: any) => {
        if (!hotelScores.has(vote.hotel_id)) {
          hotelScores.set(vote.hotel_id, {
            hotel_id: vote.hotel_id,
            hotel_name: vote.hotel_name,
            hotel_data: vote.hotel_data,
            weighted_score: 0,
          });
        }

        const hotel = hotelScores.get(vote.hotel_id)!;
        const weight = parseInt(vote.weight);
        const voteValue = vote.is_upvote ? weight : -weight;
        hotel.weighted_score += voteValue;
      });

      // Find the hotel with the highest weighted score
      const sortedHotels = Array.from(hotelScores.values()).sort(
        (a, b) => b.weighted_score - a.weighted_score
      );

      if (sortedHotels.length > 0) {
        const winner = sortedHotels[0];
        selectedHotelId = winner.hotel_id;
        selectedHotelData = winner.hotel_data;
      }
    }

    // Update group status and selected hotel
    const { data: updatedGroup, error: updateError } = await supabase
      .from("groups")
      .update({
        status: "voting_closed",
        selected_hotel_id: selectedHotelId,
        selected_hotel_data: selectedHotelData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select("id, selected_hotel_id, selected_hotel_data")
      .single();

    if (updateError) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: updateError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json<
      VoteAPIResponse<{
        group_id: string;
        selected_hotel_id: string;
        selected_hotel_data: any;
      }>
    >({
      success: true,
      data: {
        group_id: groupId,
        selected_hotel_id: updatedGroup.selected_hotel_id!,
        selected_hotel_data: updatedGroup.selected_hotel_data,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Close voting API error:", error);
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
