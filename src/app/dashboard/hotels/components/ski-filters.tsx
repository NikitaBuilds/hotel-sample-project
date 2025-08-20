"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  MountainIcon,
  WifiIcon,
  CarIcon,
  UtensilsIcon,
  DumbbellIcon,
  WavesIcon,
  XIcon,
} from "lucide-react";
import type { SkiTripSearchFilters } from "@/services/lite/types";

interface SkiFiltersProps {
  filters: SkiTripSearchFilters;
  onFiltersChange: (filters: SkiTripSearchFilters) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export function SkiFilters({
  filters,
  onFiltersChange,
  onClose,
  isOpen,
}: SkiFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SkiTripSearchFilters>(filters);

  const handleFilterChange = (key: keyof SkiTripSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose?.();
  };

  const clearFilters = () => {
    const emptyFilters: SkiTripSearchFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const skiAmenities = [
    { id: "skiStorage", label: "Ski Storage", icon: MountainIcon },
    { id: "skiShuttle", label: "Ski Shuttle", icon: MountainIcon },
    { id: "nearSkiResorts", label: "Near Ski Resorts", icon: MountainIcon },
  ];

  const generalAmenities = [
    { id: "wifi", label: "Free WiFi", icon: WifiIcon },
    { id: "parking", label: "Free Parking", icon: CarIcon },
    { id: "restaurant", label: "Restaurant", icon: UtensilsIcon },
    { id: "gym", label: "Fitness Center", icon: DumbbellIcon },
    { id: "spa", label: "Spa & Wellness", icon: WavesIcon },
  ];

  const groupFeatures = [
    { id: "requiresGroupRooms", label: "Group Room Options" },
    { id: "connectingRoomsPreferred", label: "Connecting Rooms" },
  ];

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Ski Trip Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Max Budget Per Person (per night)
          </Label>
          <div className="px-2">
            <Slider
              value={[localFilters.maxBudgetPerPerson || 500]}
              onValueChange={([value]: number[]) =>
                handleFilterChange("maxBudgetPerPerson", value)
              }
              max={1000}
              min={50}
              step={25}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$50</span>
            <span className="font-medium">
              ${localFilters.maxBudgetPerPerson || 500}
            </span>
            <span>$1000+</span>
          </div>
        </div>

        {/* Distance to Slopes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Max Distance to Slopes (km)
          </Label>
          <div className="px-2">
            <Slider
              value={[localFilters.maxDistanceToSlopes || 5]}
              onValueChange={([value]: number[]) =>
                handleFilterChange("maxDistanceToSlopes", value)
              }
              max={20}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0km</span>
            <span className="font-medium">
              {localFilters.maxDistanceToSlopes || 5}km
            </span>
            <span>20km+</span>
          </div>
        </div>

        {/* Ski Amenities */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Ski Amenities</Label>
          <div className="space-y-2">
            {skiAmenities.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={localFilters[amenity.id as keyof SkiTripSearchFilters] as boolean}
                    onCheckedChange={(checked) =>
                      handleFilterChange(amenity.id as keyof SkiTripSearchFilters, checked)
                    }
                  />
                  <Label
                    htmlFor={amenity.id}
                    className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {amenity.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Features */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Group Features</Label>
          <div className="space-y-2">
            {groupFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.id}
                  checked={localFilters[feature.id as keyof SkiTripSearchFilters] as boolean}
                  onCheckedChange={(checked) =>
                    handleFilterChange(feature.id as keyof SkiTripSearchFilters, checked)
                  }
                />
                <Label
                  htmlFor={feature.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {feature.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* General Amenities */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Hotel Amenities</Label>
          <div className="flex flex-wrap gap-2">
            {generalAmenities.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = localFilters[amenity.id as keyof SkiTripSearchFilters] as boolean;
              return (
                <Badge
                  key={amenity.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() =>
                    handleFilterChange(amenity.id as keyof SkiTripSearchFilters, !isSelected)
                  }
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {amenity.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            Clear All
          </Button>
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
