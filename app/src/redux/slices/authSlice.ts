import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  onboarding_completed: boolean;
  onboarding_status: string;
  onboarding_step: number;
  day0_daily_checkin_status: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthLoading: boolean;
  error: string | null;
  // Kept for backward compatibility if needed, but backend handles onboarding state now
  onboardingAnswers: Record<string, any>;
  onboardingFollowUps: Record<string, any>;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthLoading: true,
  error: null,
  onboardingAnswers: {},
  onboardingFollowUps: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserResponse; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isAuthLoading = false;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isAuthLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isAuthLoading = false;
      state.onboardingAnswers = {};
      state.onboardingFollowUps = {};
    },
    // Leaving these for now if components still need them before prompt 2 is done
    saveOnboardingAnswer: (
      state,
      action: PayloadAction<{ questionId: number; answer: any }>
    ) => {
      state.onboardingAnswers[action.payload.questionId] = action.payload.answer;
    },
    saveOnboardingFollowUp: (
      state,
      action: PayloadAction<{ questionId: number; followUpAnswer: any }>
    ) => {
      state.onboardingFollowUps[action.payload.questionId] = action.payload.followUpAnswer;
    },
  },
});

export const {
  setCredentials,
  setAuthLoading,
  updateUser,
  logout,
  saveOnboardingAnswer,
  saveOnboardingFollowUp,
} = authSlice.actions;

export default authSlice.reducer;
