import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import type { PaginatedResult } from "@/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export type AdmissionStatus = "inquiry" | "admitted" | "rejected" | "follow_up";

export interface Admission {
  id: number;
  candidate_name: string;
  parent_name: string;
  phone: string;
  class_id: number;
  class_name?: string;
  visit_date: string;
  status: AdmissionStatus;
  converted_student_id: number | null;
  created_at: string;
}

export interface CreateAdmissionPayload {
  candidate_name: string;
  parent_name: string;
  phone: string;
  class_id: number;
  visit_date: string;
  status?: AdmissionStatus;
}

export interface UpdateAdmissionPayload {
  candidate_name?: string;
  parent_name?: string;
  phone?: string;
  class_id?: number;
  visit_date?: string;
  status?: AdmissionStatus;
}

export const STATUS_LABELS: Record<AdmissionStatus, string> = {
  inquiry:   "Inquiry",
  admitted:  "Admitted",
  rejected:  "Rejected",
  follow_up: "Follow-up",
};

export const admissionService = {
  async list(params: { status?: AdmissionStatus | null; page?: number; page_size?: number } = {}) {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      page_size: params.page_size ?? DEFAULT_PAGE_SIZE,
    };
    if (params.status) query.status = params.status;
    const res = await api.get(API_URLS.ADMISSIONS.LIST, { params: query });
    return res.data as PaginatedResult<Admission>;
  },

  async create(payload: CreateAdmissionPayload) {
    const res = await api.post(API_URLS.ADMISSIONS.LIST, payload);
    return res.data as Admission;
  },

  async update(id: number, payload: UpdateAdmissionPayload) {
    const res = await api.patch(API_URLS.ADMISSIONS.DETAIL(id), payload);
    return res.data as Admission;
  },

  async remove(id: number) {
    await api.delete(API_URLS.ADMISSIONS.DETAIL(id));
  },

  async convert(id: number) {
    const res = await api.post(API_URLS.ADMISSIONS.CONVERT(id));
    return res.data as { admission_id: number; student_id: number; roll_number: string };
  },

  async pendingCount() {
    const res = await api.get(API_URLS.ADMISSIONS.PENDING_COUNT);
    return (res.data as { count: number }).count;
  },
};
