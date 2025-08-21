"use client";

import { Button } from "@/components/ui/button";
import { TrophyIcon } from "lucide-react";

interface VotingHeaderProps {
  activeGroupName: string;
  canCloseVoting: boolean;
  isVotingOpen: boolean;
  hasHotels: boolean;
  onCloseVoting: () => void;
  isClosingVoting: boolean;
}

export function VotingHeader({
  activeGroupName,
  canCloseVoting,
  isVotingOpen,
  hasHotels,
  onCloseVoting,
  isClosingVoting,
}: VotingHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrophyIcon className="h-8 w-8 text-yellow-500" />
          Hotel Voting
        </h1>
        <p className="text-muted-foreground mt-1">
          Vote together on the perfect ski destination for {activeGroupName}
        </p>
      </div>

      {canCloseVoting && isVotingOpen && hasHotels && (
        <Button
          onClick={onCloseVoting}
          disabled={isClosingVoting}
          variant="outline"
          className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
        >
          {isClosingVoting ? "Closing..." : "Close Voting"}
        </Button>
      )}
    </div>
  );
}
