import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  UpdateGroupRequest,
  GroupAPIResponse,
  GroupWithMembers,
} from "@/services/group/management/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Get group with members, but only if user is a member
    const { data: group, error: groupError } = await supabase
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
      .eq("id", id)
      .in(
        "id",
        supabase.from("group_members").select("group_id").eq("user_id", user.id)
      )
      .single();

    if (groupError) {
      if (groupError.code === "PGRST116") {
        return NextResponse.json<GroupAPIResponse<null>>(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Group not found or access denied",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: groupError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Transform data
    const userMember = group.members.find((m: any) => m.user_id === user.id);
    const transformedGroup: GroupWithMembers = {
      ...group,
      member_count: group.members.length,
      user_role: userMember?.role,
    };

    return NextResponse.json<GroupAPIResponse<GroupWithMembers>>({
      success: true,
      data: transformedGroup,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get group API error:", error);
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const body: UpdateGroupRequest = await request.json();

    // Check if user is admin or owner of the group
    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", id)
      .eq("user_id", user.id)
      .single();

    if (
      membershipError ||
      !membership ||
      !["owner", "admin"].includes(membership.role)
    ) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only group owners and admins can update the group",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Validate dates if provided
    if (body.check_in_date && body.check_out_date) {
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
    }

    // Update group
    const { data: updatedGroup, error: updateError } = await supabase
      .from("groups")
      .update({
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.check_in_date && { check_in_date: body.check_in_date }),
        ...(body.check_out_date && { check_out_date: body.check_out_date }),
        ...(body.max_members && { max_members: body.max_members }),
        ...(body.status && { status: body.status }),
        ...(body.selected_hotel_id !== undefined && {
          selected_hotel_id: body.selected_hotel_id,
        }),
        ...(body.selected_hotel_data !== undefined && {
          selected_hotel_data: body.selected_hotel_data,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
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
      .single();

    if (updateError) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: updateError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Transform data
    const userMember = updatedGroup.members.find(
      (m: any) => m.user_id === user.id
    );
    const transformedGroup: GroupWithMembers = {
      ...updatedGroup,
      member_count: updatedGroup.members.length,
      user_role: userMember?.role,
    };

    return NextResponse.json<GroupAPIResponse<GroupWithMembers>>({
      success: true,
      data: transformedGroup,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update group API error:", error);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Check if user is owner of the group
    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", id)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership || membership.role !== "owner") {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only group owners can delete the group",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Delete group (cascade will handle members, messages, votes, invitations)
    const { error: deleteError } = await supabase
      .from("groups")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json<GroupAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: deleteError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json<GroupAPIResponse<{ deleted: true }>>({
      success: true,
      data: { deleted: true },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete group API error:", error);
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
