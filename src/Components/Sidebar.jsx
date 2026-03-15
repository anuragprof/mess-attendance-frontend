import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutVendor } from "../features/auth/api";

const SidebarItem = ({ to, icon, label }) => {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default function Sidebar({ me, setMe }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutVendor();
      setMe(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="w-64 gradient-card h-screen fixed top-0 left-0 flex flex-col shadow-sm z-20 rounded-none border-y-0 border-l-0">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent tracking-tight">
          Happy Foods
        </h1>
      </div>

      <div className="px-6 py-4">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Main Menu</p>
        <nav className="flex flex-col gap-1.5">
          <SidebarItem to="/admin" icon="👥" label="Customers" />
          <SidebarItem to="/billing" icon="💳" label="Billing" />
          <SidebarItem to="/scan" icon="📷" label="Scan QR" />
        </nav>
      </div>

      {/* Footer Items */}
      <div className="mt-auto p-4 border-t border-zinc-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
            {me?.name?.charAt(0) || "V"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-zinc-900 truncate">{me?.name || "Vendor"}</span>
            <span className="text-xs text-zinc-500">Admin Account</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 text-left font-medium"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>

    </aside>
  );
}
