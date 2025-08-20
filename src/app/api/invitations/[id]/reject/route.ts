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

    // Get invitation details (allow both authenticated and unauthenticated access)
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
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

    // For authenticated users, verify email matches
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && user.email !== invitation.invited_email) {
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

    // Update invitation status to rejected
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: "rejected",
        responded_at: new Date().toISOString(),
        ...(user && { invited_user_id: user.id }),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: updateError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json<InvitationAPIResponse<{ message: string }>>({
      success: true,
      data: { message: "Invitation declined" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reject invitation API error:", error);
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
