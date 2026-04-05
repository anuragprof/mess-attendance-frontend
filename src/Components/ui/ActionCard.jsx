import { IndianRupee } from "lucide-react";

/**
 * ActionCard — vibrant quick-action button
 * Matches the reference pastel-color style
 */
export default function ActionCard({ icon, label, onClick, color = "indigo" }) {
  // Mapping color presets for consistency
  const themes = {
    emerald: {
      bg: "bg-[#f0f9f4]", // Very soft green
      icon: "text-[#10b981]",
      text: "text-[#065f46]",
    },
    indigo: {
      bg: "bg-[#f5f7ff]", // Very soft indigo/blue
      icon: "text-[#6366f1]",
      text: "text-[#3730a3]",
    },
    amber: {
      bg: "bg-[#fffbeb]", // Very soft amber
      icon: "text-[#f59e0b]",
      text: "text-[#92400e]",
    },
    purple: {
      bg: "bg-[#faf5ff]", // Very soft purple
      icon: "text-[#a855f7]",
      text: "text-[#5b21b6]",
    },
    rose: {
      bg: "bg-[#fff1f2]", // Very soft rose
      icon: "text-[#f43f5e]",
      text: "text-[#9f1239]",
    },
  };

  const theme = themes[color] || themes.indigo;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl w-full h-[100px]
        ${theme.bg} shadow-sm border border-transparent hover:border-${color}-200
        transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-md
      `}
    >
      <div className={`${theme.icon} mb-0.5`}>
        {icon}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.text}`}>
        {label}
      </span>
    </button>
  );
}
