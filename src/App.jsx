console.log("APP FILE LOADED");

import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";   // ✅ ADD THIS

import Navbar from "./Components/Navbar";
import Login from "./Pages/Login";
import Scan from "./Pages/Scan";
import CustomerRegistration from "./Pages/CusReg";
import Admin from "./Pages/Admin";
import Billing from "./Pages/Billing";
import AppLayout from "./Components/AppLayout";

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
    <div className="text-zinc-900">

      {/* ✅ ADD TOASTER HERE */}
      <Toaster position="top-center" richColors    toastOptions={{ className: "mx-auto" }}  />

      {/* Navbar only when logged in */}
      {me && <Navbar me={me} setMe={setMe} />}
      
      <AppLayout>
        <main className={me ? "w-full" : ""}>
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
            <Route path="/billing" element={<Billing />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/register" element={<CustomerRegistration />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </AppLayout>
    </div>
  );
}
