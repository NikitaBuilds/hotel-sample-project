/**
 * LiteAPI Types - Main export file
 * For ski trip planning app hotel search and data
 */

// Common types
export * from "./common";

// Search API types
export * from "./search";

// Hotel data types
export * from "./hotel";

// API wrapper types
export * from "./api";

// Re-export commonly used type combinations
export type {
  // For hotel search functionality
  SearchRequest,
  SearchResponse,
  HotelRate,
  MinimumRate,

  // For hotel details display
  HotelDetails,
  HotelDetailsResponse,
  Room,
  HotelFacility,

  // For API integration
  APIResponse,
  APIError,
  LiteAPIConfig,

  // For ski trip specific features
  SkiTripSearchRequest,
  SkiTripSearchFilters,
  SkiAmenities,
  GroupAmenities,

  // Common utility types
  Location,
  Price,
  DateRange,
  Occupancy,
} from "./search";

export type {
  HotelDetails,
  Room,
  HotelFacility,
  SkiAmenities,
  GroupAmenities,
} from "./hotel";

export type {
  APIResponse,
  APIError,
  LiteAPIConfig,
  SkiTripSearchRequest,
  SkiTripSearchFilters,
} from "./api";

export type {
  Location,
  Price,
  DateRange,
  Occupancy,
  Image,
  Facility,
} from "./common";
