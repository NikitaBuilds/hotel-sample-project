import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  InvitationAPIResponse,
  PaginatedInvitationsResponse,
} from "@/services/group/invitations/types";

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "pending"; // Default to pending
    const offset = (page - 1) * limit;

    // Get invitations for the user's email
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
        )
      `
      )
      .eq("invited_email", user.email)
      .eq("status", status)
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

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("invited_email", user.email)
      .eq("status", status);

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

    const total = count || 0;
    const hasMore = offset + limit < total;

    const response: PaginatedInvitationsResponse = {
      invitations: invitations || [],
      total,
      page,
      limit,
      hasMore,
    };

    return NextResponse.json<
      InvitationAPIResponse<PaginatedInvitationsResponse>
    >({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get user invitations API error:", error);
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
