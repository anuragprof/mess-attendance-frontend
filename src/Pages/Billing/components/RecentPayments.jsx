export default function RecentPayments({ payments }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return (
    <div className="gradient-card p-6">
      <h2 className="font-black text-xl mb-4 tracking-tight">Recent Payments</h2>

      <div className="space-y-1">
        {recentPayments.map((p) => (
          <div key={p.id} className="border-b last:border-0 py-3 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-zinc-900">{p.customer_name}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  {p.plan_name || "Direct Payment"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-zinc-900">₹{p.amount}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  {p.payment_mode}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recentPayments.length === 0 && (
        <p className="text-sm text-zinc-400 text-center py-8 font-medium italic">No recent payments recorded.</p>
      )}
    </div>
  );
}


