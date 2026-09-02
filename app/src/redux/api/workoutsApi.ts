import { baseApi } from "./baseApi";

// ==========================================
// Workout Models
// ==========================================
export const ACTIVITY_TYPES = ["strength", "cardio", "mobility", "recovery", "other"] as const;
export const COMPLETION_STATUSES = ["completed", "partial", "missed"] as const;

export interface WorkoutLogCreateRequest {
  activity_date: string;
  activity_type: (typeof ACTIVITY_TYPES)[number];
  custom_title?: string;
  duration_minutes: number;
  intensity: number; // RPE 1-5
  completion_status?: (typeof COMPLETION_STATUSES)[number];
  notes?: string;
  session_rating?: number;
}

export interface WorkoutLogResponse {
  id: string;
  activity_date: string;
  activity_type: string;
  custom_title: string | null;
  duration_minutes: number;
  intensity: number;
  completion_status: string;
  notes: string | null;
  reported_limitation: boolean;
  session_rating: number | null;
}

export interface WorkoutsListResponse {
  workouts: WorkoutLogResponse[];
}

export interface WorkoutSummaryResponse {
  range_days: number;
  total_sessions: number;
  completed_sessions: number;
  missed_sessions: number;
  by_activity_type: Record<string, number>;
  total_duration_minutes: number;
  recent_adherence_label: string;
  current_streak_weeks: number;
}

// ==========================================
// API Slice
// ==========================================
export const workoutsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    logWorkout: builder.mutation<WorkoutLogResponse, WorkoutLogCreateRequest>({
      query: (body) => ({
        url: "/workouts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dashboard"],
    }),

    getWorkouts: builder.query<WorkoutsListResponse, number | void>({
      query: (days = 30) => `/workouts?days=${days || 30}`,
      providesTags: ["Dashboard"],
    }),

    getWorkoutSummary: builder.query<WorkoutSummaryResponse, number | void>({
      query: (days = 30) => `/workouts/summary?days=${days || 30}`,
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useLogWorkoutMutation, useGetWorkoutsQuery, useGetWorkoutSummaryQuery } = workoutsApi;
