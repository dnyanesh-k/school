import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface Subject {
  id: number;
  name: string;
  daily_target_hours: number;
}

export interface Session {
  id: number;
  subject_id: number;
  subject_name: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
}

export interface SubjectStats {
  subject_id: number;
  subject_name: string;
  daily_target_hours: number;
  today_hours: number;
  this_week_hours: number;
  this_month_hours: number;
  total_hours: number;
  weekly_pct: number;
}

export interface DailyPoint {
  date: string;
  subject_id: number;
  subject_name: string;
  hours: number;
}

export interface StatsResponse {
  subjects: SubjectStats[];
  daily_last_30: DailyPoint[];
  active_session: Session | null;
  recent_sessions: Session[];
  today_sessions: Session[];
}

export const studentTrackerService = {
  async getSubjects(): Promise<Subject[]> {
    const r = await api.get(API_URLS.STUDENT.SUBJECTS);
    return r.data;
  },

  async createSubject(name: string, daily_target_hours: number): Promise<Subject> {
    const r = await api.post(API_URLS.STUDENT.SUBJECTS, { name, daily_target_hours });
    return r.data;
  },

  async updateSubject(id: number, name?: string, daily_target_hours?: number): Promise<Subject> {
    const r = await api.patch(API_URLS.STUDENT.SUBJECT(id), { name, daily_target_hours });
    return r.data;
  },

  async deleteSubject(id: number): Promise<void> {
    await api.delete(API_URLS.STUDENT.SUBJECT(id));
  },

  async startSession(subject_id: number): Promise<Session> {
    const r = await api.post(API_URLS.STUDENT.SESSION_START, { subject_id });
    return r.data;
  },

  async endSession(): Promise<Session> {
    const r = await api.post(API_URLS.STUDENT.SESSION_END);
    return r.data;
  },

  async getStats(): Promise<StatsResponse> {
    const r = await api.get(API_URLS.STUDENT.STATS);
    return r.data;
  },
};
