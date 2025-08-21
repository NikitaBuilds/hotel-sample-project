/**
 * Voting System Types
 * For democratic hotel selection in group ski trips
 */

export type VoteWeight = "1" | "2" | "3";

export interface Vote {
  id: string;
  group_id: string;
  user_id: string;
  hotel_id: string;
  hotel_name: string;
  hotel_data?: any; // Hotel details from LiteAPI
  is_upvote: boolean;
  weight: VoteWeight; // Vote weight 1-3
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

export interface WeightedVoteBreakdown {
  weight: VoteWeight;
  upvotes: number;
  downvotes: number;
  net_score: number;
  total_votes: number;
}

export interface HotelVoteSummary {
  hotel_id: string;
  hotel_name: string;
  hotel_data?: any;
  upvotes: number;
  downvotes: number;
  net_score: number; // weighted sum of all votes
  weighted_score: number; // score considering vote weights
  total_votes: number;
  upvote_percentage: number;
  vote_breakdown: WeightedVoteBreakdown[]; // breakdown by weight
  voters: {
    upvoters: Array<{
      id: string;
      full_name: string;
      avatar_url?: string;
      weight: VoteWeight;
    }>;
    downvoters: Array<{
      id: string;
      full_name: string;
      avatar_url?: string;
      weight: VoteWeight;
    }>;
  };
  user_votes: Array<{
    id: string;
    is_upvote: boolean;
    weight: VoteWeight;
    created_at: string;
  }>; // All user's votes for this hotel
}

export interface VotingResults {
  group_id: string;
  group_name: string;
  group_status: string;
  total_hotels: number;
  total_votes: number;
  total_voters: number;
  hotels: HotelVoteSummary[];
  winner?: HotelVoteSummary; // Hotel with highest net score (if voting is closed)
  voting_deadline?: string;
  is_voting_open: boolean;
}

// API Request/Response types
export interface CastVoteRequest {
  hotel_id: string;
  hotel_name: string;
  hotel_data?: any;
  is_upvote: boolean;
  weight: VoteWeight;
}

export interface UpdateVoteRequest {
  is_upvote: boolean;
  weight?: VoteWeight;
}

export interface CloseVotingRequest {
  selected_hotel_id?: string; // Optional manual override
}

export interface VoteAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedVotesResponse {
  votes: Vote[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Query key factories
export const voteQueryKeys = {
  all: ["votes"] as const,
  lists: () => [...voteQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...voteQueryKeys.lists(), { filters }] as const,
  groupVotes: (groupId: string) =>
    [...voteQueryKeys.all, "group", groupId] as const,
  votingResults: (groupId: string) =>
    [...voteQueryKeys.all, "results", groupId] as const,
  userVotes: (userId: string) =>
    [...voteQueryKeys.all, "user", userId] as const,
  hotelVotes: (hotelId: string) =>
    [...voteQueryKeys.all, "hotel", hotelId] as const,
  detail: (id: string) => [...voteQueryKeys.all, "detail", id] as const,
};
