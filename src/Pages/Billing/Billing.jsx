import { useState } from "react";
import RecentPayments from "./components/RecentPayments";
import RecordPayment from "./components/RecordPayment";
import RenewPlan from "./components/RenewPlan";

export default function Billing() {
  const [billingTab, setBillingTab] = useState("renew");

  // payments list for the sidebar (can be fetched here or passed down)
  const payments = [];

  return (
    <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-8 items-start">

      {/* ===== Recent Payments Sidebar ===== */}
      <RecentPayments payments={payments} />

      {/* ===== Billing Card ===== */}
      <div className="lg:col-span-2 bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8 shadow-lg space-y-6">

        {/* TOP TABS */}
        <div className="flex bg-gray-200 rounded-full p-1 w-fit">
          <button
            onClick={() => setBillingTab("renew")}
            className={`px-8 py-2 rounded-full text-sm font-medium ${
              billingTab === "renew"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-500"
            }`}
          >
            Renew Plan
          </button>

          <button
            onClick={() => setBillingTab("payment")}
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
        {billingTab === "payment" && <RecordPayment />}
        {billingTab === "renew" && <RenewPlan />}

      </div>

    </div>
  );
}
