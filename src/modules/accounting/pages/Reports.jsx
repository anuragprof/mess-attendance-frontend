import { useState } from "react";
import { useFinancialReports } from "../hooks/useFinancialReports";
import { useCategories } from "../hooks/useCategories";
import { Download, Table, BarChart3, PieChart, Filter, IndianRupee, Printer } from "lucide-react";
import ExpensePieChart from "../components/ExpensePieChart";
import { Button } from "@/Pages/ui/button";
import { toast } from "sonner";

export default function AccountingReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });

  const { profitSummary, categoryBreakdown, loading } = useFinancialReports(dateRange);
  const { categories } = useCategories();

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    toast.info("Preparing report export...");
    // Future expansion: axios call to backend /reports/export-excel-accounting
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Financial Reports</h1>
          <p className="text-zinc-500 text-sm mt-1">Detailed breakdown of profit and loss</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePrint} className="h-11 px-5 rounded-xl text-zinc-600 bg-white">
            <Printer size={18} className="mr-2" /> Print PDF
          </Button>
          <Button onClick={handleExport} className="h-11 px-5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
            <Download size={18} className="mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="gradient-card p-6 flex flex-col md:flex-row gap-6 items-center print:hidden">
         <div className="flex bg-zinc-50 p-2 rounded-2xl gap-3 w-full md:w-auto">
            {["Last 7 Days", "Last 30 Days", "This Quarter"].map(label => (
               <button 
                  key={label}
                  className="px-4 py-2 hover:bg-white hover:shadow-sm rounded-xl text-xs font-bold text-zinc-500 hover:text-blue-600 transition-all border border-transparent hover:border-blue-50"
                  onClick={() => {
                     const end = new Date();
                     const start = new Date();
                     if (label === "Last 7 Days") start.setDate(end.getDate() - 7);
                     if (label === "Last 30 Days") start.setDate(end.getDate() - 30);
                     if (label === "This Quarter") start.setMonth(end.getMonth() - 3);
                     setDateRange({
                        startDate: start.toISOString().split("T")[0],
                        endDate: end.toISOString().split("T")[0]
                     });
                  }}
               >
                  {label}
               </button>
            ))}
         </div>
         <div className="flex-grow flex items-center justify-center md:justify-end gap-2 text-sm font-bold text-zinc-500">
            <Filter size={16} className="text-blue-600" /> Date Filter: 
            <input 
              type="date"
              className="bg-white border-zinc-200 p-2 rounded-xl text-xs focus:ring-blue-500"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <span className="text-zinc-300">to</span>
            <input 
              type="date"
              className="bg-white border-zinc-200 p-2 rounded-xl text-xs focus:ring-blue-500"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
         {/* Table Breakdown */}
         <div className="gradient-card p-0 overflow-hidden print:border-none">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
               <div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
                     <Table size={20} className="text-blue-600" /> Category Breakdown
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Sum of expenses per category</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Selected Expense</p>
                  <p className="text-xl font-black text-rose-600">₹{profitSummary?.totalExpense?.toLocaleString()}</p>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm">
                  <thead>
                     <tr className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 bg-zinc-50/30">
                        <th className="p-4 text-left">Category</th>
                        <th className="p-4 text-center">Share</th>
                        <th className="p-4 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                     {categoryBreakdown.length > 0 ? categoryBreakdown.map(item => (
                        <tr key={item.categoryId} className="hover:bg-zinc-50/50 transition-colors">
                           <td className="p-4 flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-lg">{categories.find(c => c.id === item.categoryId)?.icon || '📁'}</span>
                              <span className="font-bold text-zinc-700">{item.categoryName}</span>
                           </td>
                           <td className="p-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                 <span className="text-xs font-bold text-zinc-500">{item.percentage}%</span>
                                 <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full" style={{width: `${item.percentage}%`}} />
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-right font-black text-zinc-900">
                              ₹{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                           </td>
                        </tr>
                     )) : (
                        <tr><td colSpan={3} className="p-8 text-center text-zinc-400 text-xs italic">No expenses recorded for this period</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Visual Breakdown */}
         <div className="space-y-6">
            <ExpensePieChart data={categoryBreakdown} />
            
            <div className="gradient-card p-6 bg-blue-600 text-white border-none space-y-4">
               <div className="flex justify-between items-start">
                  <div>
                     <h4 className="text-lg font-black tracking-tight">Profit Summary</h4>
                     <p className="text-blue-100 text-xs font-medium">Business health for the period</p>
                  </div>
                  <IndianRupee size={24} className="opacity-20" />
               </div>
               <div className="grid grid-cols-2 gap-4 border-t border-blue-500/30 pt-4">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Income</p>
                     <p className="text-xl font-black">₹{profitSummary?.totalIncome?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Expense</p>
                     <p className="text-xl font-black">₹{profitSummary?.totalExpense?.toLocaleString()}</p>
                  </div>
               </div>
               <div className="bg-white/10 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest">Total Net Profit</span>
                  <span className={`text-xl font-black ${profitSummary?.profit >= 0 ? "text-white" : "text-rose-200"}`}>
                    ₹{profitSummary?.profit?.toLocaleString()}
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
