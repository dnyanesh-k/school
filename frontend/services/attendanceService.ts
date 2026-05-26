import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface AttendanceRecord {
  student_id: number;
  student_name: string;
  status: "present" | "absent";
}

export interface AbsentStreak {
  student_id: number;
  student_name: string;
  class_name: string;
  parent_phone: string;
  absent_days: number;
}

export const attendanceService = {

  async getClassAttendance(classId: number, date: string) {
    const response = await api.get(API_URLS.ATTENDANCE.BY_CLASS(classId), { params: { date } });
    return response.data as AttendanceRecord[];
  },

  async markAttendance(classId: number, date: string, records: AttendanceRecord[]) {
    const response = await api.post(API_URLS.ATTENDANCE.MARK, { class_id: classId, date, records });
    return response.data;
  },

  async getAbsentStreak(days: number) {
    const response = await api.get(API_URLS.ATTENDANCE.ABSENT_STREAK, { params: { days } });
    return response.data as AbsentStreak[];
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
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  },
};