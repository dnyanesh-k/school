// // frontend/services/authService.ts
// import axios from "axios";
// import { API_URLS } from "@/config/urls";

// export const authService = {
//   login: async (payload: any) => {
//     // Direct Axios call
//     const response = await axios.post(API_URLS.AUTH.LOGIN, payload);
    
//     if (response.data.access_token) {
//       localStorage.setItem("token", response.data.access_token);
//     }
//     return response.data;
//   },

//   getMe: async () => {
//     const token = localStorage.getItem("token");
//     const response = await axios.get(API_URLS.AUTH.ME, {
//       headers: {
//         Authorization: `Bearer ${token}` // Manual token injection
//       }
//     });
//     return response.data;
//   }
// };


import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface AuthResponse {
  access_token: string;
  token_type: string;
  institute_id: string;
  role: string;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  institute: {
    id: string;
    name: string;
    city: string;
    institute_type: string;
    is_active: boolean;
  };
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", payload);
      return data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.detail || "Registration failed. Please try again.";
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      throw new Error("Network error. Check your connection.");
    }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", payload);
      return data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.detail || "Invalid email or password.";
        throw new Error(typeof msg === "string" ? msg : "Login failed.");
      }
      throw new Error("Network error. Check your connection.");
    }
  },

  async me(token: string): Promise<MeResponse> {
    try {
      const { data } = await api.get<MeResponse>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to fetch user.");
    }
  },

  // ─── Token helpers ──────────────────────────────────────────────────────────

  saveToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("vt_token", token);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vt_token");
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vt_token");
    }
  },

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      // Decode JWT payload (no verification — backend verifies)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  getInstituteId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.institute_id || null;
    } catch {
      return null;
    }
  },

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  },

  logout(): void {
    this.removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
};