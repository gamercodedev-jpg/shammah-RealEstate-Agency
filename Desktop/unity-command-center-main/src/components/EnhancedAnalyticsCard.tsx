import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Metric {
  label: string;
  value: string;
  change: number;
  icon: LucideIcon;
  color: string;
}

interface EnhancedAnalyticsCardProps {
  title: string;
  metrics: Metric[];
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
}

const EnhancedAnalyticsCard = ({ title, metrics, subtitle, trend }: EnhancedAnalyticsCardProps) => {
  const getTrendIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-safe";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="metric-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getTrendColor(trend.value)}>
                {(() => {
                  const Icon = getTrendIcon(trend.value);
                  return <Icon className="h-3 w-3 mr-1" />;
                })()}
                {Math.abs(trend.value)}%
              </Badge>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                  <metric.icon className={`h-4 w-4 ${metric.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{metric.value}</p>
                <div className={`flex items-center gap-1 text-xs ${getTrendColor(metric.change)}`}>
                  {(() => {
                    const Icon = getTrendIcon(metric.change);
                    return <Icon className="h-3 w-3" />;
                  })()}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Overall Performance</span>
            <span>87%</span>
          </div>
          <Progress value={87} className="h-2" />
        </div>
      </CardContent>
    </motion.div>
  );
};

export default EnhancedAnalyticsCard;
