import { useEffect, useState } from "react";
import api from "@/Lib/axios";
import { toast } from "sonner";
import { Button } from "@/Pages/ui/button";
import { Input } from "@/Pages/ui/input";
import { Label } from "@/Pages/ui/label";
import { Textarea } from "@/Pages/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Pages/ui/select";
import { Banknote, Smartphone, Loader2, Save } from "lucide-react";

import CustomerSearch from "./CustomerSearch";
import PaymentHistoryModal from "./PaymentHistoryModal";
import { recordPayment } from "../api/payments";

export default function PaymentForm({ onPaymentRecorded }) {
  const [plans, setPlans] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const selectedPlan = plans.find((p) => p.id.toString() === selectedPlanId);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/plans/");
        setPlans(res.data);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      setAmountPaid(selectedPlan.price_cents);
    }
  }, [selectedPlanId]);

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setSelectedPlanId("");
    setAmountPaid("");
    setNotes("");
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

      // We maintain the existing endpoint logic but use the modular structure.
      // Based on user route request: /payments/
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
    <div className="gradient-card p-10 space-y-8 h-full flex flex-col justify-between">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Record Payment</h2>
             <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Collect fee from customer</p>
          </div>
          {selectedCustomer && (
            <button 
                onClick={openHistory}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100/50 hover:bg-blue-100 transition-colors"
            >
                View History
            </button>
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

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">Mess Plan *</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-medium tracking-tight">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 shadow-xl font-bold">
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} — ₹{plan.price_cents}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">Amount Paid *</Label>
              <Input
                type="number"
                className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-black text-lg focus:bg-white transition-all text-blue-600"
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
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-500/10" 
                      : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
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
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-500/10" 
                      : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
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
              className="rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white transition-all font-medium placeholder:text-zinc-400 min-h-[100px]"
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
