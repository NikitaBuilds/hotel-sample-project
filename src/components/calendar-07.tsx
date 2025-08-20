"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";

interface Calendar07Props {
  dateRange?: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export default function Calendar07({
  dateRange,
  setDateRange,
}: Calendar07Props) {
  return (
    <div className="w-full flex flex-col gap-4">
      <Calendar
        mode="range"
        defaultMonth={dateRange?.from || new Date()}
        selected={dateRange}
        onSelect={setDateRange}
        numberOfMonths={2}
        min={2}
        max={20}
        className="rounded-lg border shadow-sm mx-auto"
      />
      <div className="text-muted-foreground text-center text-xs">
        Your stay must be between 2 and 20 nights
      </div>
    </div>
  );
}
