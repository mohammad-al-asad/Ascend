import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  body: string;
  timeAgo: string;
  unread: boolean;
}

const TODAY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    icon: "calendar-outline",
    iconColor: "#00A3C4",
    title: "Daily check-in",
    body: "Daily check-in is open — five questions, about a minute.",
    timeAgo: "14 min ago",
    unread: true,
  },
  {
    id: "n2",
    icon: "fitness-outline",
    iconColor: "#00A3C4",
    title: "OFT reminder",
    body: "Your OFT is scheduled for tomorrow — components begin at 0600.",
    timeAgo: "1 hr ago",
    unread: true,
  },
  {
    id: "n3",
    icon: "refresh-outline",
    iconColor: "#22C55E",
    title: "Plan updated",
    body: "Reconditioning plan updated by your PT/IM — 3 sessions this week.",
    timeAgo: "2 hr ago",
    unread: false,
  },
  {
    id: "n4",
    icon: "person-outline",
    iconColor: "#8E8E93",
    title: "New message",
    body: "New message from your PT/IM about your recovery plan.",
    timeAgo: "3 hr ago",
    unread: false,
  },
  {
    id: "n5",
    icon: "document-text-outline",
    iconColor: "#D97706",
    title: "Record review needed",
    body: "Record review needed — sleep-provider not attached to your weekly.",
    timeAgo: "9:08",
    unread: false,
  },
];

const YESTERDAY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n6",
    icon: "person-outline",
    iconColor: "#8E8E93",
    title: "Recommendation",
    body: "Recommendation from your PT/IM — add a 5-minute wind-down tonight.",
    timeAgo: "Yesterday · 17:42",
    unread: false,
  },
  {
    id: "n7",
    icon: "document-outline",
    iconColor: "#8E8E93",
    title: "Profile update",
    body: "Profile update available — unit & contact details ready to review.",
    timeAgo: "Yesterday · 11:00",
    unread: false,
  },
  {
    id: "n8",
    icon: "fitness-outline",
    iconColor: "#22C55E",
    title: "Sessions due",
    body: "Two reconditioning sessions are due by Sunday to stay on track.",
    timeAgo: "Yesterday · 08:30",
    unread: false,
  },
];

const EARLIER_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n9",
    icon: "calendar-outline",
    iconColor: "#00A3C4",
    title: "Weekly check-in",
    body: "Weekly check-in opens Sunday — five questions, about a minute.",
    timeAgo: "Mon · 12 July",
    unread: false,
  },
  {
    id: "n10",
    icon: "document-text-outline",
    iconColor: "#8E8E93",
    title: "Medical record",
    body: "Medical record upload submitted — awaiting provider review.",
    timeAgo: "Sun · 11 July",
    unread: false,
  },
  {
    id: "n11",
    icon: "person-outline",
    iconColor: "#22C55E",
    title: "Plan assigned",
    body: "Reconditioning plan assigned by PT/IM — initial session scheduled.",
    timeAgo: "Sat · 10 July",
    unread: false,
  },
];

function NotifItem({ item }: { item: NotificationItem }) {
  const theme = useTheme();
  return (
    <Pressable style={[styles.notifRow, { borderBottomColor: theme.colors.cardBorder }]}>
      <View style={[styles.notifIconWrapper, { backgroundColor: "#1C1F26" }]}>
        <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
      </View>
      <View style={styles.notifTextBlock}>
        <View style={styles.notifTitleRow}>
          <Text style={[styles.notifTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.notifTime, { color: theme.colors.textTertiary }]}>
            {item.timeAgo}
          </Text>
        </View>
        <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {item.unread && (
        <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
      )}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const unreadCount =
    TODAY_NOTIFICATIONS.filter((n) => n.unread).length +
    YESTERDAY_NOTIFICATIONS.filter((n) => n.unread).length +
    EARLIER_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="Notifications"
        onBack={() => router.back()}
        rightElement={
          unreadCount > 0 ? (
            <Pressable>
              <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
                Mark all read
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TODAY */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>TODAY</Text>
        <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {TODAY_NOTIFICATIONS.map((item) => (
            <NotifItem key={item.id} item={item} />
          ))}
        </View>

        {/* YESTERDAY */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>YESTERDAY</Text>
        <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {YESTERDAY_NOTIFICATIONS.map((item) => (
            <NotifItem key={item.id} item={item} />
          ))}
        </View>

        {/* EARLIER THIS WEEK */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>EARLIER THIS WEEK</Text>
        <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {EARLIER_NOTIFICATIONS.map((item) => (
            <NotifItem key={item.id} item={item} />
          ))}
        </View>

        {/* Empty state footer */}
        <View style={styles.caughtUpContainer}>
          <Ionicons name="checkmark-circle-outline" size={32} color={theme.colors.textTertiary} />
          <Text style={[styles.caughtUpTitle, { color: theme.colors.text }]}>
            {"You're all caught up"}
          </Text>
          <Text style={[styles.caughtUpSub, { color: theme.colors.textTertiary }]}>
            No new notifications in this view.
          </Text>
        </View>

        {/* Trace footer */}
        <Text style={[styles.traceText, { color: theme.colors.textTertiary }]}>
          {`Retrieved 2026-07-17 11:14 UTC`}
        </Text>
        <Text style={[styles.traceSubText, { color: theme.colors.textTertiary }]}>
          Tap any notification to open. Mark as read or top.
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
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
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  notifTextBlock: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
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
    paddingVertical: 32,
    gap: 8,
  },
  caughtUpTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  caughtUpSub: {
    fontSize: 12,
  },
  traceText: {
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  traceSubText: {
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
