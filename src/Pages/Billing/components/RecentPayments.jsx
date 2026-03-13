export default function RecentPayments({ payments }) {
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <h2 className="font-semibold mb-4">Recent Payments</h2>

      {recentPayments.map((p) => (
        <div key={p.id} className="border-b py-3 text-sm">
          <p className="font-medium">{p.customer_name}</p>
          <p className="text-gray-500">₹{p.amount} • {p.payment_mode}</p>
        </div>
      ))}

      {recentPayments.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No recent payments.</p>
      )}
    </div>
  );
}
