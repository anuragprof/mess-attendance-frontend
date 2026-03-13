import { useState } from "react";
import { Button } from "@/Pages/ui/button";
import CustomerSearch from "./CustomerSearch";

export default function RenewPlan() {
  const [renewTab, setRenewTab] = useState("renew");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <div className="space-y-6">
      {/* SUB-TABS */}
      <div className="flex border-b gap-8 text-sm">
        <button
          onClick={() => setRenewTab("renew")}
          className={`pb-3 ${
            renewTab === "renew"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Renew Plan
        </button>

        <button
          onClick={() => setRenewTab("upgrade")}
          className={`pb-3 ${
            renewTab === "upgrade"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Upgrade/Downgrade
        </button>

        <button
          onClick={() => setRenewTab("cancel")}
          className={`pb-3 ${
            renewTab === "cancel"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Cancel Plan
        </button>
      </div>

      {/* CUSTOMER SEARCH */}
      <CustomerSearch
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
      />

      {renewTab === "renew" && (
        <Button className="w-full h-12">Submit Renewal</Button>
      )}

      {renewTab === "upgrade" && (
        <Button className="w-full">Apply Plan Change</Button>
      )}

      {renewTab === "cancel" && (
        <Button variant="destructive" className="w-full">
          Cancel Subscription
        </Button>
      )}
    </div>
  );
}
