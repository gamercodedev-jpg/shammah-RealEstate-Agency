import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

type Point = { date: string; count: number };

export function AnalyticsCard({ data, loading }: { data?: Point[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="p-4 border rounded-md">
        <div className="mb-2 font-semibold">Incidents (30d)</div>
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  const chartData = data ?? [];

  return (
    <div className="p-4 border rounded-md">
      <div className="mb-2 font-semibold">Incidents (30d)</div>
      <div className="w-full h-44 sm:h-52 md:h-56 lg:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsCard;
