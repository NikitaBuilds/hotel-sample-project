/**
 * Voting System Service - Main Export
 * For democratic hotel selection in group ski trips
 */

// Export all types
export * from "./types";

// Export all hooks
export * from "./hooks";

// Re-export commonly used items for convenience
export type {
  Vote,
  HotelVoteSummary,
  VotingResults,
  CastVoteRequest,
  UpdateVoteRequest,
  CloseVotingRequest,
  VoteAPIResponse,
  PaginatedVotesResponse,
} from "./types";

export {
  useVotingResults,
  useGroupVotes,
  useCastVote,
  useUpdateVote,
  useRemoveVote,
  useCloseVoting,
  useVotingResultsLive,
  useVoteCacheUtils,
  voteQueryKeys,
} from "./hooks";
