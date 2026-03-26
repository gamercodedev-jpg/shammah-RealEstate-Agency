import {
  LayoutDashboard, FileText, Users, Bell, Settings, Shield, MapPin, BarChart3, BookOpen, Gavel, PhoneCall, Home,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Cases", url: "/dashboard/cases", icon: FileText },
  { title: "Map View", url: "/dashboard/map", icon: MapPin },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Responders", url: "/dashboard/responders", icon: Users },
  { title: "Alerts", url: "/dashboard/alerts", icon: Bell },
];

const resourceItems = [
  { title: "Articles", url: "/articles", icon: BookOpen },
  { title: "Laws & Penalties", url: "/punishments", icon: Gavel },
  { title: "Emergency Contacts", url: "/contacts", icon: PhoneCall },
];

const systemItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Home", url: "/", icon: Home },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/50">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/dashboard"}
                  className="hover:bg-sidebar-accent transition-colors touch-target"
                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                >
                  <item.icon className="h-4 w-4 mr-2 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0 hidden lg:block">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <Shield className="h-6 w-6 text-sidebar-primary shrink-0" />
        {!collapsed && <span className="font-bold text-sidebar-foreground">SafeReport</span>}
      </div>
      <SidebarContent>
        {renderGroup("Navigation", mainItems)}
        {renderGroup("Resources", resourceItems)}
        {renderGroup("System", systemItems)}
      </SidebarContent>
    </Sidebar>
  );
}
