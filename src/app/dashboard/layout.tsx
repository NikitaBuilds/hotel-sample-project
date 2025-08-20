import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { ActiveGroupProvider } from "@/services/group";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveGroupProvider>
      <SidebarProvider>
        <SidebarLeft />
        <SidebarInset>
          <div className="bg-background top-0 flex h-16 shrink-0 items-center gap-2 border-b fixed w-full" />
          <div className="flex flex-1 flex-col gap-4 py-4 px-2 mt-16 sm:pr-0 lg:pr-(--sidebar-width)">
            {children}
          </div>
        </SidebarInset>
        <SidebarRight />
      </SidebarProvider>
    </ActiveGroupProvider>
  );
}
