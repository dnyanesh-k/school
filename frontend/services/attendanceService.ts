import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";
import { buildWaMeUrl } from "@/lib/whatsapp";
import type { PaginatedResult } from "@/lib/pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export interface AttendanceRecord {
  student_id: number;
  student_name: string;
  roll_number?: string;
  status: "present" | "absent";
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
}

export interface ClassAttendanceResponse {
  class_id: number;
  class_name: string;
  date: string;
  is_holiday: boolean;
  holiday_reason?: string | null;
  is_submitted: boolean;
  submitted_at?: string | null;
  students: AttendanceRecord[];
  summary: AttendanceSummary;
}

export interface AbsentStreak {
  student_id: number;
  student_name: string;
  class_name: string;
  parent_phone: string;
  absent_days: number;
}

export interface MarkAttendanceResult {
  class_id: number;
  date: string;
  present: number;
  absent: number;
  saved: number;
  is_submitted: boolean;
  submitted_at: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export const attendanceService = {

  async getClassAttendance(classId: number, date: string): Promise<ClassAttendanceResponse> {
    const response = await api.get(API_URLS.ATTENDANCE.BY_CLASS(classId), { params: { date } });
    return response.data as ClassAttendanceResponse;
  },

  async markAttendance(classId: number, date: string, absentStudentIds: number[]): Promise<MarkAttendanceResult> {
    const payload = {
      class_id: classId,
      date,
      records: absentStudentIds.map((student_id) => ({ student_id, status: "absent" as const })),
    };
    const response = await api.post(API_URLS.ATTENDANCE.MARK, payload);
    return response.data.data as MarkAttendanceResult;
  },

  async getAbsentStreak(
    days: number,
    classId?: number,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedResult<AbsentStreak>> {
    const params: Record<string, string | number> = { days, page, page_size: pageSize };
    if (classId) params.class_id = classId;
    const response = await api.get(API_URLS.ATTENDANCE.ABSENT_STREAK, { params });
    return response.data as PaginatedResult<AbsentStreak>;
  },

  async createHoliday(date: string, reason: string) {
    const response = await api.post(API_URLS.HOLIDAYS.CREATE, { date, reason });
    return response.data;
  },

  async getHolidays() {
    const response = await api.get(API_URLS.HOLIDAYS.LIST);
    return response.data;
  },

  buildWhatsAppUrl(phone: string, studentName: string, absentDays: number): string {
    const msg = `Dear Parent, ${studentName} has been absent for the last ${absentDays} day(s). Please contact the institute.`;
    return buildWaMeUrl(phone, msg);
  },
};

export { getErrorMessage };
