import { baseApi } from "./baseApi";

export interface ProfileResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  unit_id: string | null;
  rank_grade: string | null;
  is_verified: boolean;
  onboarding_completed: boolean;
  onboarding_status: string;
  day0_daily_checkin_status: string;
  current_ops_score: number | null;
  current_ops_band: string | null;
  current_ops_band_meaning: string;
  ops_confidence_level: string;
  onboarding_baseline_ops_score: number | null;
  onboarding_baseline_band: string | null;
  support_pathways_opted_in: string[];
  assigned_scs: { user_id: string; name: string } | null;
  assigned_ptim: { user_id: string; name: string } | null;
  communications_preference: "Regular" | "Limited";
  theme_preference: "light" | "dark";
  notifications_enabled: boolean;
  data_use_consent: boolean;
  wellness_recommendations_opt_in: boolean;
  policy_version_accepted: string | null;
  policy_acknowledged_at: string | null;
  sign_in_activation: {
    is_verified: boolean;
    member_since: string;
    last_login_at: string;
  };
  member_since: string;
}

export interface ProfileSettingsRequest {
  theme_preference?: "light" | "dark";
  notifications_enabled?: boolean;
}

export interface SignInEvent {
  event_type: string;
  method: string;
  outcome: "OK" | "FAIL";
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SignInHistoryResponse {
  last_sign_in: SignInEvent | null;
  recent_history: SignInEvent[];
  activation_date: string;
  deactivation_date: string | null;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestDeactivation: builder.mutation<any, { reason?: string }>({
      query: (body) => ({
        url: "/users/deactivation-requests",
        method: "POST",
        body,
      }),
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => "/users/profile",
      providesTags: ["Profile"],
    }),
    updateProfileSettings: builder.mutation<ProfileResponse, ProfileSettingsRequest>({
      query: (body) => ({
        url: "/users/profile/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    getSignInHistory: builder.query<SignInHistoryResponse, void>({
      query: () => "/users/sign-in-history",
    }),
  }),
  overrideExisting: false,
});

export const {
  useRequestDeactivationMutation,
  useGetProfileQuery,
  useUpdateProfileSettingsMutation,
  useGetSignInHistoryQuery,
} = usersApi;
