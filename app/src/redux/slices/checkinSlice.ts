import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CheckinState {
  day0_daily_checkin_status: "pending" | "completed";
  weekly_cadence_start_date: string | null;
  monthly_cadence_start_date: string | null;
  last_daily_submission: string | null;
  last_weekly_submission: string | null;
  last_monthly_submission: string | null;
  daily_answers: Record<string, string>;
  weekly_answers: Record<string, string>;
  monthly_answers: Record<string, string>;
}

const initialState: CheckinState = {
  day0_daily_checkin_status: "pending",
  weekly_cadence_start_date: null,
  monthly_cadence_start_date: null,
  last_daily_submission: null,
  last_weekly_submission: null,
  last_monthly_submission: null,
  daily_answers: {},
  weekly_answers: {},
  monthly_answers: {},
};

const checkinSlice = createSlice({
  name: "checkin",
  initialState,
  reducers: {
    saveDailyAnswer: (state, action: PayloadAction<{ id: string; answer: string }>) => {
      state.daily_answers[action.payload.id] = action.payload.answer;
    },
    saveWeeklyAnswer: (state, action: PayloadAction<{ id: string; answer: string }>) => {
      state.weekly_answers[action.payload.id] = action.payload.answer;
    },
    saveMonthlyAnswer: (state, action: PayloadAction<{ id: string; answer: string }>) => {
      state.monthly_answers[action.payload.id] = action.payload.answer;
    },
    submitDailyCheckin: (state) => {
      const now = new Date().toISOString();
      state.last_daily_submission = now;
      if (state.day0_daily_checkin_status === "pending") {
        state.day0_daily_checkin_status = "completed";
        state.weekly_cadence_start_date = now;
        state.monthly_cadence_start_date = now;
      }
      state.daily_answers = {};
    },
    submitWeeklyCheckin: (state) => {
      state.last_weekly_submission = new Date().toISOString();
      state.weekly_answers = {};
    },
    submitMonthlyCheckin: (state) => {
      state.last_monthly_submission = new Date().toISOString();
      state.monthly_answers = {};
    },
  },
});

export const {
  saveDailyAnswer,
  saveWeeklyAnswer,
  saveMonthlyAnswer,
  submitDailyCheckin,
  submitWeeklyCheckin,
  submitMonthlyCheckin,
} = checkinSlice.actions;

export default checkinSlice.reducer;
