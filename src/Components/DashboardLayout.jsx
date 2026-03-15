import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ me, setMe }) {
  const location = useLocation();

  // Map routes to dynamic titles and subtitles for the Topbar
  let pageTitle = "";
  let pageSubtitle = "";

  switch (location.pathname) {
    case "/admin":
      pageTitle = "Manage Customers";
      pageSubtitle = "View, search, edit, and renew your customers.";
      break;
    case "/billing":
      pageTitle = "Billing & Payments";
      pageSubtitle = "Manage transactions, records, and revenue tracking.";
      break;
    case "/register":
      pageTitle = "Customer Registration";
      pageSubtitle = "Register new mess users and capture details.";
      break;
    default:
      pageTitle = "Dashboard";
      pageSubtitle = "Welcome back!";
  }

  if (!me) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      
      {/* Sidebar fixed on the left */}
      <Sidebar me={me} setMe={setMe} />

      {/* Main Content Area starts to the right of the 64 (16rem) wide sidebar */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        
        <Topbar title={pageTitle} subtitle={pageSubtitle} />

        {/* Page Content Slot */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
