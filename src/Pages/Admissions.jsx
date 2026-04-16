import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "@/Lib/axios";
import {
  Search, X, UserPlus, Eye, Edit3, Trash2, RotateCw,
  MoreVertical, LogOut,
} from "lucide-react";

import Badge from "@/Components/ui/Badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/Pages/ui/select";

// ── helpers ────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function isExpired(customer) {
  if (typeof customer.days_left === "number") return customer.days_left <= 0;
  if (customer.subscription_expiry) return new Date(customer.subscription_expiry) < new Date();
  return false;
}

// ── Component ──────────────────────────────────────────────
export default function Admissions() {
  const navigate = useNavigate();

  const [customers, setCustomers]     = useState([]);
  const [plans, setPlans]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("all");   // all | permanent | temporary
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | expired
  const [filterShift, setFilterShift] = useState("all");   // all | fullday | halfday

  // Edit/Delete/Renew state
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [renewCustomer, setRenewCustomer]     = useState(null);
  const [previewCustomer, setPreviewCustomer] = useState(null);
  const [openDropdown, setOpenDropdown]       = useState(null);

  // ── fetch ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchCustomers(), fetchPlans()]).finally(() => setLoading(false));
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/customers/", { withCredentials: true });
      setCustomers(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
    } catch {
      toast.error("Failed to load admissions");
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/plans/", { withCredentials: true });
      setPlans(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
    } catch {
      console.error("plans fetch failed");
    }
  };

  // ── mutations ──────────────────────────────────────────
  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this member permanently?")) return;
    try {
      await axios.delete(`/customers/${id}`, { withCredentials: true });
      toast.success("Member deleted");
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
      await axios.patch(`/customers/${editingCustomer.id}`, payload, { withCredentials: true });
      toast.success("Member updated");
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    }
  };

  const handleRenew = async () => {
    try {
      const data = new FormData();
      data.append("plan_id", renewCustomer.plan_id);
      await axios.post(`/customers/${renewCustomer.id}/renew`, data, { withCredentials: true });
      toast.success("Plan renewed");
      setRenewCustomer(null);
      fetchCustomers();
    } catch {
      toast.error("Renewal failed");
    }
  };

  // ── filtered list ──────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => {
      // search
      if (q && !(
        (c.full_name || "").toLowerCase().includes(q) ||
        (c.phone_number || "").toLowerCase().includes(q)
      )) return false;

      // status filter
      const expired = isExpired(c);
      if (filterStatus === "active"  && expired)  return false;
      if (filterStatus === "expired" && !expired) return false;

      return true;
    });
  }, [customers, search, filterStatus]);

  // ── render ─────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus size={20} className="text-indigo-500" />
          <h1 className="text-xl font-bold text-slate-800">Admissions</h1>
        </div>
        <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
        >
          <UserPlus size={16} />
          New Admission
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1.5 block">
              Search Member
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Member name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-44">
            <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1.5 block">
              Status
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="rounded-xl h-[42px] border-slate-200 text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <button
            onClick={() => {}}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all h-[42px] shadow-md shadow-indigo-200"
          >
            <Search size={15} />
            Search
          </button>

          {/* Clear */}
          {(search || filterStatus !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilterStatus("all"); }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors h-[42px] w-[42px] flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3.5 text-left font-semibold">Member</th>
                <th className="px-5 py-3.5 text-left font-semibold">Subscription</th>
                <th className="px-5 py-3.5 text-left font-semibold">End Date</th>
                <th className="px-5 py-3.5 text-left font-semibold">Fee</th>
                <th className="px-5 py-3.5 text-left font-semibold">Seat</th>
                <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                <th className="px-5 py-3.5 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No members found
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const expired = isExpired(c);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Member */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div
                              className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                              onClick={() => setPreviewCustomer(c)}
                              title="View photo & QR"
                            >
                              {c.photo_url ? (
                                <img
                                  src={c.photo_url}
                                  alt={c.full_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    e.target.parentNode.textContent = getInitials(c.full_name);
                                  }}
                                />
                              ) : (
                                getInitials(c.full_name)
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight text-sm">
                              {c.full_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {c.phone_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Subscription */}
                      <td className="px-5 py-3.5">
                        <Badge label={c.meal_plan || "Monthly"} variant="monthly" />
                      </td>

                      {/* End Date */}
                      <td className="px-5 py-3.5">
                        <div>
                          <p className={`font-medium text-sm ${expired ? "text-rose-600" : "text-slate-700"}`}>
                            {formatDate(c.subscription_expiry)}
                          </p>
                          {expired && (
                            <p className="text-[10px] text-rose-400 flex items-center gap-1">
                              ⊘ Expired
                            </p>
                          )}
                        </div>
                      </td>



                      {/* Fee */}
                      <td className="px-5 py-3.5">
                        <span className="text-slate-700 font-medium text-sm">
                          {c.total_amount ? `₹${c.total_amount.toLocaleString("en-IN")}` : "—"}
                        </span>
                      </td>

                      {/* Seat */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                          {c.id ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge
                          label={expired ? "Expired" : "Active"}
                          variant={expired ? "expired" : "active"}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          {/* View photo/QR */}
                          <button
                            onClick={() => setPreviewCustomer(c)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Photo & QR"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdown(openDropdown === c.id ? null : c.id)
                              }
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={15} />
                            </button>

                            {openDropdown === c.id && (
                              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                                <button
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                  onClick={() => { setEditingCustomer(c); setOpenDropdown(null); }}
                                >
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                  onClick={() => { setRenewCustomer(c); setOpenDropdown(null); }}
                                >
                                  <RotateCw size={14} /> Renew Plan
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                  onClick={() => { deleteCustomer(c.id); setOpenDropdown(null); }}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Exit / Quick action */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EDIT MODAL ──────────────────────────────────────── */}
      {editingCustomer && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingCustomer(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800">Edit Member</h3>

            {[
              { label: "Full Name", key: "full_name" },
              { label: "Phone Number", key: "phone_number" },
              { label: "Email", key: "email" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition"
                  value={editingCustomer[key] || ""}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, [key]: e.target.value })
                  }
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                onClick={handleUpdate}
              >
                Save Changes
              </button>
              <button
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                onClick={() => setEditingCustomer(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RENEW MODAL ──────────────────────────────────────── */}
      {renewCustomer && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setRenewCustomer(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800">Renew Plan</h3>
            <p className="text-sm text-slate-500">
              Renewing plan for <span className="font-semibold text-slate-700">{renewCustomer.full_name}</span>
            </p>

            <Select
              value={String(renewCustomer.plan_id || "")}
              onValueChange={(v) =>
                setRenewCustomer({ ...renewCustomer, plan_id: v })
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                onClick={handleRenew}
              >
                Renew
              </button>
              <button
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                onClick={() => setRenewCustomer(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL (Photo + QR) ────────────────────────── */}
      {previewCustomer && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewCustomer(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{previewCustomer.full_name}</h3>
                <p className="text-sm text-slate-400">📞 {previewCustomer.phone_number}</p>
              </div>
              <button
                onClick={() => setPreviewCustomer(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Member Photo
                </p>
                <img
                  src={
                    previewCustomer.photo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(previewCustomer.full_name)}&size=256&background=6366f1&color=fff`
                  }
                  alt="customer"
                  className="w-52 h-52 object-cover rounded-2xl border border-slate-200 shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(previewCustomer.full_name)}&size=256&background=6366f1&color=fff`;
                  }}
                />
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  QR Code
                </p>
                {previewCustomer.qr_url ? (
                  <img
                    src={previewCustomer.qr_url}
                    alt="qr"
                    className="w-52 h-52 object-contain rounded-2xl border border-slate-200 shadow-lg bg-white p-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/256x256/f1f5f9/94a3b8?text=No+QR";
                    }}
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 text-sm">
                    No QR Data
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
                onClick={() => setPreviewCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
