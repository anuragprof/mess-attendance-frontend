import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModule, MODULES } from "../context/ModuleContext";

const MODULE_CONFIG = {
  [MODULES.ATTENDANCE]: {
    label: "Mess Attendance",
    icon: "🍽️",
    route: "/admin",
    description: "Manage customers and billing"
  },
  [MODULES.ACCOUNTING]: {
    label: "Accounting",
    icon: "💰",
    route: "/accounting/dashboard",
    description: "Manage expenses and profit"
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
    setActiveModule(moduleKey);
    setOpen(false);
    navigate(MODULE_CONFIG[moduleKey].route);
  };

  const current = MODULE_CONFIG[activeModule] || MODULE_CONFIG[MODULES.ATTENDANCE];

  return (
    <div ref={ref} className="relative w-full mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{current.icon}</span>
          <div className="text-left">
            <h4 className="font-semibold text-sm">{current.label}</h4>
            <p className="text-xs text-zinc-400">{current.description}</p>
          </div>
        </div>
        <span>▼</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden z-50">
          {Object.entries(MODULE_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleSwitch(key)}
              className={`w-full text-left p-3 hover:bg-zinc-50 flex items-center gap-3 transition ${activeModule === key ? 'bg-zinc-50 border-l-4 border-blue-600' : ''}`}
            >
              <span className="text-xl">{config.icon}</span>
              <div>
                <h4 className={`font-semibold text-sm ${activeModule === key ? 'text-blue-600' : 'text-zinc-800'}`}>{config.label}</h4>
                <p className="text-xs text-zinc-500">{config.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
