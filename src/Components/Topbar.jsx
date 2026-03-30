import { Menu, ScanLine } from "lucide-react";

export default function Topbar({ title, subtitle, onMenuToggle, onScanOpen }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8 shadow-sm">
      
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex flex-col justify-center min-w-0">
          {title && <h1 className="text-lg lg:text-xl font-bold tracking-tight text-gray-900 leading-tight truncate">{title}</h1>}
          {subtitle && <p className="text-xs text-zinc-500 leading-none mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        
        <button 
          onClick={onScanOpen}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          <ScanLine size={18} />
          <span className="hidden sm:inline">Scan QR</span>
        </button>

        <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block"></div>
        
        <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block"></div>

        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          <span>➕</span>
          <span className="hidden sm:inline">Add Customer</span>
        </Link>
      </div>
    </header>
  );
}
