import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  SendMessageRequest,
  ChatAPIResponse,
  Message,
  PaginatedMessagesResponse,
} from "@/services/group/chat/types";

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
      return NextResponse.json<ChatAPIResponse<null>>(
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
      return NextResponse.json<ChatAPIResponse<null>>(
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

    // Get messages for the group
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
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

    if (messagesError) {
      return NextResponse.json<ChatAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: messagesError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (countError) {
      return NextResponse.json<ChatAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: countError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const response: PaginatedMessagesResponse = {
      messages: messages as Message[],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    };

    return NextResponse.json<ChatAPIResponse<PaginatedMessagesResponse>>({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get messages API error:", error);
    return NextResponse.json<ChatAPIResponse<null>>(
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
      return NextResponse.json<ChatAPIResponse<null>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body: SendMessageRequest = await request.json();

    // Validate required fields
    if (!body.content || body.content.trim() === "") {
      return NextResponse.json<ChatAPIResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Message content is required",
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
      return NextResponse.json<ChatAPIResponse<null>>(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Check if group exists
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json<ChatAPIResponse<null>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Group not found" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Insert the new message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        group_id: groupId,
        user_id: user.id,
        content: body.content.trim(),
        message_type: body.message_type || "text",
        metadata: body.metadata || null,
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

    if (messageError) {
      return NextResponse.json<ChatAPIResponse<null>>(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: messageError.message },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ChatAPIResponse<Message>>(
      {
        success: true,
        data: message as Message,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message API error:", error);
    return NextResponse.json<ChatAPIResponse<null>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
