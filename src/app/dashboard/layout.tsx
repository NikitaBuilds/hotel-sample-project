import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { AIInput } from "@/components/ui/ai-input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex-1 flex justify-center px-4">
            <AIInput
              placeholder="Search destinations, hotels, or ask about your trip..."
              minHeight={52}
              maxHeight={120}
              className="[&_textarea]:py-4 [&_textarea]:leading-normal"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}
