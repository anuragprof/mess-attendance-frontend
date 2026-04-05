import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import LibrarySidebar from "./LibrarySidebar";
import LibraryTopbar from "./LibraryTopbar";
import MobileBottomNav from "./MobileBottomNav";

// Map routes to human-readable page labels (shown in topbar right)
function getPageLabel(pathname) {
  if (pathname === "/dashboard")          return "Library Dashboard";
  if (pathname === "/admissions")         return "Admissions";
  if (pathname === "/members")            return "Members";
  if (pathname === "/seats")              return "Seats";
  if (pathname === "/billing")            return "Payments";
  if (pathname === "/discounts")          return "Discounts";
  if (pathname === "/reports")            return "Reports";
  if (pathname === "/register")           return "New Admission";
  if (pathname.startsWith("/accounting")) return "Accounting";
  return "Dashboard";
}

export default function DashboardLayout({ me, setMe }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageLabel = getPageLabel(location.pathname);

  if (!me) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Library Sidebar */}
      <LibrarySidebar
        me={me}
        setMe={setMe}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content — offset from sidebar on desktop */}
      <div className="flex-1 flex flex-col lg:ml-[185px] min-w-0">

        {/* Library Topbar */}
        <LibraryTopbar
          me={me}
          pageLabel={pageLabel}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
