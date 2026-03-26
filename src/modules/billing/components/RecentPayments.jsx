import { IndianRupee, Clock } from "lucide-react";

export default function RecentPayments({ payments }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return (
    <div className="gradient-card p-8 h-full flex flex-col border border-black/15 shadow-sm">
      <div className="flex items-center justify-between mb-8">
         <div className="space-y-1">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Recent Activity</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Latest recorded payments</p>
         </div>
         <div className="p-3 bg-zinc-900 text-white rounded-2xl">
            <Clock size={18} />
         </div>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {recentPayments.map((p, idx) => (
          <div 
            key={p.id || idx} 
            className="group relative flex items-center justify-between p-4 rounded-2xl border border-black/10 hover:border-black/30 bg-white hover:shadow-lg hover:shadow-zinc-200/50 transition-all duration-300 animate-in slide-in-from-bottom-2"
            style={{animationDelay: `${idx * 100}ms`}}
          >
            <div className="flex items-center gap-4">
               <div className={`p-2.5 rounded-xl ${p.payment_mode === 'upi' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {p.payment_mode === 'upi' ? <Smartphone size={16} /> : <Banknote size={16} />}
               </div>
               <div>
                  <p className="font-bold text-zinc-900 leading-tight">{p.customer_name}</p>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {p.plan_name && (
                      <p className="text-[10px] font-medium text-zinc-500 tracking-tight">
                        {p.plan_name} {p.meals_per_day ? `| ${p.meals_per_day} Time` : ''} {p.duration_days ? `| ${p.duration_days} Days` : ''}
                      </p>
                    )}
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider transition-colors group-hover:text-zinc-600">
                      via {p.payment_mode}
                    </p>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <p className="text-base font-black text-zinc-900">₹{p.amount}</p>
               <p className="text-[10px] text-zinc-400 font-medium">Recorded Just Now</p>
            </div>
          </div>
        ))}

        {recentPayments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 opacity-30">
            <div className="p-5 bg-zinc-50 rounded-full">
               <IndianRupee size={32} className="text-zinc-400" />
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No entries yet</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100">
         <div className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Handled</span>
            <span className="font-black text-zinc-900">₹{recentPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}</span>
         </div>
      </div>
    </div>
  );
}

// Simple fallback for missing icons in scope
const Banknote = ({ size, className }) => <IndianRupee size={size} className={className} />;
const Smartphone = ({ size, className }) => <IndianRupee size={size} className={className} />;
