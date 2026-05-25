// frontend/services/authService.ts

import axios from "axios";
import { API_URLS } from "@/config/urls";

// ─── Types ─────────────────────────────────────────────────────────────

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
  institute_id: number;
  role: string;
}

// ─── Auth Service ─────────────────────────────────────────────────────

export const authService = {
  
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await axios.post<AuthResponse>(
        API_URLS.AUTH.REGISTER,
        payload
      );

      if (data.access_token) {
        this.saveToken(data.access_token);
      }

      return data;

    } catch (err: unknown) {

      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.detail ||
          "Registration failed";

        throw new Error(
          typeof message === "string"
            ? message
            : "Registration failed"
        );
      }

      throw new Error("Network error");
    }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await axios.post<AuthResponse>(
        API_URLS.AUTH.LOGIN,
        payload
      );

      if (data.access_token) {
        this.saveToken(data.access_token);
      }

      return data;

    } catch (err: unknown) {

      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.detail ||
          "Invalid credentials";

        throw new Error(
          typeof message === "string"
            ? message
            : "Login failed"
        );
      }

      throw new Error("Network error");
    }
  },

  // ─── Token Helpers ─────────────────────────────────────────────────

  saveToken(token: string): void {
    localStorage.setItem("token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  removeToken(): void {
    localStorage.removeItem("token");
  },

  logout(): void {
    this.removeToken();
    window.location.href = "/login";
  },
};