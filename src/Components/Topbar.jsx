import { Link } from "react-router-dom";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-10 flex items-center justify-between px-8 shadow-sm">
      
      {/* Left side: Page Title */}
      <div className="flex-1 flex flex-col justify-center">
        {title && <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-zinc-500 leading-none mt-0.5">{subtitle}</p>}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        
        <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-6 w-px bg-zinc-200 mx-1"></div>

        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          <span>➕</span> Add Customer
        </Link>
      </div>
    </header>
  );
}
