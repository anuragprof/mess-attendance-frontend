import { createContext, useContext, useState, useEffect } from "react";

const ModuleContext = createContext(null);

export const MODULES = {
  ATTENDANCE: "attendance",
  ACCOUNTING: "accounting"
};

export function ModuleProvider({ children }) {
  const [activeModule, setActiveModule] = useState(() => {
    return localStorage.getItem("active_module") || MODULES.ATTENDANCE;
  });

  useEffect(() => {
    localStorage.setItem("active_module", activeModule);
  }, [activeModule]);

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModule must be used within a ModuleProvider");
  }
  return context;
}
