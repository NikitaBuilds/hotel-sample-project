"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  CalendarIcon,
  Settings,
  Mail,
  Trash2,
  Crown,
  Shield,
  User,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useActiveGroup,
  useUpdateGroup,
  useDeleteGroup,
  useSendInvitation,
} from "@/services/group";
import type {
  UpdateGroupRequest,
  MemberRole,
} from "@/services/group/management/types";

export default function GroupSettingsPage() {
  const router = useRouter();
  const {
    activeGroup,
    activeGroupId,
    isActiveGroupLoading,
    members,
    memberCount,
    maxMembers,
    pendingInvitations,
    acceptedInvitations,
    rejectedInvitations,
  } = useActiveGroup();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    checkInDate: undefined as Date | undefined,
    checkOutDate: undefined as Date | undefined,
    maxMembers: 5,
  });
  const [newInviteEmail, setNewInviteEmail] = useState("");

  const updateGroupMutation = useUpdateGroup(activeGroupId || "");
  const deleteGroupMutation = useDeleteGroup();
  const sendInvitationMutation = useSendInvitation();

  // Initialize edit data when active group loads
  useState(() => {
    if (activeGroup) {
      setEditData({
        name: activeGroup.name,
        description: activeGroup.description || "",
        checkInDate: new Date(activeGroup.check_in_date),
        checkOutDate: new Date(activeGroup.check_out_date),
        maxMembers: activeGroup.max_members,
      });
    }
  });

  if (isActiveGroupLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!activeGroup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Group Selected</h1>
          <p className="text-muted-foreground mb-6">
            Select a group from the sidebar to manage its settings.
          </p>
          <Button onClick={() => router.push("/group/new")}>
            Create New Group
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editData.checkInDate || !editData.checkOutDate) return;

    const updateData: UpdateGroupRequest = {
      name: editData.name,
      description: editData.description,
      check_in_date: editData.checkInDate.toISOString().split("T")[0],
      check_out_date: editData.checkOutDate.toISOString().split("T")[0],
      max_members: editData.maxMembers,
    };

    try {
      await updateGroupMutation.mutateAsync(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update group:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGroupMutation.mutateAsync(activeGroupId!);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const handleSendInvitation = async () => {
    if (!newInviteEmail.trim() || !activeGroupId) return;

    try {
      await sendInvitationMutation.mutateAsync({
        group_id: activeGroupId,
        invited_email: newInviteEmail.trim(),
      });
      setNewInviteEmail("");
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "member":
        return <User className="h-4 w-4 text-muted-foreground" />;
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
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwner = activeGroup.user_role === "owner";
  const isAdmin = activeGroup.user_role === "admin" || isOwner;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{activeGroup.name}</h1>
            <p className="text-muted-foreground">
              Manage your group settings and members
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {activeGroup.status}
          </Badge>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Group Details</CardTitle>
                <CardDescription>
                  Update your group name, description, and trip dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEditing ? (
                  // View Mode
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Group Name</Label>
                      <p className="text-lg">{activeGroup.name}</p>
                    </div>
                    {activeGroup.description && (
                      <div>
                        <Label className="text-sm font-medium">
                          Description
                        </Label>
                        <p className="text-muted-foreground">
                          {activeGroup.description}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Check-in Date
                        </Label>
                        <p>
                          {format(new Date(activeGroup.check_in_date), "PPP")}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Check-out Date
                        </Label>
                        <p>
                          {format(new Date(activeGroup.check_out_date), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Maximum Members
                      </Label>
                      <p>{activeGroup.max_members} people</p>
                    </div>
                    {isAdmin && (
                      <Button onClick={() => setIsEditing(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Details
                      </Button>
                    )}
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Group Name</Label>
                      <Input
                        id="edit-name"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editData.description}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        disabled={updateGroupMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {updateGroupMutation.isPending
                          ? "Saving..."
                          : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Management */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
                <CardDescription>
                  Manage who's part of your trip ({memberCount}/{maxMembers}{" "}
                  members)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.user?.avatar_url} />
                          <AvatarFallback>
                            {getInitials(
                              member.user?.full_name ||
                                member.user?.email ||
                                "?"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user?.full_name ||
                              member.user?.email ||
                              "Unknown"}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(member.role)}
                            <span className="text-sm text-muted-foreground">
                              {getRoleLabel(member.role)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(member.joined_at), "MMM d, yyyy")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invitations Management */}
          <TabsContent value="invitations">
            <div className="space-y-6">
              {/* Send New Invitation */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Send Invitation</CardTitle>
                    <CardDescription>
                      Invite new friends to join your trip
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="friend@example.com"
                        type="email"
                        value={newInviteEmail}
                        onChange={(e) => setNewInviteEmail(e.target.value)}
                      />
                      <Button
                        onClick={handleSendInvitation}
                        disabled={
                          !newInviteEmail.trim() ||
                          sendInvitationMutation.isPending
                        }
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        {sendInvitationMutation.isPending
                          ? "Sending..."
                          : "Send Invite"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Pending Invitations ({pendingInvitations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingInvitations.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-yellow-100">
                                {getInitials(invitation.invited_email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {invitation.invited_email}
                              </p>
                              <p className="text-sm text-yellow-600">
                                Sent{" "}
                                {format(
                                  new Date(invitation.created_at),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner && (
                  <div className="p-4 border border-destructive rounded-lg">
                    <h3 className="font-medium text-destructive mb-2">
                      Delete Group
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will permanently delete the group and all its data.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Group
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This will permanently delete "{activeGroup.name}"
                            and all its data.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button onClick={handleDelete} variant="destructive">
                            {deleteGroupMutation.isPending
                              ? "Deleting..."
                              : "Delete Group"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
