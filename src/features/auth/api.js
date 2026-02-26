// src/features/auth/api.js
import { api } from "../../lib/api";

export async function loginVendor({ email, password }) {
  // POST /api/vendor/login (sets cookies + csrf)
  const res = await api.post("/vendor/login", { email, password });
  return res.data; // { ok: true }
}

export async function getVendorMe() {
  // GET /api/vendor/me (reads access cookie server-side)
  const res = await api.get("/vendor/me");
  return res.data; // { id, name, email }
}

export async function refreshVendor() {
  // POST /api/vendor/refresh (rotates tokens)
  const res = await api.post("/vendor/refresh");
  return res.data; // { ok: true }
}

export async function logoutVendor() {
  // POST /api/vendor/logout (CSRF protected; axios sends X-CSRF-Token)
  const res = await api.post("/vendor/logout");
  return res.data; // { ok: true }
}
