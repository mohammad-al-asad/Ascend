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
          await setTokens(data.access_token, data.refresh_token, data.user);
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
    googleLogin: builder.mutation<any, { id_token: string }>({
      query: (body) => ({
        url: "/auth/google",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await setTokens(data.access_token, data.refresh_token, data.user);
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            })
          );
        } catch (error) {
          // Handled by the caller via unwrap()
        }
      },
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
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
  useGoogleLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useGetMeQuery,
} = authApi;
