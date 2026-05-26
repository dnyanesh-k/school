import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface Test {
  id: number;
  title: string;
  name:string;
  test_number: number;
  subject_id: number;
  subject?: string;
  class_id: number;
  class_name?: string;
  total_marks: number;
  scheduled_date: string;
  is_published: boolean;
}

export interface TestScore {
  student_id: number;
  student_name: string;
  parent_phone: string;
  marks_obtained: number | null;
  remarks: string;
}

export interface CreateTestPayload {
  title: string;
  test_number: number;
  subject_id: number;
  class_id: number;
  max_marks: number;
  scheduled_date: string;
}

export const testService = {

  async list() {
    const response = await api.get(API_URLS.TESTS.LIST);
    return response.data as Test[];
  },

  async create(payload: CreateTestPayload) {
    const response = await api.post(API_URLS.TESTS.CREATE, payload);
    return response.data;
  },

  async update(testId: number, payload: CreateTestPayload) {
    const response = await api.put(`${API_URLS.TESTS.LIST}/${testId}`, payload);
    return response.data;
  },

  async getScores(testId: number) {
    const response = await api.get(API_URLS.TESTS.SCORES(testId));
    return response.data as TestScore[];
  },

  async submitScores(testId: number, scores: { student_id: number; marks_obtained: number; remarks: string }[]) {
    const response = await api.post(API_URLS.TESTS.SCORES(testId), { scores });
    return response.data;
  },

  async delete(testId: number) {
    const response = await api.delete(`${API_URLS.TESTS.LIST}/${testId}`);
    return response.data;
  },

  buildWhatsAppUrl(phone: string, studentName: string, testTitle: string, marks: number, maxMarks: number): string {
    const msg = `Dear Parent, ${studentName} scored ${marks}/${maxMarks} in ${testTitle}. For details contact the institute.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  },
};