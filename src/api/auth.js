// src/api/auth.js
import { api } from "./client";

export async function loginVendor({ email, password }) {
  // Backend sets HttpOnly cookies on success; response body is { ok: true }
  const { data } = await api.post("/vendor/login", { email, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/vendor/me"); // cookies included by withCredentials
  return data; // { id, name, email }
}
