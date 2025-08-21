"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoteIcon, XCircleIcon } from "lucide-react";
import { useActiveGroup } from "@/services/group/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  useVotingResultsLive,
  useCastVote,
  useCloseVoting,
  useRemoveVote,
  voteQueryKeys,
  HotelVoteSummary,
  Vote,
} from "@/services/group/voting";
import {
  VotingStats,
  HotelVoteCard,
  VotingHeader,
  EmptyVotingState,
  VotePageLoading,
} from "./components";

export default function VotePage() {
  const queryClient = useQueryClient();
  const { activeGroup, activeGroupId, isActiveGroupLoading } = useActiveGroup();
  const {
    data: votingResults,
    isLoading: isVotingLoading,
    error: votingError,
    refetch: refetchVotingResults,
  } = useVotingResultsLive(activeGroupId || "", !!activeGroupId);

  const castVoteMutation = useCastVote(activeGroupId || "");
  const closeVotingMutation = useCloseVoting(activeGroupId || "");
  const removeVoteMutation = useRemoveVote();
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});

  if (isActiveGroupLoading || isVotingLoading) {
    return <VotePageLoading />;
  }

  if (!activeGroup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <VoteIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Active Group</h2>
              <p className="text-muted-foreground">
                You need to be part of a group to participate in voting.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (votingError || !votingResults) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Unable to Load Votes
              </h2>
              <p className="text-muted-foreground mb-4">
                There was an error loading the voting results.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVote = async (
    hotelId: string,
    hotelName: string,
    weight: string,
    hotelData?: any
  ) => {
    const voteKey = `${hotelId}-${weight}`;
    setVotingStates((prev) => ({ ...prev, [voteKey]: true }));

    try {
      await castVoteMutation.mutateAsync({
        hotel_id: hotelId,
        hotel_name: hotelName,
        hotel_data: hotelData,
        is_upvote: true, // Only positive votes
        weight: weight as "1" | "2" | "3",
      });

      // Force immediate refetch of voting results
      await refetchVotingResults();

      toast.success(
        `Voted for ${hotelName} with ${"⭐".repeat(parseInt(weight))}!`
      );
    } catch (error) {
      console.error("Failed to cast vote:", error);
      toast.error("Failed to cast vote. Please try again.");
    } finally {
      setVotingStates((prev) => ({ ...prev, [voteKey]: false }));
    }
  };

  const handleCloseVoting = async () => {
    try {
      await closeVotingMutation.mutateAsync({});
      toast.success("Voting has been closed and winner selected!");
    } catch (error) {
      console.error("Failed to close voting:", error);
      toast.error("Failed to close voting. Please try again.");
    }
  };

  const canCloseVoting =
    activeGroup.user_role && ["owner", "admin"].includes(activeGroup.user_role);
  const isVotingOpen = votingResults.is_voting_open;

  // Handle removing a vote
  const handleRemoveVote = async (voteId: string) => {
    setVotingStates((prev) => ({ ...prev, [voteId]: true }));

    try {
      await removeVoteMutation.mutateAsync(voteId);

      // Force immediate refetch of voting results
      await refetchVotingResults();

      // Toast is shown in the component
    } catch (error) {
      console.error("Failed to remove vote:", error);
      toast.error("Failed to remove vote. Please try again.");
    } finally {
      setVotingStates((prev) => ({ ...prev, [voteId]: false }));
    }
  };

  // Track loading states for each hotel
  const getIsVoting = (hotel: HotelVoteSummary) => {
    return (
      !!votingStates[`${hotel.hotel_id}-1`] ||
      !!votingStates[`${hotel.hotel_id}-2`] ||
      !!votingStates[`${hotel.hotel_id}-3`]
    );
  };

  const getIsRemovingVote = (hotel: HotelVoteSummary) => {
    // Check if any vote for this hotel is being removed
    return (
      hotel.user_votes?.some((vote) => vote.id && !!votingStates[vote.id]) ||
      false
    );
  };

  // Sort hotels by weighted_score to ensure leaderboard updates correctly
  const sortedHotels = [...(votingResults?.hotels || [])].sort(
    (a, b) => b.weighted_score - a.weighted_score
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <VotingHeader
          activeGroupName={activeGroup.name}
          canCloseVoting={!!canCloseVoting}
          isVotingOpen={isVotingOpen}
          hasHotels={votingResults.hotels.length > 0}
          onCloseVoting={handleCloseVoting}
          isClosingVoting={closeVotingMutation.isPending}
        />

        {/* Voting Stats */}
        <VotingStats votingResults={votingResults} />

        {/* Hotels Leaderboard */}
        {sortedHotels.length > 0 ? (
          <div className="space-y-4">
            {sortedHotels.map((hotel, index) => (
              <HotelVoteCard
                key={hotel.hotel_id}
                hotel={hotel}
                rank={index + 1}
                isWinner={votingResults.winner?.hotel_id === hotel.hotel_id}
                isVotingOpen={isVotingOpen}
                onVote={handleVote}
                onRemoveVote={handleRemoveVote}
                isVoting={getIsVoting(hotel)}
                isRemovingVote={getIsRemovingVote(hotel)}
              />
            ))}
          </div>
        ) : (
          <EmptyVotingState />
        )}
      </div>
    </div>
  );
}
