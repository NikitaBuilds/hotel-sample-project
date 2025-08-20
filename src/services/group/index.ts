/**
 * Group Services - Main Export
 * Complete group trip planning system
 */

// Group Management
export * from "./management";

// Invitations
export * from "./invitations";

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
  Invitation,
  InvitationStatus,
  SendInvitationRequest,
  InvitationEmailData,
} from "./management";

export type {
  Invitation as InvitationType,
  SendInvitationRequest as SendInviteRequest,
  InvitationAPIResponse,
  PaginatedInvitationsResponse,
} from "./invitations";

export {
  // Group Management Hooks
  useGroups,
  useGroupDetails,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupCacheUtils,
  groupQueryKeys,

  // Invitation Hooks
  useGroupInvitations,
  useInvitation,
  useSendInvitation,
  useAcceptInvitation,
  useRejectInvitation,
  useCancelInvitation,
  useInvitationCacheUtils,
  invitationQueryKeys,
} from "./management";

export {
  useGroupInvitations as useInvitationsForGroup,
  useInvitation as useInvitationDetails,
  useSendInvitation as useSendGroupInvitation,
  useAcceptInvitation as useAcceptGroupInvitation,
  useRejectInvitation as useRejectGroupInvitation,
  useInvitationStatusSync,
} from "./invitations";
