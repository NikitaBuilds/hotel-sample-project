/**
 * LiteAPI Hotels Service with React Query
 * Awesome caching strategy for ski trip planning
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  HotelDetails,
  HotelDetailsResponse,
  SearchRequest,
  SearchResponse,
  APIResponse,
  SkiTripSearchRequest,
} from "../types";

// Query Keys - organized for easy cache invalidation
export const hotelQueryKeys = {
  all: ["hotels"] as const,
  lists: () => [...hotelQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...hotelQueryKeys.lists(), { filters }] as const,
  details: () => [...hotelQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...hotelQueryKeys.details(), id] as const,
  reviews: (hotelId: string) =>
    [...hotelQueryKeys.all, "reviews", hotelId] as const,
  search: () => [...hotelQueryKeys.all, "search"] as const,
  searchResult: (params: SearchRequest) =>
    [...hotelQueryKeys.search(), params] as const,
};

// API Client Functions
const apiClient = {
  // Hotel List
  getHotels: async (params?: {
    limit?: number;
    offset?: number;
    countryCode?: string;
    cityName?: string;
  }): Promise<APIResponse<HotelDetails[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.countryCode)
      searchParams.set("countryCode", params.countryCode);
    if (params?.cityName) searchParams.set("cityName", params.cityName);

    const response = await fetch(`/api/lite/hotels?${searchParams.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch hotels");
    return response.json();
  },

  // Hotel Details
  getHotelDetails: async (
    hotelId: string
  ): Promise<APIResponse<HotelDetailsResponse>> => {
    const response = await fetch(`/api/lite/hotel/${hotelId}`);
    if (!response.ok) throw new Error("Failed to fetch hotel details");
    return response.json();
  },

  // Hotel Reviews
  getHotelReviews: async (
    hotelId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<APIResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const response = await fetch(
      `/api/lite/reviews/${hotelId}?${searchParams.toString()}`
    );
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json();
  },

  // Hotel Search
  searchHotels: async (
    searchRequest: SearchRequest
  ): Promise<APIResponse<SearchResponse>> => {
    const response = await fetch("/api/lite/hotels/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchRequest),
    });
    if (!response.ok) throw new Error("Failed to search hotels");
    return response.json();
  },

  searchHotelsPaginated: async (
    searchRequest: SearchRequest,
    page: number = 1,
    limit: number = 25
  ): Promise<APIResponse<SearchResponse>> => {
    const response = await fetch("/api/lite/hotels/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...searchRequest, page, limit }),
    });
    if (!response.ok) throw new Error("Failed to search hotels");
    return response.json();
  },
};

// React Query Hooks with Awesome Caching 🚀

/**
 * Get Hotels List with Smart Caching
 * Cache: 10 minutes stale, 30 minutes cache
 * Perfect for browsing hotels
 */
export const useHotels = (
  params?: {
    limit?: number;
    offset?: number;
    countryCode?: string;
    cityName?: string;
  },
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: hotelQueryKeys.list(params || {}),
    queryFn: () => apiClient.getHotels(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    enabled: options?.enabled,
  });
};

/**
 * Get Hotel Details with Long Caching
 * Cache: 30 minutes stale, 1 hour cache
 * Hotel details don't change often
 */
export const useHotelDetails = (
  hotelId: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: hotelQueryKeys.detail(hotelId),
    queryFn: () => apiClient.getHotelDetails(hotelId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    enabled: !!hotelId && (options?.enabled ?? true),
  });
};

/**
 * Get Hotel Reviews with Medium Caching
 * Cache: 5 minutes stale, 15 minutes cache
 * Reviews are more dynamic
 */
export const useHotelReviews = (
  hotelId: string,
  params?: { limit?: number; offset?: number },
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: hotelQueryKeys.reviews(hotelId),
    queryFn: () => apiClient.getHotelReviews(hotelId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    enabled: !!hotelId && (options?.enabled ?? true),
  });
};

/**
 * Search Hotels with Short Caching
 * Cache: 2 minutes stale, 5 minutes cache
 * Search results are time-sensitive (prices change)
 */
export const useHotelSearch = (
  searchRequest: SearchRequest,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: hotelQueryKeys.searchResult(searchRequest),
    queryFn: () => apiClient.searchHotels(searchRequest),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for fresh prices
    enabled: options?.enabled ?? true,
  });
};

/**
 * Paginated Hotel Search with React Query 🚀
 * Cache: 2 minutes stale, 5 minutes cache
 * Perfect for performance with large result sets
 */
export const useHotelSearchPaginated = (
  searchRequest: Omit<SearchRequest, "page" | "limit">,
  page: number = 1,
  limit: number = 25,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: [
      ...hotelQueryKeys.searchResult(searchRequest),
      "paginated",
      page,
      limit,
    ],
    queryFn: () => apiClient.searchHotelsPaginated(searchRequest, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    keepPreviousData: true, // Keep previous page data while loading new page
  });
};

/**
 * Ski Trip Search Hook - Enhanced for Group Planning
 * Includes automatic retry and background refetch
 */
export const useSkiTripSearch = (
  searchRequest: SkiTripSearchRequest,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: hotelQueryKeys.searchResult(searchRequest),
    queryFn: () => apiClient.searchHotels(searchRequest),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchInterval, // Optional background polling
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: options?.enabled ?? true,
  });
};

/**
 * Prefetch Hotel Details - Great for hover previews
 */
export const usePrefetchHotelDetails = () => {
  const queryClient = useQueryClient();

  return (hotelId: string) => {
    queryClient.prefetchQuery({
      queryKey: hotelQueryKeys.detail(hotelId),
      queryFn: () => apiClient.getHotelDetails(hotelId),
      staleTime: 30 * 60 * 1000,
    });
  };
};

/**
 * Cache Utilities for Manual Cache Management
 */
export const useHotelCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all hotel data
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.all }),

    // Invalidate hotel details
    invalidateHotelDetails: (hotelId: string) =>
      queryClient.invalidateQueries({
        queryKey: hotelQueryKeys.detail(hotelId),
      }),

    // Invalidate search results
    invalidateSearch: () =>
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.search() }),

    // Set hotel data manually (for optimistic updates)
    setHotelData: (hotelId: string, data: HotelDetailsResponse) =>
      queryClient.setQueryData(hotelQueryKeys.detail(hotelId), {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }),

    // Remove specific hotel from cache
    removeHotel: (hotelId: string) =>
      queryClient.removeQueries({ queryKey: hotelQueryKeys.detail(hotelId) }),
  };
};

/**
 * Background Sync Hook - Keeps data fresh in background
 */
export const useHotelBackgroundSync = (enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["hotel-background-sync"],
    queryFn: async () => {
      // Refetch critical data in background
      await queryClient.refetchQueries({
        queryKey: hotelQueryKeys.lists(),
        type: "active",
      });
      return { synced: true, timestamp: Date.now() };
    },
    refetchInterval: enabled ? 5 * 60 * 1000 : false, // Every 5 minutes
    refetchIntervalInBackground: true,
    enabled,
  });
};

// hotelQueryKeys and apiClient are already exported above
