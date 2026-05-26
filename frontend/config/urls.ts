// frontend/config/urls.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const API_URLS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    ME: `${BASE_URL}/auth/me`,
  },
  INSTITUTE: {
    ME:            `${BASE_URL}/institute/me`,
    ACADEMIC_YEAR: `${BASE_URL}/institute/academic-year`,
  },
  CLASSES: {
    LIST:          `${BASE_URL}/classes`,
    DETAIL:        (id: number) => `${BASE_URL}/classes/${id}`,
    SUBJECTS:      (id: number) => `${BASE_URL}/classes/${id}/subjects`,
    SUBJECT:       (id: number) => `${BASE_URL}/subjects/${id}`,
  },
  STUDENTS: {
    LIST:          `${BASE_URL}/students`,
    DETAIL:        (id: number) => `${BASE_URL}/students/${id}`,
  },
  FEES: {
    PLAN:          `${BASE_URL}/fees/plan`,
    PLAN_BY_STUDENT: (studentId: number) => `${BASE_URL}/fees/plan/${studentId}`,
    PAY_INSTALLMENT: (id: number) => `${BASE_URL}/installments/${id}/pay`,
    DEFAULTERS:    `${BASE_URL}/fees/defaulters`,
  },
  ATTENDANCE: {
    BY_CLASS:      (classId: number) => `${BASE_URL}/attendance/class/${classId}`,
    MARK:          `${BASE_URL}/attendance/mark`,
    ABSENT_STREAK: `${BASE_URL}/attendance/absent-streak`,
  },
  HOLIDAYS: {
    LIST:          `${BASE_URL}/holidays`,
    CREATE:        `${BASE_URL}/holidays`,
  },
  TESTS: {
    LIST:          `${BASE_URL}/tests`,
    CREATE:        `${BASE_URL}/tests`,
    SCORES:        (testId: number) => `${BASE_URL}/tests/${testId}/scores`,
  },
  DASHBOARD: {
    SUMMARY:       `${BASE_URL}/dashboard/summary`,
  },
};
