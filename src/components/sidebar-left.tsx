"use client";

import * as React from "react";
import {
  Building,
  Calendar,
  CreditCard,
  Home,
  MessageCircleQuestion,
  Mountain,
  Settings2,
  Users,
  Vote,
  Flag,
  MessageCircle,
  Plus,
} from "lucide-react";

import { NavFavorites } from "@/components/nav-favorites";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavWorkspaces } from "@/components/nav-workspaces";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Logo component for the app
const AppLogo = () => (
  <div className="flex items-center justify-center gap-2 px-6 h-16 border-b">
    {/* <div className="flex flex-col">
      <span className="font-bold text-2xl">Alpine</span>
    </div> */}
  </div>
);

// This is sample data.
const data = {
  navMain: [
    {
      title: "Trip Overview",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Explore",
      url: "/dashboard/explore",
      icon: Mountain,
    },
    {
      title: "Vote Together",
      url: "/dashboard/vote",
      icon: Vote,
    },
    {
      title: "Hotels & Lodging",
      url: "/dashboard/hotels",
      icon: Building,
    },
    {
      title: "Budget & Payments",
      url: "/dashboard/budget",
      icon: CreditCard,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: MessageCircle,
    },
    // Group settings
    {
      title: "Group Settings",
      url: "/dashboard/group-settings",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Trip Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Aspen Snowmass Resort",
      url: "#",
      emoji: "⛷️",
    },
  ],
  workspaces: [
    // {
    //   name: "Destination Research",
    //   emoji: "🏔️",
    //   pages: [
    //     {
    //       name: "Resort Comparison & Reviews",
    //       url: "#",
    //       emoji: "📊",
    //     },
    //     {
    //       name: "Snow Conditions & Weather",
    //       url: "#",
    //       emoji: "🌨️",
    //     },
    //     {
    //       name: "Trail Maps & Difficulty Levels",
    //       url: "#",
    //       emoji: "🗺️",
    //     },
    //   ],
    // },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="py-0 px-0">
        <AppLogo />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavFavorites favorites={data.favorites} /> */}
        {/* <NavWorkspaces workspaces={data.workspaces} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Link href="/group/new">
          <Button className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create New Group
          </Button>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
