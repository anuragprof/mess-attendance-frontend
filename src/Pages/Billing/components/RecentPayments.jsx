import { Clock, Banknote, Smartphone, ReceiptText } from "lucide-react";

export default function RecentPayments({ payments }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="gradient-card p-6 flex flex-col h-full border border-black/15 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Recent Activity</h2>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Latest Recorded Payments</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg overflow-hidden">
          <Clock size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {recentPayments.map((payment) => (
          <div key={payment.id} className="group p-4 bg-white border border-zinc-100 rounded-3xl transition-all hover:border-blue-600/20 hover:shadow-xl hover:shadow-blue-600/5 relative overflow-hidden flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
              payment.payment_mode?.toLowerCase() === 'cash' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              {payment.payment_mode?.toLowerCase() === 'cash' ? <Banknote size={18} /> : <Smartphone size={18} />}
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between mb-1.5">
                   <p className="text-sm font-black text-zinc-900 truncate tracking-tighter uppercase leading-none">{payment.customer_name}</p>
                   <p className="text-sm font-black text-zinc-900 tracking-tight">₹{payment.amount}</p>
               </div>
               <p className="text-[10px] text-zinc-400 font-bold leading-none mb-1.5 line-clamp-1">• {payment.plan_name}</p>
               <div className="flex items-center justify-between">
                 <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">{payment.payment_mode}</p>
                 <p className="text-[8px] font-black uppercase text-zinc-200 italic">Just Now</p>
               </div>
            </div>
          </div>
        ))}

        {recentPayments.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 gap-3 grayscale">
             <ReceiptText size={48} strokeWidth={1} />
             <p className="text-[10px] font-black uppercase tracking-widest">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}
