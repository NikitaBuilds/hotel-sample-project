import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTransporter, emailSender } from "@/lib/email/config";
import {
  generateInvitationEmailHTML,
  generateInvitationEmailText,
} from "@/lib/email/templates/invitation";
import type {
  CreateGroupRequest,
  GroupAPIResponse,
  GroupWithMembers,
  PaginatedGroupsResponse,
} from "@/services/group/management/types";
import type { InvitationEmailData } from "@/services/group/invitations/types";

// Helper function to send bulk invitations
async function sendBulkInvitations(group: any, user: any, emails: string[]) {
  const supabase = await createClient();
  const transporter = createTransporter();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  // Create all invitations in database
  const invitationsToCreate = emails.map((email) => ({
    group_id: group.id,
    invited_by: user.id,
    invited_email: email.trim(),
    expires_at: expiresAt.toISOString(),
  }));

  const { data: invitations, error: invitationError } = await supabase
    .from("invitations")
    .insert(invitationsToCreate)
    .select("*");

  if (invitationError) {
    throw new Error(`Failed to create invitations: ${invitationError.message}`);
  }

  // Send emails for each invitation
  const emailPromises = invitations.map(async (invitation) => {
    const invitationUrl = `${baseUrl}/invitations/${invitation.id}`;

    const emailData: InvitationEmailData = {
      inviterName: user.user_metadata?.full_name || user.email!,
      groupName: group.name,
      groupDescription: group.description,
      checkInDate: group.check_in_date,
      checkOutDate: group.check_out_date,
      invitationUrl,
      expiresAt: expiresAt.toISOString(),
    };

    return transporter.sendMail({
      from: `${emailSender.name} <${emailSender.address}>`,
      to: invitation.invited_email,
      subject: `🎿 You're invited to join ${group.name}!`,
      text: generateInvitationEmailText(emailData),
      html: generateInvitationEmailHTML(emailData),
    });
  });

  // Send all emails (don't wait for completion to avoid timeout)
  Promise.allSettled(emailPromises).then((results) => {
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.error(
        `Failed to send ${failed} out of ${emails.length} invitation emails`
      );
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // First get group IDs where user is a member
    const { data: memberGroups, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (memberError) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: memberError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const groupIds = memberGroups.map((m) => m.group_id);

    // If user is not a member of any groups, return empty result
    if (groupIds.length === 0) {
      const response: PaginatedGroupsResponse = {
        groups: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };

      return NextResponse.json<GroupAPIResponse<PaginatedGroupsResponse>>({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    }

    // Get groups where user is a member
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select(
        `
        *,
        members:group_members(
          id,
          user_id,
          role,
          joined_at,
          user:users(
            id,
            email,
            full_name,
            avatar_url
          )
        )
      `
      )
      .in("id", groupIds)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (groupsError) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: groupsError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("groups")
      .select("id", { count: "exact", head: true })
      .in("id", groupIds);

    if (countError) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: countError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Transform data to include user role and member count
    const transformedGroups: GroupWithMembers[] = groups.map((group) => {
      const userMember = group.members.find((m: any) => m.user_id === user.id);
      return {
        ...group,
        member_count: group.members.length,
        user_role: userMember?.role,
      };
    });

    const response: PaginatedGroupsResponse = {
      groups: transformedGroups,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    };

    return NextResponse.json<GroupAPIResponse<PaginatedGroupsResponse>>({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Groups API error:", error);
    return NextResponse.json<GroupAPIResponse<null>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body: CreateGroupRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.check_in_date || !body.check_out_date) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Name, check-in date, and check-out date are required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate dates
    const checkinDate = new Date(body.check_in_date);
    const checkoutDate = new Date(body.check_out_date);
    if (checkoutDate <= checkinDate) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Check-out date must be after check-in date",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Create group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: body.name,
        description: body.description,
        check_in_date: body.check_in_date,
        check_out_date: body.check_out_date,
        max_members: body.max_members || 5,
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: groupError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Add creator as owner
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      // Rollback group creation
      await supabase.from("groups").delete().eq("id", group.id);
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: memberError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Send bulk invitations if emails provided
    if (body.invite_emails && body.invite_emails.length > 0) {
      try {
        await sendBulkInvitations(group, user, body.invite_emails);
      } catch (emailError) {
        console.error("Failed to send bulk invitations:", emailError);
        // Don't fail the group creation if emails fail
      }
    }

    return NextResponse.json<GroupAPIResponse<GroupWithMembers>>(
      {
        success: true,
        data: {
          ...group,
          members: [
            {
              id: "", // Will be set by DB
              group_id: group.id,
              user_id: user.id,
              role: "owner" as const,
              joined_at: new Date().toISOString(),
              user: {
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || user.email!,
                avatar_url: user.user_metadata?.avatar_url,
              },
            },
          ],
          member_count: 1,
          user_role: "owner" as const,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create group API error:", error);
    return NextResponse.json<GroupAPIResponse<null>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
