"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MountainIcon, VoteIcon, UsersIcon, ClockIcon } from "lucide-react";

interface VotingStatsProps {
  votingResults: {
    total_hotels: number;
    total_votes: number;
    total_voters: number;
    is_voting_open: boolean;
  };
}

export function VotingStats({ votingResults }: VotingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MountainIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hotels</p>
              <p className="text-2xl font-bold">{votingResults.total_hotels}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <VoteIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Votes</p>
              <p className="text-2xl font-bold">{votingResults.total_votes}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voters</p>
              <p className="text-2xl font-bold">{votingResults.total_voters}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <ClockIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">
                {votingResults.is_voting_open ? "Open" : "Closed"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
