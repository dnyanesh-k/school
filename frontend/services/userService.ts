import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import type { AuthUser } from "@/services/authService";

export interface CreateTeacherPayload {
  full_name: string;
  email: string;
  password: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export const userService = {
  async listTeachers(): Promise<AuthUser[]> {
    const response = await api.get(API_URLS.USERS.TEACHERS);
    return response.data as AuthUser[];
  },

  async createTeacher(payload: CreateTeacherPayload): Promise<AuthUser> {
    const response = await api.post(API_URLS.USERS.TEACHERS, payload);
    return response.data as AuthUser;
  },
};

export { getErrorMessage };
