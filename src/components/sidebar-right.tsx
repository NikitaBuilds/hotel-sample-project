import * as React from "react";
import { Plus, Flag, Mountain } from "lucide-react";

import { Calendars } from "@/components/calendars";
import { DatePicker } from "@/components/date-picker";
import { GroupMembers } from "@/components/group-members";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  teams: [
    {
      name: "Winter Warriors 2024",
      logo: Flag,
      plan: "Active Trip",
    },
    {
      name: "Powder Seekers",
      logo: Mountain,
      plan: "Planning",
    },
    {
      name: "Alpine Adventures",
      logo: Mountain,
      plan: "Completed",
    },
  ],
  calendars: [
    {
      name: "My Calendars",
      items: ["Personal", "Work", "Family"],
    },
    {
      name: "Favorites",
      items: ["Holidays", "Birthdays"],
    },
    {
      name: "Other",
      items: ["Travel", "Reminders", "Deadlines"],
    },
  ],
};

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="fixed right-0 top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <DatePicker />
        {/* <SidebarSeparator className="mx-0 " /> */}
        <GroupMembers />
        {/* Commented out trips section - replaced with group members
        <div className="px-3 py-4">
          <h3 className="text-xs font-medium text-muted-foreground mb-3 px-2">
            Your Trips
          </h3>
          <div className="space-y-2">
            {data.teams.map((team, index) => {
              const gradients = [
                "bg-gradient-to-r from-blue-500 to-purple-600",
                "bg-gradient-to-r from-green-500 to-teal-600",
                "bg-gradient-to-r from-orange-500 to-pink-600",
              ];
              return (
                <div
                  key={team.name}
                  className={`${gradients[index]} p-3 rounded-lg text-white cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm leading-tight">
                      {team.name}
                    </span>
                    <span className="text-xs text-white/80 mt-1">
                      {team.plan}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full">
              <Plus className="size-4" />
              <span>Add New Member</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
