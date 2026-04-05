/**
 * ActionCard — large quick-action button card
 * Props:
 *   icon      — React node
 *   label     — string
 *   onClick   — function
 *   bg        — tailwind bg class (e.g. "bg-emerald-50")
 *   iconColor — tailwind text class
 *   textColor — tailwind text class for label
 */
export default function ActionCard({ icon, label, onClick, bg = "bg-indigo-50", iconColor = "text-indigo-500", textColor = "text-indigo-700" }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl w-full ${bg} hover:brightness-95 transition-all active:scale-95 cursor-pointer`}
    >
      <span className={`${iconColor} w-8 h-8 flex items-center justify-center`}>{icon}</span>
      <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
    </button>
  );
}
