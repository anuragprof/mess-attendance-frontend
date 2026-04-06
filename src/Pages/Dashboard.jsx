import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "@/Lib/axios";
import {
  Users, UserCheck, Smartphone, Banknote, AlertCircle,
  Clock, ArrowUpRight, TrendingUp, CreditCard, UserPlus,
  BarChart3, RefreshCw, Zap, Wallet, Info,
} from "lucide-react";

import StatCard from "@/Components/ui/StatCard";
import Badge from "@/Components/ui/Badge";
import ActionCard from "@/Components/ui/ActionCard";

// ── helpers ────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function isExpired(customer) {
  if (typeof customer.days_left === "number") return customer.days_left <= 0;
  if (customer.subscription_expiry) return new Date(customer.subscription_expiry) < new Date();
  return false;
}

// ── Component ──────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const [customers, setCustomers]           = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState(null);
  const [expiringSoon, setExpiringSoon]       = useState([]);
  const [loading, setLoading]                 = useState(true);

  // ── fetch ──────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, aRes, eRes] = await Promise.all([
          axios.get("/customers/", { withCredentials: true }),
          axios.get("/analytics/daily-trend", { withCredentials: true }),
          axios.get("/analytics/expiring-soon", { withCredentials: true }),
        ]);

        setCustomers(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.items ?? []));
        setAttendanceTrend(aRes.data);
        setExpiringSoon(eRes.data ?? []);
      } catch (err) {
        toast.error("Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── calculations ────────────────────────────────────────
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

  const stats = useMemo(() => {
    const duesList = customers.map(c => ({
      name: c.full_name,
      due: (c.total_amount || 0) - (c.total_amount_paid || 0)
    }));
    
    const totalPendingDuesAmount = duesList.reduce((sum, d) => sum + (d.due > 0 ? d.due : 0), 0);
    const sortedDues = [...duesList].sort((a, b) => b.due - a.due);
    const largestDueMember = sortedDues[0]?.due > 0 ? sortedDues[0] : null;

    return {
      totalMembers: customers.length,
      activeMembers: customers.filter(c => !isExpired(c)).length,
      permanentMembers: customers.filter(c => c.meal_plan?.toLowerCase().includes("monthly")).length,
      guestsToday: attendanceTrend?.[dayName] || 0, 
      availableSeats: 6 - (attendanceTrend?.[dayName] || 0),
      occupancy: Math.round(((attendanceTrend?.[dayName] || 0) / 6) * 100),
      monthlyRevenue: customers.reduce((sum, c) => sum + (c.total_amount || 0), 0),
      pendingDuesAmount: totalPendingDuesAmount,
      pendingCount: duesList.filter(d => d.due > 0).length,
      largestDue: largestDueMember,
    };
  }, [customers, attendanceTrend, dayName]);

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
      title: "PERMANENT",
      value: stats.permanentMembers,
      subtext: "monthly",
      icon: <UserCheck size={16} />,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      title: "GUESTS TODAY",
      value: stats.guestsToday,
      subtext: "checked in",
      icon: <UserPlus size={16} />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      title: "OCCUPANCY",
      value: `${stats.occupancy}%`,
      subtext: `${stats.guestsToday} of 6`,
      icon: <Smartphone size={16} />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "REVENUE",
      value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}`,
      subtext: "this month",
      icon: <Banknote size={16} />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. COMPACT STATS GRID (5 COLUMNS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {CARDS.map((c) => (
          <div key={c.title} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md h-[95px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.title}</span>
              <div className={`p-1.5 rounded-lg ${c.iconBg} ${c.iconColor}`}>
                {c.icon}
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-800 leading-tight">{c.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{c.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800">Recent Active Admissions</h3>
              </div>
              <Link to="/admissions" className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={12} />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Member</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Shift</th>
                    <th className="px-5 py-3 font-semibold">Seat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentAdmissions.length > 0 ? (
                    recentAdmissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] overflow-hidden border border-slate-200">
                              {c.photo_url ? (
                                <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : getInitials(c.full_name)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight text-xs">{c.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{c.phone_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                           <Badge label={c.meal_plan || "Monthly"} variant="monthly" />
                        </td>
                        <td className="px-5 py-3">
                           <Badge label="FULL DAY" variant="fullday" />
                        </td>
                        <td className="px-5 py-3">
                           <span className="font-bold text-slate-500 text-xs">{c.id}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="py-10 text-center text-slate-400 text-xs italic">No admissions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={18} className="text-amber-400" />
              <h3 className="font-bold text-slate-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
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
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-amber-500" />
              <h4 className="font-bold text-sm text-slate-800">Expires Soon</h4>
            </div>
            <div className="space-y-3">
              {expiringSoon.length > 0 ? (
                expiringSoon.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px]">
                        {getInitials(c.full_name)}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 leading-none">{c.full_name}</p>
                        <p className="text-[9px] text-slate-400 mt-1">{c.days_left} days left</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 flex flex-col items-center justify-center opacity-30 text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-2">
                    <UserCheck size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">No subscriptions expiring soon</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <AlertCircle size={80} className="text-rose-600" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-rose-500" />
              <h4 className="font-bold text-sm text-slate-800">Pending Dues</h4>
            </div>
            
            <div className="space-y-4">
               <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1.5">Total Unpaid Amount</p>
                  <p className="text-2xl font-black text-rose-600">₹{(stats.pendingDuesAmount || 0).toLocaleString()}</p>
               </div>

               {stats.largestDue ? (
                 <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2.5">
                       <TrendingUp size={12} className="text-rose-400" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Largest Single Due</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                       <div>
                          <p className="text-xs font-bold text-slate-800">{stats.largestDue.name}</p>
                          <p className="text-[10px] text-rose-500 font-semibold mt-0.5">₹{stats.largestDue.due.toLocaleString()} pending</p>
                       </div>
                       <button 
                         onClick={() => navigate("/billing")}
                         className="p-1 px-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-600 transition-colors"
                       >
                         Remind
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="py-4 text-center">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center justify-center gap-1">
                      <Zap size={10} /> All Dues Cleared
                    </p>
                 </div>
               )}

               <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Info size={12} className="flex-shrink-0" />
                  <p>Check the billing section for detailed reports on monthly collections.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
