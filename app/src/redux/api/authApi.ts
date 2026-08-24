import { baseApi } from "./baseApi";
import { setCredentials, logout, UserResponse } from "../slices/authSlice";
import { setTokens, clearTokens } from "../../utils/authStorage";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await setTokens(data.access_token, data.refresh_token);
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            })
          );
        } catch (error) {
          // Handle error gracefully
        }
      },
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await setTokens(data.access_token, data.refresh_token);
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            })
          );
        } catch (error) {
          // Handle error gracefully
        }
      },
    }),
    forgotPassword: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyResetCode: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/verify-reset-code",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<UserResponse, void>({
      query: () => "/auth/me",
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useGetMeQuery,
} = authApi;
