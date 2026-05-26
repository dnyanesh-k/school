import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import type { PaginatedResult, PaginationParams } from "@/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export interface Student {
  id: number;
  full_name: string;
  admission_date: string;
  class_id: number;
  class_name?: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  is_active: boolean;
}

export interface CreateStudentPayload {
  full_name: string;
  admission_date: string;
  class_id: number;
  parent_name: string;
  parent_phone: string;
  address: string;
}

export const studentService = {
  async list(params: { classId?: number; page?: number; page_size?: number; q?: string } = {}) {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      page_size: params.page_size ?? DEFAULT_PAGE_SIZE,
    };
    if (params.classId) query.class_id = params.classId;
    if (params.q) query.q = params.q;

    const response = await api.get(API_URLS.STUDENTS.LIST, { params: query });
    return response.data as PaginatedResult<Student>;
  },

  async get(id: number) {
    const response = await api.get(API_URLS.STUDENTS.DETAIL(id));
    return response.data;
  },

  async create(payload: CreateStudentPayload) {
    const response = await api.post(API_URLS.STUDENTS.LIST, payload);
    return response.data;
  },

  async update(id: number, payload: Partial<CreateStudentPayload>) {
    const response = await api.patch(API_URLS.STUDENTS.DETAIL(id), payload);
    return response.data;
  },

  async deactivate(id: number) {
    const response = await api.delete(API_URLS.STUDENTS.DETAIL(id));
    return response.data;
  },
};
