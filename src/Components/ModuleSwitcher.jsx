import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModule, MODULES } from "../context/ModuleContext";
import { ChevronDown } from "lucide-react";

const MODULE_CONFIG = {
  [MODULES.ATTENDANCE]: {
    label: "Attendance",
    icon: "🍽️",
    route: "/dashboard",
  },
  [MODULES.ACCOUNTING]: {
    label: "Accounting",
    icon: "💰",
    route: "/accounting/dashboard",
  }
};

export default function ModuleSwitcher() {
  const { activeModule, setActiveModule } = useModule();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (moduleKey) => {
    if (moduleKey === activeModule) {
      setOpen(false);
      return;
    }
    setActiveModule(moduleKey);
    setOpen(false);
    navigate(MODULE_CONFIG[moduleKey].route);
  };

  const current = MODULE_CONFIG[activeModule] || MODULE_CONFIG[MODULES.ATTENDANCE];

  return (
    <div ref={ref} className="relative w-full">
      {/* Sleek Small Switcher Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 group transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-base grayscale group-hover:grayscale-0 transition-all">{current.icon}</span>
          <span className="text-xs font-bold text-slate-200 tracking-tight">{current.label}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1e2548] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {Object.entries(MODULE_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleSwitch(key)}
              className={`
                w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors
                ${activeModule === key 
                  ? 'bg-indigo-600/20 text-indigo-400' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-base">{config.icon}</span>
              <span className="text-xs font-bold">{config.label}</span>
              {activeModule === key && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
