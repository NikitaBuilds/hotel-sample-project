"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Shimmer effect for skeletons
export function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

export function ChatSkeleton() {
  // Create varied message sizes for more realism
  const messageSizes = [
    { height: "h-12", width: "w-64" },
    { height: "h-24", width: "w-72" },
    { height: "h-16", width: "w-48" },
    { height: "h-20", width: "w-56" },
    { height: "h-10", width: "w-40" },
    { height: "h-14", width: "w-60" },
    { height: "h-28", width: "w-64" },
    { height: "h-16", width: "w-52" },
  ];

  return (
    <div className="space-y-4">
      {/* System message skeleton */}
      <div className="flex justify-center my-2">
        <div className="relative overflow-hidden">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Shimmer />
        </div>
      </div>

      {/* Regular message skeletons with varied sizes */}
      {messageSizes.map((size, i) => (
        <div
          key={i}
          className={`flex ${
            i % 2 === 0 ? "justify-start" : "justify-end"
          } gap-2 items-end animate-pulse`}
        >
          {i % 2 === 0 && (
            <div className="relative overflow-hidden">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Shimmer />
            </div>
          )}

          <div className="space-y-2 relative overflow-hidden">
            {i % 2 === 0 && (
              <div className="relative overflow-hidden">
                <Skeleton className="h-3 w-20" />
                <Shimmer />
              </div>
            )}
            <div className="relative overflow-hidden">
              <Skeleton
                className={cn(
                  size.height,
                  i % 2 === 0
                    ? size.width
                    : `w-${parseInt(size.width.substring(2)) - 8}`,
                  "rounded-2xl"
                )}
              />
              <Shimmer />
            </div>
            <div className="relative overflow-hidden flex justify-end">
              <Skeleton className="h-2 w-12" />
              <Shimmer />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatHeaderSkeleton() {
  return (
    <div className="border-b p-4">
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

export function ChatInputSkeleton() {
  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl w-full mx-auto">
        <Skeleton className="h-[52px] w-full rounded-3xl" />
      </div>
    </div>
  );
}
