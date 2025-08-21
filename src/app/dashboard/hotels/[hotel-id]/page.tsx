"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  WifiIcon,
  CarIcon,
  UtensilsIcon,
  MountainIcon,
  DumbbellIcon,
  CoffeeIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  UsersIcon,
  BedIcon,
  AirVentIcon,
  TvIcon,
  ShieldIcon,
  ThumbsUpIcon,
  VoteIcon,
  CheckIcon,
} from "lucide-react";
import { useHotelDetails } from "@/services/lite/hotels";
import { useActiveGroup } from "@/services/group/hooks";
import { useCastVote } from "@/services/group/voting";
import type { HotelDetails } from "@/services/lite/types";
import type { VoteWeight } from "@/services/group/voting/types";

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params["hotel-id"] as string;

  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [selectedWeight, setSelectedWeight] = useState<VoteWeight>("2");

  const {
    data: hotelResponse,
    isLoading,
    error,
  } = useHotelDetails(hotelId, {
    enabled: !!hotelId,
  });

  const { activeGroup, activeGroupId } = useActiveGroup();
  const castVoteMutation = useCastVote(activeGroupId || "");

  const hotel = hotelResponse?.data?.data;

  const handleVote = async () => {
    if (!hotel || !activeGroupId) return;

    const voteKey = `${hotelId}-${selectedWeight}`;
    setVotingStates((prev) => ({ ...prev, [voteKey]: true }));

    try {
      await castVoteMutation.mutateAsync({
        hotel_id: hotelId,
        hotel_name: hotel.name,
        hotel_data: hotel,
        is_upvote: true, // Only positive votes
        weight: selectedWeight,
      });
      toast.success(
        `Voted for ${hotel.name} with ${"⭐".repeat(parseInt(selectedWeight))}!`
      );
    } catch (error) {
      console.error("Failed to cast vote:", error);
      toast.error("Failed to cast vote. Please try again.");
    } finally {
      setVotingStates((prev) => ({ ...prev, [voteKey]: false }));
    }
  };

  if (isLoading) {
    return <HotelDetailsLoading />;
  }

  if (error || !hotel) {
    return (
      <div className="container mx-auto px-4 ">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">Hotel Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  We couldn't find details for this hotel. It may have been
                  removed or the ID is incorrect.
                </p>
                <Button onClick={() => router.push("/dashboard/hotels")}>
                  Back to Hotel Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        {/* Hotel Overview */}
        <HotelOverview hotel={hotel} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <HotelDescription hotel={hotel} />

            {/* Rooms */}
            <HotelRooms hotel={hotel} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Status */}
            {activeGroup && (
              <HotelVotingStatus
                hotel={hotel}
                activeGroup={activeGroup}
                onVote={handleVote}
                selectedWeight={selectedWeight}
                setSelectedWeight={setSelectedWeight}
                votingStates={votingStates}
              />
            )}

            {/* Location */}
            <HotelLocation hotel={hotel} />

            {/* Contact Info */}
            <HotelContact hotel={hotel} />

            {/* Check-in/out Times */}
            <HotelCheckInOut hotel={hotel} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelOverview({ hotel }: { hotel: HotelDetails }) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotel Image */}
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            {hotel.hotelImages?.[0]?.url ? (
              <img
                src={hotel.hotelImages[0].url}
                alt={hotel.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <MountainIcon className="h-16 w-16 text-blue-300" />
              </div>
            )}
          </div>

          {/* Hotel Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(hotel.rating || 4)}
                <span className="text-sm text-muted-foreground">
                  ({hotel.rating?.toFixed(1) || "4.0"} stars)
                </span>
              </div>
              {hotel.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {hotel.address}
                    <br />
                    {hotel.city}, {hotel.country}
                    {hotel.zip && ` ${hotel.zip}`}
                  </span>
                </div>
              )}
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-2">
              {hotel.skiResortInfo?.distanceToSlopes && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  <MountainIcon className="h-3 w-3 mr-1" />
                  {hotel.skiResortInfo.distanceToSlopes}m to slopes
                </Badge>
              )}
              {hotel.skiResortInfo?.isSkiInSkiOut && (
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700"
                >
                  Ski-in/Ski-out
                </Badge>
              )}
              {hotel.hotelFacilities?.some((f: any) =>
                f?.name?.toLowerCase()?.includes("wifi")
              ) && (
                <Badge variant="outline">
                  <WifiIcon className="h-3 w-3 mr-1" />
                  Free WiFi
                </Badge>
              )}
              {hotel.hotelFacilities?.some((f: any) =>
                f?.name?.toLowerCase()?.includes("parking")
              ) && (
                <Badge variant="outline">
                  <CarIcon className="h-3 w-3 mr-1" />
                  Parking
                </Badge>
              )}
            </div>

            {/* Short Description */}
            {hotel.hotelDescription && (
              <p className="text-muted-foreground text-sm line-clamp-3">
                {hotel.hotelDescription.replace(/<[^>]*>/g, "")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HotelDescription({ hotel }: { hotel: HotelDetails }) {
  if (!hotel.hotelDescription) return null;

  // Strip HTML tags and clean up the description
  const cleanDescription = hotel.hotelDescription
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanDescription) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Hotel</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {cleanDescription}
        </p>
      </CardContent>
    </Card>
  );
}

function HotelRooms({ hotel }: { hotel: HotelDetails }) {
  if (!hotel.rooms?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hotel.rooms.map((room: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{room.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {room.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <UsersIcon className="h-4 w-4" />
                  Up to {room.maxOccupancy} guests
                </div>
              </div>

              {room.facilities?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {room.facilities
                    ?.filter((facility: any) => facility?.name) // Filter out facilities without names
                    ?.slice(0, 6)
                    ?.map((facility: any, facilityIndex: number) => {
                      const getRoomIcon = (name: string) => {
                        if (!name) return BedIcon;
                        const lowerName = name.toLowerCase();
                        if (lowerName.includes("bed")) return BedIcon;
                        if (
                          lowerName.includes("bath") ||
                          lowerName.includes("shower")
                        )
                          return MountainIcon;
                        if (
                          lowerName.includes("air") ||
                          lowerName.includes("conditioning")
                        )
                          return AirVentIcon;
                        if (
                          lowerName.includes("tv") ||
                          lowerName.includes("television")
                        )
                          return TvIcon;
                        if (lowerName.includes("safe")) return ShieldIcon;
                        if (lowerName.includes("wifi")) return WifiIcon;
                        return BedIcon;
                      };
                      const IconComponent = getRoomIcon(facility.name);
                      return (
                        <Badge
                          key={facilityIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          <IconComponent className="h-3 w-3 mr-1" />
                          {facility.name}
                        </Badge>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HotelLocation({ hotel }: { hotel: HotelDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hotel.address && (
          <div className="flex items-start gap-2">
            <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="text-sm">
              <div>{hotel.address}</div>
              {hotel.city && hotel.country && (
                <div>
                  {hotel.city}, {hotel.country}
                  {hotel.zip && ` ${hotel.zip}`}
                </div>
              )}
            </div>
          </div>
        )}

        {hotel.skiResortInfo && (
          <div className="space-y-2">
            <Separator />
            <div className="text-sm font-medium">Ski Resort Access</div>
            {hotel.skiResortInfo.distanceToSlopes && (
              <div className="flex items-center gap-2 text-sm">
                <MountainIcon className="h-4 w-4 text-muted-foreground" />
                {hotel.skiResortInfo.distanceToSlopes}m to slopes
              </div>
            )}
            {hotel.skiResortInfo.isSkiInSkiOut && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Ski-in/Ski-out Access
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HotelContact({ hotel }: { hotel: HotelDetails }) {
  const hasContactInfo = hotel.phone || hotel.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hotel.phone && (
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{hotel.phone}</span>
          </div>
        )}
        {hotel.email && (
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{hotel.email}</span>
          </div>
        )}
        {!hasContactInfo && (
          <p className="text-sm text-muted-foreground">
            Contact information not available
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HotelCheckInOut({ hotel }: { hotel: HotelDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in & Check-out</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hotel.checkinCheckoutTimes ? (
          <>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div>Check-in: {hotel.checkinCheckoutTimes.checkin}</div>
                <div>
                  Check-out: {hotel.checkinCheckoutTimes.checkout || "11:00"}
                </div>
              </div>
            </div>
            {hotel.checkinCheckoutTimes.earlyCheckinAvailable && (
              <Badge variant="outline" className="text-xs">
                Early check-in available
              </Badge>
            )}
            {hotel.checkinCheckoutTimes.lateCheckoutAvailable && (
              <Badge variant="outline" className="text-xs">
                Late check-out available
              </Badge>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div>Check-in: 15:00</div>
              <div>Check-out: 11:00</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HotelVotingStatus({
  hotel,
  activeGroup,
  onVote,
  selectedWeight,
  setSelectedWeight,
  votingStates,
}: {
  hotel: HotelDetails;
  activeGroup: any;
  onVote: () => void;
  selectedWeight: VoteWeight;
  setSelectedWeight: (weight: VoteWeight) => void;
  votingStates: Record<string, boolean>;
}) {
  const isVotingOpen = ["planning", "voting"].includes(activeGroup.status);
  const voteKey = `${hotel.id}-${selectedWeight}`;
  const isVoting = votingStates[voteKey];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VoteIcon className="h-5 w-5" />
          Group Voting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div className="font-medium mb-2">Vote for {activeGroup.name}</div>
          <div className="text-muted-foreground mb-4">
            Add this hotel to your group's voting pool with your preferred
            weight level.
          </div>

          {isVotingOpen ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Choose Your Vote Weight
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(["1", "2", "3"] as VoteWeight[]).map((weight) => {
                    const stars = "⭐".repeat(parseInt(weight));
                    const isSelected = selectedWeight === weight;

                    return (
                      <Button
                        key={weight}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setSelectedWeight(weight)}
                        className={`flex flex-col p-3 h-auto ${
                          isSelected
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "hover:bg-blue-50"
                        }`}
                      >
                        <span className="text-lg mb-1">{stars}</span>
                        <span className="text-xs">
                          {weight === "1" && "Casual"}
                          {weight === "2" && "Strong"}
                          {weight === "3" && "Must-have"}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={onVote}
                disabled={isVoting}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <ThumbsUpIcon className="h-4 w-4 mr-2" />
                {isVoting
                  ? "Voting..."
                  : `Vote with ${"⭐".repeat(parseInt(selectedWeight))}`}
              </Button>

              <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded">
                💡 You can vote multiple times with different weights to express
                varying levels of preference.
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Badge variant="secondary" className="bg-gray-100">
                Voting is currently closed
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HotelDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Hotel Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="aspect-video rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
