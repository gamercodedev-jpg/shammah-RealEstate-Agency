import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, AlertTriangle, Users, MapPin, Clock, CheckCircle, 
  TrendingUp, TrendingDown, Zap, Shield, Phone, BarChart3,
  Eye, Settings, Bell, Download, Filter, Search, Calendar,
  Globe, Wifi, Battery, Signal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const AdvancedDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [liveData, setLiveData] = useState([]);
  const [systemStatus, setSystemStatus] = useState("optimal");
  const [activeAlerts, setActiveAlerts] = useState(3);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => {
        const newData = [...prev];
        if (newData.length > 20) newData.shift();
        newData.push({
          time: new Date().toLocaleTimeString(),
          reports: Math.floor(Math.random() * 10) + 5,
          responders: Math.floor(Math.random() * 5) + 15,
          responseTime: Math.floor(Math.random() * 10) + 10
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const performanceMetrics = [
    { 
      title: "System Uptime", 
      value: "99.9%", 
      change: 0.1, 
      icon: Activity, 
      color: "text-green-600",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    { 
      title: "Active Cases", 
      value: "47", 
      change: -5.2, 
      icon: AlertTriangle, 
      color: "text-orange-600",
      bgGradient: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200"
    },
    { 
      title: "Response Rate", 
      value: "94.2%", 
      change: 3.8, 
      icon: CheckCircle, 
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    { 
      title: "Avg Response Time", 
      value: "14 min", 
      change: -8.3, 
      icon: Clock, 
      color: "text-purple-600",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200"
    }
  ];

  const realTimeChart = [
    { time: "00:00", reports: 12, responders: 18, responseTime: 15 },
    { time: "04:00", reports: 8, responders: 16, responseTime: 18 },
    { time: "08:00", reports: 24, responders: 22, responseTime: 12 },
    { time: "12:00", reports: 35, responders: 28, responseTime: 10 },
    { time: "16:00", reports: 28, responders: 25, responseTime: 14 },
    { time: "20:00", reports: 19, responders: 20, responseTime: 16 },
    { time: "Now", reports: 22, responders: 24, responseTime: 13 }
  ];

  const provinceData = [
    { province: "Lusaka", reports: 145, resolved: 132, responseTime: 12 },
    { province: "Copperbelt", reports: 98, resolved: 87, responseTime: 15 },
    { province: "Northern", reports: 67, resolved: 61, responseTime: 18 },
    { province: "Southern", reports: 89, resolved: 82, responseTime: 14 },
    { province: "Eastern", reports: 76, resolved: 70, responseTime: 16 }
  ];

  const incidentTypes = [
    { name: "Physical Violence", value: 35, color: "#ef4444" },
    { name: "Emotional Abuse", value: 28, color: "#f97316" },
    { name: "Economic Violence", value: 20, color: "#eab308" },
    { name: "Sexual Violence", value: 12, color: "#a855f7" },
    { name: "Other", value: 5, color: "#6b7280" }
  ];

  const radarData = [
    { subject: "Response Time", A: 85, fullMark: 100 },
    { subject: "Coverage", A: 92, fullMark: 100 },
    { subject: "Satisfaction", A: 88, fullMark: 100 },
    { subject: "Efficiency", A: 79, fullMark: 100 },
    { subject: "Accessibility", A: 95, fullMark: 100 }
  ];

  const recentAlerts = [
    { id: 1, type: "emergency", message: "High priority case in Lusaka", time: "2 min ago", priority: "high" },
    { id: 2, type: "system", message: "Server load optimized", time: "5 min ago", priority: "medium" },
    { id: 3, type: "response", message: "New responder team deployed", time: "12 min ago", priority: "low" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg"
                >
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">SafeReport Command Center</h1>
                  <p className="text-xs sm:text-sm text-slate-600">Real-time GBV Management System</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-green-800">System Optimal</span>
                </div>
                <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  <Signal className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <Wifi className="h-4 w-4" />
                <Battery className="h-4 w-4" />
                <Globe className="h-4 w-4" />
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button size="sm" className="gap-2 text-xs sm:text-sm">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Key Metrics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className={`border-2 ${metric.borderColor} bg-gradient-to-br ${metric.bgGradient} hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 sm:p-3 bg-white rounded-xl shadow-sm`}>
                      <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
                      metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {metric.change > 0 ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : metric.change < 0 ? <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" /> : null}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{metric.value}</h3>
                  <p className="text-xs sm:text-sm text-slate-600">{metric.title}</p>
                  <div className="mt-3 h-1 bg-white/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 40 + 60}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Real-time Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">Real-time Activity</CardTitle>
                  <p className="text-xs sm:text-sm text-slate-600">Live monitoring of system performance</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm text-slate-600">Live</span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={realTimeChart}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResponders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reports" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorReports)"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="responders" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorResponders)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Radar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">Performance Metrics</CardTitle>
                <p className="text-xs sm:text-sm text-slate-600">System efficiency overview</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Radar 
                      name="Performance" 
                      dataKey="A" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Province Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Province Performance</CardTitle>
                  <p className="text-sm text-slate-600">Regional response metrics</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={provinceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="province" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)'
                      }}
                    />
                    <Bar dataKey="reports" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Recent Alerts</CardTitle>
                  <p className="text-sm text-slate-600">System notifications</p>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  {activeAlerts} Active
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${
                        alert.priority === 'high' ? 'bg-red-100' :
                        alert.priority === 'medium' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.priority === 'high' ? 'text-red-600' :
                          alert.priority === 'medium' ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{alert.message}</p>
                        <p className="text-xs text-slate-600">{alert.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                  <Eye className="h-4 w-4" />
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdvancedDashboard;
