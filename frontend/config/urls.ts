// frontend/config/urls.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const API_URLS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    ME: `${BASE_URL}/auth/me`,
  },
  STUDENTS: {
    BASE: `${BASE_URL}/students`,
    SEARCH: `${BASE_URL}/students/search`,
  }
};
