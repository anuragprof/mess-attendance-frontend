import { Menu } from "lucide-react";

export default function LibraryTopbar({ me, onMenuToggle, pageLabel }) {
  const initial = (me?.name || "V").charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8">
      {/* Left: hamburger + welcome */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="text-sm text-slate-500">
          Welcome back,{" "}
          <span className="font-semibold text-slate-800">{me?.name || "Admin"}</span>
        </p>
      </div>

      {/* Right: role label + avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-700 leading-tight">
            {me?.name || "Admin"}
          </p>
          <p className="text-[10px] text-slate-400 leading-none">
            {pageLabel || "Library Dashboard"}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200 select-none">
          {initial}
        </div>
      </div>
    </header>
  );
}
