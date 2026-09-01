import { baseApi } from "./baseApi";
import { updateUser } from "../slices/authSlice";
import { saveUser } from "../../utils/authStorage";

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            const updatedUser = {
              id: data.id,
              email: data.email,
              full_name: data.full_name,
              role: data.role,
              is_active: true,
              is_verified: data.is_verified,
              onboarding_completed: data.onboarding_completed,
              onboarding_status: data.onboarding_status,
              onboarding_step:
                data.onboarding_status === "completed"
                  ? "day0_daily_checkin"
                  : "in_progress",
              day0_daily_checkin_status: data.day0_daily_checkin_status,
              current_ops_score: data.current_ops_score,
              current_ops_band: data.current_ops_band,
              ops_confidence_level: data.ops_confidence_level,
              unit_id: data.unit_id,
              created_at: data.member_since,
              updated_at: data.sign_in_activation?.last_login_at || "",
              last_login_at: data.sign_in_activation?.last_login_at || null,
            };
            dispatch(updateUser(updatedUser as any));
            await saveUser(updatedUser);
          }
        } catch {
          // ignore background fetch failures
        }
      },
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
