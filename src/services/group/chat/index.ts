/**
 * Chat System Service - Main Export
 * For real-time group communication in ski trip planning
 */

// Export all types
export * from "./types";

// Export all hooks
export * from "./hooks";

// Re-export commonly used items for convenience
export type {
  Message,
  MessageType,
  SendMessageRequest,
  PaginatedMessagesResponse,
  ChatAPIResponse,
} from "./types";

export {
  useGroupMessages,
  useSendMessage,
  useDeleteMessage,
  useGroupMessagesLive,
  useChatCacheUtils,
  chatQueryKeys,
} from "./hooks";
