"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHasGroups } from "./use-active-group";
import { useUserInvitations } from "../invitations";

interface PostLoginRedirectOptions {
  enabled?: boolean;
  redirectToInvitations?: boolean;
  redirectPath?: string;
}

/**
 * Hook to handle post-login redirection based on user's groups and invitations
 *
 * This hook checks:
 * 1. If user has any active groups
 * 2. If not, checks for pending invitations
 * 3. Redirects to invitations page if user has no groups but has pending invitations
 */
export function usePostLoginRedirect({
  enabled = true,
  redirectToInvitations = true,
  redirectPath = "/dashboard/profile/my-invitations",
}: PostLoginRedirectOptions = {}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check if user has any groups
  const { hasGroups, isLoading: isLoadingGroups, groupCount } = useHasGroups();

  // Check if user has any pending invitations
  const { data: invitationsData, isLoading: isLoadingInvitations } =
    useUserInvitations(
      1,
      5, // Just need to know if any exist
      "pending",
      { enabled: enabled && !hasGroups } // Only check invitations if no groups
    );

  // Handle redirection logic
  useEffect(() => {
    if (!enabled || isLoadingGroups || (isLoadingInvitations && !hasGroups)) {
      return; // Still loading or disabled
    }

    // Done checking
    setIsChecking(false);

    // If user has no groups but has pending invitations, redirect
    if (
      !hasGroups &&
      redirectToInvitations &&
      invitationsData?.invitations?.length
    ) {
      setShouldRedirect(true);
      router.push(redirectPath);
    }
  }, [
    enabled,
    hasGroups,
    isLoadingGroups,
    isLoadingInvitations,
    invitationsData?.invitations?.length,
    redirectToInvitations,
    redirectPath,
    router,
  ]);

  return {
    isChecking,
    shouldRedirect,
    hasGroups,
    hasPendingInvitations: !!invitationsData?.invitations?.length,
    pendingInvitationsCount: invitationsData?.total || 0,
    groupCount,
  };
}

/**
 * Utility function to check if user should be redirected to invitations page
 * This is a non-hook version for server components or middleware
 */
export async function checkPostLoginRedirect(
  hasGroups: boolean,
  hasPendingInvitations: boolean
): Promise<{ shouldRedirect: boolean; redirectPath: string }> {
  if (!hasGroups && hasPendingInvitations) {
    return {
      shouldRedirect: true,
      redirectPath: "/dashboard/profile/my-invitations",
    };
  }

  return {
    shouldRedirect: false,
    redirectPath: "",
  };
}
