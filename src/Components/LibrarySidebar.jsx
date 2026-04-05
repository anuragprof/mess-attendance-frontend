import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutVendor } from "../features/auth/api";
import {
  LayoutDashboard,
  UserCheck,
  CreditCard,
  RefreshCw,
  BarChart3,
  Scan as ScanIcon,
  LogOut,
  X,
  BookOpen,
  Landmark,
  Receipt,
  FolderOpen,
  PieChart as PieChartIcon,
} from "lucide-react";
import ModuleSwitcher from "./ModuleSwitcher";
import { useModule, MODULES } from "../context/ModuleContext";

const ATTENDANCE_NAV = [
  { to: "/dashboard",   icon: <LayoutDashboard size={18} />, label: "Dashboard"  },
  { to: "/admissions",  icon: <UserCheck size={18} />,       label: "Admissions" },
  { to: "/renew-plan",  icon: <RefreshCw size={18} />,       label: "Renew Plan" },
  { to: "/billing",     icon: <CreditCard size={18} />,      label: "Payments"   },
  { to: "/reports",     icon: <BarChart3 size={18} />,       label: "Reports"    },
  { to: "/scan",        icon: <ScanIcon size={18} />,        label: "Scan QR"    },
];

const ACCOUNTING_NAV = [
  { to: "/accounting/dashboard",  icon: <Landmark size={18} />,      label: "Finance Dash"  },
  { to: "/accounting/expenses",   icon: <Receipt size={18} />,       label: "Expenses"      },
  { to: "/accounting/categories", icon: <FolderOpen size={18} />,     label: "Categories"    },
  { to: "/accounting/reports",    icon: <PieChartIcon size={18} />, label: "Finance Reps"  },
];

function SidebarItem({ to, icon, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-700/40"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function LibrarySidebar({ me, setMe, isOpen, onClose }) {
  const navigate = useNavigate();
  const { activeModule } = useModule();

  const handleLogout = async () => {
    try {
      await logoutVendor();
      setMe(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const navItems = activeModule === MODULES.ATTENDANCE ? ATTENDANCE_NAV : ACCOUNTING_NAV;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-[185px] bg-[#1a1f3c] h-screen fixed top-0 left-0 flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-indigo-700/50">
              <BookOpen size={16} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white tracking-tight">Vachanalay</p>
              <p className="text-[10px] text-slate-400 leading-none">vip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Module Switcher & Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          
          {/* Module Switcher Integration */}
          <div className="px-1 mb-2">
             <ModuleSwitcher />
          </div>

          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">
            Main Menu
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <SidebarItem key={item.to} {...item} onClick={handleNavClick} />
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-white/5 hover:text-rose-400 rounded-xl transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
