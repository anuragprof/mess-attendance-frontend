import { useEffect, useRef, useState } from "react";
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

import {
  Search,
  X,
  Banknote,
  Smartphone,
  Loader2,
} from "lucide-react";

export default function Billing() {

  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debounceTimer = useRef(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [notes, setNotes] = useState("");

  const [loadingPayment, setLoadingPayment] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const selectedPlan = plans.find(
    (p) => p.id.toString() === selectedPlanId
  );

  useEffect(() => {
    const fetchPlans = async () => {
      const res = await axios.get("/plans");
      setPlans(res.data);
    };

    const fetchPayments = async () => {
      const res = await axios.get("/payments");
      setPayments(res.data);
    };

    fetchPlans();
    fetchPayments();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!debouncedQuery) return;

      const res = await axios.get(`/customers/search?q=${debouncedQuery}`);
      setCustomers(res.data);
    };

    fetchCustomers();
  }, [debouncedQuery]);

  const handleSearchChange = (value) => {

    setSearchQuery(value);

    if (debounceTimer.current)
      clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSearchQuery("");
    setCustomers([]);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setSelectedPlanId("");
    setAmountPaid("");
    setNotes("");
  };

  useEffect(() => {
    if (selectedPlan) {
      setAmountPaid(selectedPlan.price);
    }
  }, [selectedPlanId]);

  const handleSubmit = async () => {

    if (!selectedCustomer || !selectedPlanId || !amountPaid) {
      toast.error("Please fill required fields");
      return;
    }

    try {

      setLoadingPayment(true);

      await axios.post("/payments", {
        customer_id: selectedCustomer.id,
        plan_id: selectedPlanId,
        amount: amountPaid,
        payment_mode: paymentMode,
        notes: notes,
      });

      toast.success("Payment recorded");

      handleClearCustomer();

      const res = await axios.get("/payments");
      setPayments(res.data);

    } catch {
      toast.error("Failed to record payment");
    } finally {
      setLoadingPayment(false);
    }
  };

  const openHistory = async () => {

    if (!selectedCustomer) return;

    const res = await axios.get(
      `/payments/customer/${selectedCustomer.id}`
    );

    setHistory(res.data);
    setShowHistory(true);
  };

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-3 gap-6">

      {/* Recent Payments */}

      <div className="border rounded-xl p-4">

        <h2 className="font-semibold mb-4">
          Recent Payments
        </h2>

        {recentPayments.map((p) => (

          <div key={p.id} className="border-b py-3 text-sm">

            <p className="font-medium">
              {p.customer_name}
            </p>

            <p className="text-gray-500">
              ₹{p.amount} • {p.payment_mode}
            </p>

          </div>

        ))}

      </div>

      {/* Billing Form */}

      <div className="lg:col-span-2 border rounded-xl p-6 space-y-6">

        <h2 className="text-lg font-semibold">
          Record Payment
        </h2>

        {/* Customer Search */}

        <div className="space-y-2">

          <Label>Customer *</Label>

          {selectedCustomer ? (

            <div className="flex justify-between items-center border p-3 rounded-lg">

              <div className="flex items-center gap-3">

                <img
                  src={selectedCustomer.photo_url || "/avatar.png"}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <p className="font-medium">
                    {selectedCustomer.full_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {selectedCustomer.phone_number}
                  </p>
                </div>

              </div>

              <div className="flex gap-2">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={openHistory}
                >
                  History
                </Button>

                <button onClick={handleClearCustomer}>
                  <X size={16} />
                </button>

              </div>

            </div>

          ) : (

            <div className="relative">

              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <Input
                className="pl-9"
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) =>
                  handleSearchChange(e.target.value)
                }
              />

              {customers.length > 0 && (

                <div className="absolute w-full bg-white border rounded mt-1 z-10 max-h-60 overflow-y-auto">

                  {customers.map((c) => (

                    <button
                      key={c.id}
                      onMouseDown={() =>
                        handleSelectCustomer(c)
                      }
                      className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-gray-100"
                    >

                      <img
                        src={c.photo_url || "/avatar.png"}
                        className="w-8 h-8 rounded-full"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          {c.full_name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {c.phone_number}
                        </p>
                      </div>

                    </button>

                  ))}

                </div>

              )}

            </div>

          )}

        </div>

        {/* Plan */}

        <div className="space-y-2">

          <Label>Mess Plan *</Label>

          <Select
            value={selectedPlanId}
            onValueChange={setSelectedPlanId}
          >

            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>

            <SelectContent>

              {plans.map((plan) => (

                <SelectItem
                  key={plan.id}
                  value={plan.id.toString()}
                >

                  {plan.name} — ₹{plan.price}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>

        </div>

        {/* Amount */}

        <div className="space-y-2">

          <Label>Amount Paid *</Label>

          <Input
            type="number"
            value={amountPaid}
            onChange={(e) =>
              setAmountPaid(e.target.value)
            }
          />

        </div>

        {/* Payment Mode */}

        <div className="flex gap-3">

          <Button
            variant={
              paymentMode === "cash"
                ? "default"
                : "outline"
            }
            onClick={() => setPaymentMode("cash")}
          >
            <Banknote className="mr-2 h-4 w-4" />
            Cash
          </Button>

          <Button
            variant={
              paymentMode === "upi"
                ? "default"
                : "outline"
            }
            onClick={() => setPaymentMode("upi")}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            UPI
          </Button>

        </div>

        {/* Notes */}

        <div className="space-y-2">

          <Label>Notes</Label>

          <Textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
          />

        </div>

        {/* Submit */}

        <Button
          onClick={handleSubmit}
          disabled={loadingPayment}
          className="w-full"
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

      </div>

      {/* Payment History Modal */}

      {showHistory && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-xl w-96 p-6">

            <div className="flex justify-between mb-4">

              <h3 className="font-semibold">
                Payment History
              </h3>

              <button
                onClick={() => setShowHistory(false)}
              >
                <X size={18} />
              </button>

            </div>

            {history.length === 0 ? (

              <p className="text-sm text-gray-500">
                No payment history
              </p>

            ) : (

              history.map((h) => (

                <div
                  key={h.id}
                  className="border-b py-2 text-sm"
                >

                  <p>
                    ₹{h.amount} • {h.payment_mode}
                  </p>

                  <p className="text-gray-500 text-xs">
                    {new Date(h.date).toLocaleDateString()}
                  </p>

                </div>

              ))

            )}

          </div>

        </div>

      )}

    </div>
  );
}