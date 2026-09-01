import { baseApi } from "./baseApi";

export interface NotificationItem {
  id: string;
  family: string;
  category: string;
  title: string;
  body: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  total_count: number;
  unread_count: number;
  category_counts: {
    updates?: number;
    reminders?: number;
    records?: number;
    [key: string]: number | undefined;
  };
  notifications: NotificationItem[];
}

export interface NotificationsFilterParams {
  category?: "reminders" | "records" | "updates" | null;
  unread_only?: boolean;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, NotificationsFilterParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.category) {
          queryParams.append("category", params.category);
        }
        if (params && params.unread_only) {
          queryParams.append("unread_only", "true");
        }
        const qs = queryParams.toString();
        return `/notifications${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Notifications"],
    }),

    markNotificationRead: builder.mutation<{ marked_read: boolean }, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markAllNotificationsRead: builder.mutation<{ marked_read: number }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
