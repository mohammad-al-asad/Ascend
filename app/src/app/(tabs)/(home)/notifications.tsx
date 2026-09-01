import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  NotificationItem,
} from "../../../redux/api/notificationsApi";

type FilterTab = "all" | "reminders" | "updates" | "unread";

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `${diffHours} hr ago`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `Yesterday · ${timeStr}`;
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  } catch {
    return "";
  }
}

function getNotificationIcon(item: NotificationItem): { icon: any; color: string; bg: string } {
  const family = item.family?.toLowerCase() || "";
  const cat = item.category?.toLowerCase() || "";
  const entityType = item.related_entity_type?.toLowerCase() || "";
  const title = item.title?.toLowerCase() || "";
  const body = item.body?.toLowerCase() || "";

  if (title.includes("sleep") || body.includes("sleep")) {
    return { icon: "moon-outline", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)" };
  }
  if (family.includes("check_in") || entityType.includes("checkin") || cat === "reminders") {
    if (entityType.includes("weekly") || title.includes("weekly")) {
      return { icon: "calendar-outline", color: "#00A3C4", bg: "rgba(0, 163, 196, 0.12)" };
    }
    return { icon: "checkbox-outline", color: "#00A3C4", bg: "rgba(0, 163, 196, 0.12)" };
  }
  if (family.includes("assigned_action") || entityType === "recommendation" || cat === "updates") {
    return { icon: "sparkles-outline", color: "#22C55E", bg: "rgba(34, 197, 94, 0.12)" };
  }
  if (cat === "records" || entityType.includes("record")) {
    return { icon: "document-text-outline", color: "#D97706", bg: "rgba(217, 119, 6, 0.12)" };
  }
  if (title.includes("message") || entityType.includes("message") || entityType.includes("support")) {
    return { icon: "chatbubbles-outline", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" };
  }
  return { icon: "notifications-outline", color: "#00A3C4", bg: "rgba(0, 163, 196, 0.12)" };
}

function NotifRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  const theme = useTheme();
  const iconMeta = getNotificationIcon(item);
  const timeAgo = formatRelativeTime(item.created_at);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notifRow,
        {
          borderBottomColor: theme.colors.cardBorder,
          backgroundColor: pressed
            ? "rgba(255, 255, 255, 0.04)"
            : !item.is_read
              ? "rgba(0, 163, 196, 0.03)"
              : "transparent",
        },
      ]}
    >
      <View style={[styles.notifIconWrapper, { backgroundColor: iconMeta.bg }]}>
        <Ionicons name={iconMeta.icon} size={18} color={iconMeta.color} />
      </View>
      <View style={styles.notifTextBlock}>
        <View style={styles.notifTitleRow}>
          <Text
            style={[
              styles.notifTitle,
              { color: item.is_read ? theme.colors.textSecondary : theme.colors.text },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.notifTime, { color: theme.colors.textTertiary }]}>
            {timeAgo}
          </Text>
        </View>
        <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {!item.is_read && (
        <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
      )}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const queryParams = useMemo(() => {
    if (activeTab === "unread") {
      return { unread_only: true };
    }
    if (activeTab === "reminders" || activeTab === "updates") {
      return { category: activeTab };
    }
    return undefined;
  }, [activeTab]);

  const { data: responseData, isFetching, refetch } = useGetNotificationsQuery(queryParams, {
    pollingInterval: 30000,
  });

  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = responseData?.notifications || [];
  const unreadCount = responseData?.unread_count ?? 0;
  const totalCount = responseData?.total_count ?? 0;
  const categoryCounts = responseData?.category_counts || {};

  // Group notifications chronologically
  const groupedSections = useMemo(() => {
    const todayList: NotificationItem[] = [];
    const yesterdayList: NotificationItem[] = [];
    const earlierList: NotificationItem[] = [];

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayMidnight = todayMidnight - 24 * 60 * 60 * 1000;

    notifications.forEach((item) => {
      const itemTime = new Date(item.created_at).getTime();
      if (itemTime >= todayMidnight) {
        todayList.push(item);
      } else if (itemTime >= yesterdayMidnight) {
        yesterdayList.push(item);
      } else {
        earlierList.push(item);
      }
    });

    return [
      { title: "TODAY", data: todayList },
      { title: "YESTERDAY", data: yesterdayList },
      { title: "EARLIER", data: earlierList },
    ].filter((section) => section.data.length > 0);
  }, [notifications]);

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id).unwrap();
      } catch (err) {
        console.warn("Failed to mark notification as read:", err);
      }
    }

    const entityType = item.related_entity_type?.toLowerCase() || "";
    const family = item.family?.toLowerCase() || "";

    if (family.includes("check_in") || entityType.includes("checkin")) {
      router.push("/(tabs)/(home)/checkin" as any);
    } else if (family.includes("assigned_action") || entityType === "recommendation") {
      router.push("/(tabs)/(home)" as any);
    } else if (entityType.includes("support") || family.includes("support")) {
      router.push("/(tabs)/support" as any);
    } else if (entityType.includes("record") || family.includes("record")) {
      router.push("/(tabs)/profile/records" as any);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.warn("Failed to mark all notifications read:", err);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={styles.opsecBanner}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="Notifications"
        onBack={() => router.back()}
        rightElement={
          unreadCount > 0 ? (
            <Pressable onPress={handleMarkAllRead} disabled={isMarkingAll}>
              <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
                {isMarkingAll ? "Updating..." : "Mark all read"}
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      {/* Filter Tabs / Pills */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          <Pressable
            onPress={() => setActiveTab("all")}
            style={[
              styles.filterPill,
              activeTab === "all"
                ? [styles.filterPillActive, { backgroundColor: theme.colors.primary }]
                : { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: activeTab === "all" ? "#FFFFFF" : theme.colors.textSecondary },
              ]}
            >
              All {totalCount > 0 ? `(${totalCount})` : ""}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("reminders")}
            style={[
              styles.filterPill,
              activeTab === "reminders"
                ? [styles.filterPillActive, { backgroundColor: theme.colors.primary }]
                : { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: activeTab === "reminders" ? "#FFFFFF" : theme.colors.textSecondary },
              ]}
            >
              Reminders {categoryCounts.reminders !== undefined ? `(${categoryCounts.reminders})` : ""}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("updates")}
            style={[
              styles.filterPill,
              activeTab === "updates"
                ? [styles.filterPillActive, { backgroundColor: theme.colors.primary }]
                : { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: activeTab === "updates" ? "#FFFFFF" : theme.colors.textSecondary },
              ]}
            >
              Updates {categoryCounts.updates !== undefined ? `(${categoryCounts.updates})` : ""}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("unread")}
            style={[
              styles.filterPill,
              activeTab === "unread"
                ? [styles.filterPillActive, { backgroundColor: theme.colors.primary }]
                : { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: activeTab === "unread" ? "#FFFFFF" : theme.colors.textSecondary },
              ]}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {isFetching && notifications.length === 0 ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginVertical: 32 }}
          />
        ) : groupedSections.length > 0 ? (
          groupedSections.map((section) => (
            <View key={section.title} style={styles.sectionContainer}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>
                {section.title}
              </Text>
              <View
                style={[
                  styles.listCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                {section.data.map((item) => (
                  <NotifRow
                    key={item.id}
                    item={item}
                    onPress={() => handleNotificationPress(item)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.caughtUpContainer}>
            <Ionicons name="checkmark-circle-outline" size={36} color={theme.colors.textTertiary} />
            <Text style={[styles.caughtUpTitle, { color: theme.colors.text }]}>
              {"You're all caught up"}
            </Text>
            <Text style={[styles.caughtUpSub, { color: theme.colors.textTertiary }]}>
              {activeTab === "unread"
                ? "No unread notifications right now."
                : "No notifications in this category."}
            </Text>
          </View>
        )}

        {/* Footer info */}
        <Text style={[styles.traceSubText, { color: theme.colors.textTertiary }]}>
          Tap any notification to view details. Mark all read above.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  opsecBanner: {
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
    backgroundColor: "#000000",
  },
  opsecText: {
    fontSize: 11,
    fontWeight: "600",
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "700",
  },
  filtersWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  filtersScrollContent: {
    flexDirection: "row",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterPillActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    position: "relative",
  },
  notifIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  notifTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  notifTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
    flexShrink: 0,
  },
  notifBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  unreadDot: {
    position: "absolute",
    top: 18,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  caughtUpContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  caughtUpTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  caughtUpSub: {
    fontSize: 12,
  },
  traceSubText: {
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 0.2,
    marginTop: 12,
  },
});

