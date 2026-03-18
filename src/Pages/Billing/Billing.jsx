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
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <RecentPayments payments={payments} />
        </div>

        {/* Main Content: Explicitly ONLY for Renewals */}
        <div className="lg:col-span-2 gradient-card p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
               <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Renew Plan</h2>
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Extend customer mess subscriptions</p>
            </div>
            <div className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white tracking-widest">
                Renewal Only
            </div>
          </div>
          
          <RenewPlan onRenewalComplete={refreshPayments} />
        </div>
      </div>
    </div>
  );
}
