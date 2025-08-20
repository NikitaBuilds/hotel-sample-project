"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock } from "lucide-react";
import { useActiveGroup } from "@/services/group";
import { format, differenceInDays } from "date-fns";

export function DatePicker() {
  const { activeGroup, activeGroupId, isActiveGroupLoading, hasGroups } =
    useActiveGroup();

  if (isActiveGroupLoading) {
    return (
      <SidebarGroup className="px-0 py-0 my-0">
        <SidebarGroupContent>
          <div className="p-4 space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
          <Calendar className="bg-muted/20 [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px] pb-2" />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!hasGroups || !activeGroup) {
    return (
      <SidebarGroup className="px-0 py-0 my-0">
        <SidebarGroupContent>
          <div className="p-4 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No trip selected</p>
            <p className="text-xs text-muted-foreground">
              Create a group to see trip dates
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const checkInDate = new Date(activeGroup.check_in_date);
  const checkOutDate = new Date(activeGroup.check_out_date);
  const today = new Date();
  const daysUntilTrip = differenceInDays(checkInDate, today);
  const tripDuration = differenceInDays(checkOutDate, checkInDate);

  // Create array of trip dates for calendar highlighting
  const tripDates = [];
  for (
    let d = new Date(checkInDate);
    d <= checkOutDate;
    d.setDate(d.getDate() + 1)
  ) {
    tripDates.push(new Date(d));
  }

  return (
    <SidebarGroup className="px-0 py-0 my-0" key={activeGroupId}>
      <SidebarGroupContent>
        {/* Trip Dates Info */}
        <div className="p-4 space-y-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Trip Dates</h3>
            <Badge
              variant={daysUntilTrip > 0 ? "default" : "secondary"}
              className="text-xs"
            >
              {daysUntilTrip > 0
                ? `${daysUntilTrip} days`
                : daysUntilTrip === 0
                ? "Today!"
                : "Past"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(checkInDate, "MMM d")} -{" "}
                {format(checkOutDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {tripDuration} day{tripDuration !== 1 ? "s" : ""} trip
              </span>
              {daysUntilTrip > 0 && (
                <span>
                  • {daysUntilTrip} day{daysUntilTrip !== 1 ? "s" : ""} to go
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Calendar with highlighted trip dates */}
        <Calendar
          mode="multiple"
          selected={tripDates}
          disabled={() => true} // Disable all date selection - read-only calendar
          className="bg-muted/20 pb-2 [&_[role=gridcell]]:w-[33px] [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_button[disabled]]:opacity-100 [&_.bg-blue-500]:opacity-100 [&_[data-selected]]:opacity-100"
          classNames={{
            day_selected: "bg-blue-500 text-white",
            day_range_start:
              "rounded-l-lg rounded-r-none bg-blue-500 text-white",
            day_range_end: "rounded-r-lg rounded-l-none bg-blue-500 text-white",
            day_range_middle: "rounded-none bg-blue-500 text-white",
          }}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
