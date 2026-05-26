import api from "@/lib/axios";
import { API_URLS } from "@/config/urls";

export interface Installment {
  id: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
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
}

export const feeService = {

  async createPlan(payload: CreateFeePlanPayload) {
    const response = await api.post(API_URLS.FEES.PLAN, payload);
    return response.data;
  },

  async getPlanByStudent(studentId: number) {
    const response = await api.get(API_URLS.FEES.PLAN_BY_STUDENT(studentId));
    return response.data;
  },

  async payInstallment(installmentId: number) {
    const response = await api.put(API_URLS.FEES.PAY_INSTALLMENT(installmentId));
    return response.data;
  },

  async getDefaulters() {
    const response = await api.get(API_URLS.FEES.DEFAULTERS);
    return response.data as Defaulter[];
  },

  buildWhatsAppUrl(phone: string, studentName: string, pendingAmount: number, dueDate: string): string {
    const msg = `Dear Parent, fees of ₹${pendingAmount} for ${studentName} was due on ${dueDate}. Please pay at the earliest.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  },
};