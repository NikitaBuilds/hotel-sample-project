"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, MapPin, Users, MessageCircle, Vote } from "lucide-react";

export function PreviewModal() {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Group Header Preview */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Badge variant="secondary">Planning</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Destination TBD
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Members Preview */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <h3 className="font-medium">Group Members</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">You (Owner)</p>
                <p className="text-xs text-muted-foreground">Trip organizer</p>
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 opacity-50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Skeleton className="h-full w-full rounded-full" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-medium">What's Next?</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm">Invite friends to join</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
              <Vote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Vote on hotels together
              </span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Chat and plan activities
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
