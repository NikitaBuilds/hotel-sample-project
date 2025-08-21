"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { HotelSearchForm, HotelResults, SkiFilters } from "./components";
import { useHotelSearch } from "@/services/lite/hotels";
import { SearchIcon, FilterIcon, SparklesIcon } from "lucide-react";
import type {
  SearchRequest,
  SearchResponse,
  SkiTripSearchFilters,
} from "@/services/lite/types";

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useState<SearchRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SkiTripSearchFilters>({});
  const [favoriteHotels, setFavoriteHotels] = useState<Set<string>>(new Set());
  const [aiQuery, setAiQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Use the hotel search hook (gets all results)
  const {
    data: searchResults,
    isLoading,
    error,
  } = useHotelSearch(searchParams!, {
    enabled: !!searchParams,
  });

  const handleSearch = (params: SearchRequest) => {
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleHotelSelect = (hotelId: string) => {
    console.log("Selected hotel:", hotelId);
    // TODO: Navigate to hotel details or add to group selection
  };

  const handleHotelFavorite = (hotelId: string) => {
    setFavoriteHotels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hotelId)) {
        newSet.delete(hotelId);
      } else {
        newSet.add(hotelId);
      }
      return newSet;
    });
  };

  const handleHotelShare = (hotelId: string) => {
    // TODO: Implement sharing functionality
    console.log("Share hotel:", hotelId);
  };

  return (
    <div className="space-y-6">
      {/* AI Query Display */}
      {aiQuery && (
        <Card className="mx-4">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <SparklesIcon className="h-4 w-4" />
              AI Search Query
            </div>
            <p className="text-sm bg-muted/50 rounded p-2">"{aiQuery}"</p>
            <p className="text-xs text-muted-foreground mt-2">
              🚧 AI search parsing coming soon! Use the search form below for
              now.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Animated Layout */}
      <div
        className={`px-4 transition-all duration-700 ease-in-out ${
          searchResults
            ? "pt-8" // Results view: search form at top
            : "min-h-[calc(100vh-200px)] flex flex-col justify-center" // No results: centered
        }`}
      >
        {/* Search Section */}
        <div className={`space-y-6 mb-12`}>
          <div className="text-center py-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-2">
              Find Perfect Ski Hotels Together
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search, compare, and book amazing ski resorts for your group
              adventure. From cozy chalets to luxury ski-in/ski-out resorts.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <HotelSearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>

        {/* Results Section - Animated in */}
        {searchResults && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            {error && (
              <Card className="border-red-200 bg-red-50 mb-6">
                <CardContent className="pt-6">
                  <p className="text-red-800">
                    Error searching hotels: {error.message}
                  </p>
                </CardContent>
              </Card>
            )}

            <HotelResults
              searchResults={searchResults?.data || null}
              isLoading={isLoading}
              onHotelSelect={handleHotelSelect}
              onHotelFavorite={handleHotelFavorite}
              onHotelShare={handleHotelShare}
              favoriteHotels={favoriteHotels}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Floating Filters Button */}
      {searchResults && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowFilters(true)}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      )}

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-background w-full max-w-md h-full overflow-y-auto">
            <SkiFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
              isOpen={showFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
}
