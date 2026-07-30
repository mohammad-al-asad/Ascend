import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  username: string;
  userId: string;
  role: string;
  provisionedStatus: string;
  firstLoginTimestamp: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingStatus: "incomplete" | "complete";
  onboardingAnswers: Record<string, any>;
  onboardingFollowUps: Record<string, any>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  onboardingStatus: "incomplete",
  onboardingAnswers: {},
  onboardingFollowUps: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLogin: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.user = null;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.onboardingAnswers = {};
      state.onboardingFollowUps = {};
      state.onboardingStatus = "incomplete";
    },
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
    completeOnboarding: (state) => {
      state.onboardingStatus = "complete";
    },
  },
});

export const {
  startLogin,
  loginSuccess,
  loginFailure,
  logout,
  saveOnboardingAnswer,
  saveOnboardingFollowUp,
  completeOnboarding,
} = authSlice.actions;

export default authSlice.reducer;
export type { User, AuthState };
