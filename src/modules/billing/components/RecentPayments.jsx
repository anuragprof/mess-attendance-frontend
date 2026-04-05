import { IndianRupee, Clock, Smartphone, Banknote } from "lucide-react";

export default function RecentPayments({ payments = [] }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Reduced to 5 as requested

  return (
    <div className="bg-white rounded-[2.5rem] p-8 h-full flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Activity</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Latest recorded payments
          </p>
        </div>
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
          <Clock size={20} />
        </div>
      </div>

      {/* List (Scrollable) */}
      <div className="flex-grow space-y-3 overflow-y-auto pr-2 -mr-2 custom-scrollbar max-h-[360px]">
        {recentPayments.length > 0 ? (
          recentPayments.map((p, idx) => (
            <div
              key={p.id || idx}
              className="group flex items-center justify-between p-4 rounded-[1.5rem] bg-white border border-slate-50 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 animate-in slide-in-from-bottom-3"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Icon matching height of two rows */}
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${p.payment_mode?.toLowerCase() === 'upi' 
                    ? 'bg-indigo-50 text-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.1)]' 
                    : 'bg-emerald-50 text-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.1)]'
                  }
                `}>
                  {p.payment_mode?.toLowerCase() === 'upi' ? <Smartphone size={22} /> : <Banknote size={22} />}
                </div>

                {/* Two rows area */}
                <div className="flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                    {p.customer_name || "Anonymous Member"}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {p.payment_mode || "CASH"}
                    </span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-medium text-slate-500 truncate max-w-[150px]">
                      {p.plan_name || "Mess Subscription"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount on Right */}
              <div className="text-right">
                <p className="text-lg font-black text-slate-900 tracking-tight">
                  ₹{(p.amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
               <IndianRupee size={24} className="text-slate-300" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No entries yet</p>
          </div>
        )}
      </div>

      {/* Footer Total */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Today's Handled
          </span>
          <span className="text-xl font-black text-slate-900 tracking-tighter">
            ₹{recentPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
