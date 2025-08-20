/**
 * Group Management Service - Main Export
 * For collaborative ski trip planning
 */

// Export all types
export * from "./types";

// Export all hooks
export * from "./hooks";

// Re-export commonly used items for convenience
export type {
  Group,
  GroupWithMembers,
  GroupMember,
  GroupStatus,
  MemberRole,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupAPIResponse,
  PaginatedGroupsResponse,
} from "./types";

export {
  useGroups,
  useGroupDetails,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupCacheUtils,
  useGroupBackgroundSync,
  groupQueryKeys,
} from "./hooks";
