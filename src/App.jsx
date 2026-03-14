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

      {/* The Dashboard layout will only wrap specific routes using the layout pattern */}
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

        {/* Layout completely hidden on scan */}
        <Route path="/scan" element={<Scan />} />

        {/* Routes protected by DashboardLayout */}
        <Route element={<DashboardLayout me={me} setMe={setMe} />}>
          <Route path="/billing" element={<Billing />} />
          <Route path="/register" element={<CustomerRegistration />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </div>
  );
}
