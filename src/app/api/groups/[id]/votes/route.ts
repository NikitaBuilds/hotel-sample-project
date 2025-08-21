import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  CastVoteRequest,
  VoteAPIResponse,
  Vote,
  PaginatedVotesResponse,
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Get votes for the group
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

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

    // Get total count
    const { count, error: countError } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (countError) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: countError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const response: PaginatedVotesResponse = {
      votes: votes as Vote[],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    };

    return NextResponse.json<VoteAPIResponse<PaginatedVotesResponse>>({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get votes API error:", error);
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

    const body: CastVoteRequest = await request.json();

    // Validate required fields
    if (
      !body.hotel_id ||
      !body.hotel_name ||
      typeof body.is_upvote !== "boolean" ||
      !body.weight
    ) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "hotel_id, hotel_name, is_upvote, and weight are required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate weight
    if (!["1", "2", "3"].includes(body.weight)) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "weight must be 1, 2, or 3",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
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

    // Check if group is in voting status
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
            message: "Voting is not open for this group",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // First, delete any existing votes for this hotel by this user (regardless of weight)
    await supabase
      .from("votes")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .eq("hotel_id", body.hotel_id);

    // Then insert the new vote
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .insert({
        group_id: groupId,
        user_id: user.id,
        hotel_id: body.hotel_id,
        hotel_name: body.hotel_name,
        hotel_data: body.hotel_data || null,
        is_upvote: body.is_upvote,
        weight: body.weight,
        updated_at: new Date().toISOString(),
      })
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
      .single();

    if (voteError) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: voteError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json<VoteAPIResponse<Vote>>(
      {
        success: true,
        data: vote as Vote,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Cast vote API error:", error);
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
