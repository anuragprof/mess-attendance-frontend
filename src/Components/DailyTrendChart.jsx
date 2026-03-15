import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DailyTrendChart({ data, todayTotal, yesterdayTotal }) {
   // Data expected format: [{ hour: 0, count: 5 }, { hour: 4, count: 18 }, ... ]
   
   // Calculate percentage change
   const calculateTrend = () => {
     if (!yesterdayTotal) return { text: "+100%", isPositive: true };
     
     const diff = todayTotal - yesterdayTotal;
     const percentage = ((diff / yesterdayTotal) * 100).toFixed(1);
     
     return {
       text: diff >= 0 ? `+${percentage}%` : `${percentage}%`,
       isPositive: diff >= 0
     };
   };
   
   const trend = calculateTrend();
   
   const formatHour = (hour) => {
     return `${hour}:00`;
   };

   return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Daily Trend</h3>
          <p className="text-[10px] text-zinc-500">Meal scans throughout the day</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 leading-none">{todayTotal}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend.text}
            </span>
            <span className="text-[10px] text-zinc-500">vs Yesterday</span>
          </div>
        </div>
      </div>
      
      <div className="w-full flex-grow min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tickFormatter={formatHour}
              tick={{ fontSize: 10, fill: '#71717a' }}
              dy={5}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#71717a' }}
            />
            <CartesianGrid vertical={false} stroke="#f4f4f5" />
            <Tooltip 
              labelFormatter={(label) => `${label}:00 - ${label+3}:59`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCount)" 
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
