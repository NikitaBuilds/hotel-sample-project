/**
 * Group Management Types
 * For collaborative ski trip planning
 */

export type GroupStatus =
  | "planning"
  | "voting"
  | "voting_closed"
  | "booked"
  | "completed"
  | "cancelled";
export type MemberRole = "owner" | "admin" | "member";

export interface Group {
  id: string;
  name: string;
  description?: string;
  check_in_date: string; // ISO date
  check_out_date: string; // ISO date
  max_members: number;
  status: GroupStatus;
  selected_hotel_id?: string;
  selected_hotel_data?: any; // Hotel data from API
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  // Populated user data
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  member_count: number;
  user_role?: MemberRole; // Current user's role in this group
}

// API Request/Response types
export interface CreateGroupRequest {
  name: string;
  description?: string;
  check_in_date: string;
  check_out_date: string;
  max_members?: number;
  invite_emails?: string[]; // Optional bulk invitations
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  check_in_date?: string;
  check_out_date?: string;
  max_members?: number;
  status?: GroupStatus;
  selected_hotel_id?: string;
  selected_hotel_data?: any;
}

export interface GroupAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedGroupsResponse {
  groups: GroupWithMembers[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Query key factories
export const groupQueryKeys = {
  all: ["groups"] as const,
  lists: () => [...groupQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...groupQueryKeys.lists(), { filters }] as const,
  details: () => [...groupQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...groupQueryKeys.details(), id] as const,
  members: (groupId: string) =>
    [...groupQueryKeys.all, "members", groupId] as const,
};
