import { X } from "lucide-react";

export default function PaymentHistoryModal({ showHistory, setShowHistory, history, selectedCustomer }) {
  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[700px] max-h-[80vh] overflow-y-auto p-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">
              Payment History — {selectedCustomer?.full_name}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedCustomer?.phone_number}
            </p>
          </div>

          <button
            onClick={() => setShowHistory(false)}
            className="text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No payment history found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Date</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">Plan Fee</th>
                <th className="pb-2">Paid</th>
                <th className="pb-2">Balance</th>
                <th className="pb-2">Mode</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{h.date}</td>
                  <td className="py-2">{h.plan}</td>
                  <td className="py-2">₹{h.plan_fee}</td>
                  <td className="py-2">₹{h.paid}</td>
                  <td className="py-2">₹{h.balance}</td>
                  <td className="py-2">{h.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
