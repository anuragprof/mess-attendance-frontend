import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function IncomeExpenseTrendChart({ data }) {
  return (
    <div className="gradient-card p-6 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Financial Trend</h3>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Income vs Expense Daily Distribution</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold px-3 py-1 bg-zinc-50 rounded-lg">
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income</div>
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense</div>
        </div>
      </div>
      
      <div className="flex-grow w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 500}} 
              dy={10}
              tickFormatter={(v) => {
                const parts = v.split("-");
                return `${parts[2]}/${parts[1]}`;
              }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 600 }}
              labelStyle={{ color: '#0f172a', marginBottom: '8px' }}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
              name="Income"
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
              name="Expense"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
