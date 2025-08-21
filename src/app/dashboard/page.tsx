"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHasGroups } from "@/services/group/hooks/use-active-group";
import { useUserInvitations } from "@/services/group/invitations";
import { useUser } from "@/services/supabase/use-user";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading: userLoading } = useUser();

  // Only make API calls after user is authenticated and loaded
  const isUserReady = !userLoading && !!user;

  // Check if user has any groups - only when user is ready
  const { hasGroups, isLoading: isLoadingGroups } = useHasGroups();

  // Check if user has any pending invitations
  // Only fetch invitations if the user has no groups and user is ready
  const { data: invitationsData, isLoading: isLoadingInvitations } =
    useUserInvitations(
      1,
      5, // Just need to know if any exist
      "pending",
      { enabled: isUserReady && !hasGroups && !isLoadingGroups } // Only check invitations if user is ready and has no groups
    );

  useEffect(() => {
    // Wait until user is ready and we have loaded both groups and invitations (if needed)
    if (
      userLoading ||
      !isUserReady ||
      isLoadingGroups ||
      (isLoadingInvitations && !hasGroups)
    ) {
      return;
    }

    setIsChecking(false);

    // If user has no groups but has pending invitations, redirect to invitations page
    if (
      !hasGroups &&
      invitationsData?.invitations &&
      invitationsData.invitations.length > 0
    ) {
      router.push("/dashboard/profile/my-invitations");
    } else {
      // Otherwise redirect to hotels page
      router.push("/dashboard/hotels");
    }
  }, [
    userLoading,
    isUserReady,
    hasGroups,
    isLoadingGroups,
    isLoadingInvitations,
    invitationsData,
    router,
  ]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Return empty fragment - we're always redirecting
  return <></>; // This will never be shown as we always redirect
}
