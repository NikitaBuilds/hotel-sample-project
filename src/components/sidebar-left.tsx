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
} from "lucide-react";

import { NavFavorites } from "@/components/nav-favorites";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavWorkspaces } from "@/components/nav-workspaces";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
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
  navMain: [
    {
      title: "Trip Overview",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "Destinations",
      url: "#",
      icon: Mountain,
    },
    {
      title: "Our Group",
      url: "#",
      icon: Users,
      badge: "5",
    },
    {
      title: "Vote Together",
      url: "#",
      icon: Vote,
    },
    {
      title: "Hotels & Lodging",
      url: "#",
      icon: Building,
    },
    {
      title: "Budget & Payments",
      url: "#",
      icon: CreditCard,
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
    {
      name: "Whistler Blackcomb",
      url: "#",
      emoji: "🏔️",
    },
    {
      name: "Vail Mountain Resort",
      url: "#",
      emoji: "🎿",
    },
    {
      name: "Group Chat & Messages",
      url: "#",
      emoji: "💬",
    },
    {
      name: "Weather Forecasts",
      url: "#",
      emoji: "🌨️",
    },
    {
      name: "Packing Checklist",
      url: "#",
      emoji: "🎒",
    },
    {
      name: "Equipment Rentals",
      url: "#",
      emoji: "🎿",
    },
    {
      name: "Lift Tickets & Passes",
      url: "#",
      emoji: "🎫",
    },
    {
      name: "Après-Ski Activities",
      url: "#",
      emoji: "🍻",
    },
    {
      name: "Emergency Contacts",
      url: "#",
      emoji: "🚨",
    },
  ],
  workspaces: [
    {
      name: "Destination Research",
      emoji: "🏔️",
      pages: [
        {
          name: "Resort Comparison & Reviews",
          url: "#",
          emoji: "📊",
        },
        {
          name: "Snow Conditions & Weather",
          url: "#",
          emoji: "🌨️",
        },
        {
          name: "Trail Maps & Difficulty Levels",
          url: "#",
          emoji: "🗺️",
        },
      ],
    },
    {
      name: "Accommodation Planning",
      emoji: "🏨",
      pages: [
        {
          name: "Hotel Options & Pricing",
          url: "#",
          emoji: "🏠",
        },
        {
          name: "Booking Status & Confirmations",
          url: "#",
          emoji: "✅",
        },
        {
          name: "Room Assignments & Preferences",
          url: "#",
          emoji: "🛏️",
        },
      ],
    },
    {
      name: "Activity Planning",
      emoji: "⛷️",
      pages: [
        {
          name: "Ski Lessons & Instruction",
          url: "#",
          emoji: "🎿",
        },
        {
          name: "Equipment & Gear Rentals",
          url: "#",
          emoji: "🎒",
        },
        {
          name: "Après-Ski & Dining",
          url: "#",
          emoji: "🍽️",
        },
      ],
    },
    {
      name: "Budget Management",
      emoji: "💰",
      pages: [
        {
          name: "Trip Cost Breakdown",
          url: "#",
          emoji: "📋",
        },
        {
          name: "Payment Tracking & Splits",
          url: "#",
          emoji: "💳",
        },
        {
          name: "Expense Reports & Receipts",
          url: "#",
          emoji: "🧾",
        },
      ],
    },
    {
      name: "Group Coordination",
      emoji: "👥",
      pages: [
        {
          name: "Member Status & Availability",
          url: "#",
          emoji: "📅",
        },
        {
          name: "Group Decisions & Voting",
          url: "#",
          emoji: "🗳️",
        },
        {
          name: "Communication & Updates",
          url: "#",
          emoji: "💬",
        },
      ],
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.favorites} />
        <NavWorkspaces workspaces={data.workspaces} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
