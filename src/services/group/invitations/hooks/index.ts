/**
 * Invitation System React Query Hooks
 * For group trip planning invitations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Invitation,
  SendInvitationRequest,
  InvitationResponse,
  InvitationAPIResponse,
  PaginatedInvitationsResponse,
} from "../types";
import { invitationQueryKeys } from "../types";

// API Client Functions
const invitationAPI = {
  // Get invitations for a group
  getGroupInvitations: async (
    groupId: string,
    page = 1,
    limit = 10
  ): Promise<InvitationAPIResponse<PaginatedInvitationsResponse>> => {
    const response = await fetch(
      `/api/groups/${groupId}/invitations?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch group invitations");
    return response.json();
  },

  // Get single invitation details
  getInvitation: async (
    invitationId: string
  ): Promise<InvitationAPIResponse<Invitation>> => {
    const response = await fetch(`/api/invitations/${invitationId}`);
    if (!response.ok) throw new Error("Failed to fetch invitation");
    return response.json();
  },

  // Send invitation
  sendInvitation: async (
    data: SendInvitationRequest
  ): Promise<InvitationAPIResponse<Invitation>> => {
    const response = await fetch(`/api/groups/${data.group_id}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to send invitation");
    return response.json();
  },

  // Accept invitation
  acceptInvitation: async (
    invitationId: string
  ): Promise<
    InvitationAPIResponse<{
      message: string;
      group_id: string;
      group_name: string;
    }>
  > => {
    const response = await fetch(`/api/invitations/${invitationId}/accept`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to accept invitation");
    return response.json();
  },

  // Reject invitation
  rejectInvitation: async (
    invitationId: string
  ): Promise<InvitationAPIResponse<{ message: string }>> => {
    const response = await fetch(`/api/invitations/${invitationId}/reject`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to reject invitation");
    return response.json();
  },

  // Cancel invitation (for group admins/owners)
  cancelInvitation: async (
    invitationId: string
  ): Promise<InvitationAPIResponse<{ message: string }>> => {
    const response = await fetch(`/api/invitations/${invitationId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to cancel invitation");
    return response.json();
  },
};

/**
 * Get Group Invitations with Pagination
 * Cache: 2 minutes stale, 5 minutes cache
 */
export const useGroupInvitations = (
  groupId: string,
  page = 1,
  limit = 10,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: invitationQueryKeys.groupInvitations(groupId),
    queryFn: () => invitationAPI.getGroupInvitations(groupId, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!groupId && (options?.enabled ?? true),
    select: (response) => response.data,
  });
};

/**
 * Get Single Invitation Details
 * Cache: 30 seconds stale, 2 minutes cache (for real-time status updates)
 */
export const useInvitation = (
  invitationId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: invitationQueryKeys.detail(invitationId),
    queryFn: () => invitationAPI.getInvitation(invitationId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Check for status updates
    enabled: !!invitationId && (options?.enabled ?? true),
    select: (response) => response.data,
  });
};

/**
 * Send Invitation Mutation
 */
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationAPI.sendInvitation,
    onSuccess: (response, variables) => {
      // Invalidate group invitations to show new invitation
      queryClient.invalidateQueries({
        queryKey: invitationQueryKeys.groupInvitations(variables.group_id),
      });

      // Add new invitation to cache
      if (response.data) {
        queryClient.setQueryData(
          invitationQueryKeys.detail(response.data.id),
          response
        );
      }
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error);
    },
  });
};

/**
 * Accept Invitation Mutation
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationAPI.acceptInvitation,
    onSuccess: (response, invitationId) => {
      // Update invitation status in cache
      queryClient.setQueryData(
        invitationQueryKeys.detail(invitationId),
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              status: "accepted",
              responded_at: new Date().toISOString(),
            },
          };
        }
      );

      // Invalidate groups list to show new group membership
      queryClient.invalidateQueries({ queryKey: ["groups", "list"] });

      // If we have group_id, invalidate group details and members
      if (response.data?.group_id) {
        queryClient.invalidateQueries({
          queryKey: ["groups", "detail", response.data.group_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["groups", "members", response.data.group_id],
        });
      }
    },
    onError: (error) => {
      console.error("Failed to accept invitation:", error);
    },
  });
};

/**
 * Reject Invitation Mutation
 */
export const useRejectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationAPI.rejectInvitation,
    onSuccess: (_, invitationId) => {
      // Update invitation status in cache
      queryClient.setQueryData(
        invitationQueryKeys.detail(invitationId),
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              status: "rejected",
              responded_at: new Date().toISOString(),
            },
          };
        }
      );
    },
    onError: (error) => {
      console.error("Failed to reject invitation:", error);
    },
  });
};

/**
 * Cancel Invitation Mutation (for admins/owners)
 */
export const useCancelInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationAPI.cancelInvitation,
    onSuccess: (_, invitationId) => {
      // Remove invitation from all caches
      queryClient.removeQueries({
        queryKey: invitationQueryKeys.detail(invitationId),
      });

      // Invalidate group invitations lists
      queryClient.invalidateQueries({ queryKey: invitationQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to cancel invitation:", error);
    },
  });
};

/**
 * Cache Utilities for Manual Cache Management
 */
export const useInvitationCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all invitation data
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: invitationQueryKeys.all }),

    // Invalidate group invitations
    invalidateGroupInvitations: (groupId: string) =>
      queryClient.invalidateQueries({
        queryKey: invitationQueryKeys.groupInvitations(groupId),
      }),

    // Invalidate specific invitation
    invalidateInvitation: (invitationId: string) =>
      queryClient.invalidateQueries({
        queryKey: invitationQueryKeys.detail(invitationId),
      }),

    // Set invitation data manually
    setInvitationData: (invitationId: string, data: Invitation) =>
      queryClient.setQueryData(invitationQueryKeys.detail(invitationId), {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }),

    // Remove specific invitation from cache
    removeInvitation: (invitationId: string) =>
      queryClient.removeQueries({
        queryKey: invitationQueryKeys.detail(invitationId),
      }),

    // Prefetch invitation details
    prefetchInvitation: (invitationId: string) =>
      queryClient.prefetchQuery({
        queryKey: invitationQueryKeys.detail(invitationId),
        queryFn: () => invitationAPI.getInvitation(invitationId),
        staleTime: 30 * 1000,
      }),
  };
};

/**
 * Real-time Invitation Status Hook
 * Polls for status changes on active invitations
 */
export const useInvitationStatusSync = (
  invitationId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: [...invitationQueryKeys.detail(invitationId), "status-sync"],
    queryFn: () => invitationAPI.getInvitation(invitationId),
    refetchInterval: enabled ? 10 * 1000 : false, // Every 10 seconds
    refetchIntervalInBackground: false,
    enabled: !!invitationId && enabled,
    select: (response) => response.data?.status,
  });
};

// Export query keys for external use
export { invitationQueryKeys };
