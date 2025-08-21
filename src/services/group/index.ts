/**
 * Group Services - Main Export
 * Complete group trip planning system
 */

// Group Management
export * from "./management";

// Invitations
export * from "./invitations";

// Voting
export * from "./voting";

// Additional Hooks
export * from "./hooks";

// Re-export commonly used types and hooks
export type {
  // Group Management
  Group,
  GroupWithMembers,
  GroupMember,
  GroupStatus,
  MemberRole,
  CreateGroupRequest,
  UpdateGroupRequest,

  // Invitations
} from "./management";

export type {
  Invitation,
  InvitationStatus,
  SendInvitationRequest,
  InvitationEmailData,
} from "./invitations";

export type {
  Invitation as InvitationType,
  SendInvitationRequest as SendInviteRequest,
  InvitationAPIResponse,
  PaginatedInvitationsResponse,
} from "./invitations";

export {
  useGroupInvitations,
  useInvitation,
  useSendInvitation,
  useAcceptInvitation,
  useRejectInvitation,
  useCancelInvitation,
  useInvitationCacheUtils,
  invitationQueryKeys,
} from "./invitations";

export {
  useGroups,
  useGroupDetails,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupCacheUtils,
  groupQueryKeys,
} from "./management";

export {
  useGroupInvitations as useInvitationsForGroup,
  useInvitation as useInvitationDetails,
  useSendInvitation as useSendGroupInvitation,
  useAcceptInvitation as useAcceptGroupInvitation,
  useRejectInvitation as useRejectGroupInvitation,
  useInvitationStatusSync,
} from "./invitations";

export {
  ActiveGroupProvider,
  useActiveGroup,
  useActiveGroupId,
  useHasGroups,
} from "./hooks";

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
} from "./voting";
