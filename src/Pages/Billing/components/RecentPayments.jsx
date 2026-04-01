import { IndianRupee, Clock, Smartphone, Banknote } from "lucide-react";

export default function RecentPayments({ payments }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return (
    <div className="gradient-card p-6 h-full flex flex-col border border-black/15 shadow-sm">
      <div className="flex items-center justify-between mb-6">
         <div className="space-y-1">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Recent Activity</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Latest recorded payments</p>
         </div>
         <div className="p-3 bg-zinc-900 text-white rounded-2xl">
            <Clock size={16} />
         </div>
      </div>

      <div className="flex-grow space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {recentPayments.map((p, idx) => (
          <div 
            key={p.id || idx} 
            className="group relative flex flex-col p-4 rounded-2xl border border-black/10 hover:border-black/30 bg-white hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300 animate-in slide-in-from-bottom-2"
            style={{animationDelay: `${idx * 100}ms`}}
          >
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border border-black/[0.03] ${p.payment_mode === 'upi' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                     {p.payment_mode === 'upi' ? <Smartphone size={12} /> : <Banknote size={12} />}
                  </div>
                  <p className="font-black text-zinc-900 text-sm tracking-tight truncate max-w-[120px]">{p.customer_name}</p>
               </div>
               <p className="text-sm font-black text-zinc-900 tracking-tight">₹{p.amount?.toLocaleString()}</p>
            </div>

            {p.plan_name && (
              <div className="pl-9 mb-2">
                <p className="text-[10px] font-bold text-zinc-500 tracking-tight flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all truncate">
                  <span className="w-1 h-1 bg-zinc-300 rounded-full flex-shrink-0" />
                  {p.plan_name}
                </p>
              </div>
            )}

            <div className="pl-9 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
               <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.1em]">{p.payment_mode}</p>
               <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest italic opacity-40">Just Now</p>
            </div>
          </div>
        ))}

        {recentPayments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 opacity-30">
            <div className="p-5 bg-zinc-50 rounded-full">
               <IndianRupee size={32} className="text-zinc-400" />
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

