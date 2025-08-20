import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTransporter, emailSender } from "@/lib/email/config";
import {
  generateInvitationEmailHTML,
  generateInvitationEmailText,
} from "@/lib/email/templates/invitation";
import type {
  SendInvitationRequest,
  InvitationAPIResponse,
  Invitation,
  PaginatedInvitationsResponse,
  InvitationEmailData,
} from "@/services/group/invitations/types";

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
      return NextResponse.json<InvitationAPIResponse<null>>(
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
      return NextResponse.json<InvitationAPIResponse<null>>(
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get invitations for the group
    const { data: invitations, error: invitationsError } = await supabase
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
        ),
        invited_user:users!invitations_invited_user_id_fkey(
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

    if (invitationsError) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: invitationsError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from("invitations")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (countError) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: countError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const response: PaginatedInvitationsResponse = {
      invitations: invitations as Invitation[],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    };

    return NextResponse.json<
      InvitationAPIResponse<PaginatedInvitationsResponse>
    >({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get invitations API error:", error);
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
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body: SendInvitationRequest = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.invited_email)) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid email address" },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if user can invite (admin or owner)
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
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only group owners and admins can send invitations",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupError) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Group not found" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Check if email is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq(
        "user_id",
        supabase
          .from("users")
          .select("id")
          .eq("email", body.invited_email)
          .single()
      )
      .single();

    if (existingMember) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "User is already a member of this group",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("group_id", groupId)
      .eq("invited_email", body.invited_email)
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invitation already sent to this email",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if invited email has a user account
    const { data: invitedUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", body.invited_email)
      .single();

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .insert({
        group_id: groupId,
        invited_by: user.id,
        invited_email: body.invited_email,
        invited_user_id: invitedUser?.id || null,
        expires_at: expiresAt.toISOString(),
      })
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
      .single();

    if (invitationError) {
      return NextResponse.json<InvitationAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: invitationError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Send email invitation
    try {
      const transporter = createTransporter();
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const invitationUrl = `${baseUrl}/invitations/${invitation.id}`;

      const emailData: InvitationEmailData = {
        inviterName: user.user_metadata?.full_name || user.email!,
        groupName: group.name,
        groupDescription: group.description,
        checkInDate: group.check_in_date,
        checkOutDate: group.check_out_date,
        invitationUrl,
        expiresAt: expiresAt.toISOString(),
        personalMessage: body.message,
      };

      await transporter.sendMail({
        from: `${emailSender.name} <${emailSender.address}>`,
        to: body.invited_email,
        subject: `🎿 You're invited to join ${group.name}!`,
        text: generateInvitationEmailText(emailData),
        html: generateInvitationEmailHTML(emailData),
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json<InvitationAPIResponse<Invitation>>(
      {
        success: true,
        data: invitation as Invitation,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send invitation API error:", error);
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
