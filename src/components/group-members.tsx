"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Crown, Shield, User } from "lucide-react";
import { useActiveGroup } from "@/services/group";
import type { MemberRole } from "@/services/group/management/types";

export function GroupMembers() {
  const {
    activeGroup,
    activeGroupId,
    isActiveGroupLoading,
    hasGroups,
    members,
    memberCount,
    maxMembers,
    availableSlots,
    pendingInvitations,
    acceptedInvitations,
    rejectedInvitations,
  } = useActiveGroup();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "admin":
        return <Shield className="h-3 w-3 text-blue-500" />;
      case "member":
        return <User className="h-3 w-3 text-muted-foreground" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: MemberRole) => {
    switch (role) {
      case "owner":
        return "Trip Organizer";
      case "admin":
        return "Admin";
      case "member":
        return "Member";
      default:
        return "Member";
    }
  };

  if (isActiveGroupLoading) {
    return (
      <div className="px-3 py-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-3 px-2">
          Group Members
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasGroups || !activeGroup) {
    return (
      <div className="px-3 py-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-3 px-2">
          Group Members
        </h3>
        <div className="p-4 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No group selected</p>
          <p className="text-xs text-muted-foreground">
            Join or create a group to see members
          </p>
        </div>
      </div>
    );
  }

  // Use members and availableSlots from the hook

  return (
    <div className="px-3 py-4" key={activeGroupId}>
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-xs font-medium text-muted-foreground">
          Group Members
        </h3>
        <Badge variant="outline" className="text-xs">
          {memberCount}/{maxMembers}
        </Badge>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={member.user?.avatar_url}
                  alt={member.user?.full_name}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(
                    member.user?.full_name || member.user?.email || "?"
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5">
                {getRoleIcon(member.role)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {member.user?.full_name || member.user?.email || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {getRoleLabel(member.role)}
              </p>
            </div>
          </div>
        ))}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-2">
            <div className="px-2 pt-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Pending Invitations
              </h4>
            </div>
            {pendingInvitations.slice(0, 3).map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-yellow-100">
                    {getInitials(invitation.invited_email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {invitation.invited_email.split("@")[0]}
                  </p>
                  <p className="text-xs text-yellow-600">Invitation pending</p>
                </div>
              </div>
            ))}
            {pendingInvitations.length > 3 && (
              <div className="text-center py-1">
                <p className="text-xs text-muted-foreground">
                  +{pendingInvitations.length - 3} more pending
                </p>
              </div>
            )}
          </div>
        )}

        {/* Available slots */}
        {availableSlots > pendingInvitations.length && (
          <div className="space-y-2">
            {Array.from({
              length: Math.min(availableSlots - pendingInvitations.length, 2),
            }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center gap-3 p-2 rounded-lg border-2 border-dashed border-muted opacity-50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    <UserPlus className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Empty slot</p>
                  <p className="text-xs text-muted-foreground">
                    Invite a friend
                  </p>
                </div>
              </div>
            ))}
            {availableSlots - pendingInvitations.length > 2 && (
              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground">
                  +{availableSlots - pendingInvitations.length - 2} more slot
                  {availableSlots - pendingInvitations.length - 2 !== 1
                    ? "s"
                    : ""}{" "}
                  available
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
