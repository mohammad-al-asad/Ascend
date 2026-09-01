import { baseApi } from "./baseApi";

export interface MessageAttachment {
  filename: string;
  url: string;
  size?: number;
  content_type?: string;
}

export interface MessageResponse {
  id: string;
  thread_key?: string;
  thread_id?: string;
  sender_id: string;
  sender_role?: string;
  recipient_id: string;
  body: string;
  is_read?: boolean;
  source_type?: string;
  related_recommendation_id?: string | null;
  attachment?: MessageAttachment | null;
  created_at: string;
  updated_at?: string;
}

export interface ThreadPathwayContext {
  pathway_key: string;
  label: string;
  role_title?: string;
  status?: string;
}

export interface ThreadDetailResponse {
  thread_key: string;
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  pathway_context?: ThreadPathwayContext | null;
  messages: MessageResponse[];
}

export interface ThreadSummary {
  thread_id: string;
  thread_key: string;
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

export interface ThreadsListResponse {
  threads: ThreadSummary[];
}

export interface ScanMessageRequest {
  body: string;
}

export interface ScanMessageResponse {
  blocked_terms: string[];
  severity: number | null;
}

export interface MessageTraceResponse {
  thread_source?: {
    source_type?: "provider_plan_link" | "user_initiated" | string;
    plan_link_id?: string;
    readiness_driver?: string;
    route_level?: string;
    assigned_to?: string;
  };
  last_send_audit?: {
    message_id?: string;
    audit_event_id?: string;
    audit_timestamp?: string;
    attachment_count?: number;
    opsec_scan?: string;
    role_scope?: string;
  } | null;
}

export const messagingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getThreads: builder.query<ThreadsListResponse | ThreadSummary[], void>({
      query: () => "/messaging/threads",
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.threads)) return response.threads;
        if (response && response.data && Array.isArray(response.data.threads)) return response.data.threads;
        return response || [];
      },
      providesTags: ["Messaging"],
    }),

    getThreadWithUser: builder.query<ThreadDetailResponse, string>({
      query: (otherUserId) => `/messaging/thread/${encodeURIComponent(otherUserId)}`,
      providesTags: (result, error, otherUserId) => [{ type: "Messaging", id: otherUserId }],
    }),

    sendMessage: builder.mutation<MessageResponse, FormData>({
      query: (formData) => ({
        url: "/messaging/send",
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: ["Messaging"],
    }),

    scanMessage: builder.mutation<ScanMessageResponse, ScanMessageRequest>({
      query: (payload) => ({
        url: "/messaging/scan",
        method: "POST",
        body: payload,
      }),
    }),

    getMessageTrace: builder.query<MessageTraceResponse, string>({
      query: (messageId) => `/messaging/message/${encodeURIComponent(messageId)}/trace`,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetThreadsQuery,
  useGetThreadWithUserQuery,
  useSendMessageMutation,
  useScanMessageMutation,
  useGetMessageTraceQuery,
  useLazyGetMessageTraceQuery,
} = messagingApi;
