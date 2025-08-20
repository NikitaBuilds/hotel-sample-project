/**
 * LiteAPI Search types for hotel rates and availability
 * Focused on ski trip group bookings
 */

import { Price, Occupancy, DateRange, GuestInfo } from "./common";

export interface SearchRequest {
  hotelIds?: string[];
  checkin: string; // ISO date (YYYY-MM-DD)
  checkout: string; // ISO date (YYYY-MM-DD)
  currency: string; // ISO currency code
  guestNationality: string; // ISO country code
  occupancies: Occupancy[];
  guestResidency?: string; // ISO country code
  timeout?: number; // seconds
}

export interface TaxFee {
  included: boolean;
  amount: number;
  currency: string;
  type?: string;
}

export interface RetailRate {
  total: Price[];
  msp: Price[]; // Market selling price
  taxesAndFees: TaxFee[];
}

export interface Commission {
  amount: number;
  currency: string;
  percentage?: number;
}

export interface CancelPolicyInfo {
  cancelTime: string; // ISO datetime
  amount: number;
  currency: string;
  type: "AMOUNT" | "PERCENTAGE" | "NIGHTS";
}

export interface CancellationPolicy {
  cancelPolicyInfos: CancelPolicyInfo[];
  hotelRemarks: string[];
  refundableTag: "REFUNDABLE" | "NON_REFUNDABLE" | "PARTIALLY_REFUNDABLE";
}

export interface Rate {
  rateId: string;
  name: string;
  maxOccupancy: number;
  boardType: string;
  boardName: string;
  priceType: "PER_NIGHT" | "TOTAL_STAY";
  commission: Commission[];
  retailRate: RetailRate;
  cancellationPolicies: CancellationPolicy;
  // Ski trip specific
  skiPackageIncluded?: boolean;
  liftTicketsIncluded?: boolean;
  equipmentRentalDiscount?: number;
}

export interface RoomType {
  offerId: string;
  roomTypeId: string;
  supplier: string;
  supplierId: number;
  rates: Rate[];
  // Room details for group planning
  roomName?: string;
  bedConfiguration?: string;
  roomSize?: number; // in sqm
  maxOccupancy: number;
}

export interface HotelRate {
  hotelId: string;
  roomTypes: RoomType[];
  currency: string;
  // For quick comparison in ski trip planning
  minPrice?: Price;
  maxPrice?: Price;
  availableRooms: number;
}

export interface MinimumRate {
  hotelId: string;
  currency: string;
  price: number;
  supplierId: number;
  supplier: string;
  // Additional info for ski trip context
  pricePerPerson?: number;
  groupDiscount?: number;
}

export interface SearchResponse {
  hotels: HotelRate[];
  searchId?: string;
  currency: string;
  checkin: string;
  checkout: string;
  nights: number;
  // Summary for group planning
  totalResults: number;
  priceRange?: {
    min: Price;
    max: Price;
  };
}

export interface MinimumRatesResponse {
  hotels: MinimumRate[];
  currency: string;
  checkin: string;
  checkout: string;
}
