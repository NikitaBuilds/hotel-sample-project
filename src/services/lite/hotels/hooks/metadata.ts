/**
 * LiteAPI Metadata Hooks - Countries, Cities, Facilities, etc.
 * Long caching for static data
 */

import { useQuery } from "@tanstack/react-query";
import type { APIResponse, Facility } from "../../types";

// Query Keys for Metadata
export const metadataQueryKeys = {
  all: ["metadata"] as const,
  countries: () => [...metadataQueryKeys.all, "countries"] as const,
  cities: (countryCode?: string) =>
    [...metadataQueryKeys.all, "cities", countryCode] as const,
  facilities: () => [...metadataQueryKeys.all, "facilities"] as const,
  hotelTypes: () => [...metadataQueryKeys.all, "hotel-types"] as const,
  chains: () => [...metadataQueryKeys.all, "chains"] as const,
  currencies: () => [...metadataQueryKeys.all, "currencies"] as const,
  iataCodes: () => [...metadataQueryKeys.all, "iata-codes"] as const,
};

// Types for Metadata
interface Country {
  code: string;
  name: string;
  currency?: string;
}

interface City {
  id: string;
  name: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

interface HotelType {
  id: string;
  name: string;
  description?: string;
}

interface HotelChain {
  id: string;
  name: string;
  code?: string;
}

interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

interface IATACode {
  code: string;
  city: string;
  country: string;
  name: string;
}

// API Client Functions
const metadataClient = {
  getCountries: async (): Promise<APIResponse<{ countries: Country[] }>> => {
    const response = await fetch("/api/lite/countries");
    if (!response.ok) throw new Error("Failed to fetch countries");
    return response.json();
  },

  getCities: async (
    countryCode: string
  ): Promise<APIResponse<{ cities: City[]; country: string }>> => {
    const response = await fetch(`/api/lite/cities/${countryCode}`);
    if (!response.ok) throw new Error("Failed to fetch cities");
    return response.json();
  },

  getFacilities: async (): Promise<APIResponse<{ facilities: Facility[] }>> => {
    const response = await fetch("/api/lite/facilities");
    if (!response.ok) throw new Error("Failed to fetch facilities");
    return response.json();
  },
};

/**
 * Get Countries - Very Long Cache (24 hours)
 * Countries rarely change, perfect for long caching
 */
export const useCountries = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: metadataQueryKeys.countries(),
    queryFn: metadataClient.getCountries,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount, use cache
    refetchOnReconnect: false,
    enabled: options?.enabled ?? true,
  });
};

/**
 * Get Cities by Country - Long Cache (12 hours)
 * Cities don't change often, especially for ski destinations
 */
export const useCities = (
  countryCode: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: metadataQueryKeys.cities(countryCode),
    queryFn: () => metadataClient.getCities(countryCode),
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 3 * 24 * 60 * 60 * 1000, // 3 days
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!countryCode && (options?.enabled ?? true),
  });
};

/**
 * Get Facilities - Long Cache (24 hours)
 * Hotel facilities list is quite static
 */
export const useFacilities = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: metadataQueryKeys.facilities(),
    queryFn: metadataClient.getFacilities,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: options?.enabled ?? true,
  });
};

/**
 * Ski-Focused Facilities Hook
 * Filters facilities relevant for ski trips
 */
export const useSkiFacilities = (options?: { enabled?: boolean }) => {
  const facilitiesQuery = useFacilities(options);

  return {
    ...facilitiesQuery,
    data: facilitiesQuery.data
      ? {
          ...facilitiesQuery.data,
          data: {
            ...facilitiesQuery.data.data,
            facilities: facilitiesQuery.data.data.facilities?.filter(
              (facility: Facility) =>
                facility.name.toLowerCase().includes("ski") ||
                facility.name.toLowerCase().includes("snow") ||
                facility.name.toLowerCase().includes("winter") ||
                facility.name.toLowerCase().includes("mountain") ||
                facility.name.toLowerCase().includes("slope") ||
                facility.category === "SKI" ||
                facility.category === "WINTER_SPORTS"
            ),
          },
        }
      : undefined,
  };
};

/**
 * Popular Ski Countries Hook
 * Pre-filtered list of countries with major ski destinations
 */
export const useSkiCountries = (options?: { enabled?: boolean }) => {
  const countriesQuery = useCountries(options);

  const skiCountryCodes = [
    "AT", // Austria
    "CH", // Switzerland
    "FR", // France
    "IT", // Italy
    "DE", // Germany
    "US", // United States
    "CA", // Canada
    "NO", // Norway
    "SE", // Sweden
    "FI", // Finland
    "JP", // Japan
    "KR", // South Korea
  ];

  return {
    ...countriesQuery,
    data: countriesQuery.data
      ? {
          ...countriesQuery.data,
          data: {
            ...countriesQuery.data.data,
            countries: countriesQuery.data.data.countries?.filter(
              (country: Country) => skiCountryCodes.includes(country.code)
            ),
          },
        }
      : undefined,
  };
};

/**
 * Prefetch Cities for Popular Ski Countries
 * Great for improving UX by pre-loading likely selections
 */
export const useSkiDestinationsPrefetch = () => {
  const { data: skiCountries } = useSkiCountries();

  useQuery({
    queryKey: ["ski-destinations-prefetch"],
    queryFn: async () => {
      if (!skiCountries?.data.countries) return null;

      // Prefetch cities for top ski countries
      const topSkiCountries = ["AT", "CH", "FR", "IT", "US", "CA"];
      const prefetchPromises = topSkiCountries.map(async (countryCode) => {
        try {
          return await metadataClient.getCities(countryCode);
        } catch {
          return null;
        }
      });

      const results = await Promise.allSettled(prefetchPromises);
      return results.filter((result) => result.status === "fulfilled");
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!skiCountries?.data.countries,
  });
};

// metadataQueryKeys is already exported above
