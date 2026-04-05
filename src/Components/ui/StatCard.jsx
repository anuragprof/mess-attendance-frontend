/**
 * StatCard — reusable dashboard stat card
 * Props:
 *   icon        — React node (icon element)
 *   iconBg      — tailwind bg class (e.g. "bg-indigo-50")
 *   iconColor   — tailwind text class (e.g. "text-indigo-500")
 *   title       — string
 *   value       — string | number
 *   subtext     — string (optional)
 */
export default function StatCard({ icon, iconBg, iconColor, title, value, subtext }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider leading-none">
        {title}
      </p>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value ?? "—"}</p>
      {subtext && (
        <p className="text-[11px] text-slate-400">{subtext}</p>
      )}
    </div>
  );
}
