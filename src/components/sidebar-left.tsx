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
import { usePathname } from "next/navigation";

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
import { ActiveGroupDisplay } from "./active-group-display";

// Active Group Header - shows current trip
const ActiveGroupHeader = () => (
  <div className="border-b h-16 flex items-center ">
    <ActiveGroupDisplay />
  </div>
);

// This is sample data.
const data = {
  navMain: [
    {
      title: "Explore Hotels",
      url: "/dashboard/hotels",
      icon: Building,
    },
    {
      title: "Vote Together",
      url: "/dashboard/vote",
      icon: Vote,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: MessageCircle,
    },
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
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  // Set mounted to true after hydration to prevent SSR mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update navigation items to set isActive based on current path
  // Only set isActive after component has mounted to prevent hydration mismatch
  const navMainWithActive = data.navMain.map((item) => ({
    ...item,
    isActive: mounted
      ? pathname === item.url || pathname.startsWith(`${item.url}/`)
      : false,
  }));

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="py-0 px-0">
        <ActiveGroupHeader />
        <NavMain items={navMainWithActive} />
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
