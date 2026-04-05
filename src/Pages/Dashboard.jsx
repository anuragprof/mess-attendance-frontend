import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "@/Lib/axios";
import {
  Users, UserCheck, UserPlus, Armchair, Lock, IndianRupee,
  AlertTriangle, Zap, LayoutGrid, FileText, CreditCard,
  CheckCircle2, Clock, ChevronRight, Wifi,
} from "lucide-react";

import StatCard from "@/Components/ui/StatCard";
import Badge from "@/Components/ui/Badge";
import ActionCard from "@/Components/ui/ActionCard";

// ── helpers ────────────────────────────────────────────────
const TOTAL_SEATS = 6; // adjust as needed

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Main Component ─────────────────────────────────────────
export default function LibraryDashboard() {
  const navigate = useNavigate();

  const [customers, setCustomers]     = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [dailyTrend, setDailyTrend]   = useState(null);
  const [loading, setLoading]         = useState(true);

  // ── data fetching ──────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetchCustomers(),
      fetchExpiringSoon(),
      fetchDailyTrend(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/customers/", { withCredentials: true });
      setCustomers(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
    } catch {
      toast.error("Failed to load customers");
    }
  };

  const fetchExpiringSoon = async () => {
    try {
      const res = await axios.get("/analytics/expiring-soon", { withCredentials: true });
      setExpiringSoon(Array.isArray(res.data) ? res.data : []);
    } catch {
      console.error("expiring-soon fetch failed");
    }
  };

  const fetchDailyTrend = async () => {
    try {
      const res = await axios.get("/analytics/daily-trend", { withCredentials: true });
      setDailyTrend(res.data);
    } catch {
      console.error("daily-trend fetch failed");
    }
  };

  // ── derived stats ──────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalMembers     = customers.length;
  const permanentMembers = customers.filter(
    (c) => c.days_left > 0 || (c.subscription_expiry && new Date(c.subscription_expiry) >= today)
  ).length;
  const guestsToday      = dailyTrend?.today_total ?? 0;
  const occupiedSeats    = permanentMembers;
  const availableSeats   = Math.max(0, TOTAL_SEATS - occupiedSeats);
  const occupiedPct      = TOTAL_SEATS > 0 ? Math.round((occupiedSeats / TOTAL_SEATS) * 100) : 0;

  // Revenue: sum of all total_amount_paid (from customers data; proxy only)
  // Per API, the billing page is the source of truth; here we show today scans
  const monthlyRevenue   = 0; // placeholder — requires a separate billing API
  const pendingDues      = customers.filter(
    (c) => typeof c.days_left === "number" && c.days_left <= 0
  ).length;

  // Recent 5 active members (sorted by expiry desc)
  const recentAdmissions = [...customers]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 5);

  // ── stat cards config ──────────────────────────────────
  const CARDS = [
    {
      icon: <Users size={18} />,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
      title: "Total Members",
      value: totalMembers,
      subtext: `${permanentMembers} active`,
    },
    {
      icon: <UserCheck size={18} />,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      title: "Permanent",
      value: permanentMembers,
      subtext: "members",
    },
    {
      icon: <UserPlus size={18} />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      title: "Guests Today",
      value: guestsToday,
      subtext: "checked in",
    },
    {
      icon: <CheckCircle2 size={18} />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      title: "Available Seats",
      value: availableSeats,
      subtext: `${TOTAL_SEATS} total`,
    },
    {
      icon: <Lock size={18} />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      title: "Occupied",
      value: `${occupiedPct}%`,
      subtext: `${occupiedSeats} of ${TOTAL_SEATS}`,
    },
    {
      icon: <IndianRupee size={18} />,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-500",
      title: "Monthly Revenue",
      value: monthlyRevenue > 0 ? `₹${monthlyRevenue.toLocaleString("en-IN")}` : "—",
      subtext: "this month",
    },
    {
      icon: <AlertTriangle size={18} />,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      title: "Pending Dues",
      value: pendingDues,
      subtext: "unpaid",
    },
  ];

  // ── render ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {CARDS.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>

      {/* ── Middle: Table + Right sidebar ────────────────── */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">

        {/* Left Column */}
        <div className="space-y-5">

          {/* Recent Active Admissions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Users size={16} className="text-indigo-400" />
                Recent Active Admissions
              </div>
              <button
                onClick={() => navigate("/admissions")}
                className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 font-medium transition-colors"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left font-semibold">Member</th>
                    <th className="px-5 py-3 text-left font-semibold">Type</th>
                    <th className="px-5 py-3 text-left font-semibold">Shift</th>
                    <th className="px-5 py-3 text-left font-semibold">Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={4} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                        </td>
                      </tr>
                    ))
                  ) : recentAdmissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">
                        No admissions yet
                      </td>
                    </tr>
                  ) : (
                    recentAdmissions.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => navigate("/admissions")}
                      >
                        {/* Member */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {c.photo_url ? (
                              <img
                                src={c.photo_url}
                                alt={c.full_name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0"
                              style={{ display: c.photo_url ? "none" : "flex" }}
                            >
                              {getInitials(c.full_name)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm leading-tight">
                                {c.full_name}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {c.phone_number}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3">
                          <Badge
                            label={c.days_left > 0 ? "Permanent" : "Expired"}
                            variant={c.days_left > 0 ? "permanent" : "expired"}
                          />
                        </td>

                        {/* Shift */}
                        <td className="px-5 py-3">
                          <Badge label="Full Day" variant="fullday" />
                        </td>

                        {/* Seat */}
                        <td className="px-5 py-3">
                          <span className="text-slate-700 font-semibold text-sm">
                            {c.id ?? "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-4">
              <Zap size={16} className="text-amber-400" />
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ActionCard
                icon={<UserPlus size={20} />}
                label="New Admission"
                onClick={() => navigate("/register")}
                bg="bg-emerald-50"
                iconColor="text-emerald-500"
                textColor="text-emerald-700"
              />
              <ActionCard
                icon={<LayoutGrid size={20} />}
                label="Manage Seats"
                onClick={() => navigate("/seats")}
                bg="bg-indigo-50"
                iconColor="text-indigo-500"
                textColor="text-indigo-700"
              />
              <ActionCard
                icon={<CreditCard size={20} />}
                label="Record Payment"
                onClick={() => navigate("/billing")}
                bg="bg-amber-50"
                iconColor="text-amber-500"
                textColor="text-amber-700"
              />
              <ActionCard
                icon={<FileText size={20} />}
                label="Reports"
                onClick={() => navigate("/reports")}
                bg="bg-violet-50"
                iconColor="text-violet-500"
                textColor="text-violet-700"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">

          {/* Expires Soon */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Clock size={15} className="text-amber-400" />
              <span className="text-sm font-semibold text-slate-700">Expires Soon</span>
            </div>
            <div className="p-4">
              {expiringSoon.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
                  <CheckCircle2 size={28} className="text-emerald-300" />
                  <p className="text-xs text-center">No subscriptions expiring soon</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expiringSoon.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      {p.photo_url ? (
                        <img
                          src={p.photo_url}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                          {getInitials(p.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.days_left === 0 ? (
                            <span className="text-rose-500 font-bold">Expired</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">{p.days_left}d left</span>
                          )}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatDate(p.end_date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Library Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wifi size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Library Status</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="p-5 space-y-4">
              {/* Seat Occupancy Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Seat Occupancy</span>
                  <span className="font-bold text-slate-700">{occupiedSeats} / {TOTAL_SEATS}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${occupiedPct}%` }}
                  />
                </div>
              </div>

              {/* Stats list */}
              <div className="space-y-2.5">
                {[
                  { icon: <CheckCircle2 size={13} className="text-emerald-500" />, label: "Available Seats",   value: availableSeats, color: "text-emerald-600" },
                  { icon: <Users size={13} className="text-indigo-500" />,         label: "Active Members",    value: permanentMembers, color: "text-indigo-600" },
                  { icon: <UserPlus size={13} className="text-amber-500" />,       label: "Guests Checked In", value: guestsToday, color: "text-amber-600" },
                  { icon: <UserCheck size={13} className="text-violet-500" />,     label: "Permanent Members", value: permanentMembers, color: "text-violet-600" },
                  { icon: <AlertTriangle size={13} className="text-rose-500" />,   label: "Pending Dues",      value: pendingDues, color: "text-rose-600" },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      {icon}
                      {label}
                    </div>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
