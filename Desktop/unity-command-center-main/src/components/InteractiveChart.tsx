import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, 
  PieChart as PieChartIcon, AreaChart as AreaChartIcon,
  Download, Filter, Settings
} from "lucide-react";
import { motion } from "framer-motion";

interface DataPoint {
  name: string;
  value: number;
  secondary?: number;
  trend?: number;
}

interface InteractiveChartProps {
  title: string;
  data: DataPoint[];
  type?: 'line' | 'bar' | 'area' | 'pie';
  colors?: string[];
  subtitle?: string;
  showTrend?: boolean;
  height?: number;
}

const COLORS = [
  'hsl(174, 62%, 38%)', // primary
  'hsl(160, 60%, 45%)', // safe
  'hsl(43, 96%, 56%)',  // warning
  'hsl(200, 80%, 50%)', // info
  'hsl(0, 72%, 51%)',   // destructive
];

const InteractiveChart = ({ 
  title, 
  data, 
  type = 'line', 
  colors = COLORS,
  subtitle,
  showTrend = true,
  height = 300
}: InteractiveChartProps) => {
  const [chartType, setChartType] = useState(type);
  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(null);

  const overallTrend = data.length > 1 
    ? ((data[data.length - 1].value - data[0].value) / data[0].value) * 100 
    : 0;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170, 15%, 88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
            {data[0]?.secondary !== undefined && (
              <Bar dataKey="secondary" fill={colors[1]} radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170, 15%, 88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              fill={colors[0]} 
              fillOpacity={0.3} 
            />
            {data[0]?.secondary !== undefined && (
              <Area 
                type="monotone" 
                dataKey="secondary" 
                stroke={colors[1]} 
                fill={colors[1]} 
                fillOpacity={0.3} 
              />
            )}
          </AreaChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={colors[0]}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(170, 15%, 88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ fill: colors[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
            {data[0]?.secondary !== undefined && (
              <Line 
                type="monotone" 
                dataKey="secondary" 
                stroke={colors[1]} 
                strokeWidth={2}
                dot={{ fill: colors[1], r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        );
    }
  };

  const chartTypeButtons = [
    { type: 'line' as const, icon: LineChartIcon, label: 'Line' },
    { type: 'bar' as const, icon: BarChart3, label: 'Bar' },
    { type: 'area' as const, icon: AreaChartIcon, label: 'Area' },
    { type: 'pie' as const, icon: PieChartIcon, label: 'Pie' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="metric-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {showTrend && (
              <Badge 
                variant="outline" 
                className={overallTrend >= 0 ? "text-safe" : "text-destructive"}
              >
                {overallTrend >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(overallTrend).toFixed(1)}%
              </Badge>
            )}
            <div className="flex items-center bg-muted rounded-lg p-1">
              {chartTypeButtons.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant={chartType === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="h-7 px-2"
                >
                  <Icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {selectedDataPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedDataPoint.name}</p>
                <p className="text-sm text-muted-foreground">Value: {selectedDataPoint.value}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDataPoint(null)}
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </motion.div>
  );
};

export default InteractiveChart;
