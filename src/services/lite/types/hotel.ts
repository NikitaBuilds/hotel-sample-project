/**
 * LiteAPI Hotel Data types for detailed hotel information
 * Tailored for ski trip group planning
 */

import { Location, Address, Image, Facility, SkiResortInfo } from "./common";

export interface CheckinCheckoutTimes {
  checkin: string; // HH:MM format
  checkinStart: string; // HH:MM format
  checkout?: string; // HH:MM format
  earlyCheckinAvailable?: boolean;
  lateCheckoutAvailable?: boolean;
}

export interface HotelImage extends Image {
  category?:
    | "EXTERIOR"
    | "INTERIOR"
    | "ROOM"
    | "AMENITY"
    | "RESTAURANT"
    | "SKI_AREA";
  isPrimary?: boolean;
}

export interface RoomFacility extends Facility {
  // Ski trip relevant room amenities
  isSkiStorage?: boolean;
  hasBalcony?: boolean;
  hasMountainView?: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  facilities: RoomFacility[];
  images: HotelImage[];
  // Ski trip specific room details
  bedConfiguration?: string;
  roomSize?: number; // in sqm
  floor?: number;
  hasSkiView?: boolean;
  smokingPolicy?: "SMOKING" | "NON_SMOKING" | "BOTH";
}

export interface HotelFacility extends Facility {
  // Ski-focused facility categorization
  isSkiRelated?: boolean;
  operatingHours?: string;
  seasonalAvailability?: boolean;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  description?: string;
  operatingHours?: string;
  dressCode?: string;
  reservationRequired?: boolean;
}

export interface SkiAmenities {
  skiStorage: boolean;
  skiRental: boolean;
  skiSchool: boolean;
  skiShuttle: boolean;
  skiShuttleSchedule?: string[];
  liftTicketSales: boolean;
  equipmentDrying: boolean;
  // Distance to ski areas
  nearestSlope?: {
    name: string;
    distance: number; // in meters
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  };
}

export interface GroupAmenities {
  // Facilities useful for friend groups
  commonAreas: string[];
  groupDiningOptions: boolean;
  privateDiningRooms: boolean;
  gameRoom?: boolean;
  conferenceRooms?: boolean;
  largeRoomConfigurations: boolean;
  connectingRooms: boolean;
}

export interface HotelDetails {
  id: string;
  name: string;
  hotelDescription: string;
  hotelImportantInformation?: string;
  checkinCheckoutTimes: CheckinCheckoutTimes;
  hotelImages: HotelImage[];
  country: string;
  city: string;
  region?: string;
  starRating: number;
  location: Location;
  address: string;
  hotelFacilities: HotelFacility[];
  rooms: Room[];
  restaurants?: Restaurant[];

  // Ski trip specific information
  skiAmenities?: SkiAmenities;
  groupAmenities?: GroupAmenities;
  resortInfo?: SkiResortInfo;

  // Policies relevant for group bookings
  cancellationPolicy?: string;
  childPolicy?: string;
  petPolicy?: string;
  groupBookingPolicy?: string;

  // Contact and booking info
  phone?: string;
  email?: string;
  website?: string;

  // Seasonal information
  seasonalClosures?: string[];
  peakSeasons?: string[];

  // Reviews and ratings (if available)
  guestRating?: number;
  reviewCount?: number;

  // Pricing context
  priceRange?: "BUDGET" | "MID_RANGE" | "LUXURY" | "ULTRA_LUXURY";
}

export interface HotelDetailsResponse {
  hotel: HotelDetails;
  lastUpdated?: string;
}

// For batch hotel details requests
export interface MultipleHotelsResponse {
  hotels: HotelDetails[];
  totalCount: number;
  lastUpdated?: string;
}
