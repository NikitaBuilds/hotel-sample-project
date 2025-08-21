"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  TrophyIcon,
  ThumbsUpIcon,
  CrownIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  MountainIcon,
} from "lucide-react";
import type {
  HotelVoteSummary,
  VoteWeight,
} from "@/services/group/voting/types";

interface HotelVoteCardProps {
  hotel: HotelVoteSummary;
  rank: number;
  isWinner: boolean;
  isVotingOpen: boolean;
  onVote: (
    hotelId: string,
    hotelName: string,
    weight: string,
    hotelData?: any
  ) => void;
  onRemoveVote?: (voteId: string) => void;
  isVoting: boolean;
  isRemovingVote?: boolean;
}

export function HotelVoteCard({
  hotel,
  rank,
  isWinner,
  isVotingOpen,
  onVote,
  onRemoveVote,
  isVoting,
  isRemovingVote,
}: HotelVoteCardProps) {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState<VoteWeight>("2");

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownIcon className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <TrophyIcon className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <TrophyIcon className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-medium text-slate-600">#{rank}</span>;
  };

  // Deduplicate user_votes to prevent React key errors
  const userVotes = Array.from(
    new Map(hotel.user_votes.map((vote) => [vote.id, vote])).values()
  );
  const hasVoted = userVotes.length > 0;

  const handleHotelClick = () => {
    router.push(`/dashboard/hotels/${hotel.hotel_id}`);
  };

  const handleVote = () => {
    // If user has already voted for this hotel, replace their vote
    if (userVotes.length > 0) {
      // If they're selecting the same weight they already voted with, ask if they want to remove the vote
      const existingVoteWithSameWeight = userVotes.find(
        (vote) => vote.weight === selectedWeight
      );

      if (existingVoteWithSameWeight && onRemoveVote) {
        if (
          confirm(
            `Do you want to remove your ${selectedWeight}-star vote for this hotel?`
          )
        ) {
          onRemoveVote(existingVoteWithSameWeight.id);
          toast.success(
            `Removed your ${selectedWeight}-star vote for ${hotel.hotel_name}`
          );
        }
        return;
      }

      // If they're changing the weight, replace their vote
      toast.info(
        `Changing your vote for ${hotel.hotel_name} to ${selectedWeight} stars`
      );
    }

    onVote(hotel.hotel_id, hotel.hotel_name, selectedWeight, hotel.hotel_data);
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all
        ${isWinner ? "ring-1 ring-yellow-400" : "border border-gray-100"}
      `}
    >
      {isWinner && (
        <div className="absolute top-2 right-2 z-20">
          <Badge className="bg-yellow-500 text-white text-xs px-2 py-0.5">
            <CrownIcon className="h-3 w-3 mr-1" />
            Winner
          </Badge>
        </div>
      )}

      <div className="flex min-h-[180px]">
        {/* Hotel Image - Left Third */}
        <div className="relative w-1/3">
          {hotel.hotel_data?.hotelImages?.[0]?.url ? (
            <img
              src={hotel.hotel_data.hotelImages[0].url}
              alt={hotel.hotel_name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
              <MountainIcon className="h-10 w-10 text-gray-400" />
            </div>
          )}

          {/* Rank Badge */}
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
              {getRankIcon(rank)}
            </div>
          </div>

          {/* Score Badge */}
          <div className="absolute bottom-2 left-2 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-md px-2 py-0.5 shadow-sm">
              <span className="font-medium text-sm text-gray-800">
                {hotel.weighted_score} pts
              </span>
            </div>
          </div>
        </div>

        {/* Hotel Info - Right Two Thirds */}
        <div className="w-2/3 p-4 flex flex-col justify-between min-h-full">
          {/* Top Section */}
          <div>
            <button
              onClick={handleHotelClick}
              className="text-left group mb-2 block w-full"
            >
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {hotel.hotel_name}
              </h3>
            </button>

            {hotel.hotel_data?.address && (
              <div className="flex items-center gap-1 text-gray-500 mb-2">
                <MapPinIcon className="h-3 w-3" />
                <span className="text-xs">
                  {hotel.hotel_data.city}, {hotel.hotel_data.country}
                </span>
              </div>
            )}

            {hotel.hotel_data?.rating && (
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(hotel.hotel_data.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  {hotel.hotel_data.rating?.toFixed(1)}
                </span>
              </div>
            )}

            {/* Vote Stats - Simplified */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <ThumbsUpIcon className="h-3 w-3 text-gray-500" />
                <span>{hotel.upvotes} votes</span>
              </div>

              {/* Simplified Weight Breakdown */}
              <div className="flex gap-1">
                {hotel.vote_breakdown
                  .filter((breakdown) => breakdown.upvotes > 0)
                  .map((breakdown) => (
                    <span
                      key={breakdown.weight}
                      className="text-xs text-gray-600"
                      title={`${breakdown.upvotes} votes with ${breakdown.weight} stars`}
                    >
                      {"⭐".repeat(parseInt(breakdown.weight))}:{" "}
                      {breakdown.upvotes}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Bottom Section - Simplified */}
          <div>
            {/* Voters - More subtle */}
            {hotel.voters.upvoters.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-1.5">
                  {/* Deduplicate voters by creating a Map with voter.id as keys */}
                  {Array.from(
                    new Map(
                      hotel.voters.upvoters.map((voter) => [voter.id, voter])
                    ).values()
                  )
                    .slice(0, 3)
                    .map((voter, index) => (
                      <Avatar
                        key={`${voter.id}-${index}`}
                        className="h-5 w-5 border border-white"
                        title={`${voter.full_name} - ${"⭐".repeat(
                          parseInt(voter.weight)
                        )}`}
                      >
                        <AvatarImage src={voter.avatar_url} />
                        <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                          {voter.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  {/* Deduplicate before checking length */}
                  {new Map(
                    hotel.voters.upvoters.map((voter) => [voter.id, voter])
                  ).size > 3 && (
                    <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                      <span className="text-[10px] text-gray-600">
                        +
                        {new Map(
                          hotel.voters.upvoters.map((voter) => [
                            voter.id,
                            voter,
                          ])
                        ).size - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Voting Section - Integrated with user's votes */}
            {isVotingOpen ? (
              <div className="flex items-center gap-1.5">
                {/* Weight Selection - More subtle */}
                {(["1", "2", "3"] as VoteWeight[]).map((weight) => {
                  const userVoteForWeight = userVotes.find(
                    (v) => v.weight === weight
                  );
                  const hasVotedWithWeight = !!userVoteForWeight;
                  const isSelected = selectedWeight === weight;

                  return (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`
                        px-2 py-0.5 rounded text-xs transition-all
                        ${
                          hasVotedWithWeight
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : isSelected
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                        }
                      `}
                    >
                      {"⭐".repeat(parseInt(weight))}
                      {hasVotedWithWeight && <span className="ml-0.5">✓</span>}
                    </button>
                  );
                })}

                {/* Vote and Remove buttons */}
                <div className="ml-auto flex gap-1">
                  {hasVoted && onRemoveVote && (
                    <Button
                      onClick={() => {
                        if (
                          userVotes[0] &&
                          confirm(`Remove your vote for ${hotel.hotel_name}?`)
                        ) {
                          onRemoveVote(userVotes[0].id);
                        }
                      }}
                      disabled={isVoting || isRemovingVote}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                    >
                      {isRemovingVote ? "Removing..." : "Remove Vote"}
                    </Button>
                  )}
                  <Button
                    onClick={handleVote}
                    disabled={isVoting || isRemovingVote}
                    size="sm"
                    variant="ghost"
                    className={`text-xs h-6 px-2 ${
                      hasVoted ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {isVoting ? "Voting..." : hasVoted ? "Change Vote" : "Vote"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Voting Closed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
