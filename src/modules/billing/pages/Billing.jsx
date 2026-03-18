import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getRecentPayments } from "../api/payments";
import PaymentForm from "../components/PaymentForm";
import RecentPayments from "../components/RecentPayments";
import { Loader2, ShieldCheck, Zap } from "lucide-react";

export default function BillingPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getRecentPayments();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      toast.error("Failed to load recent activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
           <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Billing & Transactions</h1>
           <p className="text-zinc-500 font-medium">Record daily collections and track payment flow.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex items-center gap-4">
           <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={20} />
           </div>
           <div>
              <p className="text-xs font-black uppercase text-emerald-800/60 tracking-[0.1em]">Secured Flow</p>
              <p className="text-sm font-bold text-emerald-900 italic">Auto-syncs with accounts</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Aspect: Recent Activity (1/3) */}
        <div className="lg:col-span-4 h-full">
          {loading && payments.length === 0 ? (
            <div className="h-full min-h-[500px] w-full bg-white rounded-[32px] border border-zinc-100 flex items-center justify-center">
               <Loader2 className="h-10 w-10 text-zinc-200 animate-spin" />
            </div>
          ) : (
            <RecentPayments payments={payments} />
          )}
        </div>

        {/* Right Aspect: Payment Form (2/3) */}
        <div className="lg:col-span-8 h-full">
           <PaymentForm onPaymentRecorded={fetchPayments} />
        </div>

      </div>

      {/* Micro-Interaction Tip */}
      <div className="bg-zinc-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full group-hover:bg-blue-600/30 transition-all duration-700" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
               <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl">
                  <Zap className="text-amber-400" />
               </div>
               <div>
                  <h4 className="text-xl font-black tracking-tight">Need a quick summary?</h4>
                  <p className="text-zinc-400 text-sm font-medium mt-1">Check the Reports module for deep financial analysis.</p>
               </div>
            </div>
            <button className="bg-white text-zinc-900 px-8 py-3 rounded-2xl font-black text-sm hover:bg-zinc-100 transition-all active:scale-95">
               View Full Reports
            </button>
         </div>
      </div>
    </div>
  );
}
