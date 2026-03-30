import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";
import ScannerModal from "./ScannerModal";

export default function DashboardLayout({ me, setMe }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const openScanner = () => setScannerOpen(true);
  const closeScanner = () => setScannerOpen(false);

  // Map routes to dynamic titles and subtitles for the Topbar
  let pageTitle = "";
  let pageSubtitle = "";

  switch (location.pathname) {
    case "/dashboard":
      pageTitle = "Attendance Dashboard";
      pageSubtitle = "View, search, edit, and renew your customers.";
      break;
    case "/billing":
      pageTitle = "Collections & Billing";
      pageSubtitle = "Record daily payments and track collections.";
      break;
    case "/renew-plan":
      pageTitle = "Plan Renewal";
      pageSubtitle = "Extend customer subscriptions and plans.";
      break;
    case "/register":
      pageTitle = "Customer Registration";
      pageSubtitle = "Register new mess users and capture details.";
      break;
    case "/reports":
      pageTitle = "Reports";
      pageSubtitle = "Analyze mess attendance and meal counts.";
      break;
    default:
      pageTitle = "Dashboard";
      pageSubtitle = "Welcome back!";
  }

  if (!me) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      
      {/* Sidebar — always rendered, visibility controlled via props + CSS */}
      <Sidebar
        me={me}
        setMe={setMe}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onScanOpen={openScanner}
      />

      {/* Main Content Area — full width on mobile, offset on desktop */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        
        <Topbar
          title={pageTitle}
          subtitle={pageSubtitle}
          onMenuToggle={() => setSidebarOpen(true)}
          onScanOpen={openScanner}
        />

        {/* Page Content Slot — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onScanOpen={openScanner} />

      {/* Global Scanner Modal */}
      <ScannerModal 
        isOpen={scannerOpen} 
        onClose={closeScanner} 
        onScanSuccess={() => {
            // Optional: refresh data on any specific page
            if (location.pathname === "/dashboard") window.location.reload();
        }}
      />
    </div>
  );
}
