import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import type { PaginatedResult } from "@/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import type { AuthUser } from "@/services/authService";

export interface IndependentStudent {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  total_sessions: number;
  total_hours: number;
  last_session_at: string | null;
}

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
  student_count: number;
  last_attendance_date: string | null;
  last_dashboard_access: string | null;
  qr_generated: number;
  parents_scanned: number;
  parent_last_scan_at: string | null;
  admin?: {
    id: number;
    full_name: string;
    email: string;
  } | null;
}

export interface AdminStats {
  total: number;
  pending: number;
  active: number;
  rejected: number;
  suspended: number;
  total_students: number;
  institutes_used_this_week: number;
  independent_students_total: number;
  independent_students_active: number;
  independent_students_pending: number;
  independent_students_active_this_week: number;
  independent_students_total_hours: number;
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

  async getStats(): Promise<AdminStats> {
    const response = await api.get(API_URLS.ADMIN.STATS);
    return response.data as AdminStats;
  },

  async listStudents(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<IndependentStudent>> {
    const r = await api.get(API_URLS.ADMIN_STUDENTS.LIST, { params: { page, page_size: pageSize } });
    return r.data;
  },

  async toggleStudentAccess(userId: number, is_active: boolean): Promise<IndependentStudent> {
    const r = await api.patch(API_URLS.ADMIN_STUDENTS.ACCESS(userId), { is_active });
    return r.data;
  },
};

export { getErrorMessage };

export type { AuthUser };
