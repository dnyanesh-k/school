import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  institute_type: string;
  admin_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {

  async register(payload: RegisterPayload) {
    const response = await api.post(API_URLS.AUTH.REGISTER, payload);
    localStorage.setItem("token", response.data.access_token);
    return response.data;
  },

  async login(payload: LoginPayload) {
    const response = await api.post(API_URLS.AUTH.LOGIN, payload);
    localStorage.setItem("token", response.data.access_token);
    return response.data;
  },

  async me() {
    const response = await api.get(API_URLS.AUTH.ME);
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  isLoggedIn(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  },

  getInstituteId(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1])).institute_id || null;
    } catch { return null; }
  },

  getRole(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1])).role || null;
    } catch { return null; }
  },
};