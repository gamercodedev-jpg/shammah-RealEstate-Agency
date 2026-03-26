import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Users, MapPin, Clock, AlertTriangle, CheckCircle, 
  TrendingUp, Activity, Zap, Shield, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveStat {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
  trend: 'up' | 'down' | 'stable';
  live?: boolean;
}

interface LiveStatsWidgetProps {
  title?: string;
  refreshInterval?: number;
}

const LiveStatsWidget = ({ 
  title = "Live Statistics", 
  refreshInterval = 5000 
}: LiveStatsWidgetProps) => {
  const [stats, setStats] = useState<LiveStat[]>([
    {
      label: "Active Reports",
      value: "24",
      change: 12.5,
      icon: AlertTriangle,
      color: "text-warning",
      trend: "up",
      live: true
    },
    {
      label: "Responders Online",
      value: "18",
      change: -5.2,
      icon: Users,
      color: "text-safe",
      trend: "down",
      live: true
    },
    {
      label: "Avg Response Time",
      value: "14 min",
      change: -8.3,
      icon: Clock,
      color: "text-info",
      trend: "up",
      live: true
    },
    {
      label: "Cases Resolved Today",
      value: "42",
      change: 15.7,
      icon: CheckCircle,
      color: "text-safe",
      trend: "up",
      live: false
    }
  ]);

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setStats(prevStats => 
        prevStats.map(stat => {
          if (stat.live) {
            const change = (Math.random() - 0.5) * 10;
            const currentValue = parseInt(stat.value);
            const newValue = Math.max(0, currentValue + Math.floor(change / 5));
            
            return {
              ...stat,
              value: stat.label.includes("min") ? `${newValue} min` : newValue.toString(),
              change: parseFloat((Math.random() * 20 - 10).toFixed(1)),
              trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
            };
          }
          return stat;
        })
      );
      setLastUpdate(new Date());
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingUp;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'stable') return "text-muted-foreground";
    if (trend === 'up') return change > 0 ? "text-safe" : "text-destructive";
    return change < 0 ? "text-safe" : "text-destructive";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="metric-card"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full bg-safe ${isRefreshing ? 'animate-pulse' : ''}`} />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Updated {formatTime(lastUpdate)}
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="relative"
              >
                <div className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all duration-300 group">
                  {stat.live && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-safe rounded-full"
                    />
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div className={`flex items-center gap-1 text-xs ${getTrendColor(stat.trend, stat.change)}`}>
                      {(() => {
                        const Icon = getTrendIcon(stat.trend);
                        return <Icon className="h-3 w-3" />;
                      })()}
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                  
                  {/* Mini progress bar */}
                  <div className="mt-3">
                    <Progress 
                      value={Math.min(100, Math.abs(stat.change) * 5)} 
                      className="h-1" 
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* System Health Indicator */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-safe" />
              <span className="text-sm font-medium">System Health</span>
            </div>
            <Badge className="bg-safe text-safe-foreground">Optimal</Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-semibold text-safe">99.9%</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Response</p>
              <p className="font-semibold text-info">142ms</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Load</p>
              <p className="font-semibold text-warning">67%</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Emergency
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Map View
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </motion.div>
  );
};

export default LiveStatsWidget;
