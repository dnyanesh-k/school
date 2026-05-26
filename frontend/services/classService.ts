import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface ClassPayload {
  name: string;
}

export interface ClassItem {
  id: number;
  name: string;
  created_at?: string;
}

export const classService = {
  async list() {
    const response = await api.get(API_URLS.CLASSES.LIST);
    return response.data as ClassItem[];
  },

  async create(payload: ClassPayload) {
    const response = await api.post(API_URLS.CLASSES.LIST, payload);
    return response.data as ClassItem;
  },

  async update(id: number, payload: ClassPayload) {
    const response = await api.put(API_URLS.CLASSES.DETAIL(id), payload);
    return response.data as ClassItem;
  },

  async remove(id: number) {
    const response = await api.delete(API_URLS.CLASSES.DETAIL(id));
    return response.data;
  },
};
