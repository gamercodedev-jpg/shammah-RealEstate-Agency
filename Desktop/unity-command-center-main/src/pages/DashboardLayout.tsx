import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import RealTimeNotifications from "@/components/RealTimeNotifications";
import MobileNavigation from "@/components/MobileNavigation";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="mr-2 lg:hidden" />
              <h2 className="font-semibold text-foreground">Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <RealTimeNotifications />
              <ThemeToggle />
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
