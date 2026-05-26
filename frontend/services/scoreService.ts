import api from "@/lib/axios";

export interface Score {
  id: number;
  student_id: number;
  test_id: number;
  student_name: string;
  test_name: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  created_at?: string;
}

export interface CreateScorePayload {
  student_id: number;
  test_id: number;
  marks_obtained: number;
}

export interface UpdateScorePayload extends Partial<CreateScorePayload> {}

const SCORES_API = "/scores";

export const scoreService = {
  async list(testId?: number, studentId?: number): Promise<Score[]> {
    const params: any = {};
    if (testId) params.test_id = testId;
    if (studentId) params.student_id = studentId;
    const response = await api.get(SCORES_API, { params });
    return response.data;
  },

  async create(payload: CreateScorePayload): Promise<Score> {
    const response = await api.post(SCORES_API, payload);
    return response.data;
  },

  async bulkCreate(
    testId: number,
    scores: { student_id: number; marks_obtained: number }[]
  ): Promise<Score[]> {
    const response = await api.post(`${SCORES_API}/bulk`, {
      test_id: testId,
      scores,
    });
    return response.data;
  },

  async update(id: number, payload: UpdateScorePayload): Promise<Score> {
    const response = await api.put(`${SCORES_API}/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${SCORES_API}/${id}`);
  },
};
