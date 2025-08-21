/**
 * Voting System React Query Hooks
 * For democratic hotel selection in group ski trips
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Vote,
  VotingResults,
  CastVoteRequest,
  UpdateVoteRequest,
  CloseVotingRequest,
  VoteAPIResponse,
  PaginatedVotesResponse,
  HotelVoteSummary,
} from "../types";
import { voteQueryKeys } from "../types";

// API Client Functions
const voteAPI = {
  // Get voting results for a group
  getVotingResults: async (
    groupId: string
  ): Promise<VoteAPIResponse<VotingResults>> => {
    const response = await fetch(`/api/groups/${groupId}/votes/results`);
    if (!response.ok) throw new Error("Failed to fetch voting results");
    return response.json();
  },

  // Get all votes for a group
  getGroupVotes: async (
    groupId: string,
    page = 1,
    limit = 50
  ): Promise<VoteAPIResponse<PaginatedVotesResponse>> => {
    const response = await fetch(
      `/api/groups/${groupId}/votes?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch group votes");
    return response.json();
  },

  // Cast a vote
  castVote: async (
    groupId: string,
    data: CastVoteRequest
  ): Promise<VoteAPIResponse<Vote>> => {
    const response = await fetch(`/api/groups/${groupId}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to cast vote");
    return response.json();
  },

  // Update existing vote
  updateVote: async (
    voteId: string,
    data: UpdateVoteRequest
  ): Promise<VoteAPIResponse<Vote>> => {
    const response = await fetch(`/api/votes/${voteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update vote");
    return response.json();
  },

  // Remove vote
  removeVote: async (
    voteId: string
  ): Promise<VoteAPIResponse<{ deleted: true }>> => {
    const response = await fetch(`/api/votes/${voteId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove vote");
    return response.json();
  },

  // Close voting and select winner
  closeVoting: async (
    groupId: string,
    data?: CloseVotingRequest
  ): Promise<
    VoteAPIResponse<{
      group_id: string;
      selected_hotel_id: string;
      selected_hotel_data: any;
    }>
  > => {
    const response = await fetch(`/api/groups/${groupId}/votes/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
    });
    if (!response.ok) throw new Error("Failed to close voting");
    return response.json();
  },
};

/**
 * Get Voting Results for Group
 * Cache: 30 seconds stale, 2 minutes cache (real-time updates needed)
 */
export const useVotingResults = (
  groupId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: voteQueryKeys.votingResults(groupId),
    queryFn: () => voteAPI.getVotingResults(groupId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Check for new votes
    enabled: !!groupId && (options?.enabled ?? true),
    select: (response) => response.data,
  });
};

/**
 * Get Group Votes with Pagination
 * Cache: 1 minute stale, 5 minutes cache
 */
export const useGroupVotes = (
  groupId: string,
  page = 1,
  limit = 50,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: voteQueryKeys.groupVotes(groupId),
    queryFn: () => voteAPI.getGroupVotes(groupId, page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!groupId && (options?.enabled ?? true),
    select: (response) => response.data,
  });
};

/**
 * Cast Vote Mutation
 * Optimistic updates for instant feedback
 */
export const useCastVote = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CastVoteRequest) => voteAPI.castVote(groupId, data),
    onMutate: async (newVote) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: voteQueryKeys.votingResults(groupId),
      });

      // Snapshot the previous value
      const previousResults = queryClient.getQueryData(
        voteQueryKeys.votingResults(groupId)
      );

      // Optimistically update voting results (simplified for weighted votes)
      queryClient.setQueryData(
        voteQueryKeys.votingResults(groupId),
        (old: any) => {
          if (!old) return old;

          // Handle both direct data structure and nested data structure
          const oldData = old.data ? old.data : old;

          // Check if hotels array exists
          if (!oldData || !oldData.hotels || !Array.isArray(oldData.hotels)) {
            console.error(
              "Invalid data structure in optimistic update:",
              oldData
            );
            return old;
          }

          // For weighted votes, we'll do a simpler optimistic update
          // and rely on the server response for accurate calculations
          const updatedHotels = oldData.hotels.map(
            (hotel: HotelVoteSummary) => {
              if (hotel.hotel_id === newVote.hotel_id) {
                const weight = parseInt(newVote.weight);
                const voteValue = newVote.is_upvote ? weight : -weight;

                return {
                  ...hotel,
                  upvotes: newVote.is_upvote
                    ? hotel.upvotes + 1
                    : hotel.upvotes,
                  downvotes: !newVote.is_upvote
                    ? hotel.downvotes + 1
                    : hotel.downvotes,
                  total_votes: hotel.total_votes + 1,
                  weighted_score: hotel.weighted_score + voteValue,
                  user_votes: [
                    ...(hotel.user_votes || []),
                    {
                      id: `temp-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 9)}`,
                      is_upvote: newVote.is_upvote,
                      weight: newVote.weight,
                      created_at: new Date().toISOString(),
                    },
                  ],
                };
              }
              return hotel;
            }
          );

          // If we have a nested structure, maintain it
          if (old.data) {
            return {
              ...old,
              data: {
                ...oldData,
                hotels: updatedHotels.sort(
                  (a: any, b: any) => b.weighted_score - a.weighted_score
                ),
                total_votes: oldData.total_votes + 1,
              },
            };
          }

          // Otherwise update the direct structure
          return {
            ...oldData,
            hotels: updatedHotels.sort(
              (a: any, b: any) => b.weighted_score - a.weighted_score
            ),
            total_votes: oldData.total_votes + 1,
          };
        }
      );

      return { previousResults };
    },
    onError: (err, newVote, context) => {
      // Rollback on error
      if (context?.previousResults) {
        queryClient.setQueryData(
          voteQueryKeys.votingResults(groupId),
          context.previousResults
        );
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: voteQueryKeys.votingResults(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: voteQueryKeys.groupVotes(groupId),
      });
    },
  });
};

/**
 * Update Vote Mutation
 */
export const useUpdateVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      voteId,
      data,
    }: {
      voteId: string;
      data: UpdateVoteRequest;
    }) => voteAPI.updateVote(voteId, data),
    onSuccess: (response, variables) => {
      // Update vote in cache
      if (response.data) {
        queryClient.setQueryData(
          voteQueryKeys.detail(response.data.id),
          response
        );
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: voteQueryKeys.votingResults(response.data?.group_id || ""),
      });
      queryClient.invalidateQueries({
        queryKey: voteQueryKeys.groupVotes(response.data?.group_id || ""),
      });
    },
    onError: (error) => {
      console.error("Failed to update vote:", error);
    },
  });
};

/**
 * Remove Vote Mutation
 */
export const useRemoveVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voteAPI.removeVote,
    onSuccess: (_, voteId) => {
      // Remove vote from cache
      queryClient.removeQueries({
        queryKey: voteQueryKeys.detail(voteId),
      });

      // Invalidate all voting-related queries
      queryClient.invalidateQueries({ queryKey: voteQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to remove vote:", error);
    },
  });
};

/**
 * Close Voting Mutation (Admin/Owner only)
 */
export const useCloseVoting = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CloseVotingRequest) =>
      voteAPI.closeVoting(groupId, data),
    onSuccess: (response) => {
      // Invalidate group details to reflect new status
      queryClient.invalidateQueries({
        queryKey: ["groups", "detail", groupId],
      });

      // Invalidate voting results
      queryClient.invalidateQueries({
        queryKey: voteQueryKeys.votingResults(groupId),
      });

      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: ["groups", "list"] });
    },
    onError: (error) => {
      console.error("Failed to close voting:", error);
    },
  });
};

/**
 * Real-time Voting Results Hook
 * Polls for voting changes every 15 seconds
 */
export const useVotingResultsLive = (groupId: string, enabled = true) => {
  return useQuery({
    queryKey: [...voteQueryKeys.votingResults(groupId), "live"],
    queryFn: () => voteAPI.getVotingResults(groupId),
    refetchInterval: enabled ? 15 * 1000 : false, // Every 15 seconds
    refetchIntervalInBackground: false,
    enabled: !!groupId && enabled,
    select: (response) => response.data,
  });
};

/**
 * Cache Utilities for Manual Cache Management
 */
export const useVoteCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all voting data
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: voteQueryKeys.all }),

    // Invalidate group voting results
    invalidateVotingResults: (groupId: string) =>
      queryClient.invalidateQueries({
        queryKey: voteQueryKeys.votingResults(groupId),
      }),

    // Invalidate group votes
    invalidateGroupVotes: (groupId: string) =>
      queryClient.invalidateQueries({
        queryKey: voteQueryKeys.groupVotes(groupId),
      }),

    // Set voting results manually
    setVotingResults: (groupId: string, data: VotingResults) =>
      queryClient.setQueryData(voteQueryKeys.votingResults(groupId), {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }),

    // Remove specific vote from cache
    removeVote: (voteId: string) =>
      queryClient.removeQueries({
        queryKey: voteQueryKeys.detail(voteId),
      }),

    // Prefetch voting results
    prefetchVotingResults: (groupId: string) =>
      queryClient.prefetchQuery({
        queryKey: voteQueryKeys.votingResults(groupId),
        queryFn: () => voteAPI.getVotingResults(groupId),
        staleTime: 30 * 1000,
      }),
  };
};

// Export query keys for external use
export { voteQueryKeys };
