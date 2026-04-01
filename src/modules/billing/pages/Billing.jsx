import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getRecentPayments } from "../api/payments";
import PaymentForm from "../components/PaymentForm";
import RecentPayments from "../components/RecentPayments";
import { Loader2, ShieldCheck, Zap } from "lucide-react";

export default function BillingPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getRecentPayments();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      toast.error("Failed to load recent activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-700 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch lg:h-full">
        
        {/* Left Column: Recent Activity (1/3) */}
        <div className="lg:col-span-1 h-full">
          {loading && payments.length === 0 ? (
            <div className="h-full min-h-[500px] w-full bg-white rounded-[32px] border border-zinc-100 flex items-center justify-center">
               <Loader2 className="h-10 w-10 text-zinc-200 animate-spin" />
            </div>
          ) : (
            <RecentPayments payments={payments} />
          )}
        </div>

        {/* Right Column: Payment Form (2/3) */}
        <div className="lg:col-span-2 h-full">
           <PaymentForm onPaymentRecorded={fetchPayments} />
        </div>

      </div>
    </div>
  );
}
