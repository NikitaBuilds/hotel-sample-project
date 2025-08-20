/**
 * Invitation System Types
 * For group trip planning invitations
 */

export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired";

export interface Invitation {
  id: string;
  group_id: string;
  invited_by: string;
  invited_email: string;
  invited_user_id?: string;
  status: InvitationStatus;
  expires_at: string;
  responded_at?: string;
  created_at: string;
  // Populated data
  group?: {
    id: string;
    name: string;
    description?: string;
    check_in_date: string;
    check_out_date: string;
  };
  inviter?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
  invited_user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

// API Request/Response types
export interface SendInvitationRequest {
  group_id: string;
  invited_email: string;
  message?: string; // Optional personal message
}

export interface InvitationResponse {
  invitation_id: string;
  response: "accept" | "reject";
}

export interface InvitationAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedInvitationsResponse {
  invitations: Invitation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Email template data
export interface InvitationEmailData {
  inviterName: string;
  groupName: string;
  groupDescription?: string;
  checkInDate: string;
  checkOutDate: string;
  invitationUrl: string;
  expiresAt: string;
  personalMessage?: string;
}

// Query key factories
export const invitationQueryKeys = {
  all: ["invitations"] as const,
  lists: () => [...invitationQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...invitationQueryKeys.lists(), { filters }] as const,
  groupInvitations: (groupId: string) =>
    [...invitationQueryKeys.all, "group", groupId] as const,
  userInvitations: (userId: string) =>
    [...invitationQueryKeys.all, "user", userId] as const,
  detail: (id: string) => [...invitationQueryKeys.all, "detail", id] as const,
};
