import { Link, useLocation } from "react-router-dom";
import { logoutVendor } from "../features/auth/api";
import { Users, CreditCard, LogOut, Search, Plus, Bell } from "lucide-react";

export function Sidebar({ me, setMe }) {
  const { pathname } = useLocation();

  const handleLogout = async () => {
    try {
      await logoutVendor();
      if (setMe) setMe(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { label: "Customers", path: "/admin", icon: Users },
    { label: "Billing", path: "/billing", icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-zinc-50 border-r border-zinc-200 flex flex-col h-screen p-4 flex-shrink-0">
      {/* Brand */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Happy Foods</h1>
        <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="mt-auto border-t border-zinc-200 pt-4 space-y-4">
        {me && (
          <div className="px-2">
            <p className="text-sm font-semibold text-zinc-800">{me.name}</p>
            <p className="text-xs text-zinc-500 truncate">{me.email || "Vendor"}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-red-600 hover:bg-red-50 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
