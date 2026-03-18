import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Card from "../Components/Card";
import { toast } from "sonner";
import axios from "@/Lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Pages/ui/select";
import MealDistributionChart from "../Components/MealDistributionChart";
import DailyTrendChart from "../Components/DailyTrendChart";

export default function Admin() {
const [customers, setCustomers] = useState([]);
const [plans, setPlans] = useState([]);
const [search, setSearch] = useState("");
const [editingCustomer, setEditingCustomer] = useState(null);
const [renewCustomer, setRenewCustomer] = useState(null);
const [openDropdown, setOpenDropdown] = useState(null);
const [previewCustomer, setPreviewCustomer] = useState(null);
const [isUpdating, setIsUpdating] = useState(false);


// Analytics State
const [mealDistribution, setMealDistribution] = useState(null);
const [dailyTrend, setDailyTrend] = useState(null);

// Track mount state to suppress errors during logout/unmount
const mountedRef = useRef(true);

useEffect(() => {
  mountedRef.current = true;
  fetchCustomers();
  fetchPlans();
  fetchMealDistribution();
  fetchDailyTrend();
  return () => { mountedRef.current = false; };
}, []);

const fetchCustomers = async () => {
try {
const res = await axios.get("/customers/", {
withCredentials: true,
});
if (mountedRef.current) setCustomers(res.data);
} catch {
if (mountedRef.current) toast.error("Failed to load customers");
}
};

const fetchPlans = async () => {
try {
const res = await axios.get("/plans/", {
withCredentials: true,
});
if (mountedRef.current) setPlans(res.data);
} catch {
if (mountedRef.current) toast.error("Failed to load plans");
}
};

const fetchMealDistribution = async () => {
  try {
    const res = await axios.get("/analytics/meal-distribution", {
      withCredentials: true,
    });
    // Format for Recharts PieChart expected structure
    const formattedData = [
      { name: "Breakfast", value: res.data.breakfast },
      { name: "Lunch", value: res.data.lunch },
      { name: "Dinner", value: res.data.dinner },
    ].filter(item => item.value > 0); // Only pass segments with values to render cleaner

    // If all are zero, provide a default so chart renders an empty placeholder loop
    if (formattedData.length === 0) {
      formattedData.push({ name: "No Data", value: 1, fill: "#f4f4f5" }); 
    }
    
    setMealDistribution(formattedData);
  } catch (error) {
    console.error("Failed to fetch meal distribution:", error);
  }
};

const fetchDailyTrend = async () => {
  try {
    const res = await axios.get("/analytics/daily-trend", {
      withCredentials: true,
    });
    setDailyTrend(res.data);
  } catch (error) {
    console.error("Failed to fetch daily trend:", error);
  }
};

const deleteCustomer = async (id) => {
try {
await axios.delete(`/customers/${id}`, {
withCredentials: true,
});
toast.success("Customer deleted");
fetchCustomers();
} catch {
toast.error("Delete failed");
}
};

const handleUpdate = async () => {
    if (!editingCustomer) return;
    
    setIsUpdating(true);
    try {
        const original = customers.find(c => c.id === editingCustomer.id);
        const payload = {};
        
        if (editingCustomer.full_name !== original.full_name) payload.full_name = editingCustomer.full_name;
        if (editingCustomer.phone_number !== original.phone_number) payload.phone_number = editingCustomer.phone_number;
        if (editingCustomer.email !== original.email) payload.email = editingCustomer.email;

        // If nothing changed, just close
        if (Object.keys(payload).length === 0) {
            setEditingCustomer(null);
            return;
        }

        await axios.patch(`/customers/${editingCustomer.id}`, payload, {
            withCredentials: true,
        });

        toast.success("Customer updated successfully");
        setEditingCustomer(null);
        fetchCustomers();
    } catch (error) {
        console.error("Update failed:", error);
        toast.error(error.response?.data?.detail || "Update failed");
    } finally {
        setIsUpdating(false);
    }
};

const handleRenew = async () => {
const data = new FormData();
data.append("plan_id", renewCustomer.plan_id);


await axios.post(
  `/customers/${renewCustomer.id}/renew`,
  data,
  { withCredentials: true }
);

toast.success("Plan renewed");
setRenewCustomer(null);
fetchCustomers();

};

const filteredCustomers = Array.from(
    new Map(
      customers
        .filter((c) => {
          const query = search.toLowerCase();
          if (!query) return true;
          return (
            (c.full_name || "").toLowerCase().includes(query) ||
            (c.email || "").toLowerCase().includes(query) ||
            (c.phone_number || "").toLowerCase().includes(query) ||
            String(c.id).includes(query) ||
            `cust-${c.id}`.toLowerCase().includes(query)
          );
        })
        .map(c => [c.id, c]) // Deduplicate by ID just in case
    ).values()
  ).sort((a, b) => {
    if (!search) return b.id - a.id;
    
    const query = search.toLowerCase();
    
    const getScore = (c) => {
      let score = 0;
      const name = (c.full_name || "").toLowerCase();
      const phone = (c.phone_number || "").toLowerCase();
      const cid = `cust-${c.id}`.toLowerCase();
      
      // Highest priority: Exact matches
      if (name === query || phone === query || cid === query || String(c.id) === query) {
        score = 1000;
      } 
      // Medium priority: Starts with query
      else if (name.startsWith(query) || phone.startsWith(query) || cid.startsWith(query)) {
        score = 500;
      }
      // Lower priority: Includes query
      else {
        score = 100;
      }

      // Relevance penalty: Longer names that don't match as closely should be lower
      // This ensures "test3" (score ~995) beats "test30" (score ~994)
      score -= name.length; 

      return score;
    };

    const scoreA = getScore(a);
    const scoreB = getScore(b);

    if (scoreA !== scoreB) return scoreB - scoreA;
    return b.id - a.id; // Tie-breaker: Most recent first
  });

const formatDate = (dateString) => {
if (!dateString) return "—";
return new Date(dateString).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
});
};

// WHATSAPP FUNCTION
const sendWhatsAppMessage = (phone) => {
const message = `
Hello 👋

Your Mess Registration is successful.

Please visit the mess counter to scan your QR and mark attendance.

Thank you.
`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
window.open(whatsappUrl, "_blank");
};

  return (
  <div className="space-y-2">
    
    {/* Floating Card Content */}
    <div className="gradient-card mt-1">
      <div className="p-3">
        <input
          type="text"
          placeholder="Search by ID, name, or email..."
          className="bg-zinc-50 border border-zinc-200 p-2 mb-2 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm placeholder:text-zinc-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] lg:max-h-[240px]">
          <table className="w-full">
            <thead className="bg-zinc-50 border-y border-zinc-200 text-xs uppercase text-zinc-500 tracking-wider">
          <tr>
            <th className="p-1 text-left">Photo</th>
            <th className="p-1 text-left min-w-[150px]">Name</th>
            <th className="p-1 text-left">Phone</th>
            <th className="p-1 text-left">Meal Plan</th>
            {/* <th className="p-1 text-left">Email</th> */}
            <th className="p-1 text-left">QR</th>
            <th className="p-1 text-left">Expiry</th>
            <th className="p-1 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {(search ? filteredCustomers : filteredCustomers.slice(0, 5)).map((customer) => (
            <tr
              key={customer.id}
              className={`border-b border-x last:border-b transition-colors relative ${
                customer.days_left <= 0 
                  ? "bg-red-50 border-red-200" 
                  : "bg-white border-green-300 shadow-sm"
              }`}
            >
              <td className="p-1">
                <img
                  src={customer.photo_url}
                  alt="customer"
                  onClick={() => setPreviewCustomer(customer)}
                  className="w-8 h-8 object-cover rounded-xl border shadow-sm cursor-pointer hover:scale-105 transition"
                />
              </td>

              <td className="p-1">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 leading-tight text-sm">{customer.full_name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">CUST-{customer.id}</span>
                </div>
              </td>

              <td className="p-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{customer.phone_number}</span>

                  <button
                    onClick={() => sendWhatsAppMessage(customer.phone_number)}
                    className="bg-green-500 text-white px-1.5 py-0.5 rounded text-[10px] hover:bg-green-600"
                  >
                    WhatsApp
                  </button>
                </div>
              </td>

              <td className="p-1">
                <span className="text-sm font-medium text-zinc-700">
                  {customer.meal_plan || "N/A"}
                </span>
              </td>

              <td className="p-1">
                <img
                  src={customer.qr_url}
                  alt="qr"
                  onClick={() => setPreviewCustomer(customer)}
                  className="w-10 h-10 border rounded-md cursor-pointer hover:scale-105 transition"
                />
              </td>

              <td className="p-1">
                <div className="flex flex-col">
                  <span className="text-sm">{formatDate(customer.subscription_expiry)}</span>
                  {typeof customer.days_left === "number" ? (
                    <span
                      className={`text-xs font-semibold ${
                        customer.days_left <= 0
                          ? "text-red-700"
                          : customer.days_left <= 5
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {customer.days_left > 0
                        ? `${customer.days_left} days`
                        : "Expired"}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-zinc-500">—</span>
                  )}
                </div>
              </td>

              <td className="p-1 relative">
                <div className="relative inline-block text-left">
                  <button
                    className="bg-gray-600 text-white px-2 py-0.5 rounded text-xs"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === customer.id ? null : customer.id
                      )
                    }
                  >
                    ⋮
                  </button>

                  {openDropdown === customer.id && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-20">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setEditingCustomer(customer);
                          setOpenDropdown(null);
                        }}
                      >
                        ✏️ Edit Information
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setRenewCustomer(customer);
                          setOpenDropdown(null);
                        }}
                      >
                        🔄 Renew Plan
                      </button>

                      <button
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          deleteCustomer(customer.id);
                          setOpenDropdown(null);
                        }}
                      >
                        ❌ Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {filteredCustomers.length === 0 && (
            <tr>
              <td colSpan="7" className="p-4 text-center text-zinc-500">
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>

{/* Analytics Section */}
<div className="mt-2 text-zinc-800">
  <div className="mb-1 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-bold tracking-tight">Analytics</h2>
      <p className="text-[10px] text-zinc-500">Meal distribution and daily scan trend</p>
    </div>
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <div className="h-[240px]">
      {mealDistribution ? (
        <MealDistributionChart data={mealDistribution} />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-zinc-100">
          <p className="text-zinc-500 animate-pulse">Loading meal distribution...</p>
        </div>
      )}
    </div>
    
    <div className="h-[240px]">
      {dailyTrend ? (
        <DailyTrendChart 
          data={dailyTrend.trend} 
          todayTotal={dailyTrend.today_total} 
          yesterdayTotal={dailyTrend.yesterday_total} 
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-zinc-100">
          <p className="text-zinc-500 animate-pulse">Loading daily trend...</p>
        </div>
      )}
    </div>
  </div>
</div>

{/* EDIT MODAL */}
  {editingCustomer && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 border border-zinc-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-zinc-800">Edit Information</h3>
          <span className="text-xs font-mono text-zinc-400">ID: {editingCustomer.id}</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Full Name</label>
            <input
              className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="Full Name"
              value={editingCustomer.full_name || ""}
              onChange={(e) =>
                setEditingCustomer({
                  ...editingCustomer,
                  full_name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Phone Number</label>
            <input
              className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="Phone Number"
              value={editingCustomer.phone_number || ""}
              onChange={(e) =>
                setEditingCustomer({
                  ...editingCustomer,
                  phone_number: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Email Address</label>
            <input
              className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="Email"
              value={editingCustomer.email || ""}
              onChange={(e) =>
                setEditingCustomer({
                  ...editingCustomer,
                  email: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            className={`flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 ${
              isUpdating ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>

          <button
            className="flex-1 bg-zinc-100 text-zinc-600 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all"
            onClick={() => setEditingCustomer(null)}
            disabled={isUpdating}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* RENEW MODAL */}
  {renewCustomer && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Renew Plan</h3>

        <Select
          value={String(renewCustomer.plan_id || "")}
          onValueChange={(v) =>
            setRenewCustomer({
              ...renewCustomer,
              plan_id: v,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Plan" />
          </SelectTrigger>

          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={String(plan.id)}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded flex-1"
            onClick={handleRenew}
          >
            Renew
          </button>

          <button
            className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
            onClick={() => setRenewCustomer(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* PREVIEW MODAL */}
  {previewCustomer && (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={() => setPreviewCustomer(null)}
    >
      <div
        className="bg-white p-6 rounded-2xl w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold">
            {previewCustomer.full_name}
          </h3>

          <span className="text-zinc-600 text-sm bg-zinc-100 px-3 py-1 rounded-lg">
            📞 {previewCustomer.phone_number}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center">
            <p className="font-medium mb-2">Photo</p>
            <img
              src={previewCustomer.photo_url}
              alt="customer"
              className="w-64 h-64 object-cover rounded-xl border shadow-lg"
            />
          </div>

          <div className="flex flex-col items-center">
            <p className="font-medium mb-2">QR Code</p>
            <img
              src={previewCustomer.qr_url}
              alt="qr"
              className="w-64 h-64 border rounded-xl shadow-lg"
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            className="bg-gray-600 text-white px-6 py-2 rounded-lg"
            onClick={() => setPreviewCustomer(null)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Card title="Issue QR / Student">Coming soon…</Card>
    <Card title="Meals & Slots">Coming soon…</Card>
  </div>
</div>


);
}
