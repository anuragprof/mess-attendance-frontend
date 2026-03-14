import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ me, setMe }) {
  if (!me) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      
      {/* Sidebar fixed on the left */}
      <Sidebar me={me} setMe={setMe} />

      {/* Main Content Area starts to the right of the 64 (16rem) wide sidebar */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        
        <Topbar />

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
