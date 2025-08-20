/**
 * React Query Configuration and Provider
 * Optimized for LiteAPI hotel data with awesome caching
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";

// Create Query Client with optimized defaults
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global defaults for all queries
        staleTime: 5 * 60 * 1000, // 5 minutes default stale time
        gcTime: 10 * 60 * 1000, // 10 minutes default cache time (formerly cacheTime)
        refetchOnWindowFocus: false, // Don't refetch on window focus by default
        refetchOnReconnect: true, // Refetch on network reconnect
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Global defaults for mutations
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create a stable query client instance
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}

// Export query client for use in server components or utilities
export const getQueryClient = createQueryClient;

// Cache invalidation utilities
export const cacheKeys = {
  hotels: ["hotels"],
  metadata: ["metadata"],
  search: ["search"],
} as const;

// Global cache management functions
export const globalCacheUtils = {
  /**
   * Clear all cached data - use sparingly
   */
  clearAll: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  /**
   * Invalidate all hotel-related data
   */
  invalidateHotels: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.hotels });
  },

  /**
   * Invalidate all metadata
   */
  invalidateMetadata: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.metadata });
  },

  /**
   * Prefetch essential data for better UX
   */
  prefetchEssentials: async (queryClient: QueryClient) => {
    // Prefetch countries and facilities
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ["metadata", "countries"],
        queryFn: async () => {
          const response = await fetch("/api/lite/countries");
          return response.json();
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
      }),
      queryClient.prefetchQuery({
        queryKey: ["metadata", "facilities"],
        queryFn: async () => {
          const response = await fetch("/api/lite/facilities");
          return response.json();
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
      }),
    ]);
  },
};

/**
 * Hook for accessing query client in components
 */
export { useQueryClient } from "@tanstack/react-query";
