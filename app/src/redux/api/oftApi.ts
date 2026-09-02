import { baseApi } from "./baseApi";

// ==========================================
// OFT Models
// ==========================================
export interface OFTStatusResponse {
  current_status: string;
  latest_pass_fail: string | null;
  latest_test_date: string | null;
  items_passed: number | null;
  items_total: number | null;
  score_percentage: number | null;
  next_scheduled_date: string | null;
  next_scheduled_relative: string | null;
  annual_test_count: number;
}

// ==========================================
// API Slice
// ==========================================
export const oftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOftStatus: builder.query<OFTStatusResponse, void>({
      query: () => "/oft/me",
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyOftStatusQuery } = oftApi;
