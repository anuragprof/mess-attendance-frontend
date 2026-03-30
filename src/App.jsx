console.log("APP FILE LOADED");

import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";   // ✅ ADD THIS

import Navbar from "./Components/Navbar";
import DashboardLayout from "./Components/DashboardLayout";
import Login from "./Pages/Login";
import Scan from "./Pages/Scan";
import CustomerRegistration from "./Pages/CusReg";
import Admin from "./Pages/Admin";
import Billing from "./Pages/Billing";
import Reports from "./Pages/Reports";

import { ModuleProvider } from "./context/ModuleContext";
import BillingPage from "./modules/billing/pages/Billing";
import AccountingDashboard from "./modules/accounting/pages/Dashboard";
import ExpensesPage from "./modules/accounting/pages/Expenses";
import CategoriesPage from "./modules/accounting/pages/Categories";
import AccountingReportsPage from "./modules/accounting/pages/Reports";

import { getVendorMe } from "./features/auth/api";


export default function App() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    async function autoLogin() {
      try {
        const data = await getVendorMe();
        setMe(data);
      } catch {
        setMe(null);
      }
    }
    autoLogin();
  }, []);

  return (
    <ModuleProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">

        {/* ✅ ADD TOASTER HERE */}
        <Toaster position="top-center" richColors    toastOptions={{ className: "mx-auto" }}  />

        {/* The Dashboard layout will only wrap specific routes using the layout pattern */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route
            path="/login"
            element={
              me ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login setMe={setMe} />
              )
            }
          />

          {/* Layout completely hidden on scan - Still useful for full-screen dedicated scanning tablets */}
          <Route path="/scan" element={me ? <Scan /> : <Navigate to="/login" replace />} />

          {/* Routes protected by DashboardLayout */}
          <Route element={<DashboardLayout me={me} setMe={setMe} />}>
            {/* Attendance Module Routes */}
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/renew-plan" element={<Billing />} />
            <Route path="/register" element={<CustomerRegistration />} />
            <Route path="/dashboard" element={<Admin />} />
            <Route path="/reports" element={<Reports />} />

            {/* Accounting Module Routes */}
            <Route path="/accounting/dashboard" element={<AccountingDashboard />} />
            <Route path="/accounting/expenses" element={<ExpensesPage />} />
            <Route path="/accounting/categories" element={<CategoriesPage />} />
            <Route path="/accounting/reports" element={<AccountingReportsPage />} />
          </Route>
        </Routes>
      </div>
    </ModuleProvider>
  );
}

