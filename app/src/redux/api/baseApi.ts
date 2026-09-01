import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from 'async-mutex';
import { RootState } from "../store";
import { logout, setCredentials } from "../slices/authSlice";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  // baseUrl: process.env.EXPO_PUBLIC_API_URL || "https://monorail-lagoon-pettiness.ngrok-free.dev/api/v1",
  baseUrl: "https://monorail-lagoon-pettiness.ngrok-free.dev/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      console.log("Authenticated request: access token attached");
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (headers.get("Content-Type") === "multipart/form-data" || headers.get("Content-Type") === "NONE") {
      headers.delete("Content-Type");
    } else if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
});

const unwrappedBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.data && typeof result.data === 'object' && 'data' in result.data) {
    return { data: (result.data as any).data };
  }
  return result;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await unwrappedBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as RootState).auth.refreshToken;
        if (refreshToken) {
          const refreshResult = await unwrappedBaseQuery(
            {
              url: '/auth/refresh',
              method: 'POST',
              body: { refresh_token: refreshToken }
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const data = refreshResult.data as any;
            // Store the new token
            api.dispatch(setCredentials({
              user: data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token
            }));
            // Retry the initial query
            result = await unwrappedBaseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile", "Checkin", "Dashboard", "Onboarding", "Notifications", "Support", "Messaging"],
  endpoints: () => ({}),
});
