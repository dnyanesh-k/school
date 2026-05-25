// frontend/services/authService.ts

import axios from "axios";
import { API_URLS } from "@/config/urls";

// ─── Types ───────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

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

// ─── Service ─────────────────────────────────────────────────────────

export const authService = {

  async login(payload: LoginPayload) {

    const response = await axios.post(
      API_URLS.AUTH.LOGIN,
      payload
    );

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    return response.data;
  },

  async register(payload: RegisterPayload) {

    const response = await axios.post(
      API_URLS.AUTH.REGISTER,
      payload
    );

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    return response.data;
  },

  async me() {

    const token = localStorage.getItem("token");

    const response = await axios.get(
      API_URLS.AUTH.ME,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  logout() {

    localStorage.removeItem("token");

    window.location.href = "/login";
  },

    saveToken(token: string) {
    localStorage.setItem("token", token);
  },
};