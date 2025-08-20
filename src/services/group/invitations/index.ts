/**
 * Invitation System Service - Main Export
 * For group trip planning invitations
 */

// Export all types
export * from "./types";

// Export all hooks
export * from "./hooks";

// Re-export commonly used items for convenience
export type {
  Invitation,
  InvitationStatus,
  SendInvitationRequest,
  InvitationResponse,
  InvitationAPIResponse,
  PaginatedInvitationsResponse,
  InvitationEmailData,
} from "./types";

export {
  useGroupInvitations,
  useInvitation,
  useSendInvitation,
  useAcceptInvitation,
  useRejectInvitation,
  useCancelInvitation,
  useInvitationCacheUtils,
  useInvitationStatusSync,
  invitationQueryKeys,
} from "./hooks";
