import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
import { Search, UserPlus, FileText, Trash2, Edit3, RotateCw, MoreVertical, Phone, MessageCircle, Sun, Moon, Cloud, Sparkles, Clock, AlertCircle } from "lucide-react";

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
const [expiringSoon, setExpiringSoon] = useState([]);

useEffect(() => {
  fetchCustomers();
  fetchPlans();
  fetchMealDistribution();
  fetchDailyTrend();
  fetchExpiringSoon();
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

const fetchExpiringSoon = async () => {
  try {
    const res = await axios.get("/analytics/expiring-soon", {
      withCredentials: true,
    });
    setExpiringSoon(Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    console.error("Failed to fetch expiring soon:", error);
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
  try {
    const payload = {
      full_name: editingCustomer.full_name,
      phone_number: editingCustomer.phone_number,
      email: editingCustomer.email,
    };

    await axios.patch(`/customers/${editingCustomer.id}`, payload, {
      withCredentials: true,
    });

    toast.success("Customer updated");
    setEditingCustomer(null);
    fetchCustomers();
  } catch (err) {
    toast.error(err.response?.data?.detail || "Update failed");
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
                  src={customer.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`}
                  alt="customer"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`;
                  }}
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
                <div
                  className="flex items-center justify-center cursor-pointer hover:scale-105 transition"
                  onClick={() => setPreviewCustomer(customer)}
                >
                  {customer.qr_value ? (
                    <QRCodeSVG
                      value={customer.qr_value}
                      size={48}
                      level="H"
                      className="rounded"
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-400">N/A</span>
                  )}
                </div>
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
    {/* Distribution Chart (Restored) */}
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
             <div className="absolute inset-0 pointer-events-none transition-all duration-1000 overflow-hidden opacity-[0.18]">
                {(() => {
                  const hour = (new Date().getHours()) % 24; // Use local hour for realistic scenery
                  if (hour >= 6 && hour < 18) {
                    return (
                      <div className="w-full h-full bg-gradient-to-b from-sky-400/30 via-blue-100/20 to-transparent flex flex-col items-center justify-center">
                        {/* Sun */}
                        <div className="w-24 h-24 bg-amber-200 rounded-full blur-2xl absolute top-1/2 left-1/2 -translate-x-[120%] -translate-y-1/2 animate-pulse opacity-60" />
                        <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.6)] absolute top-1/2 left-1/2 -translate-x-[120%] -translate-y-1/2" />
                        
                        {/* Day Hills */}
                        <div className="w-[160%] h-36 bg-gradient-to-t from-emerald-600/30 to-emerald-500/10 rounded-[100%] absolute -bottom-16 left-[-30%]" />
                        <div className="w-[160%] h-28 bg-gradient-to-t from-green-600/40 to-green-500/10 rounded-[100%] absolute -bottom-12 left-[0%]" />
                      </div>
                    );
                  } else {
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-950 flex flex-col items-center justify-center">
                         {/* Moon */}
                         <div className="w-16 h-16 bg-blue-50 rounded-full shadow-[0_0_80px_rgba(59,130,246,0.3)] absolute top-1/2 left-1/2 -translate-x-[120%] -translate-y-1/2" />
                         <div className="w-12 h-12 bg-indigo-950 rounded-full absolute top-1/2 left-1/2 -translate-x-[105%] -translate-y-2/3" />
                         
                         {/* Sparkling Stars */}
                         {[1,2,3,4,5,6,7,8].map(i => (
                           <div key={i} 
                             className={`w-0.5 h-0.5 bg-blue-100 rounded-full absolute animate-pulse`} 
                             style={{ 
                               top: `${10 + Math.random() * 60}%`, 
                               left: `${10 + Math.random() * 80}%`,
                               animationDelay: `${i * 0.4}s`,
                               opacity: 0.4 + Math.random() * 0.6
                             }} 
                           />
                         ))}

                         {/* Night Hills (Richer Blues) */}
                         <div className="w-[160%] h-36 bg-indigo-900/40 rounded-[100%] absolute -bottom-16 left-[-30%] blur-[1px]" />
                         <div className="w-[160%] h-28 bg-blue-900/50 rounded-[100%] absolute -bottom-12 left-[0%] blur-[1px]" />
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
            {previewCustomer.qr_value ? (
              <div className="p-3 border rounded-xl shadow-lg bg-white">
                <QRCodeSVG
                  value={previewCustomer.qr_value}
                  size={240}
                  level="H"
                />
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center border rounded-xl shadow-lg bg-zinc-50 text-zinc-400 text-sm">
                No QR Data
              </div>
            )}
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
    {/* Expiring Soon Card */}
    <div className="min-h-[200px]">
      <div className="gradient-card p-4 h-full flex flex-col border border-zinc-100 overflow-hidden shadow-sm shadow-blue-500/5">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-50 pb-2">
          <h3 className="text-sm font-black text-zinc-800 uppercase tracking-tight flex items-center gap-2">
             <AlertCircle size={14} className="text-rose-500" />
             Renewal Alerts {"(< 4d)"}
          </h3>
          <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-black border border-rose-100 uppercase tracking-widest">
             Action Required
          </span>
        </div>
        
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-[160px]">
          {expiringSoon.length > 0 ? (
             expiringSoon.map((person) => (
               <div 
                 key={person.id} 
                 className="flex items-center gap-3 p-2 rounded-xl bg-white/50 border border-zinc-50 hover:border-blue-100 hover:bg-white transition-all group"
               >
                 <div className="relative">
                   <img 
                     src={person.photo_url} 
                     alt={person.name} 
                     className="w-10 h-10 rounded-full object-cover border border-zinc-100 shadow-sm"
                   />
                   <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${person.days_left === 0 ? 'bg-rose-500' : 'bg-amber-500'}`}>
                     <Clock size={8} className="text-white" />
                   </div>
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-zinc-900 truncate">{person.name}</p>
                   <p className="text-[9px] text-zinc-400 font-mono">CUST-{person.id}</p>
                 </div>
                 
                 <div className="text-right">
                   <p className={`text-[10px] font-black ${person.days_left === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                     {person.days_left === 0 ? 'Expired' : `${person.days_left} Days`}
                   </p>
                   <p className="text-[8px] text-zinc-400 uppercase tracking-tighter">
                    Ends {new Date(person.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                   </p>
                 </div>
               </div>
             ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400/50 py-4">
               <Sparkles className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-widest">No Urgent Renewals</p>
            </div>
          )}
        </div>
      </div>
    </div>

    <Card title="Meals & Slots">Coming soon…</Card>
  </div>
</div>


);
}
