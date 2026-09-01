import { baseApi } from "./baseApi";

// ==========================================
// Onboarding Models
// ==========================================
export interface OnboardingIntroResponse {
  welcome_name?: string;
  intro_body?: string;
  cta_label?: string;
  privacy_summary?: string;
  consent_required_label?: string;
  consent_required_description?: string;
  optional_opt_in_label?: string;
  optional_opt_in_description?: string;
  policy_version?: string;
  trace_id?: string;
  opsec_notice_text?: string;
}

export interface OnboardingConsentRequest {
  data_use_consent: boolean;
  wellness_recommendations_opt_in?: boolean;
  policy_version: string;
}

export interface FollowUpOption {
  label: string;
  description: string;
  disabled?: boolean;
  value?: boolean;
}

export interface FollowUpConfig {
  type: "severity_sheet" | "toggle_sheet" | "role_sheet" | "text_sheet" | "severity-sheet" | "toggle-sheet" | "role-sheet" | "text-sheet";
  title: string;
  trigger_options?: string[];
  triggerOptions?: string[];
  required_when_triggered?: boolean;
  save_label?: string;
  helper_text?: string;
  options?: FollowUpOption[];
  placeholder?: string;
  max_length?: number;
  maxLength?: number;
}

export interface OnboardingQuestion {
  id: number;
  code?: string;
  question_number?: number;
  question_total?: number;
  category: string;
  readiness_component?: string;
  question: string;
  description: string;
  options: any[];
  answer_type?: string;
  scoreable?: boolean;
  reverse_scored?: boolean;
  estimated_time_label?: string;
  submit_label?: string;
  footer_note?: string;
  support_note_variant?: string;
  follow_up_required?: boolean;
  routing_text?: string;
  routingText?: string;
  routing_trigger?: string[];
  routingTrigger?: string[];
  provider_route?: string;
  follow_up?: FollowUpConfig;
  followUp?: FollowUpConfig;
  answered?: boolean;
  current_answer?: string | string[] | null;
  current_follow_up_answer?: string | string[] | Record<string, boolean> | null;
  ai_tags?: string[];
}

export interface OnboardingAnswerRequest {
  question_id: number;
  answer: string | string[];
  follow_up_answer?: string | string[];
}

export interface OnboardingAnswerResponse {
  success?: boolean;
  next_question_id?: number | null;
  answered_count?: number;
  total_count?: number;
}

export interface BaselineCompleteResponse {
  baseline_ops_score: number;
  baseline_band: string;
  component_scores: Record<string, number>;
}

// ==========================================
// Check-in Models
// ==========================================
export interface CheckinQuestionOption {
  id: string | number;
  title: string;
  subtitle?: string;
  score?: number;
  flag?: string;
}

export interface DailyCheckinQuestion {
  id: number | string;
  question_id?: number;
  driver: string;
  question: string;
  options: (CheckinQuestionOption | string)[];
  follow_up?: any;
  follow_up_required?: boolean;
}

export interface DailyCheckinResponse {
  is_day_zero?: boolean;
  already_completed_today: boolean;
  total_questions?: number;
  questions: DailyCheckinQuestion[];
  answered_questions?: number;
}

export interface SubmitDailyAnswerItem {
  question_id: number | string;
  answer: string;
  follow_up_answer?: string;
}

export interface SubmitDailyCheckinRequest {
  answers: SubmitDailyAnswerItem[];
}

export interface SubmitDailyCheckinResponse {
  current_ops_score?: number;
  current_ops_band?: string;
  trend_delta?: number;
  message?: string;
}

export interface WeeklyGateResponse {
  locked: boolean;
  cadence_label?: string;
  today?: string;
  days_until_open: number;
  next_open_at?: string;
  cadence_start_date?: string;
}

export interface WeeklyCheckinResponse {
  cadence?: string;
  is_open?: boolean;
  days_until_open?: number;
  period_label?: string;
  period_start_date?: string;
  window_closes_in_days?: number;
  questions: DailyCheckinQuestion[];
  already_completed?: boolean;
}

export interface SubmitWeeklyCheckinRequest {
  answers: Array<{ question_id: number | string; answer: string }>;
}

export interface MonthlyCheckinResponse {
  cadence?: string;
  is_open?: boolean;
  days_until_open?: number;
  period_label?: string;
  period_start_date?: string;
  window_closes_in_days?: number;
  questions: DailyCheckinQuestion[];
  already_completed?: boolean;
}

export interface SubmitMonthlyCheckinRequest {
  answers: Array<{ question_id: number | string; answer: string }>;
}

// ==========================================
// Dashboard Models
// ==========================================
export interface CurrentOps {
  ops_score: number;
  ops_band: string;
  band_meaning?: string;
  confidence_level?: string;
  trend_delta?: number;
  last_updated_at?: string;
}

export interface TodaysCheckinSummary {
  already_completed_today: boolean;
  already_completed?: boolean;
  title?: string;
  body?: string;
  cta_label?: string;
  total_questions?: number;
}

export interface DriverTrend {
  readiness_component: string;
  signal_label: string;
  current_score: number;
  stale: boolean;
  trend_points: number[];
}

export interface ComponentScores {
  "Physical Readiness"?: number;
  "Sleep Readiness"?: number;
  "Mental Performance"?: number;
  "Nutritional Readiness"?: number;
  "Spiritual Readiness"?: number;
  [key: string]: number | undefined;
}

export interface SupportPreviewItem {
  key: string;
  label: string;
  description: string;
  availability_status: string;
}

export interface UpcomingItem {
  key: string;
  title: string;
  subtitle: string;
  tag: string;
}

export interface HomeDashboardResponse {
  greeting?: string;
  subtitle?: string;
  date_label?: string;
  current_ops: CurrentOps;
  todays_checkin: TodaysCheckinSummary;
  driver_trends: DriverTrend[];
  component_scores: ComponentScores;
  today_for_you?: any;
  support_preview?: SupportPreviewItem[];
  upcoming?: UpcomingItem[];
  last_updated_label?: string;
}

export interface DriverDetailResponse {
  current_score: number;
  score_band: string;
  trend_points: number[];
  trend_direction: string;
  delta_7d: number;
  delta_30d: number;
  try_this: string[];
  influences: Array<{ key: string; title: string; detail: string }>;
  support_cta_label?: string;
  support_route?: string;
}

export interface ActiveRecommendation {
  id: string;
  readiness_component: string;
  title: string;
  instructions: string;
  assigned_provider_name?: string;
  assigned_provider_role?: string;
  steps?: Array<{ title: string; description: string }>;
  follow_up_timeline?: string;
  status: string;
}

// ==========================================
// API Slice
// ==========================================
export const checkinApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ----------------------------------------
    // Onboarding Endpoints
    // ----------------------------------------
    getOnboardingIntro: builder.query<OnboardingIntroResponse, void>({
      query: () => "/onboarding/intro",
      providesTags: ["Onboarding"],
    }),

    submitOnboardingConsent: builder.mutation<any, OnboardingConsentRequest>({
      query: (body) => ({
        url: "/onboarding/consent",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    getOnboardingQuestions: builder.query<OnboardingQuestion[], void>({
      query: () => "/onboarding/questions",
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.questions)) return response.questions;
        if (response && Array.isArray(response.data)) return response.data;
        return [];
      },
      providesTags: ["Onboarding"],
    }),

    submitOnboardingAnswer: builder.mutation<OnboardingAnswerResponse, OnboardingAnswerRequest>({
      query: (body) => ({
        url: "/onboarding/answer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    completeOnboardingBaseline: builder.mutation<BaselineCompleteResponse, void>({
      query: () => ({
        url: "/onboarding/baseline/complete",
        method: "POST",
      }),
      invalidatesTags: ["Onboarding", "Checkin", "Dashboard", "Profile"],
    }),

    // ----------------------------------------
    // Check-in Endpoints (Daily, Weekly, Monthly)
    // ----------------------------------------
    getDailyCheckin: builder.query<DailyCheckinResponse, void>({
      query: () => "/checkins/daily",
      providesTags: ["Checkin"],
    }),

    submitDailyCheckin: builder.mutation<SubmitDailyCheckinResponse, SubmitDailyCheckinRequest>({
      query: (body) => ({
        url: "/checkins/daily/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Checkin", "Dashboard", "Profile"],
    }),

    getWeeklyCheckinGate: builder.query<WeeklyGateResponse, void>({
      query: () => "/checkins/weekly/gate",
      providesTags: ["Checkin"],
    }),

    getWeeklyCheckin: builder.query<WeeklyCheckinResponse | DailyCheckinQuestion[], void>({
      query: () => "/checkins/weekly",
      providesTags: ["Checkin"],
    }),

    submitWeeklyCheckin: builder.mutation<any, SubmitWeeklyCheckinRequest>({
      query: (body) => ({
        url: "/checkins/weekly/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Checkin", "Dashboard", "Profile"],
    }),

    getMonthlyCheckin: builder.query<MonthlyCheckinResponse | DailyCheckinQuestion[], void>({
      query: () => "/checkins/monthly",
      providesTags: ["Checkin"],
    }),

    submitMonthlyCheckin: builder.mutation<any, SubmitMonthlyCheckinRequest>({
      query: (body) => ({
        url: "/checkins/monthly/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Checkin", "Dashboard", "Profile"],
    }),

    // ----------------------------------------
    // Dashboard Endpoints
    // ----------------------------------------
    getHomeDashboard: builder.query<HomeDashboardResponse, void>({
      query: () => "/dashboards/home",
      providesTags: ["Dashboard"],
    }),

    getTrends: builder.query<any, number | void>({
      query: (days = 30) => `/dashboards/trends?days=${days || 30}`,
      providesTags: ["Dashboard"],
    }),

    getDriverDetail: builder.query<DriverDetailResponse, string>({
      query: (driverName) => `/dashboards/drivers/${encodeURIComponent(driverName)}`,
    }),

    getUnitReport: builder.query<any, void>({
      query: () => "/dashboards/unit-report",
      providesTags: ["Dashboard"],
    }),

    getWellnessReport: builder.query<any, void>({
      query: () => "/dashboards/wellness-report",
      providesTags: ["Dashboard"],
    }),

    getMonthlyReview: builder.query<any, void>({
      query: () => "/dashboards/monthly-review",
      providesTags: ["Dashboard"],
    }),

    getActiveRecommendations: builder.query<ActiveRecommendation[], void>({
      query: () => "/recommendations/active",
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Onboarding Hooks
  useGetOnboardingIntroQuery,
  useSubmitOnboardingConsentMutation,
  useGetOnboardingQuestionsQuery,
  useSubmitOnboardingAnswerMutation,
  useCompleteOnboardingBaselineMutation,

  // Check-in Hooks
  useGetDailyCheckinQuery,
  useSubmitDailyCheckinMutation,
  useGetWeeklyCheckinGateQuery,
  useGetWeeklyCheckinQuery,
  useSubmitWeeklyCheckinMutation,
  useGetMonthlyCheckinQuery,
  useSubmitMonthlyCheckinMutation,

  // Dashboard Hooks
  useGetHomeDashboardQuery,
  useGetTrendsQuery,
  useGetDriverDetailQuery,
  useGetUnitReportQuery,
  useGetWellnessReportQuery,
  useGetMonthlyReviewQuery,
  useGetActiveRecommendationsQuery,
} = checkinApi;
