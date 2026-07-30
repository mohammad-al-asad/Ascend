import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import authReducer from "./slices/authSlice";
import { baseApi } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// TypeScript typings for store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for dispatch and selector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
