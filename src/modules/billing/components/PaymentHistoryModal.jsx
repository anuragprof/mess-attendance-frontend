import { X } from "lucide-react";

export default function PaymentHistoryModal({ showHistory, setShowHistory, history, selectedCustomer }) {
  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-100 flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">
              Payment History
            </h3>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {selectedCustomer?.full_name} • {selectedCustomer?.phone_number}
            </p>
          </div>

          <button
            onClick={() => setShowHistory(false)}
            className="p-2 hover:bg-white rounded-xl text-zinc-400 hover:text-zinc-900 shadow-sm border border-transparent hover:border-zinc-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-50">
              <div className="p-4 bg-zinc-50 rounded-full">
                <X size={24} className="text-zinc-400" />
              </div>
              <p className="text-sm font-bold text-zinc-400">No payment history found.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-zinc-100 rounded-2xl shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50/50 text-left text-zinc-400 uppercase text-[10px] font-black tracking-[0.15em] border-b border-zinc-100">
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Plan Name</th>
                    <th className="px-5 py-4">Paid</th>
                    <th className="px-5 py-4">Balance</th>
                    <th className="px-5 py-4">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-zinc-900">{h.date}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-lg">
                            {h.plan_name}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600">₹{h.paid}</td>
                      <td className="px-5 py-4 text-zinc-500 font-medium">₹{h.balance}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${h.mode === 'upi' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                            {h.mode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
           <button 
             onClick={() => setShowHistory(false)}
             className="bg-white border border-zinc-200 px-8 py-2.5 rounded-2xl font-bold text-sm tracking-tight text-zinc-600 hover:bg-zinc-100 transition-all"
           >
             Close History
           </button>
        </div>

      </div>
    </div>
  );
}
