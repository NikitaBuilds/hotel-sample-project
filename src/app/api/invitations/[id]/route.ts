import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  InvitationAPIResponse,
  Invitation,
} from "@/services/group/invitations/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get invitation details (public endpoint for email links)
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select(
        `
        *,
        group:groups(
          id,
          name,
          description,
          check_in_date,
          check_out_date
        ),
        inviter:users!invitations_invited_by_fkey(
          id,
          email,
          full_name,
          avatar_url
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

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt && invitation.status === "pending") {
      // Update status to expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", id);

      invitation.status = "expired";
    }

    return NextResponse.json<InvitationAPIResponse<Invitation>>({
      success: true,
      data: invitation as Invitation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get invitation API error:", error);
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
