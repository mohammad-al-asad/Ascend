import { baseApi } from "./baseApi";

// ==========================================
// Assessment Models
// ==========================================
export interface AssessmentResponse {
  id: string;
  assessment_type: string;
  display_title: string;
  status: string;
  due_date: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  result_band: string | null;
  result_band_label: string | null;
  physical_result_summary: string | null;
  mental_result_summary: string | null;
  feedback_session_status: string;
}

export interface MyAssessmentsResponse {
  completed: AssessmentResponse[];
  completed_total: number;
  active: AssessmentResponse[];
}

// ==========================================
// API Slice
// ==========================================
export const assessmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAssessments: builder.query<MyAssessmentsResponse, void>({
      query: () => "/assessments/me",
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyAssessmentsQuery } = assessmentsApi;
