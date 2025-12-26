'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '@/utils/types';

/**
 * MarketTrendChart Component
 * - Line chart displaying market price trends over time
 * - Uses Recharts library for responsive charts
 * - Shows multiple crop price lines with different colors
 * - Tooltips with formatted currency (₹)
 * - Mobile responsive
 */

interface MarketTrendChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export default function MarketTrendChart({ data, title = 'Market Price Trends' }: MarketTrendChartProps) {
  // Get unique crop names from data
  const crops = Array.from(new Set(data.map(d => d.crop)));
  
  // Color palette for different crops
  const colors = [
    '#22c55e', // primary green
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <strong>{entry.name}:</strong> ₹{entry.value.toFixed(2)}/kg
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Historical market prices for recommended crops
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Price (₹/kg)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {crops.map((crop, index) => (
            <Line
              key={crop}
              type="monotone"
              dataKey="price"
              data={data.filter(d => d.crop === crop)}
              name={crop}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend Info */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {crops.map((crop, index) => (
          <div key={crop} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-gray-700">{crop}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple stat card for market summary
 */
export function MarketSummaryCard({ 
  label, 
  value, 
  trend 
}: { 
  label: string; 
  value: string; 
  trend?: 'up' | 'down' | 'stable' 
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-lg ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}
