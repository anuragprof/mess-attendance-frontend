// src/api/client.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Fail loudly at startup — prevents silent fallback to localhost in production
// which causes a mixed-content block (HTTP from HTTPS page → "failed" XHR).
// Fix: set VITE_API_URL in Vercel Dashboard → Settings → Environment Variables.
if (!BASE_URL) {
  throw new Error(
    "[client.js] VITE_API_URL is not defined. " +
    "Set it in Vercel Dashboard → Settings → Environment Variables → VITE_API_URL=https://your-railway-url.up.railway.app/api"
  );
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive HttpOnly cookies (requires SameSite=None; Secure on server)
  timeout: 10000,
});

// Helper to read the CSRF cookie for POST/DELETE protected routes
export function getCsrfToken() {
  const m = document.cookie.match(/(?:^|;\s*)X-CSRF-Token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}
