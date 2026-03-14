import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export default function DashboardLayout({ children, me, setMe }) {
  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden text-zinc-900 font-sans">
      <Sidebar me={me} setMe={setMe} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Topbar />
        
        {/* Main Scrolling Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {/* The Floating Card Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 min-h-[calc(100vh-8rem)] p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
