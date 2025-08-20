"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  UsersIcon,
  SearchIcon,
  MapPinIcon,
  EditIcon,
  XIcon,
  BedIcon,
} from "lucide-react";
import { useCountries } from "@/services/lite/hotels/hooks/metadata";
import type { SearchRequest, Occupancy } from "@/services/lite/types";
import Calendar07 from "@/components/calendar-07";
import { type DateRange } from "react-day-picker";

interface HotelSearchFormProps {
  onSearch: (searchParams: SearchRequest) => void;
  isLoading?: boolean;
}

export function HotelSearchForm({ onSearch, isLoading }: HotelSearchFormProps) {
  const [countryCode, setCountryCode] = useState("");

  // Set default dates: 2 months from now for 5 days
  const getDefaultDateRange = (): DateRange => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 2);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);
    return { from: startDate, to: endDate };
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDefaultDateRange()
  );
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    dateRange
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);

  // Get ski countries for destination suggestions
  const { data: countries } = useCountries();

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return "Select dates";
    const from = range.from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const to = range.to.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const nights = Math.ceil(
      (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${from} - ${to} (${nights} nights)`;
  };

  const handleDateModalOpen = () => {
    setTempDateRange(dateRange);
    setIsDateModalOpen(true);
  };

  const handleDateSave = () => {
    setDateRange(tempDateRange);
    setIsDateModalOpen(false);
  };

  const handleDateCancel = () => {
    setTempDateRange(dateRange);
    setIsDateModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (!countryCode) {
      alert("Please select a country");
      return;
    }

    const occupancies: Occupancy[] = [
      {
        rooms,
        adults,
        children: [], // No children for ski trips
      },
    ];

    const searchRequest: SearchRequest = {
      checkin: dateRange.from.toISOString().split("T")[0],
      checkout: dateRange.to.toISOString().split("T")[0],
      currency: "USD",
      guestNationality: "US",
      occupancies,
      guestResidency: "US",
      countryCode, // Add the required location parameter
    };

    onSearch(searchRequest);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <SearchIcon className="h-5 w-5" />
          Find Your Perfect Ski Trip Hotels
        </CardTitle>
        <p className="text-muted-foreground">
          Search together, compare options, and book the perfect place for your
          group adventure
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country, Rooms, Adults - Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Country */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Country
              </Label>
              <div>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="text-base w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                    <SelectItem value="CH">🇨🇭 Switzerland</SelectItem>
                    <SelectItem value="AT">🇦🇹 Austria</SelectItem>
                    <SelectItem value="FR">🇫🇷 France</SelectItem>
                    <SelectItem value="IT">🇮🇹 Italy</SelectItem>
                    <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                    <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                    <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
                    <SelectItem value="FI">🇫🇮 Finland</SelectItem>
                    <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                    <SelectItem value="KR">🇰🇷 South Korea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <Label htmlFor="rooms" className="flex items-center gap-2">
                <BedIcon className="h-4 w-4" />
                Rooms
              </Label>
              <Input
                id="rooms"
                type="number"
                min="1"
                max="10"
                value={rooms}
                onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                className="text-base"
              />
            </div>

            {/* Adults */}
            <div className="space-y-2">
              <Label htmlFor="adults" className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Adults
              </Label>
              <Input
                id="adults"
                type="number"
                min="1"
                max="20"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                className="text-base"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Stay Dates
            </Label>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal"
              onClick={handleDateModalOpen}
            >
              <span>{formatDateRange(dateRange)}</span>
              <EditIcon className="h-4 w-4 opacity-50" />
            </Button>

            {/* Custom Modal */}
            {isDateModalOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4"
                onClick={handleDateCancel}
              >
                <div
                  className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                      Select Your Stay Dates
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDateCancel}
                      className="h-8 w-8 p-0"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Calendar */}
                  <div className="p-6">
                    <Calendar07
                      dateRange={tempDateRange}
                      setDateRange={setTempDateRange}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t">
                    <Button variant="outline" onClick={handleDateCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleDateSave}>Save Dates</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="px-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Searching Hotels...
                </>
              ) : (
                <>
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search Hotels Together
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
