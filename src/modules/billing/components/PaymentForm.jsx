import { useEffect, useState } from "react";
import api from "@/Lib/axios";
import { toast } from "sonner";
import { Button } from "@/Pages/ui/button";
import { Input } from "@/Pages/ui/input";
import { Label } from "@/Pages/ui/label";
import { Textarea } from "@/Pages/ui/textarea";
import { Banknote, Smartphone, Loader2, Save } from "lucide-react";

import CustomerSearch from "./CustomerSearch";
import PaymentHistoryModal from "./PaymentHistoryModal";
import { recordPayment } from "../api/payments";

export default function PaymentForm({ onPaymentRecorded }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const [planDetails, setPlanDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!selectedCustomer) {
        setPlanDetails(null);
        return;
      }
      try {
        setLoadingDetails(true);
        const res = await api.get(`/customers/${selectedCustomer.id}/current-plan`);
        setPlanDetails(res.data);
        
        // Auto-fill amount paid with remaining balance if available
        if (res.data && res.data.remaining > 0) {
            setAmountPaid(res.data.remaining.toString());
        }
      } catch (err) {
        console.error("Failed to fetch plan details:", err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchPlanDetails();
  }, [selectedCustomer]);

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setAmountPaid("");
    setNotes("");
    setPlanDetails(null);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !amountPaid) {
      toast.error("Please fill required fields (Customer & Amount)");
      return;
    }

    try {
      setLoadingPayment(true);
      
      const payload = {
        customer_id: selectedCustomer.id,
        amount: parseFloat(amountPaid),
        payment_mode: paymentMode,
        notes: notes || ""
      };

      await recordPayment(payload);

      toast.success("Payment recorded successfully");
      handleClearCustomer();
      if (onPaymentRecorded) onPaymentRecorded();
    } catch {
      toast.error("Failed to record payment. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const openHistory = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await api.get(`/customers/${selectedCustomer.id}/billing`);
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment history");
    }
  };

  return (
    <div className="gradient-card p-10 space-y-8 h-full flex flex-col justify-between border border-black/15 shadow-sm">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Record Payment</h2>
             <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Collect fee from customer</p>
          </div>
          {selectedCustomer && (
            <div className="flex gap-2">
                <button 
                    onClick={openHistory}
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-black/10 hover:border-black/30 hover:bg-blue-100 transition-colors"
                >
                    View History
                </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <CustomerSearch
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={(c) => {
              if (c === null) handleClearCustomer();
              else setSelectedCustomer(c);
            }}
            onHistoryClick={openHistory}
          />

          {/* Current Plan Details Card */}
          {selectedCustomer && (
            <div className="bg-zinc-50 border border-black/15 rounded-[32px] p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Current Plan Details</h4>
                {loadingDetails && <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />}
              </div>

              {planDetails ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Plan Name</p>
                    <p className="text-sm font-black text-zinc-900">{planDetails.plan_name || "No Active Plan"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Expiry Date</p>
                    <p className="text-sm font-black text-zinc-900">
                        {planDetails.end_date ? new Date(planDetails.end_date).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Days Left</p>
                    <p className={`text-sm font-black ${planDetails.days_left <= 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {planDetails.has_active_plan ? `${planDetails.days_left} Days` : "Expired"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Plan Price</p>
                    <p className="text-sm font-black text-zinc-900">₹{planDetails.total_amount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Amount Paid</p>
                    <p className="text-sm font-black text-zinc-900">₹{planDetails.paid_amount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Remaining</p>
                    <p className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg inline-block border border-blue-200">
                        ₹{planDetails.remaining || 0}
                    </p>
                  </div>
                </div>
              ) : (
                !loadingDetails && <p className="text-sm font-bold text-zinc-400 italic">No active subscription found.</p>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">Amount Paid *</Label>
              <Input
                type="number"
                className="h-12 rounded-2xl bg-zinc-50 border-black/15 font-black text-lg focus:bg-white focus:border-black transition-all text-blue-600"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
             <Label className="text-sm font-semibold text-zinc-700">Payment Method *</Label>
             <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMode("cash")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMode === "cash" 
                      ? "border-black bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-500/10" 
                      : "border-black/10 bg-zinc-50 text-zinc-400 hover:border-black/30"
                  }`}
                >
                  <Banknote className={`${paymentMode === 'cash' ? 'animate-bounce' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-widest">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode("upi")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMode === "upi" 
                      ? "border-black bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-500/10" 
                      : "border-black/10 bg-zinc-50 text-zinc-400 hover:border-black/30"
                  }`}
                >
                  <Smartphone className={`${paymentMode === 'upi' ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-widest">UPI</span>
                </button>
             </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700">Internal Notes</Label>
            <Textarea
              className="rounded-2xl bg-zinc-50 border-black/15 focus:bg-white focus:border-black transition-all font-medium placeholder:text-zinc-400 min-h-[100px]"
              placeholder="e.g. Received by someone else, partial payment details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button
          onClick={handleSubmit}
          disabled={loadingPayment || !selectedCustomer}
          className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl transition-all duration-500 ${
              loadingPayment 
                ? "bg-zinc-100 text-zinc-400" 
                : "bg-zinc-900 text-white hover:bg-black hover:-translate-y-1 shadow-zinc-900/10 active:scale-95 disabled:bg-zinc-50 disabled:text-zinc-300"
          }`}
        >
          {loadingPayment ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              <Save size={20} />
              Confirm Payment
            </div>
          )}
        </Button>
      </div>

      <PaymentHistoryModal
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        history={history}
        selectedCustomer={selectedCustomer}
      />
    </div>
  );
}
