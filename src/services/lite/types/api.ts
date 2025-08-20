/**
 * LiteAPI request/response wrapper types and API configuration
 * For ski trip planning app integration
 */

import { SearchRequest, SearchResponse, MinimumRatesResponse } from "./search";
import { HotelDetailsResponse, MultipleHotelsResponse } from "./hotel";

// API Configuration
export interface LiteAPIConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

// Generic API Response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: string;
  requestId?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

// Specific API endpoint types
export interface HotelSearchAPI {
  searchHotels(request: SearchRequest): Promise<APIResponse<SearchResponse>>;
  getMinimumRates(
    request: SearchRequest
  ): Promise<APIResponse<MinimumRatesResponse>>;
}

export interface HotelDataAPI {
  getHotelDetails(hotelId: string): Promise<APIResponse<HotelDetailsResponse>>;
  getMultipleHotels(
    hotelIds: string[]
  ): Promise<APIResponse<MultipleHotelsResponse>>;
}

// Request options for API calls
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number; // seconds
}

// Ski trip specific search filters
export interface SkiTripSearchFilters {
  // Location filters
  nearSkiResorts?: boolean;
  maxDistanceToSlopes?: number; // in km

  // Amenity filters
  requiresSkiStorage?: boolean;
  requiresSkiShuttle?: boolean;
  requiresGroupRooms?: boolean;

  // Price filters
  maxBudgetPerPerson?: number;
  currency?: string;

  // Group requirements
  minRoomsNeeded?: number;
  connectingRoomsPreferred?: boolean;

  // Dates and duration
  flexibleDates?: boolean;
  minStayNights?: number;
  maxStayNights?: number;
}

// Enhanced search request for ski trips
export interface SkiTripSearchRequest extends SearchRequest {
  filters?: SkiTripSearchFilters;
  sortBy?: "PRICE" | "DISTANCE_TO_SLOPES" | "RATING" | "GROUP_FRIENDLY";
  sortOrder?: "ASC" | "DESC";
}

// Batch operations for group planning
export interface BatchRequest<T> {
  requests: T[];
  parallel?: boolean;
  failFast?: boolean;
}

export interface BatchResponse<T> {
  results: (APIResponse<T> | null)[];
  successCount: number;
  failureCount: number;
  totalRequests: number;
}

// Cache management
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheManager {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, data: T, ttl?: number): void;
  delete(key: string): boolean;
  clear(): void;
  isExpired(entry: CacheEntry<any>): boolean;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface RateLimitedResponse<T> extends APIResponse<T> {
  rateLimit?: RateLimitInfo;
}

// Webhook types (if needed for real-time updates)
export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: string;
  signature?: string;
}

export interface PriceUpdateWebhook extends WebhookPayload {
  event: "price.updated";
  data: {
    hotelId: string;
    oldPrice: number;
    newPrice: number;
    currency: string;
    validUntil: string;
  };
}

export interface AvailabilityWebhook extends WebhookPayload {
  event: "availability.changed";
  data: {
    hotelId: string;
    roomTypeId: string;
    available: boolean;
    date: string;
  };
}
