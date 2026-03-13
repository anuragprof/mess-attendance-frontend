import { useEffect, useState } from "react";
import axios from "@/Lib/axios";
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

import { Banknote, Smartphone, Loader2 } from "lucide-react";

import CustomerSearch from "./CustomerSearch";
import PaymentHistoryModal from "./PaymentHistoryModal";

export default function RecordPayment() {
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
      const res = await axios.get("/plans/");
      setPlans(res.data);
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
      toast.error("Please fill required fields");
      return;
    }

    try {
      setLoadingPayment(true);

      const formData = new FormData();
      formData.append("amount", amountPaid);
      formData.append("payment_mode", paymentMode);
      if (notes) formData.append("notes", notes);

      await axios.post(
        `/customers/${selectedCustomer.id}/transaction`,
        formData
      );

      toast.success("Payment recorded successfully");
      handleClearCustomer();
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setLoadingPayment(false);
    }
  };

  const openHistory = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await axios.get(`/customers/${selectedCustomer.id}/billing`);
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history");
    }
  };

  return (
    <>
      {/* CUSTOMER SEARCH */}
      <CustomerSearch
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={(c) => {
          if (c === null) handleClearCustomer();
          else setSelectedCustomer(c);
        }}
        onHistoryClick={openHistory}
      />

      {/* PLAN */}
      <div className="space-y-2">
        <Label>Mess Plan *</Label>
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id.toString()}>
                {plan.name} — ₹{plan.price_cents}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AMOUNT + PAYMENT MODE */}
      <div className="grid md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <Label>Amount Paid *</Label>
          <Input
            type="number"
            className="h-11"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
        </div>

        <div className="space-y-2 flex flex-col items-end">
          <Label className="self-start">Payment Method *</Label>
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
      </div>

      {/* NOTES */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          className="min-h-[110px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* SUBMIT */}
      <Button
        onClick={handleSubmit}
        disabled={loadingPayment}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500"
      >
        {loadingPayment ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording Payment...
          </>
        ) : (
          "Record Payment"
        )}
      </Button>

      {/* PAYMENT HISTORY MODAL */}
      <PaymentHistoryModal
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        history={history}
        selectedCustomer={selectedCustomer}
      />
    </>
  );
}
