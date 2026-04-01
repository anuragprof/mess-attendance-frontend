import { useEffect, useState } from "react";
import RecentPayments from "./components/RecentPayments";
import RenewPlan from "./components/RenewPlan";
import { fetchRecentTransactions } from "@/api/billing";

export default function Billing() {
  const [payments, setPayments] = useState([]);

  // Fetch recent payments on mount for the sidebar summary
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRecentTransactions();
        setPayments(data);
      } catch (err) {
        console.error("Failed to load recent payments:", err);
      }
    };
    load();
  }, []);

  const refreshPayments = async () => {
    try {
      const data = await fetchRecentTransactions();
      setPayments(data);
    } catch (err) {
      console.error("Failed to refresh payments:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 px-2 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Main Content: Explicitly ONLY for Renewals (order-1 on mobile, order-2 on lg) */}
        <div className="lg:col-span-2 order-1 lg:order-2 gradient-card p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
               <h2 className="text-xl lg:text-2xl font-black text-zinc-900 tracking-tight">Renew Plan</h2>
               <p className="text-[10px] lg:text-xs font-bold text-zinc-400 uppercase tracking-widest">Extend customer mess subscriptions</p>
            </div>
            <div className="bg-blue-600 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase text-white tracking-widest">
                Renewal Only
            </div>
          </div>
          
          <RenewPlan onRenewalComplete={refreshPayments} />
        </div>

        {/* Sidebar Summary (order-2 on mobile, order-1 on lg) */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <RecentPayments payments={payments} />
        </div>
      </div>
    </div>
  );
}
