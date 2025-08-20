"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Mountain } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useActiveGroup } from "@/services/group";

export function ActiveGroupDisplay() {
  const { isMobile } = useSidebar();
  const {
    activeGroup,
    activeGroupId,
    availableGroups,
    isActiveGroupLoading,
    isGroupsLoading,
    switchToGroup,
    hasGroups,
    isLoaded,
  } = useActiveGroup();

  // Loading state
  if (!isLoaded || isGroupsLoading || isActiveGroupLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="grid flex-1 gap-1">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // No groups state
  if (!hasGroups) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                <Mountain className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No Active Trip</span>
              <span className="truncate text-xs text-muted-foreground">
                Create your first group
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // No active group selected
  if (!activeGroup) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                <Mountain className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Select a Trip</span>
              <span className="truncate text-xs text-muted-foreground">
                Choose from your groups
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Get group initials for avatar
  const groupInitials = activeGroup.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Active group display
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {groupInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeGroup.name}</span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {activeGroup.status} trip
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {groupInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeGroup.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground capitalize">
                    {activeGroup.status} trip
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableGroups.map((group) => {
              const initials = group.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => {
                    switchToGroup(group.id);
                  }}
                  className="flex items-center gap-2 p-2"
                >
                  <Avatar className="h-6 w-6 rounded-md">
                    <AvatarFallback className="rounded-md text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium truncate text-sm">
                        {group.name}
                      </span>
                      {group.id === activeGroupId && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize truncate">
                      {group.status} trip
                      {group.description && ` • ${group.description}`}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
