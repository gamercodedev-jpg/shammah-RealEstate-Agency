import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, FileText, Users, Bell, Settings, Shield, MapPin, 
  BarChart3, BookOpen, Gavel, PhoneCall, Home, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  const NavItem = ({ item, onClick }: { item: any; onClick?: () => void }) => (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <Link
        to={item.url}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target",
          isActive(item.url)
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium">{item.title}</span>
        {isActive(item.url) && (
          <motion.div
            layoutId="activeTab"
            className="absolute right-4 w-2 h-2 bg-primary rounded-full"
          />
        )}
      </Link>
    </motion.div>
  );

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          {mainItems.slice(0, 5).map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 touch-target",
                isActive(item.url)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <item.icon className="h-5 w-5" />
                {isActive(item.url) && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                  />
                )}
              </motion.div>
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          ))}
          
          {/* More menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 py-2 px-1 h-auto touch-target"
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="touch-target"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto smooth-scroll p-4 space-y-6">
                  {/* Main Navigation */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-4">
                      Main
                    </h3>
                    <div className="space-y-2">
                      {mainItems.map((item) => (
                        <NavItem key={item.url} item={item} onClick={() => setIsOpen(false)} />
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-4">
                      Resources
                    </h3>
                    <div className="space-y-2">
                      {resourceItems.map((item) => (
                        <NavItem key={item.url} item={item} onClick={() => setIsOpen(false)} />
                      ))}
                    </div>
                  </div>

                  {/* System */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 px-4">
                      System
                    </h3>
                    <div className="space-y-2">
                      {systemItems.map((item) => (
                        <NavItem key={item.url} item={item} onClick={() => setIsOpen(false)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Add bottom padding to account for mobile nav */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default MobileNavigation;
