import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/Pages/ui/button";
import { Input } from "@/Pages/ui/input";
import { Label } from "@/Pages/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Pages/ui/select";

import { Banknote, Smartphone, Loader2, RefreshCw, AlertCircle, ArrowRight, CheckCircle2, History } from "lucide-react";

import CustomerSearch from "./CustomerSearch";
import {
  fetchCustomerCurrentPlan,
  fetchVendorPlans,
  renewSubscription,
} from "@/api/billing";

export default function RenewPlan({ onRenewalComplete }) {
  // ── state ─────────────────────────────────────────────
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const selectedPlan = plans.find((p) => p.id.toString() === selectedPlanId);

  // ── Fetch current plan + all plans when customer selected ──
  useEffect(() => {
    if (!selectedCustomer) {
      setCurrentPlan(null);
      setPlans([]);
      setSelectedPlanId("");
      setAmountPaid("");
      return;
    }

    const load = async () => {
      try {
        setLoadingPlan(true);
        const [planData, allPlans] = await Promise.all([
          fetchCustomerCurrentPlan(selectedCustomer.id),
          fetchVendorPlans(),
        ]);

        setCurrentPlan(planData);
        setPlans(allPlans);

        // Pre-select current plan + auto-fill amount
        if (planData.has_active_plan && planData.plan_id) {
          setSelectedPlanId(planData.plan_id.toString());
          setAmountPaid(
            planData.plan_price?.toString() || ""
          );
        }
      } catch {
        toast.error("Failed to load plan information");
      } finally {
        setLoadingPlan(false);
      }
    };

    load();
  }, [selectedCustomer]);

  // ── Auto-populate amount paid when plan changes ──
  useEffect(() => {
    if (selectedPlan) {
      setAmountPaid(selectedPlan.price_cents.toString());
    }
  }, [selectedPlanId]);

  // ── Clear form ──
  const handleClear = () => {
    setSelectedCustomer(null);
    setCurrentPlan(null);
    setSelectedPlanId("");
    setAmountPaid("");
    setPaymentMode("cash");
  };

  // ── Submit renewal ──
  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedPlanId) {
      toast.error("Please select a customer and plan");
      return;
    }

    try {
      setLoading(true);

      const data = {
        plan_id: parseInt(selectedPlanId),
        amount_paid: parseFloat(amountPaid || "0"),
        payment_mode: paymentMode,
      };

      const result = await renewSubscription(selectedCustomer.id, data);

      toast.success(
        `${result.plan_name} renewed until ${result.end_date}`,
      );
      handleClear();
      if (onRenewalComplete) onRenewalComplete();
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Failed to renew subscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── CUSTOMER SEARCH ── */}
      <CustomerSearch
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={(c) => {
          if (c === null) handleClear();
          else setSelectedCustomer(c);
        }}
      />

      {/* ── LOADING INDICATOR ── */}
      {loadingPlan && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading plan details...
        </div>
      )}

      {/* ── CURRENT PLAN SUMMARY ── */}
      {currentPlan && currentPlan.has_active_plan && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <History size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Active Status</p>
                <h4 className="text-lg font-black text-zinc-900 tracking-tight leading-none">{currentPlan.plan_name}</h4>
              </div>
            </div>
            {loadingPlan && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2 border-t border-blue-100">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Expiry Date</span>
              <p className="text-sm font-black text-zinc-900 tracking-tight">{currentPlan.end_date}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Days Left</span>
              <p className={`text-sm font-black ${currentPlan.days_left <= 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {currentPlan.days_left} Days
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Plan Price</span>
              <p className="text-sm font-black text-zinc-900">₹{currentPlan.plan_price}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Amount Due</span>
              <p className={`text-sm font-black ${currentPlan.remaining > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                ₹{currentPlan.remaining}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PENDING PAYMENT BLOCKER ── */}
      {currentPlan && currentPlan.remaining > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 space-y-5 animate-in fade-in zoom-in-95 duration-500 shadow-xl shadow-rose-500/5">
          <div className="flex items-center gap-5 text-rose-600">
             <div className="w-14 h-14 rounded-[1.25rem] bg-rose-100 flex items-center justify-center border-2 border-rose-200 shadow-sm">
                <AlertCircle size={28} strokeWidth={2.5} />
             </div>
             <div>
                <h4 className="text-xl font-black tracking-tight text-rose-900">Renewal Restricted</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Action Required: Settle Account</p>
             </div>
          </div>
          
          <div className="h-px bg-rose-200 w-full opacity-50" />
          
          <p className="text-sm font-semibold text-rose-800 leading-relaxed max-w-xl">
             This customer has an outstanding balance of <span className="text-rose-600 font-black px-1.5 py-0.5 bg-white rounded-lg border border-rose-200 shadow-sm mx-1">₹{currentPlan.remaining}</span>. 
             Policy prohibits renewing or extending plans while a balance remains from the previous cycle.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link 
              to="/billing" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30 active:scale-95 group"
            >
               Clear Dues in Billing <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-2">Complete payment to unlock renewal form</p>
          </div>
        </div>
      )}

      {currentPlan && !currentPlan.has_active_plan && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-left-4">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
             <AlertCircle size={16} />
          </div>
          <p className="text-xs font-bold text-amber-700 tracking-tight">No active plan found — this will be a fresh subscription for this customer.</p>
        </div>
      )}

      {/* ── RENEWAL FORM (Only if no pending amount) ── */}
      {selectedCustomer && plans.length > 0 && (!currentPlan || currentPlan.remaining <= 0) && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="h-px bg-zinc-100 my-2" />
          
          <div className="space-y-2">
            <Label className="text-sm font-bold text-zinc-700">Select New Plan *</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="h-12 premium-input bg-zinc-50 border-zinc-200">
                <SelectValue placeholder="Choose a plan to continue" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-zinc-100">
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()} className="py-3 rounded-xl focus:bg-blue-50 focus:text-blue-700">
                    <span className="font-bold">{plan.name}</span>
                    <span className="mx-2 opacity-20">|</span>
                    <span className="text-zinc-500 font-mono">₹{plan.price_cents}</span>
                    <span className="mx-2 opacity-20">•</span>
                    <span className="text-zinc-400 text-[10px] font-black uppercase">{plan.duration_days} Days</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
              Select a plan to view payment options
            </p>
          </div>

          {selectedPlanId && (
            <div className="grid md:grid-cols-2 gap-8 pt-2 items-end">
              {/* Amount Paid */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Amount Paid *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    className="premium-input w-full pl-10"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-blue-500/50">₹</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("cash")}
                    className={`flex items-center justify-center gap-2 h-12 rounded-2xl border-2 transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                      paymentMode === "cash" 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/10" 
                        : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
                    }`}
                  >
                    <Banknote size={18} />
                    Cash
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("upi")}
                    className={`flex items-center justify-center gap-2 h-12 rounded-2xl border-2 transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                      paymentMode === "upi" 
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-600/10" 
                        : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
                    }`}
                  >
                    <Smartphone size={18} />
                    UPI
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedPlanId && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 shadow-xl ${
                loading 
                  ? "bg-zinc-100 text-zinc-400 shadow-none" 
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-600/20 active:scale-95"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Renewal...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Submit Renewal
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
