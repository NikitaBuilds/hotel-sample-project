"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPinIcon,
  StarIcon,
  WifiIcon,
  CarIcon,
  UtensilsIcon,
  MountainIcon,
  HeartIcon,
  ShareIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { HotelRate, Rate } from "@/services/lite/types";

interface HotelCardProps {
  hotel: HotelRate;
  onSelect?: (hotelId: string) => void;
  onFavorite?: (hotelId: string) => void;
  onShare?: (hotelId: string) => void;
  isFavorited?: boolean;
}

export function HotelCard({
  hotel,
  onSelect,
  onFavorite,
  onShare,
  isFavorited = false,
}: HotelCardProps) {
  const router = useRouter();

  // Get the best rate for display
  const bestRate = hotel.roomTypes?.[0]?.rates?.[0];
  const minPrice = hotel.minPrice || bestRate?.retailRate?.total?.[0];

  // Use real hotel details from API, with fallbacks for missing data
  const hotelDetails = {
    name: hotel.name || `Hotel ${hotel.hotelId.slice(-3)}`,
    rating: hotel.rating || 4.2 + Math.random() * 0.8,

    image:
      hotel.main_photo ||
      `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop&auto=format`,
    amenities: ["Free WiFi", "Restaurant", "Spa", "Parking", "Fitness Center"],
    address: hotel.address,
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden p-0">
      {/* Hotel Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotelDetails.image}
          alt={hotelDetails.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Only show real data badges here - no mock distance data */}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={() => onFavorite?.(hotel.hotelId)}
          >
            <HeartIcon
              className={`h-4 w-4 ${
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={() => onShare?.(hotel.hotelId)}
          >
            <ShareIcon className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Price Badge */}
        {minPrice && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-green-600 hover:bg-green-700 text-white px-3 py-1">
              {formatPrice(minPrice.amount, minPrice.currency)}/night
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="px-4 py-0 my-0">
        <div className="flex items-start justify-between h-12">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {hotelDetails.name}
            </h3>
          </div>
        </div>

        {/* Rating */}
        <div className="">{renderStars(hotelDetails.rating)}</div>
      </CardHeader>

      <CardContent className="pb-4 px-4 pt-0">
        {/* Amenities */}

        {/* Room Info */}
        {hotel.roomTypes && hotel.roomTypes.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              {hotel.availableRooms > 0 && (
                <>
                  <span className="font-medium">
                    {hotel.availableRooms} rooms available
                  </span>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              {hotel.roomTypes?.[0]?.maxOccupancy && (
                <span className="text-muted-foreground">
                  Up to {hotel.roomTypes[0].maxOccupancy} guests per room
                </span>
              )}
              {!hotel.availableRooms && !hotel.roomTypes?.[0]?.maxOccupancy && (
                <span className="text-muted-foreground">
                  Multiple room types available
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            window.open(`/dashboard/hotels/${hotel.hotelId}`, "_blank")
          }
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
