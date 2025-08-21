/**
 * Chat System React Query Hooks
 * For real-time group communication in ski trip planning
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Message,
  SendMessageRequest,
  PaginatedMessagesResponse,
  ChatAPIResponse,
} from "../types";
import { chatQueryKeys } from "../types";

// API Client Functions
const chatAPI = {
  // Get messages for a group
  getGroupMessages: async (
    groupId: string,
    page = 1,
    limit = 50
  ): Promise<ChatAPIResponse<PaginatedMessagesResponse>> => {
    const response = await fetch(
      `/api/groups/${groupId}/chat?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch group messages");
    return response.json();
  },

  // Send a message
  sendMessage: async (
    groupId: string,
    data: SendMessageRequest
  ): Promise<ChatAPIResponse<Message>> => {
    const response = await fetch(`/api/groups/${groupId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  },

  // Delete a message (for admins or message owners)
  deleteMessage: async (
    messageId: string
  ): Promise<ChatAPIResponse<{ deleted: true }>> => {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete message");
    return response.json();
  },
};

/**
 * Get Group Messages with Pagination
 * Cache: 10 seconds stale, 2 minutes cache (for near real-time updates)
 */
export const useGroupMessages = (
  groupId: string,
  page = 1,
  limit = 50,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...chatQueryKeys.groupMessages(groupId), page, limit],
    queryFn: () => chatAPI.getGroupMessages(groupId, page, limit),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    enabled: !!groupId && (options?.enabled ?? true),
    select: (response) => response.data,
  });
};

/**
 * Send Message Mutation
 * Optimistic updates for instant feedback
 */
export const useSendMessage = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      chatAPI.sendMessage(groupId, data),
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: chatQueryKeys.groupMessages(groupId),
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        ...chatQueryKeys.groupMessages(groupId),
        1,
        50,
      ]);

      // Optimistically update messages
      queryClient.setQueryData(
        [...chatQueryKeys.groupMessages(groupId), 1, 50],
        (old: any) => {
          if (!old) return old;

          // Handle both direct data structure and nested data structure
          const oldData = old.data ? old.data : old;

          // Check if messages array exists
          if (
            !oldData ||
            !oldData.messages ||
            !Array.isArray(oldData.messages)
          ) {
            console.error(
              "Invalid data structure in optimistic update:",
              oldData
            );
            return old;
          }

          // Create optimistic message
          const optimisticMessage: Partial<Message> = {
            id: `temp-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            content: newMessage.content,
            message_type: newMessage.message_type || "text",
            metadata: newMessage.metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // User data will be added from the server response
          };

          // If we have a nested structure, maintain it
          if (old.data) {
            return {
              ...old,
              data: {
                ...oldData,
                messages: [optimisticMessage, ...oldData.messages],
                total: oldData.total + 1,
              },
            };
          }

          // Otherwise update the direct structure
          return {
            ...oldData,
            messages: [optimisticMessage, ...oldData.messages],
            total: oldData.total + 1,
          };
        }
      );

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          [...chatQueryKeys.groupMessages(groupId), 1, 50],
          context.previousMessages
        );
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.groupMessages(groupId),
      });
    },
  });
};

/**
 * Delete Message Mutation
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.deleteMessage,
    onSuccess: (_, messageId) => {
      // Remove message from cache
      queryClient.removeQueries({
        queryKey: chatQueryKeys.detail(messageId),
      });

      // Invalidate all message-related queries
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to delete message:", error);
    },
  });
};

/**
 * Real-time Messages Hook
 * Polls for new messages every 5 seconds
 */
export const useGroupMessagesLive = (groupId: string, enabled = true) => {
  return useQuery({
    queryKey: [...chatQueryKeys.groupMessages(groupId), "live"],
    queryFn: () => chatAPI.getGroupMessages(groupId, 1, 50),
    refetchInterval: enabled ? 5 * 1000 : false, // Every 5 seconds
    refetchIntervalInBackground: false,
    enabled: !!groupId && enabled,
    select: (response) => response.data,
  });
};

/**
 * Cache Utilities for Manual Cache Management
 */
export const useChatCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all chat data
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.all }),

    // Invalidate group messages
    invalidateGroupMessages: (groupId: string) =>
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.groupMessages(groupId),
      }),

    // Set group messages manually
    setGroupMessages: (
      groupId: string,
      data: PaginatedMessagesResponse,
      page = 1,
      limit = 50
    ) =>
      queryClient.setQueryData(
        [...chatQueryKeys.groupMessages(groupId), page, limit],
        {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        }
      ),

    // Remove specific message from cache
    removeMessage: (messageId: string) =>
      queryClient.removeQueries({
        queryKey: chatQueryKeys.detail(messageId),
      }),

    // Prefetch group messages
    prefetchGroupMessages: (groupId: string, page = 1, limit = 50) =>
      queryClient.prefetchQuery({
        queryKey: [...chatQueryKeys.groupMessages(groupId), page, limit],
        queryFn: () => chatAPI.getGroupMessages(groupId, page, limit),
        staleTime: 10 * 1000,
      }),
  };
};

// Export query keys for external use
export { chatQueryKeys };
