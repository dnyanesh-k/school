import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

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

  async list(classId?: number) {
    const params = classId ? { class_id: classId } : {};
    const response = await api.get(API_URLS.STUDENTS.LIST, { params });
    return response.data;
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