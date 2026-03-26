import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, X, CheckCircle, AlertTriangle, Info, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'emergency' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'emergency',
      title: 'New Emergency Report',
      message: 'GBV case reported in Lusaka - Immediate response required',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      action: {
        label: 'View Details',
        onClick: () => console.log('View emergency details')
      }
    },
    {
      id: '2',
      type: 'alert',
      title: 'Responder Status Update',
      message: 'Officer M. Banda is now available in Copperbelt',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Case Resolved',
      message: 'Case #2024-089 has been successfully resolved',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [showNewNotification, setShowNewNotification] = useState(false);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'emergency' : Math.random() > 0.5 ? 'alert' : 'info',
        title: 'System Update',
        message: 'New activity detected in the system',
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setShowNewNotification(true);
      setTimeout(() => setShowNewNotification(false), 3000);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'alert': return Bell;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'emergency': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'alert': return 'text-warning bg-warning/10 border-warning/20';
      case 'success': return 'text-safe bg-safe/10 border-safe/20';
      case 'info': return 'text-info bg-info/10 border-info/20';
      default: return 'text-muted-foreground bg-muted/10 border-border/20';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
            >
              {unreadCount}
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* New Notification Popup */}
      <AnimatePresence>
        {showNewNotification && notifications[0] && !notifications[0].read && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 right-0 z-50 w-80"
          >
            <Card className={cn("border-2 shadow-lg", getNotificationColor(notifications[0].type))}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {(() => {
                    const Icon = getNotificationIcon(notifications[0].type);
                    return <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />;
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{notifications[0].title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notifications[0].message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewNotification(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-16 right-0 z-50 w-96"
          >
            <Card className="border shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Mark all read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="p-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                              getNotificationColor(notification.type),
                              !notification.read && "font-semibold"
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              {(() => {
                                const Icon = getNotificationIcon(notification.type);
                                return <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />;
                              })()}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium truncate">{notification.title}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(notification.timestamp)}
                                  </span>
                                  {notification.action && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        notification.action!.onClick();
                                      }}
                                      className="text-xs h-6 px-2"
                                    >
                                      {notification.action.label}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeNotifications;
