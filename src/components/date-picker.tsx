import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function DatePicker() {
  return (
    <SidebarGroup className="px-0 py-0 my-0">
      <SidebarGroupContent>
        <Calendar className="bg-muted/20 [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px] pb-2" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
