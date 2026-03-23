import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const CSRF_COOKIE = import.meta.env.VITE_CSRF_COOKIE || "csrf_token";
const CSRF_HEADER = import.meta.env.VITE_CSRF_HEADER || "X-CSRF-Token";

// --- Utility to read cookies ---
export function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// --- Axios instance ---
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // REQUIRED for cookie auth
});

export default api;

// --- Attach CSRF token ---
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  const needsCsrf = ["post", "put", "patch", "delete"].includes(method);

  if (needsCsrf) {
    const token = getCookie(CSRF_COOKIE);
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        [CSRF_HEADER]: token,
      };
    }
  }

  return config;
});

// --- Auto-refresh expired tokens ---
let isRefreshing = false;
let pendingQueue = [];

function runQueue() {
  const queue = [...pendingQueue];
  pendingQueue = [];
  queue.forEach((fn) => fn());
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;

      await new Promise((resolve, reject) => {
        pendingQueue.push(resolve);

        if (!isRefreshing) {
          isRefreshing = true;
          axios
            .post(`${API_BASE}/vendor/refresh`, null, {
              withCredentials: true,
            })
            .then(() => {
              isRefreshing = false;
              runQueue();
            })
            .catch((err) => {
              isRefreshing = false;
              pendingQueue = [];
              reject(err);
            });
        }
      });

      return api(original);
    }

    return Promise.reject(error);
  }
);