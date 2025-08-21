"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MountainIcon } from "lucide-react";

export function EmptyVotingState() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <MountainIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Hotels to Vote On</h3>
          <p className="text-muted-foreground mb-6">
            Start by exploring hotels and adding them to the voting pool.
          </p>
          <Button onClick={() => (window.location.href = "/dashboard/hotels")}>
            Explore Hotels
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
