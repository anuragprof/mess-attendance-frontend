import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "@/Lib/axios";
import {
  Users, UserCheck, Banknote, AlertCircle,
  Clock, ArrowUpRight, TrendingUp, UserPlus,
  BarChart3, RefreshCw, Zap, Wallet, Info, UtensilsCrossed, Loader2,
} from "lucide-react";

import Badge from "@/Components/ui/Badge";
import ActionCard from "@/Components/ui/ActionCard";

// ── helpers ────────────────────────────────────────────────
function getInitials(name = "") {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w?.[0] || "").join("").toUpperCase();
}

function isExpired(customer) {
  if (typeof customer.days_left === "number") return customer.days_left <= 0;
  if (customer.subscription_expiry) return new Date(customer.subscription_expiry) < new Date();
  return false;
}

function getShiftLabel(mealsPerDay) {
  if (mealsPerDay === 2) return "Full Day";
  if (mealsPerDay === 1) return "Half Day";
  return "—";
}

// ── Component ──────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const [customers, setCustomers]             = useState([]);
  const [dailyTrend, setDailyTrend]           = useState(null);
  const [dashStats, setDashStats]             = useState(null);
  const [expiringSoon, setExpiringSoon]        = useState([]);
  const [loading, setLoading]                  = useState(true);
  const [expiringLoading, setExpiringLoading]  = useState(true);
  const [statsLoading, setStatsLoading]        = useState(true);
  const [errors, setErrors]                    = useState({});

  // ── fetch all data ──────────────────────────────────────
  useEffect(() => {
    fetchCustomers();
    fetchDailyTrend();
    fetchDashStats();
    fetchExpiringSoon();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/customers/", { withCredentials: true });
      setCustomers(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
    } catch (err) {
      console.error("[Dashboard] Failed to load customers:", err);
      setErrors(prev => ({ ...prev, customers: true }));
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyTrend = async () => {
    try {
      const res = await axios.get("/analytics/daily-trend", { withCredentials: true });
      setDailyTrend(res.data);
    } catch (err) {
      console.error("[Dashboard] Failed to load daily trend:", err);
    }
  };

  const fetchDashStats = async () => {
    try {
      const res = await axios.get("/analytics/stats", { withCredentials: true });
      setDashStats(res.data);
    } catch (err) {
      console.error("[Dashboard] Failed to load stats:", err);
      setErrors(prev => ({ ...prev, stats: true }));
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchExpiringSoon = async () => {
    try {
      const res = await axios.get("/analytics/expiring-soon", { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : [];
      setExpiringSoon(data);
    } catch (err) {
      console.error("[Dashboard] Failed to load expiring-soon:", err);
      setErrors(prev => ({ ...prev, expiring: true }));
    } finally {
      setExpiringLoading(false);
    }
  };

  const recordGuestLunch = async () => {
    try {
      await axios.post("/guest-lunch/", {}, { withCredentials: true });
      toast.success("Guest lunch recorded! (₹100)");
      // Refresh stats
      fetchDashStats();
      fetchDailyTrend();
    } catch (err) {
      toast.error("Failed to record guest lunch");
    }
  };


  // ── calculations ────────────────────────────────────────
  const stats = useMemo(() => {
    // Pending dues: use total_amount and total_amount_paid from the customer list
    const duesList = customers
      .map(c => ({
        id: c.id,
        name: c.full_name,
        due: Math.max(0, (c.total_amount || 0) - (c.total_amount_paid || 0)),
      }))
      .filter(d => d.due > 0);

    const totalPendingDuesAmount = duesList.reduce((sum, d) => sum + d.due, 0);
    const sortedDues = [...duesList].sort((a, b) => b.due - a.due);
    const largestDueMember = sortedDues[0] || null;

    return {
      totalMembers: customers.length,
      activeMembers: customers.filter(c => !isExpired(c)).length,
      // Guest lunch comes from the /analytics/stats endpoint (Walk-ins)
      guestLunchCount: dashStats?.guest_lunch_count_today ?? 0,
      // Pending lunch for subscription users
      pendingLunchCount: dashStats?.pending_lunch_count ?? 0,
      // Revenue from subscription totals
      monthlyRevenue: customers.reduce((sum, c) => sum + (c.total_amount || 0), 0),
      // Pending dues
      pendingDuesAmount: totalPendingDuesAmount,
      pendingCount: duesList.length,
      largestDue: largestDueMember,
      // Today stats from daily-trend
      todayTotal: dailyTrend?.today_total ?? 0,
      // Session based pending
      pendingMorning: dashStats?.pending_morning ?? 0,
      pendingEvening: dashStats?.pending_evening ?? 0,
      pendingToday: dashStats?.pending_meals_today ?? 0,
    };

  }, [customers, dashStats, dailyTrend]);

  const recentAdmissions = [...customers]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 3);

  // ── stat cards config ──────────────────────────────────
  const CARDS = [
    {
      title: "TOTAL MEMBERS",
      value: stats.totalMembers,
      subtext: `${stats.activeMembers} active`,
      icon: <Users size={16} />,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      title: "GUEST LUNCH",
      value: statsLoading ? "…" : stats.guestLunchCount,
      subtext: `₹${(stats.guestLunchCount * 100).toLocaleString()} total`,
      icon: <UtensilsCrossed size={16} />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      title: "PENDING MEALS",
      value: statsLoading ? "…" : stats.pendingMorning,
      subtext: `Evening: ${stats.pendingEvening} | Total: ${stats.pendingToday}`,
      icon: <Clock size={16} />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "REVENUE",
      value: `₹${(stats.monthlyRevenue || 0).toLocaleString("en-IN")}`,
      subtext: "this month",
      icon: <Banknote size={16} />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];


  return (
    <div className="space-y-6">
      {/* ── 1. COMPACT STATS GRID ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">

        {CARDS.map((c) => (
          <div
            key={c.title}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md flex flex-col justify-between min-h-[95px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-lg ${c.iconBg} ${c.iconColor}`}>
                {c.icon}
              </div>
            </div>
            <div>
              <p className="text-xl font-black text-slate-800 leading-tight">{c.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{c.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. MAIN CONTENT GRID ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Admissions Table + Quick Actions */}
        <div className="lg:col-span-9 space-y-6">

          {/* Recent Admissions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800">Recent Active Admissions</h3>
              </div>
              <Link
                to="/admissions"
                className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Member</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Days Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center">
                        <Loader2 size={20} className="animate-spin text-indigo-400 mx-auto" />
                      </td>
                    </tr>
                  ) : recentAdmissions.length > 0 ? (
                    recentAdmissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Member */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] overflow-hidden border border-slate-200">
                              {c.photo_url ? (
                                <img
                                  src={c.photo_url}
                                  alt=""
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
                            <div>
                              <p className="font-bold text-slate-800 leading-tight text-xs">
                                {c.full_name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {c.phone_number}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Plan (dynamic from backend) */}
                        <td className="px-5 py-3">
                          <Badge
                            label={c.meal_plan || "No Plan"}
                            variant={c.meal_plan ? "monthly" : "expired"}
                          />
                        </td>

                        {/* Days Left */}
                        <td className="px-5 py-3">
                          {typeof c.days_left === "number" ? (
                            <span
                              className={`text-xs font-bold ${
                                c.days_left <= 3
                                  ? "text-rose-500"
                                  : c.days_left <= 7
                                  ? "text-amber-500"
                                  : "text-emerald-600"
                              }`}
                            >
                              {c.days_left}d
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-10 text-center text-slate-400 text-xs italic"
                      >
                        No admissions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={18} className="text-amber-400" />
              <h3 className="font-bold text-slate-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4">

              <ActionCard
                label="New Admission"
                icon={<UserPlus size={22} />}
                color="emerald"
                onClick={() => navigate("/register")}
              />
              <ActionCard
                label="Renew Plan"
                icon={<RefreshCw size={22} />}
                color="indigo"
                onClick={() => navigate("/renew-plan")}
              />
              <ActionCard
                label="Payments"
                icon={<Wallet size={22} />}
                color="amber"
                onClick={() => navigate("/billing")}
              />
              <ActionCard
                label="Reports"
                icon={<BarChart3 size={22} />}
                color="purple"
                onClick={() => navigate("/reports")}
              />
              <ActionCard
                label="Guest Lunch"
                icon={<UtensilsCrossed size={22} />}
                color="orange"
                onClick={recordGuestLunch}
              />
            </div>

          </div>
        </div>

        {/* ── RIGHT SIDEBAR ──────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Expires Soon */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-amber-500" />
              <h4 className="font-bold text-sm text-slate-800">Expires Soon</h4>
            </div>
            <div className="space-y-3">
              {expiringLoading ? (
                <div className="py-6 flex justify-center">
                  <Loader2 size={18} className="animate-spin text-amber-400" />
                </div>
              ) : errors.expiring ? (
                <div className="py-6 text-center">
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tight">
                    Failed to load
                  </p>
                  <button
                    onClick={fetchExpiringSoon}
                    className="mt-2 text-[10px] font-bold text-indigo-500 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : expiringSoon.length > 0 ? (
                expiringSoon.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px]">
                        {getInitials(c.name || c.full_name)}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 leading-none">
                          {c.name || c.full_name}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1">
                          {c.days_left != null ? `${c.days_left} days left` : "Expiring soon"}
                        </p>
                      </div>
                    </div>
                    {c.days_left != null && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                          c.days_left <= 1
                            ? "bg-rose-50 text-rose-500"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {c.days_left}d
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center mb-2 opacity-40">
                    <UserCheck size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    No subscriptions expiring soon
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Dues */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertCircle size={80} className="text-rose-600" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-rose-500" />
              <h4 className="font-bold text-sm text-slate-800">Pending Dues</h4>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-6 flex justify-center">
                  <Loader2 size={18} className="animate-spin text-rose-400" />
                </div>
              ) : (
                <>
                  {/* Total amount */}
                  <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1.5">
                      Total Unpaid
                    </p>
                    <p className="text-2xl font-black text-rose-600">
                      ₹{(stats.pendingDuesAmount || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] font-semibold text-rose-400 mt-1">
                      {stats.pendingCount} member{stats.pendingCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Largest due member */}
                  {stats.largestDue ? (
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-2.5">
                        <TrendingUp size={12} className="text-rose-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                          Highest Due
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {stats.largestDue.name}
                          </p>
                          <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                            ₹{stats.largestDue.due.toLocaleString("en-IN")} pending
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/billing")}
                          className="p-1 px-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-600 transition-colors"
                        >
                          Collect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 text-center">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center justify-center gap-1">
                        <Zap size={10} /> All Dues Cleared
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Info size={12} className="flex-shrink-0" />
                <p>Billing section has detailed collection reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
