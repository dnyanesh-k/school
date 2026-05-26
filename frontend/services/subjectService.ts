import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface Subject {
  id: number;
  name: string;
  class_id: number;
  created_at?: string;
}

export interface SubjectPayload {
  name: string;
}

export const subjectService = {
  async listForClass(classId: number) {
    const response = await api.get(API_URLS.CLASSES.SUBJECTS(classId));
    return response.data as Subject[];
  },

  async create(classId: number, payload: SubjectPayload) {
    const response = await api.post(API_URLS.CLASSES.SUBJECTS(classId), payload);
    return response.data as Subject;
  },

  async update(subjectId: number, payload: SubjectPayload) {
    const response = await api.put(API_URLS.CLASSES.SUBJECT(subjectId), payload);
    return response.data as Subject;
  },

  async remove(subjectId: number) {
    const response = await api.delete(API_URLS.CLASSES.SUBJECT(subjectId));
    return response.data;
  },
};
