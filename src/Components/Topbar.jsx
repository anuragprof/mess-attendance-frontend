import { Link } from "react-router-dom";

export default function Topbar() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-10 flex items-center justify-between px-8 shadow-sm">
      
      {/* Left side: Spacer */}
      <div className="flex-1"></div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        
        <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-6 w-px bg-zinc-200 mx-1"></div>

        <Link
          to="/register"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          <span>➕</span> Add Customer
        </Link>
      </div>
    </header>
  );
}
