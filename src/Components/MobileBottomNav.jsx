import { Link, useLocation } from "react-router-dom";
import { ScanLine, Users, CreditCard, UserPlus, BarChart3 } from "lucide-react";

const navItems = [
  { to: "/scan", icon: ScanLine, label: "Scan" },
  { to: "/dashboard", icon: Users, label: "Dashboard" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/renew-plan", icon: CreditCard, label: "Renew" },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all duration-200 ${
                active
                  ? "text-blue-600"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
                className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}
              />
              <span
                className={`text-[10px] leading-none font-medium ${
                  active ? "text-blue-600" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
              {active && (
                <span className="absolute bottom-1.5 w-5 h-0.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
