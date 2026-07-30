import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.ascend-readiness.com/v1",
    prepareHeaders: (headers) => {
      // Mock authorization headers
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: () => ({}),
});
