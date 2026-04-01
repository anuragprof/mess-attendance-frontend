import { useEffect, useState } from "react";
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
import { Search, UserPlus, FileText, Trash2, Edit3, RotateCw, MoreVertical, Phone, MessageCircle, Sun, Moon, Cloud, Sparkles } from "lucide-react";

export default function Admin() {
const [customers, setCustomers] = useState([]);
const [plans, setPlans] = useState([]);
const [search, setSearch] = useState("");
const [editingCustomer, setEditingCustomer] = useState(null);
const [renewCustomer, setRenewCustomer] = useState(null);
const [openDropdown, setOpenDropdown] = useState(null);
const [previewCustomer, setPreviewCustomer] = useState(null);

// Analytics State
const [mealDistribution, setMealDistribution] = useState(null);
const [dailyTrend, setDailyTrend] = useState(null);

useEffect(() => {
  fetchCustomers();
  fetchPlans();
  fetchMealDistribution();
  fetchDailyTrend();
}, []);

const fetchCustomers = async () => {
try {
const res = await axios.get("/customers/", {
withCredentials: true,
});
// Guard: always store an array — API may return object or paginated shape
setCustomers(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
} catch {
toast.error("Failed to load customers");
}
};

const fetchPlans = async () => {
try {
const res = await axios.get("/plans/", {
withCredentials: true,
});
// Guard: always store an array
setPlans(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
} catch {
toast.error("Failed to load plans");
}
};

const fetchMealDistribution = async () => {
  try {
    const res = await axios.get("/analytics/meal-distribution", {
      withCredentials: true,
    });
    // Format for Recharts PieChart expected structure
    const formattedData = [
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
const data = new FormData();
data.append("full_name", editingCustomer.full_name);
data.append("phone_number", editingCustomer.phone_number);
data.append("email", editingCustomer.email);
data.append("plan_id", editingCustomer.plan_id);


await axios.put(`/customers/${editingCustomer.id}`, data, {
  withCredentials: true,
});

toast.success("Customer updated");
setEditingCustomer(null);
fetchCustomers();


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
        <div className="search-wrapper mb-3 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-all" />
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            className="premium-input w-full pl-11 !h-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[240px]">
          <table className="w-full">
            <thead className="bg-zinc-50 border-y border-zinc-200 text-[10px] uppercase text-zinc-500 tracking-[0.2em] font-black">
          <tr>
            <th className="p-3 text-left w-[8%] font-black">Photo</th>
            <th className="p-3 text-left w-[24%] font-black">Client Name</th>
            <th className="p-3 text-left w-[24%] font-black">Contact / WhatsApp</th>
            <th className="p-3 text-left w-[12%] font-black uppercase tracking-widest text-center">QR Code</th>
            <th className="p-3 text-left w-[24%] font-black uppercase tracking-widest">Expiration</th>
            <th className="p-3 text-center w-[8%] font-black">Actions</th>
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
                  className="w-8 h-8 object-cover rounded-full border border-zinc-100 shadow-sm cursor-pointer hover:scale-105 transition"
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
                    className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all font-black text-[9px] uppercase tracking-widest shadow-sm shadow-emerald-500/5"
                  >
                    WhatsApp
                  </button>
                </div>
              </td>

              {/* <td className="p-1">{customer.email}</td> */}

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
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === customer.id ? null : customer.id
                      )
                    }
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openDropdown === customer.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-2xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        onClick={() => {
                          setEditingCustomer(customer);
                          setOpenDropdown(null);
                        }}
                      >
                        <Edit3 size={14} /> Edit Customer
                      </button>

                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        onClick={() => {
                          setRenewCustomer(customer);
                          setOpenDropdown(null);
                        }}
                      >
                        <RotateCw size={14} /> Renew Plan
                      </button>

                      <div className="h-px bg-zinc-100 my-1" />

                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        onClick={() => {
                          deleteCustomer(customer.id);
                          setOpenDropdown(null);
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {filteredCustomers.length === 0 && (
            <tr>
              <td colSpan="6" className="p-4 text-center text-zinc-500">
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
<div className="mt-3 text-zinc-800">
  <div className="mb-2">
    <h2 className="text-lg font-bold tracking-tight">Analytics</h2>
    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Attendance Breakdown</p>
  </div>
  
  <div className="grid md:grid-cols-2 gap-3">
    {/* Distribution Chart */}
    <div className="h-[240px]">
      {mealDistribution ? (
        <MealDistributionChart data={mealDistribution} />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-zinc-100">
          <p className="text-zinc-500 animate-pulse">Loading distribution...</p>
        </div>
      )}
    </div>

    {/* Daily Count Card */}
    <div className="h-[240px]">
      {dailyTrend ? (
        <div className="gradient-card p-4 h-full flex flex-col justify-between border border-zinc-100 overflow-hidden">
          <h3 className="text-base font-black text-zinc-800 mb-1 lg:mb-2 uppercase tracking-tight">Today's Consumption</h3>
          <div className="flex-1 flex flex-col items-center justify-center -mt-2 relative">
             {/* Dynamic CSS Scenery Background */}
             <div className="absolute inset-0 pointer-events-none transition-all duration-1000 overflow-hidden opacity-[0.12]">
                {(() => {
                  const hour = (new Date().getUTCHours() + 5.5) % 24;
                  if (hour >= 5 && hour < 16) {
                    return (
                      <div className="w-full h-full bg-gradient-to-b from-blue-100 to-blue-50/0 flex flex-col items-center justify-center">
                        {/* Sun */}
                        <div className="w-24 h-24 bg-amber-200 rounded-full blur-xl absolute top-1/2 left-1/2 -translate-x-[110%] -translate-y-1/2 animate-pulse" />
                        <div className="w-16 h-16 bg-amber-400 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.5)] absolute top-1/2 left-1/2 -translate-x-[110%] -translate-y-1/2" />
                        
                        {/* Hills */}
                        <div className="w-[150%] h-32 bg-emerald-500/20 rounded-[100%] absolute -bottom-16 left-[-25%]" />
                        <div className="w-[150%] h-24 bg-emerald-600/30 rounded-[100%] absolute -bottom-14 left-[5%]" />
                      </div>
                    );
                  } else {
                    return (
                      <div className="w-full h-full bg-gradient-to-b from-indigo-950 to-indigo-900/0 flex flex-col items-center justify-center">
                         {/* Moon */}
                         <div className="w-16 h-16 bg-zinc-100 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.2)] absolute top-1/2 left-1/2 -translate-x-[110%] -translate-y-1/2" />
                         <div className="w-12 h-12 bg-indigo-950 rounded-full absolute top-1/2 left-1/2 -translate-x-[95%] -translate-y-2/3" />
                         
                         {/* Stars */}
                         {[1,2,3,4,5].map(i => (
                           <div key={i} 
                             className={`w-0.5 h-0.5 bg-white rounded-full absolute animate-pulse`} 
                             style={{ 
                               top: `${Math.random() * 60}%`, 
                               left: `${Math.random() * 90}%`,
                               animationDelay: `${i * 0.5}s`
                             }} 
                           />
                         ))}

                         {/* Night Hills */}
                         <div className="w-[150%] h-32 bg-zinc-950/40 rounded-[100%] absolute -bottom-16 left-[-25%]" />
                         <div className="w-[150%] h-24 bg-zinc-950/60 rounded-[100%] absolute -bottom-14 left-[5%]" />
                      </div>
                    );
                  }
                })()}
             </div>
             
             <div className="relative z-10 text-6xl font-black text-slate-800 tracking-tighter drop-shadow-sm animate-in fade-in zoom-in-95 duration-700">
                {dailyTrend.today_total}
             </div>
             <p className="relative z-10 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 opacity-80">Total Scans Today</p>
          </div>
          
          <div className="border-t border-zinc-100 pt-3 flex items-center justify-between">
             <div className="text-center flex-1 border-r border-zinc-100 flex flex-col items-center justify-center py-1">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Lunch</p>
                <div className="flex items-center gap-2">
                   <Sun size={18} className="text-blue-500 animate-[spin_8s_linear_infinite]" />
                   <p className="text-2xl font-black text-blue-600 leading-none">
                      {mealDistribution?.find(m => m.name === "Lunch")?.value || 0}
                   </p>
                </div>
             </div>
             <div className="text-center flex-1 flex flex-col items-center justify-center py-1">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Dinner</p>
                <div className="flex items-center gap-2">
                   <Moon size={16} className="text-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
                   <p className="text-2xl font-black text-emerald-600 leading-none">
                      {mealDistribution?.find(m => m.name === "Dinner")?.value || 0}
                   </p>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-zinc-100">
          <p className="text-zinc-500 animate-pulse">Loading stats...</p>
        </div>
      )}
    </div>
  </div>
</div>

{/* EDIT MODAL */}
  {editingCustomer && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Edit Information</h3>

        <input
          className="border p-2 w-full rounded"
          value={editingCustomer.full_name}
          onChange={(e) =>
            setEditingCustomer({
              ...editingCustomer,
              full_name: e.target.value,
            })
          }
        />

        <input
          className="border p-2 w-full rounded"
          value={editingCustomer.phone_number}
          onChange={(e) =>
            setEditingCustomer({
              ...editingCustomer,
              phone_number: e.target.value,
            })
          }
        />

        <input
          className="border p-2 w-full rounded"
          value={editingCustomer.email}
          onChange={(e) =>
            setEditingCustomer({
              ...editingCustomer,
              email: e.target.value,
            })
          }
        />

        <Select
          value={String(editingCustomer.plan_id || "")}
          onValueChange={(v) =>
            setEditingCustomer({
              ...editingCustomer,
              plan_id: Number(v),
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
            onClick={handleUpdate}
          >
            Save
          </button>

          <button
            className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
            onClick={() => setEditingCustomer(null)}
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
              className="w-64 h-64 object-cover rounded-full border shadow-lg"
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

  <div className="grid md:grid-cols-2 gap-4">
    <Card title="Issue QR / Student">Coming soon…</Card>
    <Card title="Meals & Slots">Coming soon…</Card>
  </div>
</div>


);
}
