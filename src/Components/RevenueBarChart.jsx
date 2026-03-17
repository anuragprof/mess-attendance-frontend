import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RevenueBarChart({ data, total }) {
   // Data expected format: [{ date: "2026-03-10", amount: 5000 }, { date: "2026-03-11", amount: 8000 } ]
   
   const formatDay = (dateString) => {
     if (!dateString) return "";
     const parts = dateString.split("-");
     if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
     }
     return dateString;
   };

   return (
    <div className="gradient-card p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Revenue Trend</h3>
          <p className="text-[10px] text-zinc-500">Daily collections over time</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 leading-none">₹{total.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="w-full flex-grow min-h-0 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f4f4f5" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tickFormatter={formatDay}
              tick={{ fontSize: 10, fill: '#71717a' }}
              dy={5}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickFormatter={(value) => `₹${value>=1000 ? (value/1000).toFixed(1)+'k' : value}`}
            />
            <Tooltip 
              formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              itemStyle={{ color: '#10b981', fontWeight: 600 }}
              labelStyle={{ color: '#71717a', marginBottom: '4px' }}
            />
            <Bar 
              dataKey="amount" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
