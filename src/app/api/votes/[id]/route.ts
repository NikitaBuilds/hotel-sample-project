import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  UpdateVoteRequest,
  VoteAPIResponse,
  Vote,
} from "@/services/group/voting/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: voteId } = await params;
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

    const body: UpdateVoteRequest = await request.json();

    // Validate required fields
    if (typeof body.is_upvote !== "boolean") {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "is_upvote is required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate weight if provided
    if (body.weight && !["1", "2", "3"].includes(body.weight)) {
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

    // Check if vote exists and belongs to user
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("votes")
      .select("group_id, user_id")
      .eq("id", voteId)
      .eq("user_id", user.id)
      .single();

    if (voteCheckError || !existingVote) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Vote not found or access denied",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Check if group voting is still open
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("status")
      .eq("id", existingVote.group_id)
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
            message: "Voting is closed for this group",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Update vote
    const updateData: any = {
      is_upvote: body.is_upvote,
      updated_at: new Date().toISOString(),
    };

    if (body.weight) {
      updateData.weight = body.weight;
    }

    const { data: updatedVote, error: updateError } = await supabase
      .from("votes")
      .update(updateData)
      .eq("id", voteId)
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

    return NextResponse.json<VoteAPIResponse<Vote>>({
      success: true,
      data: updatedVote as Vote,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update vote API error:", error);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: voteId } = await params;
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

    // Check if vote exists and belongs to user
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("votes")
      .select("group_id, user_id")
      .eq("id", voteId)
      .eq("user_id", user.id)
      .single();

    if (voteCheckError || !existingVote) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Vote not found or access denied",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Check if group voting is still open
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("status")
      .eq("id", existingVote.group_id)
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
            message: "Voting is closed for this group",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Delete vote
    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .eq("id", voteId);

    if (deleteError) {
      return NextResponse.json<VoteAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: deleteError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json<VoteAPIResponse<{ deleted: true }>>({
      success: true,
      data: { deleted: true },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete vote API error:", error);
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
