import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"]; // Amber, Blue, Emerald

export default function MealDistributionChart({ data }) {
  // Data expected format: [{ name: "Breakfast", value: 320 }, { name: "Lunch", value: 560 }, { name: "Dinner", value: 370 }]
  
  const totalMeals = data.reduce((sum, entry) => sum + entry.value, 0);

  // Custom label for the center of the donut chart
  const renderCustomLabel = ({ cx, cy }) => {
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-semibold text-gray-700"
      >
        <tspan x={cx} dy="-0.5em" fontSize="14">Total Meals</tspan>
        <tspan x={cx} dy="1.5em" fontSize="24" fontWeight="bold">{totalMeals}</tspan>
      </text>
    );
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center justify-between h-full">
      <h3 className="text-base font-semibold text-gray-800 w-full mb-1">Meal Distribution</h3>
      
      <div className="relative w-full flex-grow flex items-center justify-center min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={45}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              cx="50%"
              cy="50%"
            >
               {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [
                `${value} (${((value / (totalMeals || 1)) * 100).toFixed(1)}%)`, 
                name
              ]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Absolute positioned center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
          <span className="text-[10px] text-zinc-500 font-medium leading-none">Total</span>
          <span className="text-lg font-bold text-gray-800 leading-tight">{totalMeals}</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs font-medium text-gray-600">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
