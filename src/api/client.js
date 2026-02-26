// src/api/client.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  withCredentials: true, // send/receive HttpOnly cookies
  timeout: 10000,
});

// optional: small helper to read CSRF cookie when you need to POST/DELETE protected routes
export function getCsrfToken() {
  const m = document.cookie.match(/(?:^|;\s*)X-CSRF-Token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}
