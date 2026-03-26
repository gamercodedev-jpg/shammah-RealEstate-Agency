import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCases, mockResponders, analyticsData, type CaseStatus } from "@/data/mockData";
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import EnhancedAnalyticsCard from "@/components/EnhancedAnalyticsCard";
import LiveStatsWidget from "@/components/LiveStatsWidget";
import InteractiveChart from "@/components/InteractiveChart";
import { motion } from "framer-motion";

const statusColors: Record<CaseStatus, string> = {
  New: "bg-info text-info-foreground",
  "In Progress": "bg-warning text-warning-foreground",
  Resolved: "bg-safe text-safe-foreground",
  Escalated: "bg-destructive text-destructive-foreground",
};

const overviewCards = [
  { title: "Total Reports", value: mockCases.length.toString(), icon: FileText, color: "text-primary" },
  { title: "Pending Cases", value: mockCases.filter((c) => c.status === "New" || c.status === "In Progress").length.toString(), icon: Clock, color: "text-warning" },
  { title: "Resolved", value: mockCases.filter((c) => c.status === "Resolved").length.toString(), icon: CheckCircle, color: "text-safe" },
  { title: "Avg Response", value: "18 min", icon: TrendingDown, color: "text-info" },
];

const DashboardOverview = () => {
  const chartData = [
    { name: "Mon", value: 12, secondary: 8 },
    { name: "Tue", value: 19, secondary: 12 },
    { name: "Wed", value: 15, secondary: 10 },
    { name: "Thu", value: 25, secondary: 18 },
    { name: "Fri", value: 22, secondary: 15 },
    { name: "Sat", value: 18, secondary: 11 },
    { name: "Sun", value: 14, secondary: 9 },
  ];

  const analyticsMetrics = [
    {
      label: "Response Rate",
      value: "94.2%",
      change: 5.3,
      icon: CheckCircle,
      color: "text-safe"
    },
    {
      label: "Active Cases",
      value: "47",
      change: -2.1,
      icon: FileText,
      color: "text-warning"
    },
    {
      label: "Resolution Time",
      value: "2.3h",
      change: -8.7,
      icon: Clock,
      color: "text-info"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LiveStatsWidget />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Analytics Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <EnhancedAnalyticsCard
            title="Performance Metrics"
            metrics={analyticsMetrics}
            subtitle="Last 30 days performance"
            trend={{ value: 12.5, label: "vs last month" }}
          />
        </motion.div>

        {/* Interactive Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <InteractiveChart
            title="Weekly Report Trends"
            data={chartData}
            type="line"
            subtitle="Reports vs Resolved Cases"
            showTrend={true}
          />
        </motion.div>
      </div>

      {/* Recent Cases with Enhanced UI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Live Case Feed
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
            </CardTitle>
            <Link to="/dashboard/cases" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCases.slice(0, 5).map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 hover:shadow-md group cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      animate={{ rotate: c.status === "Escalated" ? [0, 5, -5, 0] : 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertTriangle className={`h-4 w-4 shrink-0 ${
                        c.status === "Escalated" ? "text-destructive animate-pulse" : "text-muted-foreground"
                      }`} />
                    </motion.div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {c.id} — {c.incidentType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.district}, {c.province} · {c.reportChannel}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[c.status]} shrink-0 text-xs animate-slide-in-right`}>
                    {c.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Responders Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-safe" />
              Active Responders
              <Badge variant="outline" className="text-xs">
                {mockResponders.filter(r => r.status !== "Offline").length} online
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockResponders.filter((r) => r.status !== "Offline").map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-300 group cursor-pointer"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {r.name}
                    </p>
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        r.status === "Available" ? "bg-safe animate-pulse-glow" : "bg-warning"
                      }`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{r.zone} · {r.type}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-safe h-1 rounded-full"
                        style={{ width: `${Math.random() * 60 + 40}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
