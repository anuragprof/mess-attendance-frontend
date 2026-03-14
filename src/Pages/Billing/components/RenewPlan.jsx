import { useEffect, useState } from "react";
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

import { Banknote, Smartphone, Loader2, RefreshCw } from "lucide-react";

import CustomerSearch from "./CustomerSearch";
import {
  fetchCustomerCurrentPlan,
  fetchVendorPlans,
  renewSubscription,
} from "@/api/billing";

export default function RenewPlan() {
  // ── state ─────────────────────────────────────────────
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
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
      setTotalAmount("");
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

        // Pre-select current plan
        if (planData.has_active_plan && planData.plan_id) {
          setSelectedPlanId(planData.plan_id.toString());
          // Auto-populate with current plan price
          const match = allPlans.find((p) => p.id === planData.plan_id);
          if (match) {
            setTotalAmount(match.price_cents.toString());
          }
        }
      } catch {
        toast.error("Failed to load plan information");
      } finally {
        setLoadingPlan(false);
      }
    };

    load();
  }, [selectedCustomer]);

  // ── Auto-populate amount when plan changes ──
  useEffect(() => {
    if (selectedPlan) {
      setTotalAmount(selectedPlan.price_cents.toString());
    }
  }, [selectedPlanId]);

  // ── Clear form ──
  const handleClear = () => {
    setSelectedCustomer(null);
    setCurrentPlan(null);
    setSelectedPlanId("");
    setTotalAmount("");
    setAmountPaid("");
    setPaymentMode("cash");
  };

  // ── Submit renewal ──
  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedPlanId || !totalAmount) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const data = {
        plan_id: parseInt(selectedPlanId),
        total_amount: parseFloat(totalAmount),
        total_amount_paid: parseFloat(amountPaid || "0"),
        payment_mode: paymentMode,
      };

      const result = await renewSubscription(selectedCustomer.id, data);

      toast.success(
        `${result.plan_name} renewed until ${result.end_date}`,
      );
      handleClear();
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-blue-700">
            Current Plan — {currentPlan.plan_name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Expires</span>
              <p className="font-medium">{currentPlan.end_date}</p>
            </div>
            <div>
              <span className="text-gray-500">Days Left</span>
              <p className="font-medium">{currentPlan.days_left}</p>
            </div>
            <div>
              <span className="text-gray-500">Total</span>
              <p className="font-medium">₹{currentPlan.total_amount}</p>
            </div>
            <div>
              <span className="text-gray-500">Balance</span>
              <p className="font-medium text-red-600">
                ₹{currentPlan.balance}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentPlan && !currentPlan.has_active_plan && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          No active plan — this will be a fresh subscription.
        </div>
      )}

      {/* ── PLAN DROPDOWN ── */}
      {selectedCustomer && plans.length > 0 && (
        <div className="space-y-2">
          <Label>Select Plan *</Label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Choose a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.name} — ₹{plan.price_cents} / {plan.duration_days}
                  &nbsp;days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── AMOUNT + PAYMENT MODE ── */}
      {selectedCustomer && selectedPlanId && (
        <div className="grid md:grid-cols-2 gap-6 items-end">
          {/* Total Amount */}
          <div className="space-y-2">
            <Label>Total Amount *</Label>
            <Input
              type="number"
              className="h-11"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>

          {/* Amount Paid */}
          <div className="space-y-2">
            <Label>Amount Paid</Label>
            <Input
              type="number"
              className="h-11"
              placeholder="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
        </div>
      )}

      {selectedCustomer && selectedPlanId && (
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="flex gap-3">
            <Button
              variant={paymentMode === "cash" ? "default" : "outline"}
              onClick={() => setPaymentMode("cash")}
              className="rounded-full px-6"
            >
              <Banknote className="mr-2 h-4 w-4" />
              Cash
            </Button>

            <Button
              variant={paymentMode === "upi" ? "default" : "outline"}
              onClick={() => setPaymentMode("upi")}
              className="rounded-full px-6"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              UPI
            </Button>
          </div>
        </div>
      )}

      {/* ── SUBMIT ── */}
      {selectedCustomer && selectedPlanId && (
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Renewing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Submit Renewal
            </>
          )}
        </Button>
      )}
    </div>
  );
}
