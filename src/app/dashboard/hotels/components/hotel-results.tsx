"use client";

import { useEffect, useState, useMemo } from "react";
import { HotelCard } from "./hotel-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FilterIcon,
  SortAscIcon,
  MapIcon,
  GridIcon,
  ListIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { SearchResponse, HotelRate } from "@/services/lite/types";

interface HotelResultsProps {
  searchResults: SearchResponse | null;
  isLoading: boolean;
  onHotelSelect: (hotelId: string) => void;
  onHotelFavorite: (hotelId: string) => void;
  onHotelShare: (hotelId: string) => void;
  favoriteHotels: Set<string>;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

type SortOption = "price-low" | "price-high" | "rating" | "distance";
type ViewMode = "grid" | "list";

const HOTELS_PER_PAGE = 25;

export function HotelResults({
  searchResults,
  isLoading,
  onHotelSelect,
  onHotelFavorite,
  onHotelShare,
  favoriteHotels,
  currentPage = 1,
  onPageChange,
}: HotelResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("price-low");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Auto-scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Finding Perfect Hotels</h3>
          <p className="text-muted-foreground">
            Searching the best ski resorts for your group adventure...
          </p>
        </div>
      </div>
    );
  }

  if (!searchResults || !searchResults.hotels || !searchResults.hotels.length) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
          <MapIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Hotels Found</h3>
        <p className="text-muted-foreground mb-4">
          {searchResults?.error
            ? `${searchResults.error.message} - Try different dates or destinations`
            : "Try adjusting your search criteria or explore different ski destinations"}
        </p>
        <Button variant="outline">Browse Popular Ski Resorts</Button>
      </div>
    );
  }

  // Sort hotels based on selected option
  const sortedHotels = [...searchResults.hotels].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        const priceA = a.minPrice?.amount || 0;
        const priceB = b.minPrice?.amount || 0;
        return priceA - priceB;
      case "price-high":
        const priceA2 = a.minPrice?.amount || 0;
        const priceB2 = b.minPrice?.amount || 0;
        return priceB2 - priceA2;
      case "rating":
        // Mock rating sort (in real app, you'd have actual ratings)
        return Math.random() - 0.5;
      case "distance":
        // Mock distance sort (in real app, you'd have actual distances)
        return Math.random() - 0.5;
      default:
        return 0;
    }
  });

  // Client-side pagination (better for LiteAPI which returns all results)
  const HOTELS_PER_PAGE = 25;
  const totalPages = Math.ceil(sortedHotels.length / HOTELS_PER_PAGE);
  const startIndex = (currentPage - 1) * HOTELS_PER_PAGE;
  const endIndex = startIndex + HOTELS_PER_PAGE;
  const paginatedHotels = sortedHotels.slice(startIndex, endIndex);

  const pagination = {
    page: currentPage,
    limit: HOTELS_PER_PAGE,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  const formatDateRange = () => {
    if (!searchResults.checkin || !searchResults.checkout) return "";
    const checkin = new Date(searchResults.checkin).toLocaleDateString();
    const checkout = new Date(searchResults.checkout).toLocaleDateString();
    return `${checkin} - ${checkout}`;
  };

  useEffect(() => {
    console.log(searchResults);
  }, [searchResults]);

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {searchResults.totalResults} Hotels Found
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedHotels.length)}{" "}
            of {sortedHotels.length} hotels
            {pagination.totalPages > 1 &&
              ` (Page ${pagination.page} of ${pagination.totalPages})`}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{formatDateRange()}</span>
            <span>•</span>
            <span>{searchResults.nights} nights</span>
            <span>•</span>
            <Badge variant="secondary" className="text-xs">
              <UsersIcon className="h-3 w-3 mr-1" />
              Group Trip
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-40">
              <SortAscIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Best Rated</SelectItem>
              <SelectItem value="distance">Closest to Slopes</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Price Range Summary */}
      {searchResults.priceRange && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Price range per night:
            </span>
            <span className="font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: searchResults.currency,
              }).format(searchResults.priceRange.min.amount)}{" "}
              -{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: searchResults.currency,
              }).format(searchResults.priceRange.max.amount)}
            </span>
          </div>
        </div>
      )}

      {/* Group Planning Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <UsersIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Planning Together Made Easy
            </h4>
            <p className="text-sm text-blue-700">
              Share your favorite hotels with the group, vote on options, and
              book together. Look for ski-in/ski-out properties and
              group-friendly amenities.
            </p>
          </div>
        </div>
      </div>

      {/* Hotel Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {paginatedHotels.map((hotel, index) => (
          <HotelCard
            key={hotel.hotelId || `hotel-${index}`}
            hotel={hotel}
            onSelect={onHotelSelect}
            onFavorite={onHotelFavorite}
            onShare={onHotelShare}
            isFavorited={favoriteHotels.has(hotel.hotelId)}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
