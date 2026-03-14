console.log("APP FILE LOADED");

import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";   // ✅ ADD THIS

import DashboardLayout from "./Layouts/DashboardLayout";
import Login from "./Pages/Login";
import Scan from "./Pages/Scan";
import CustomerRegistration from "./Pages/CusReg";
import Admin from "./Pages/Admin";
import Billing from "./Pages/Billing";

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
    <div className="min-h-screen bg-zinc-50 text-zinc-900">

      {/* ✅ ADD TOASTER HERE */}
      <Toaster position="top-center" richColors    toastOptions={{ className: "mx-auto" }}  />

      {/* Main App Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route
          path="/login"
          element={
            me ? (
              <Navigate to="/register" replace />
            ) : (
              <Login setMe={setMe} />
            )
          }
        />

        {/* Full Screen Unauthenticated/Kiosk Views */}
        <Route path="/scan" element={<Scan />} />

        {/* Dashboard layout views */}
        <Route path="/billing" element={
          <DashboardLayout me={me} setMe={setMe}><Billing /></DashboardLayout>
        } />
        <Route path="/admin" element={
          <DashboardLayout me={me} setMe={setMe}><Admin /></DashboardLayout>
        } />
        <Route path="/register" element={
          <DashboardLayout me={me} setMe={setMe}><CustomerRegistration /></DashboardLayout>
        } />
      </Routes>
    </div>
  );
}
