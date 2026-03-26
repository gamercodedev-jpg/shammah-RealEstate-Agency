import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsData, mockCases, provinces } from "@/data/mockData";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import InteractiveChart from "@/components/InteractiveChart";
import EnhancedAnalyticsCard from "@/components/EnhancedAnalyticsCard";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle } from "lucide-react";

const AnalyticsPage = () => {
  const [provinceFilter, setProvinceFilter] = React.useState<string | null>(null);

  // compute incident breakdown for selected province (or overall)
  const incidentBreakdown = React.useMemo(() => {
    const list = provinceFilter ? mockCases.filter((c) => c.province === provinceFilter) : mockCases;
    const map: Record<string, number> = {};
    list.forEach((c) => { map[c.incidentType] = (map[c.incidentType] || 0) + 1; });
    return Object.keys(map).map((k, i) => ({ type: k, count: map[k], fill: analyticsData.incidentTypes[i % analyticsData.incidentTypes.length].fill }));
  }, [provinceFilter]);

  const performanceMetrics = [
    {
      label: "Response Rate",
      value: "94.2%",
      change: 5.3,
      icon: CheckCircle,
      color: "text-safe"
    },
    {
      label: "Active Responders",
      value: "18",
      change: -2.1,
      icon: Users,
      color: "text-warning"
    },
    {
      label: "Avg Resolution Time",
      value: "2.3h",
      change: -8.7,
      icon: Clock,
      color: "text-info"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive insights into GBV reporting patterns and response effectiveness</p>
      </motion.div>

      {/* Enhanced Analytics Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <EnhancedAnalyticsCard
          title="Key Performance Indicators"
          metrics={performanceMetrics}
          subtitle="Last 30 days performance metrics"
          trend={{ value: 12.5, label: "vs last month" }}
        />
      </motion.div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <InteractiveChart
            title="Reports Over Time"
            data={analyticsData.reportsOverTime}
            type="line"
            subtitle="Monthly report trends"
            showTrend={true}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <InteractiveChart
            title="Reports by Province"
            data={analyticsData.reportsByProvince}
            type="bar"
            subtitle="Geographic distribution"
            showTrend={false}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <InteractiveChart
            title="Response Time Trends"
            data={analyticsData.responseTimeTrends}
            type="area"
            subtitle="Average response time in minutes"
            showTrend={true}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <InteractiveChart
            title="Incident Type Breakdown"
            data={incidentBreakdown}
            type="pie"
            subtitle="Types of reported incidents"
            showTrend={false}
          />
        </motion.div>
      </div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Filter by Province:</label>
          <select 
            value={provinceFilter || ''} 
            onChange={(e) => setProvinceFilter(e.target.value || null)} 
            className="text-sm p-2 border rounded-lg bg-card border-border"
          >
            <option value="">All Provinces</option>
            {provinces.map((p) => <option value={p} key={p}>{p}</option>)}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          {provinceFilter ? `Showing data for ${provinceFilter}` : "Showing national data"}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
