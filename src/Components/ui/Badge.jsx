const VARIANTS = {
  permanent:  "bg-indigo-100 text-indigo-700",
  temporary:  "bg-amber-100  text-amber-700",
  fullday:    "bg-violet-100 text-violet-700",
  halfday:    "bg-sky-100    text-sky-700",
  active:     "bg-emerald-100 text-emerald-700",
  expired:    "bg-rose-100   text-rose-600",
  monthly:    "bg-teal-100   text-teal-700",
  default:    "bg-slate-100  text-slate-600",
};

/**
 * Badge — inline tag-style chip
 * Props:
 *   label    — text to display
 *   variant  — key from VARIANTS map (optional, defaults to 'default')
 *   className — extra classes (optional)
 */
export default function Badge({ label, variant = "default", className = "" }) {
  const cls = VARIANTS[variant?.toLowerCase()] || VARIANTS.default;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls} ${className}`}
    >
      {label}
    </span>
  );
}
