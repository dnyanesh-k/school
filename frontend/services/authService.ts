import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import { DEV_BYPASS_AUTH } from "@/lib/dev";

export type UserRole = "platform_admin" | "institute_admin" | "teacher" | "independent_student";

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_admin: boolean;
  institute_id: number | null;
  institute_name: string | null;
  institute_status: string | null;
  is_active: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  address?: string;       // optional — matches backend schema
  city: string;
  institute_type: string;
  admin_name: string;
  password: string;
}

export interface StudentRegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  institute_status: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

function decodeToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export const authService = {

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await api.post(API_URLS.AUTH.REGISTER, payload);
    return response.data as RegisterResponse;
  },

  async registerStudent(payload: StudentRegisterPayload): Promise<{ message: string }> {
    const response = await api.post(API_URLS.AUTH.REGISTER_STUDENT, payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post(API_URLS.AUTH.LOGIN, payload);
    localStorage.setItem("token", response.data.access_token);
    return response.data as LoginResponse;
  },

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    const response = await api.post(API_URLS.AUTH.FORGOT_PASSWORD, { email });
    return response.data as MessageResponse;
  },

  async resetPassword(payload: {
    email: string;
    otp: string;
    new_password: string;
  }): Promise<MessageResponse> {
    const response = await api.post(API_URLS.AUTH.RESET_PASSWORD, payload);
    return response.data as MessageResponse;
  },

  async me(): Promise<AuthUser> {
    if (DEV_BYPASS_AUTH) {
      return {
        id: 1,
        full_name: "Dev User",
        email: "dev@example.com",
        role: "institute_admin",
        is_admin: true,
        institute_id: 1,
        institute_name: "Demo Institute",
        institute_status: "active",
        is_active: true,
      };
    }
    const response = await api.get(API_URLS.AUTH.ME);
    return response.data as AuthUser;
  },

  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  isLoggedIn(): boolean {
    if (DEV_BYPASS_AUTH) return true;
    const payload = decodeToken();
    if (!payload) return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  },

  getInstituteId(): number | null {
    if (DEV_BYPASS_AUTH) return 1;
    const payload = decodeToken();
    return payload?.institute_id ?? null;
  },

getRole(): UserRole | null {
  // 1. Always check for dev bypass first
  if (DEV_BYPASS_AUTH) return "institute_admin";
  
  // 2. Add the guard block for the static build server
  if (typeof window === "undefined") {
    return null; 
  }
  
  // 3. Safe to call decodeToken now that we are in the browser
  const payload = decodeToken();
  return (payload?.role as UserRole) ?? null;
},

  isPlatformAdmin(): boolean {
    return authService.getRole() === "platform_admin";
  },

  isInstituteAdmin(): boolean {
    return authService.getRole() === "institute_admin";
  },

  isTeacher(): boolean {
    return authService.getRole() === "teacher";
  },

  isIndependentStudent(): boolean {
    return authService.getRole() === "independent_student";
  },

  canViewFees(): boolean {
    return authService.isInstituteAdmin();
  },

  getHomeRoute(): string {
    if (authService.isPlatformAdmin()) return "/admin";
    if (authService.isIndependentStudent()) return "/student";
    return "/dashboard";
  },
};
