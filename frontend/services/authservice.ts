// frontend/services/authService.ts
import axios from "axios";
import { API_URLS } from "@/config/urls";

export const authService = {
  login: async (payload: any) => {
    // Direct Axios call
    const response = await axios.post(API_URLS.AUTH.LOGIN, payload);
    
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
  },

  getMe: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(API_URLS.AUTH.ME, {
      headers: {
        Authorization: `Bearer ${token}` // Manual token injection
      }
    });
    return response.data;
  }
};
