import { useState, useMemo } from "react";
import { useFinancialReports } from "../hooks/useFinancialReports";
import { TrendingUp, TrendingDown, Wallet, IndianRupee, PieChart, Info, Calendar } from "lucide-react";
import IncomeExpenseTrendChart from "../components/TrendChart";
import ExpensePieChart from "../components/ExpensePieChart";
import { toast } from "sonner";

const SummaryCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className="gradient-card p-6 flex items-start justify-between border-l-4" style={{borderLeftColor: color}}>
     <div className="space-y-3">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-black text-zinc-900 tracking-tighter">
          ₹{parseFloat(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </h4>
        {trend && (
           <div className={`flex items-center gap-1.5 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trendValue} %
              <span className="text-zinc-400 font-medium">Margin</span>
           </div>
        )}
     </div>
     <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-white group-hover:text-zinc-900 transition-all duration-300">
        {icon}
     </div>
  </div>
);

export default function AccountingDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });

  const { profitSummary, categoryBreakdown, trendData, loading } = useFinancialReports(dateRange);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Finance Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time overview of your mess profitability</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-zinc-100 items-center gap-2">
           <Calendar size={16} className="ml-2 text-zinc-400" />
           <input 
              type="date"
              className="bg-transparent border-none text-xs font-bold py-1.5 focus:ring-0 cursor-pointer"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
           />
           <span className="text-zinc-400 text-xs font-black">—</span>
           <input 
              type="date"
              className="bg-transparent border-none text-xs font-bold py-1.5 focus:ring-0 cursor-pointer pr-2"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <SummaryCard 
           title="Total Income" 
           value={profitSummary?.totalIncome} 
           icon={<IndianRupee />} 
           color="#10b981" 
           trend="up"
           trendValue="100"
         />
         <SummaryCard 
           title="Total Expense" 
           value={profitSummary?.totalExpense} 
           icon={<IndianRupee />} 
           color="#f43f5e" 
         />
         <SummaryCard 
           title="Net Profit" 
           value={profitSummary?.profit} 
           icon={<Wallet />} 
           color="#3b82f6" 
           trend={profitSummary?.profit >= 0 ? 'up' : 'down'}
           trendValue={profitSummary?.profitMargin}
         />
         <div className="gradient-card p-6 bg-zinc-900 text-white border-none flex flex-col justify-center text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Profit Margin</p>
            <h4 className="text-4xl font-black">{profitSummary?.profitMargin || 0}%</h4>
            <div className="w-full bg-zinc-800 h-1.5 mt-2 rounded-full overflow-hidden">
               <div className="bg-emerald-500 h-full transition-all duration-1000" style={{width: `${Math.max(0, Math.min(100, profitSummary?.profitMargin || 0))}%`}} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <IncomeExpenseTrendChart data={trendData} />
         </div>
         <div className="lg:col-span-1">
            <ExpensePieChart data={categoryBreakdown} />
         </div>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex flex-col md:flex-row gap-6 items-center">
         <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
            <Info size={24} />
         </div>
         <div className="flex-grow text-center md:text-left">
            <h5 className="font-bold text-blue-900">How is profit calculated?</h5>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
               Income is calculated as the sum of all customer payments (CusTrans) collected during the selected period. 
               Expenses are subtracted to derive your net profit. This ensures accuracy based on actual cash flow.
            </p>
         </div>
         <button className="whitespace-nowrap bg-white text-blue-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:shadow-md transition-all">
            Full Reports →
         </button>
      </div>
    </div>
  );
}
