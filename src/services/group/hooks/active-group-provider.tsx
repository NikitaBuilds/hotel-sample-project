"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useGroups, useGroupDetails } from "../management";
import { useGroupInvitations } from "../invitations";
import type { GroupWithMembers } from "../management/types";
import type { Invitation } from "../invitations/types";

const ACTIVE_GROUP_KEY = "ski-trip-active-group-id";

interface ActiveGroupContextType {
  // Active group data
  activeGroup: GroupWithMembers | undefined;
  activeGroupId: string | null;
  isActiveGroupLoading: boolean;
  activeGroupError: any;

  // Group members (from activeGroup.members)
  members: any[];
  memberCount: number;
  maxMembers: number;
  availableSlots: number;

  // Invitations data
  invitations: Invitation[];
  pendingInvitations: Invitation[];
  acceptedInvitations: Invitation[];
  rejectedInvitations: Invitation[];
  isInvitationsLoading: boolean;

  // All groups for switching
  availableGroups: GroupWithMembers[];
  isGroupsLoading: boolean;

  // Actions
  setActiveGroup: (groupId: string | null) => void;
  switchToGroup: (groupId: string) => void;
  clearActiveGroup: () => void;

  // State
  isLoaded: boolean;
  hasGroups: boolean;
  isActiveGroupValid: boolean;
}

const ActiveGroupContext = createContext<ActiveGroupContextType | undefined>(
  undefined
);

interface ActiveGroupProviderProps {
  children: ReactNode;
}

export function ActiveGroupProvider({ children }: ActiveGroupProviderProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get all user's groups
  const { data: groupsResponse, isLoading: groupsLoading } = useGroups(1, 50);

  // Get active group details
  const {
    data: activeGroup,
    isLoading: activeGroupLoading,
    error: activeGroupError,
  } = useGroupDetails(activeGroupId || "", {
    enabled: !!activeGroupId,
  });

  // Get active group invitations
  const { data: invitationsResponse, isLoading: invitationsLoading } =
    useGroupInvitations(activeGroupId || "", 1, 50, {
      enabled: !!activeGroupId,
    });

  // Set active group and persist to localStorage
  const setActiveGroup = useCallback((groupId: string | null) => {
    setActiveGroupId(groupId);
    if (groupId) {
      localStorage.setItem(ACTIVE_GROUP_KEY, groupId);
    } else {
      localStorage.removeItem(ACTIVE_GROUP_KEY);
    }
  }, []);

  // Load active group ID from localStorage on mount
  useEffect(() => {
    const storedGroupId = localStorage.getItem(ACTIVE_GROUP_KEY);
    if (storedGroupId) {
      setActiveGroupId(storedGroupId);
    }
    setIsLoaded(true);
  }, []);

  // Auto-select group if no active group and groups are available
  useEffect(() => {
    if (
      isLoaded &&
      !activeGroupId &&
      groupsResponse?.groups &&
      groupsResponse.groups.length > 0
    ) {
      // Always auto-select the first group (especially important for single group users)
      const firstGroup = groupsResponse.groups[0];
      setActiveGroup(firstGroup.id);
    }
  }, [isLoaded, activeGroupId, groupsResponse?.groups, setActiveGroup]);

  // Switch to a specific group
  const switchToGroup = useCallback(
    (groupId: string) => {
      setActiveGroup(groupId);
    },
    [setActiveGroup]
  );

  // Clear active group
  const clearActiveGroup = useCallback(() => {
    setActiveGroup(null);
  }, [setActiveGroup]);

  // Get all available groups for switching
  const availableGroups = groupsResponse?.groups || [];

  // Get invitations data
  const invitations = invitationsResponse?.invitations || [];
  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );
  const acceptedInvitations = invitations.filter(
    (inv) => inv.status === "accepted"
  );
  const rejectedInvitations = invitations.filter(
    (inv) => inv.status === "rejected"
  );

  // Check if the stored group ID is still valid
  const isActiveGroupValid =
    activeGroupId && availableGroups.some((g) => g.id === activeGroupId);

  // If stored group is no longer valid, clear it
  useEffect(() => {
    if (
      isLoaded &&
      activeGroupId &&
      !isActiveGroupValid &&
      availableGroups.length > 0
    ) {
      // Switch to first available group
      setActiveGroup(availableGroups[0].id);
    } else if (
      isLoaded &&
      activeGroupId &&
      !isActiveGroupValid &&
      availableGroups.length === 0
    ) {
      // No groups available, clear active group
      clearActiveGroup();
    }
  }, [
    isLoaded,
    activeGroupId,
    isActiveGroupValid,
    availableGroups,
    setActiveGroup,
    clearActiveGroup,
  ]);

  const contextValue: ActiveGroupContextType = {
    // Active group data
    activeGroup,
    activeGroupId,
    isActiveGroupLoading: activeGroupLoading || invitationsLoading,
    activeGroupError,

    // Group members (from activeGroup.members)
    members: activeGroup?.members || [],
    memberCount: activeGroup?.member_count || 0,
    maxMembers: activeGroup?.max_members || 5,
    availableSlots:
      (activeGroup?.max_members || 5) - (activeGroup?.member_count || 0),

    // Invitations data
    invitations,
    pendingInvitations,
    acceptedInvitations,
    rejectedInvitations,
    isInvitationsLoading: invitationsLoading,

    // All groups for switching
    availableGroups,
    isGroupsLoading: groupsLoading,

    // Actions
    setActiveGroup,
    switchToGroup,
    clearActiveGroup,

    // State
    isLoaded,
    hasGroups: availableGroups.length > 0,
    isActiveGroupValid,
  };

  return (
    <ActiveGroupContext.Provider value={contextValue}>
      {children}
    </ActiveGroupContext.Provider>
  );
}

export function useActiveGroup() {
  const context = useContext(ActiveGroupContext);
  if (context === undefined) {
    throw new Error(
      "useActiveGroup must be used within an ActiveGroupProvider"
    );
  }
  return context;
}
