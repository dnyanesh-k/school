import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import { buildWaMeUrl } from "@/lib/whatsapp";
import type { PaginatedResult } from "@/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export interface Installment {
  id: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
  paid_amount?: number | null;
  status: "pending" | "paid" | "overdue";
}

export interface FeePlan {
  id: number;
  student_id: number;
  total_amount: number;
  paid_amount: number;
  installments: Installment[];
}

export interface CreateFeePlanPayload {
  student_id: number;
  total_amount: number;
  installments: { amount: number; due_date: string }[];
}

export interface Defaulter {
  student_id: number;
  student_name: string;
  class_name: string;
  parent_phone: string;
  pending_amount: number;
  due_date: string;
  installment_id: number;
}

export interface FeeSummary {
  student_id: number;
  student_name: string;
  roll_number: string;
  class_name: string;
  parent_phone: string;
  has_plan: boolean;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  status: "none" | "paid" | "partial" | "overdue" | "pending";
}

export interface FeeOverviewStats {
  collected: number;
  pending: number;
  overdue: number;
}

export interface FeeSummaryListResult extends PaginatedResult<FeeSummary> {
  stats: FeeOverviewStats;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const feeService = {
  async getSummaries(
    classId?: number,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<FeeSummaryListResult> {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (classId) params.class_id = classId;
    const response = await api.get(API_URLS.FEES.SUMMARY, { params });
    return response.data as FeeSummaryListResult;
  },

  async listAllSummaries(classId?: number): Promise<FeeSummary[]> {
    const all: FeeSummary[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await this.getSummaries(classId, page, 50);
      all.push(...result.items);
      totalPages = result.total_pages;
      page += 1;
    } while (page <= totalPages);

    return all;
  },

  async createPlan(payload: CreateFeePlanPayload): Promise<FeePlan> {
    const response = await api.post(API_URLS.FEES.PLAN, payload);
    return response.data.data as FeePlan;
  },

  async getPlanByStudent(studentId: number): Promise<FeePlan> {
    const response = await api.get(API_URLS.FEES.PLAN_BY_STUDENT(studentId));
    return response.data as FeePlan;
  },

  async payInstallment(installmentId: number, amount: number): Promise<FeePlan> {
    const response = await api.put(API_URLS.FEES.PAY_INSTALLMENT(installmentId), { amount });
    return response.data.data as FeePlan;
  },

  async getDefaulters(
    classId?: number,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    filter: "overdue" | "due_soon" = "overdue",
  ): Promise<PaginatedResult<Defaulter>> {
    const params: Record<string, string | number> = { page, page_size: pageSize, filter };
    if (classId) params.class_id = classId;
    const response = await api.get(API_URLS.FEES.DEFAULTERS, { params });
    return response.data as PaginatedResult<Defaulter>;
  },

  buildWhatsAppUrl(phone: string, studentName: string, pendingAmount: number, dueDate: string): string {
    const msg = `Dear Parent, fees of ${formatInr(pendingAmount)} for ${studentName} was due on ${formatDate(dueDate)}. Please pay at the earliest.`;
    return buildWaMeUrl(phone, msg);
  },

  buildDueSoonWhatsAppUrl(phone: string, studentName: string, pendingAmount: number, dueDate: string): string {
    const msg = `Dear Parent, fees of ${formatInr(pendingAmount)} for ${studentName} is due on ${formatDate(dueDate)}. Please arrange payment on time.`;
    return buildWaMeUrl(phone, msg);
  },
};

export { getErrorMessage, formatInr, formatDate };
