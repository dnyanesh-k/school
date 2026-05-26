import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import type { PaginatedResult } from "@/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import type { AuthUser } from "@/services/authService";

export interface InstituteRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  institute_type: string;
  status: string;
  created_at: string;
  admin?: {
    id: number;
    full_name: string;
    email: string;
  } | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export const adminService = {
  async listInstitutes(
    status?: string,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResult<InstituteRecord>> {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (status) params.status = status;
    const response = await api.get(API_URLS.ADMIN.INSTITUTES, { params });
    return response.data as PaginatedResult<InstituteRecord>;
  },

  async updateStatus(instituteId: number, status: "active" | "rejected" | "suspended") {
    const response = await api.patch(API_URLS.ADMIN.INSTITUTE_STATUS(instituteId), { status });
    return response.data;
  },
};

export { getErrorMessage };

export type { AuthUser };
