/**
 * API Utilities for Error Handling and Response Formatting
 * Consistent error handling across all LiteAPI endpoints
 */

import type { APIResponse, APIError } from "@/services/lite/types";

/**
 * Standard API Error Types
 */
export const API_ERROR_CODES = {
  MISSING_API_KEY: "MISSING_API_KEY",
  INVALID_API_KEY: "INVALID_API_KEY",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INVALID_REQUEST: "INVALID_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
} as const;

/**
 * Create standardized API response
 */
export function createAPIResponse<T>(
  data: T,
  success = true,
  requestId?: string
): APIResponse<T> {
  return {
    success,
    data,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * Create standardized API error response
 */
export function createAPIError(
  code: string,
  message: string,
  statusCode = 500,
  details?: Record<string, any>
): APIResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle LiteAPI response errors
 */
export function handleLiteAPIError(
  response: Response,
  fallbackMessage: string
) {
  const statusCode = response.status;

  switch (statusCode) {
    case 400:
      return createAPIError(
        API_ERROR_CODES.INVALID_REQUEST,
        "Invalid request parameters",
        400
      );
    case 401:
      return createAPIError(
        API_ERROR_CODES.INVALID_API_KEY,
        "Invalid or missing API key",
        401
      );
    case 404:
      return createAPIError(
        API_ERROR_CODES.NOT_FOUND,
        "Resource not found",
        404
      );
    case 429:
      return createAPIError(
        API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded. Please try again later.",
        429
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return createAPIError(
        API_ERROR_CODES.INTERNAL_ERROR,
        "LiteAPI service temporarily unavailable",
        statusCode
      );
    default:
      return createAPIError(statusCode.toString(), fallbackMessage, statusCode);
  }
}

/**
 * Validate environment variables
 */
export function validateLiteAPIConfig() {
  const apiKey = process.env.LITE_API_KEY;
  const baseUrl = process.env.LITE_API_BASE_URL;

  if (!apiKey) {
    throw new Error("LITE_API_KEY environment variable is required");
  }

  return {
    apiKey,
    baseUrl: baseUrl || "https://api.liteapi.travel",
  };
}

/**
 * Create LiteAPI headers
 */
export function createLiteAPIHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    "User-Agent": "SkiTripPlanner/1.0",
  };
}

/**
 * Retry configuration for failed requests
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
};

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(attempt: number): number {
  const delay =
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(statusCode: number): boolean {
  // Don't retry client errors (4xx), but retry server errors (5xx) and network issues
  return statusCode >= 500 || statusCode === 0; // 0 for network errors
}

/**
 * Format search parameters for LiteAPI
 */
export function formatSearchParams(
  params: Record<string, any>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}

/**
 * Validate date range
 */
export function validateDateRange(
  checkin: string,
  checkout: string
): {
  valid: boolean;
  error?: string;
} {
  if (!validateDateFormat(checkin)) {
    return {
      valid: false,
      error: "Invalid check-in date format. Use YYYY-MM-DD.",
    };
  }

  if (!validateDateFormat(checkout)) {
    return {
      valid: false,
      error: "Invalid check-out date format. Use YYYY-MM-DD.",
    };
  }

  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  if (checkinDate >= checkoutDate) {
    return {
      valid: false,
      error: "Check-in date must be before check-out date.",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkinDate < today) {
    return { valid: false, error: "Check-in date cannot be in the past." };
  }

  return { valid: true };
}

/**
 * Cache key generators for consistent caching
 */
export const cacheKeyGenerators = {
  hotelsList: (params?: Record<string, any>) =>
    ["hotels", "list", params ? JSON.stringify(params) : "all"].join(":"),

  hotelDetails: (hotelId: string) => ["hotels", "detail", hotelId].join(":"),

  hotelReviews: (hotelId: string, params?: Record<string, any>) =>
    [
      "hotels",
      "reviews",
      hotelId,
      params ? JSON.stringify(params) : "default",
    ].join(":"),

  hotelSearch: (searchParams: Record<string, any>) =>
    ["hotels", "search", JSON.stringify(searchParams)].join(":"),

  countries: () => "metadata:countries",

  cities: (countryCode: string) =>
    ["metadata", "cities", countryCode].join(":"),

  facilities: () => "metadata:facilities",
};

/**
 * Debug logging utility
 */
export function logAPICall(
  method: string,
  url: string,
  params?: any,
  response?: any,
  error?: any
) {
  if (process.env.NODE_ENV === "development") {
    console.group(`🏨 LiteAPI ${method.toUpperCase()}: ${url}`);
    if (params) console.log("📋 Params:", params);
    if (response) console.log("✅ Response:", response);
    if (error) console.error("❌ Error:", error);
    console.groupEnd();
  }
}
