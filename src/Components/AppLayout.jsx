export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 bg-fixed h-full w-full">
      <div className="w-full max-w-6xl bg-slate-50 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.4)] p-8 my-8 relative z-10">
        {children}
      </div>
      
      {/* Decorative geometric lines */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <svg className="absolute left-0 top-0 h-full w-full" width="100%" height="100%">
          <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-500" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
        </svg>
      </div>
    </div>
  );
}
