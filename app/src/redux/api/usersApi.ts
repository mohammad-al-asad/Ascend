import { baseApi } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestDeactivation: builder.mutation<any, { reason?: string }>({
      query: (body) => ({
        url: "/users/deactivation-requests",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useRequestDeactivationMutation } = usersApi;
