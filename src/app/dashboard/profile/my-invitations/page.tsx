"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUserInvitations,
  useAcceptInvitation,
  useRejectInvitation,
} from "@/services/group/invitations";
import { useActiveGroup } from "@/services/group/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Check, X, Loader2 } from "lucide-react";

export default function MyInvitationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUserInvitations(page, 10, "pending");
  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutate: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation();

  // Get active group information
  const { activeGroupId, hasGroups, isActiveGroupValid } = useActiveGroup();

  // Handle invitation acceptance
  const handleAccept = (invitationId: string) => {
    acceptInvitation(invitationId, {
      onSuccess: (response) => {
        // Redirect to the group page if successful
        if (response.data?.group_id) {
          router.push(`/dashboard`);
        }
      },
    });
  };

  // Handle invitation rejection
  const handleReject = (invitationId: string) => {
    rejectInvitation(invitationId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading invitations...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <h2 className="text-lg font-medium text-red-800">
          Error loading invitations
        </h2>
        <p className="text-red-700">Please try again later.</p>
      </div>
    );
  }

  // No invitations state
  if (!data?.invitations || data.invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Pending Invitations</h2>
          <p className="text-muted-foreground">
            You don't have any pending invitations to join ski trip groups.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Button onClick={() => router.push("/group/new")}>
              Create New Group
            </Button>
            {activeGroupId && isActiveGroupValid && (
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/group-settings")}
              >
                Manage Current Group
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 min-h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-6">My Invitations</h1>

      <div className="space-y-6">
        {data.invitations.map((invitation) => (
          <Card key={invitation.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {invitation.group?.name || "Ski Trip Group"}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Invitation
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm mt-1">
                  Invited by{" "}
                  {invitation.inviter?.full_name || invitation.invited_by}
                </p>

                {invitation.group?.description && (
                  <p className="mt-2">{invitation.group.description}</p>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {invitation.group?.check_in_date &&
                        format(
                          new Date(invitation.group.check_in_date),
                          "MMM d, yyyy"
                        )}
                      {" - "}
                      {invitation.group?.check_out_date &&
                        format(
                          new Date(invitation.group.check_out_date),
                          "MMM d, yyyy"
                        )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 self-end md:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(invitation.id)}
                  disabled={isRejecting || isAccepting}
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Decline
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={isRejecting || isAccepting}
                >
                  {isAccepting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Accept
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-4">
              Expires: {format(new Date(invitation.expires_at), "MMMM d, yyyy")}
            </div>
          </Card>
        ))}
      </div>

      {data.hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
