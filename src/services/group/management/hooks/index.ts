/**
 * Group Management React Query Hooks
 * For collaborative ski trip planning
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Group,
  GroupWithMembers,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupAPIResponse,
  PaginatedGroupsResponse,
} from "../types";
import { groupQueryKeys } from "../types";

// API Client Functions
const groupAPI = {
  // Get all groups for user
  getGroups: async (
    page = 1,
    limit = 10
  ): Promise<GroupAPIResponse<PaginatedGroupsResponse>> => {
    const response = await fetch(`/api/groups?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch groups");
    return response.json();
  },

  // Get single group details
  getGroup: async (
    groupId: string
  ): Promise<GroupAPIResponse<GroupWithMembers>> => {
    const response = await fetch(`/api/groups/${groupId}`);
    if (!response.ok) throw new Error("Failed to fetch group");
    return response.json();
  },

  // Create new group
  createGroup: async (
    data: CreateGroupRequest
  ): Promise<GroupAPIResponse<GroupWithMembers>> => {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create group");
    return response.json();
  },

  // Update group
  updateGroup: async (
    groupId: string,
    data: UpdateGroupRequest
  ): Promise<GroupAPIResponse<GroupWithMembers>> => {
    const response = await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update group");
    return response.json();
  },

  // Delete group
  deleteGroup: async (
    groupId: string
  ): Promise<GroupAPIResponse<{ deleted: true }>> => {
    const response = await fetch(`/api/groups/${groupId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete group");
    return response.json();
  },
};

/**
 * Get Groups List with Pagination
 * Cache: 5 minutes stale, 15 minutes cache
 */
export const useGroups = (
  page = 1,
  limit = 10,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: groupQueryKeys.list({ page, limit }),
    queryFn: () => groupAPI.getGroups(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
    select: (response) => response.data,
  });
};

/**
 * Get Single Group Details
 * Cache: 2 minutes stale, 10 minutes cache
 */
export const useGroupDetails = (
  groupId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: groupQueryKeys.detail(groupId),
    queryFn: () => groupAPI.getGroup(groupId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!groupId && (options?.enabled ?? true),
    select: (response) => response.data,
  });
};

/**
 * Create Group Mutation
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupAPI.createGroup,
    onSuccess: (response) => {
      // Invalidate groups list to show new group
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.lists() });

      // Add new group to cache
      if (response.data) {
        queryClient.setQueryData(
          groupQueryKeys.detail(response.data.id),
          response
        );
      }
    },
    onError: (error) => {
      console.error("Failed to create group:", error);
    },
  });
};

/**
 * Update Group Mutation
 */
export const useUpdateGroup = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGroupRequest) =>
      groupAPI.updateGroup(groupId, data),
    onSuccess: (response) => {
      // Update group details cache
      queryClient.setQueryData(groupQueryKeys.detail(groupId), response);

      // Invalidate groups list to reflect changes
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to update group:", error);
    },
  });
};

/**
 * Delete Group Mutation
 */
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupAPI.deleteGroup,
    onSuccess: (_, groupId) => {
      // Remove group from cache
      queryClient.removeQueries({ queryKey: groupQueryKeys.detail(groupId) });

      // Invalidate groups list to remove deleted group
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.lists() });

      // Remove all related queries (members, votes, messages, etc.)
      queryClient.removeQueries({ queryKey: ["groups", "members", groupId] });
      queryClient.removeQueries({ queryKey: ["groups", "votes", groupId] });
      queryClient.removeQueries({ queryKey: ["groups", "messages", groupId] });
      queryClient.removeQueries({
        queryKey: ["groups", "invitations", groupId],
      });
    },
    onError: (error) => {
      console.error("Failed to delete group:", error);
    },
  });
};

/**
 * Cache Utilities for Manual Cache Management
 */
export const useGroupCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all group data
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.all }),

    // Invalidate groups list
    invalidateGroupsList: () =>
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.lists() }),

    // Invalidate specific group
    invalidateGroup: (groupId: string) =>
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.detail(groupId),
      }),

    // Set group data manually (for optimistic updates)
    setGroupData: (groupId: string, data: GroupWithMembers) =>
      queryClient.setQueryData(groupQueryKeys.detail(groupId), {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }),

    // Remove specific group from cache
    removeGroup: (groupId: string) => {
      queryClient.removeQueries({ queryKey: groupQueryKeys.detail(groupId) });
      queryClient.removeQueries({ queryKey: ["groups", "members", groupId] });
      queryClient.removeQueries({ queryKey: ["groups", "votes", groupId] });
      queryClient.removeQueries({ queryKey: ["groups", "messages", groupId] });
      queryClient.removeQueries({
        queryKey: ["groups", "invitations", groupId],
      });
    },

    // Prefetch group details
    prefetchGroup: (groupId: string) =>
      queryClient.prefetchQuery({
        queryKey: groupQueryKeys.detail(groupId),
        queryFn: () => groupAPI.getGroup(groupId),
        staleTime: 2 * 60 * 1000,
      }),
  };
};

/**
 * Background Sync Hook - Keeps group data fresh
 */
export const useGroupBackgroundSync = (enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["group-background-sync"],
    queryFn: async () => {
      // Refetch active group data in background
      await queryClient.refetchQueries({
        queryKey: groupQueryKeys.lists(),
        type: "active",
      });
      return { synced: true, timestamp: Date.now() };
    },
    refetchInterval: enabled ? 2 * 60 * 1000 : false, // Every 2 minutes
    refetchIntervalInBackground: true,
    enabled,
  });
};

// Export query keys for external use
export { groupQueryKeys };
