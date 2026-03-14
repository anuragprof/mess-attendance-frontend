import { Search, Bell, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
      
      {/* Search Bar Placeholder */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-100/50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm transition-all outline-none"
            disabled
          />
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4 pl-4">
        <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <Link
          to="/register"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Link>
      </div>
    </header>
  );
}
