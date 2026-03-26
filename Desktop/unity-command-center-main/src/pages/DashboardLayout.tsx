import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import RealTimeNotifications from "@/components/RealTimeNotifications";
import MobileNavigation from "@/components/MobileNavigation";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full app-shell">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="site-header sticky top-0 z-40">
            <div className="app-container flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="mr-2 lg:hidden" />
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">Dashboard</span>
                  <span className="text-xs text-muted-foreground">Overview & real-time insights</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RealTimeNotifications />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-background smooth-scroll">
            <div className="app-container p-4 lg:p-6">
              <Outlet />
            </div>
          </main>

          <MobileNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
