import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InvitationAPIResponse } from "@/services/group/invitations/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select(
        `
        *,
        group:groups(
          id,
          name,
          max_members
        )
      `
      )
      .eq("id", id)
      .single();

    if (invitationError) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Invitation not found" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Validate invitation
    if (invitation.status !== "pending") {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invitation is no longer valid",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      // Update status to expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", id);

      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invitation has expired",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if user email matches invitation
    if (user.email !== invitation.invited_email) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "This invitation is not for your email address",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", invitation.group_id)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      // Update invitation to accepted (they're already a member somehow)
      await supabase
        .from("invitations")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          invited_user_id: user.id,
        })
        .eq("id", id);

      return NextResponse.json<InvitationAPIResponse<{ message: string }>>({
        success: true,
        data: { message: "You are already a member of this group" },
        timestamp: new Date().toISOString(),
      });
    }

    // Check group capacity
    const { count: memberCount } = await supabase
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", invitation.group_id);

    if (memberCount && memberCount >= invitation.group.max_members) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Group is already at maximum capacity",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Start transaction: Add member and update invitation
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: invitation.group_id,
      user_id: user.id,
      role: "member",
    });

    if (memberError) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: memberError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: "accepted",
        responded_at: new Date().toISOString(),
        invited_user_id: user.id,
      })
      .eq("id", id);

    if (updateError) {
      // Rollback member addition
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", invitation.group_id)
        .eq("user_id", user.id);

      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: updateError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Send success message to group chat (optional)
    try {
      await supabase.from("messages").insert({
        group_id: invitation.group_id,
        user_id: user.id,
        content: `${
          user.user_metadata?.full_name || user.email
        } joined the group! 🎉`,
        message_type: "system",
      });
    } catch (messageError) {
      // Don't fail if system message fails
      console.error("Failed to send join message:", messageError);
    }

    return NextResponse.json<
      InvitationAPIResponse<{
        message: string;
        group_id: string;
        group_name: string;
      }>
    >({
      success: true,
      data: {
        message: "Successfully joined the group!",
        group_id: invitation.group_id,
        group_name: invitation.group.name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Accept invitation API error:", error);
    return NextResponse.json<InvitationAPIResponse<null>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
