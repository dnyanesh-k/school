import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface DashboardSummary {
  total_students: number;
  attendance_today_pct: number;
  absent_today_count: number;
  fees_collected: number;
  fees_collected_this_month: number;
  fees_pending: number;
  collection_rate_pct: number;
  fee_defaulters_count: number;
  tests_this_week: number;
  tests_pending_scores: number;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get(API_URLS.DASHBOARD.SUMMARY);
    return response.data as DashboardSummary;
  },
};
