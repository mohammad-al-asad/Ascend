import { baseApi } from "./baseApi";

export interface PathwayProvider {
  user_id: string;
  name: string;
}

export interface PathwayFollowUpStatus {
  request_id: string;
  status: string; // "open" | "in_progress" | "resolved"
  created_at: string;
}

export interface PathwayAssignedAction {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
}

export interface SupportPathway {
  pathway_key: string; // e.g. "SCS", "PT-IM", "Nutritionist", "Mental Performance", "Chaplain"
  label: string;
  role_title: string;
  description: string;
  always_available: boolean;
  status: "locked_on" | "enabled" | "disabled";
  messaging_available: boolean;
  provider: PathwayProvider | null;
  follow_up_status: PathwayFollowUpStatus | null;
  assigned_action: PathwayAssignedAction | null;
}

export interface MyTeamResponse {
  pathways: SupportPathway[];
}

export interface TogglePathwayArgs {
  pathway_key: string;
  enabled: boolean;
}

export interface SupportRequestPayload {
  pathway_key: string;
  message?: string;
  context?: string;
}

export interface SupportRequestResponse {
  id: string;
  pathway_key: string;
  pathway_label?: string;
  message?: string;
  context?: string;
  status: "open" | "in_progress" | "resolved" | string;
  priority_flag?: boolean;
  safety_notice?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupportRequestItem extends SupportRequestResponse {}

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyTeam: builder.query<SupportPathway[], void>({
      query: () => "/support/team",
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.pathways)) return response.pathways;
        if (response && response.data && Array.isArray(response.data.pathways)) return response.data.pathways;
        return [];
      },
      providesTags: ["Support"],
    }),
    togglePathway: builder.mutation<SupportPathway, TogglePathwayArgs>({
      query: ({ pathway_key, enabled }) => ({
        url: `/support/team/${encodeURIComponent(pathway_key)}/toggle`,
        method: "POST",
        body: { enabled },
      }),
      async onQueryStarted({ pathway_key, enabled }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          supportApi.util.updateQueryData("getMyTeam", undefined, (draft) => {
            const pathway = draft.find((p) => p.pathway_key === pathway_key);
            if (pathway && !pathway.always_available) {
              pathway.status = enabled ? "enabled" : "disabled";
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["Support"],
    }),
    getSupportPathways: builder.query<any[], void>({
      query: () => "/support/pathways",
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.pathways)) return response.pathways;
        if (response && response.data && Array.isArray(response.data.pathways)) return response.data.pathways;
        return [];
      },
      providesTags: ["Support"],
    }),
    createSupportRequest: builder.mutation<SupportRequestResponse, SupportRequestPayload>({
      query: (payload) => ({
        url: "/support/requests",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Support"],
    }),
    getSupportRequests: builder.query<SupportRequestItem[], void>({
      query: () => "/support/requests",
      providesTags: ["Support"],
    }),
  }),
});

export const {
  useGetMyTeamQuery,
  useTogglePathwayMutation,
  useGetSupportPathwaysQuery,
  useCreateSupportRequestMutation,
  useGetSupportRequestsQuery,
} = supportApi;
