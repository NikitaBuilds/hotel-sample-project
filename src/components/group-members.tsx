"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample data for group members
const sampleMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "",
    role: "Trip Leader",
    status: "online",
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "",
    role: "Budget Manager",
    status: "online",
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    email: "mike@example.com",
    avatar: "",
    role: "Activities Coordinator",
    status: "away",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    avatar: "",
    role: "Accommodation Lead",
    status: "offline",
  },
  {
    id: 5,
    name: "David Kim",
    email: "david@example.com",
    avatar: "",
    role: "Member",
    status: "online",
  },
];

export function GroupMembers() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
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

  return (
    <div className="px-3 py-4">
      <h3 className="text-xs font-medium text-muted-foreground mb-3 px-2">
        Group Members
      </h3>
      <div className="space-y-3">
        {sampleMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                  member.status
                )}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
