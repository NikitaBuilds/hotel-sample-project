/**
 * Chat System Types
 * For real-time group communication in ski trip planning
 */

export type MessageType = "text" | "system" | "hotel_share" | "vote_update";

export interface Message {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  message_type: MessageType;
  metadata?: any; // Additional data for special message types
  created_at: string;
  updated_at: string;
  // Populated data
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SendMessageRequest {
  content: string;
  message_type?: MessageType;
  metadata?: any;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ChatAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Query key factories
export const chatQueryKeys = {
  all: ["messages"] as const,
  lists: () => [...chatQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...chatQueryKeys.lists(), { filters }] as const,
  groupMessages: (groupId: string) =>
    [...chatQueryKeys.all, "group", groupId] as const,
  userMessages: (userId: string) =>
    [...chatQueryKeys.all, "user", userId] as const,
  detail: (id: string) => [...chatQueryKeys.all, "detail", id] as const,
};
