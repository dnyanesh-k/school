import axios from "axios";
import { DEV_BYPASS_AUTH } from "@/lib/dev";

/**
 * Single API client for the whole app.
 *
 * - Reads JWT from localStorage and sends `Authorization: Bearer <token>` on every request.
 * - 401 → token invalid/expired → clear token and go to /login
 * - 403 → logged in but not allowed (wrong role, suspended institute) → page shows error
 */
const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !DEV_BYPASS_AUTH) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      const message = error.response?.data?.message;
      if (message) {
        console.warn("[API 403]", message);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
