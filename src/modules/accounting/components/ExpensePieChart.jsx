import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#a855f7"];

export default function ExpensePieChart({ data }) {
  if (!data || data.length === 0) {
    return (
       <div className="gradient-card p-6 flex items-center justify-center text-zinc-400 h-full min-h-[300px]">
          <p className="text-sm font-medium">No expense data for this period</p>
       </div>
    );
  }

  return (
    <div className="gradient-card p-6 h-full flex flex-col min-h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Spending Breakdown</h3>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Expenses by Category</p>
      </div>
      
      <div className="flex-grow w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              dataKey="amount"
              nameKey="category_name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `₹${parseFloat(value).toLocaleString()}`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 600 }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600, color: '#64748b'}} />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-18px]">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total</p>
          <p className="text-xl font-black text-zinc-900 truncate max-w-[120px]">
            ₹{data.reduce((sum, i) => sum + parseFloat(i.amount), 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
