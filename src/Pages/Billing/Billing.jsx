import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecentPayments from "./components/RecentPayments";
import RecordPayment from "./components/RecordPayment";
import RenewPlan from "./components/RenewPlan";
import { fetchRecentTransactions } from "@/api/billing";

export default function Billing() {
  const [billingTab, setBillingTab] = useState("renew");
  const [payments, setPayments] = useState([]);

  // Fetch recent payments on mount
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

  // Refresh payments when tab switches (catches new payments from Record tab)
  const refreshPayments = async () => {
    try {
      const data = await fetchRecentTransactions();
      setPayments(data);
    } catch (err) {
      console.error("Failed to refresh payments:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
      <RecentPayments payments={payments} />

      {/* ===== Billing Card ===== */}
      <div className="lg:col-span-2 gradient-card p-8 space-y-6">

        {/* TOP TABS */}
        <div className="flex bg-gray-200 rounded-full p-1 w-fit">
          <button
            onClick={() => { setBillingTab("renew"); refreshPayments(); }}
            className={`px-8 py-2 rounded-full text-sm font-medium ${
              billingTab === "renew"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-500"
            }`}
          >
            Renew Plan
          </button>

          <button
            onClick={() => { setBillingTab("payment"); refreshPayments(); }}
            className={`px-8 py-2 rounded-full text-sm font-medium ${
              billingTab === "payment"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-500"
            }`}
          >
            Record Payment
          </button>
        </div>

        {/* TAB CONTENT */}
        {billingTab === "payment" && <RecordPayment onPaymentRecorded={refreshPayments} />}
        {billingTab === "renew" && <RenewPlan onRenewalComplete={refreshPayments} />}

      </div>
      </div>
    </div>
  );
}
