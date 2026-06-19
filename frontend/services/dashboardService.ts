import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface AttendanceTrendPoint {
  date: string;
  pct: number;
  absent: number;
}

export interface DashboardSummary {
  total_students: number;
  attendance_today_pct: number;
  absent_today_count: number;
  attendance_trend: AttendanceTrendPoint[];
  can_view_fees: boolean;
  fees_collected: number | null;
  fees_collected_this_month: number | null;
  fees_collected_this_week: number | null;
  fees_total_planned: number | null;
  fees_pending: number | null;
  fees_due_next_week: number | null;
  next_week_start: string | null;
  next_week_end: string | null;
  collection_rate_pct: number | null;
  fee_defaulters_count: number | null;
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
