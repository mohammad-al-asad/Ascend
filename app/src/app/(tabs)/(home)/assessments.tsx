import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function AssessmentsScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Completed assessments list details matching the reference screenshot
  const completedAssessments = [
    {
      id: 1,
      title: "Initial HPO/H2F assessment",
      date: "12 Jul 2026 · Above target",
      badgeText: "Strong",
      icon: "barbell-outline",
      iconColor: theme.colors.primary,
    },
    {
      id: 2,
      title: "Quarterly readiness check",
      date: "02 Apr 2026 · On target",
      badgeText: "Steady",
      icon: "flash-outline",
      iconColor: "#8B5CF6", // purple
    },
    {
      id: 3,
      title: "Strength re-assessment",
      date: "14 Feb 2026 · On target",
      badgeText: "Steady",
      icon: "barbell-outline",
      iconColor: "#10B981", // green
    },
    {
      id: 4,
      title: "Cardio re-assessment",
      date: "22 Jan 2026 · Needs focus",
      badgeText: "Flagged",
      icon: "pulse-outline",
      iconColor: theme.colors.dangerText,
    },
    {
      id: 5,
      title: "Recovery baseline",
      date: "05 Dec 2025 · Above target",
      badgeText: "Strong",
      icon: "time-outline",
      iconColor: "#F59E0B", // amber
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="Assessments"
        onBack={() => router.back()}
        rightElement={
          <View style={styles.headerRight}>
            <Pressable style={styles.bellBtn} onPress={() => router.push("/notifications" as any)}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
              <View style={[styles.bellDot, { backgroundColor: theme.colors.primary }]} />
            </Pressable>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Meta Header */}
        <View style={styles.metaHeaderContainer}>
          <Text style={[styles.metaHeaderTag, { color: "#8E8E93" }]}>
            OPERATOR · RECORDS · PR-M-058
          </Text>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
            Assessments
          </Text>
          <Text style={[styles.pageDesc, { color: theme.colors.textSecondary }]}>
            {"Completed assessment history. Summaries only — raw scores are not displayed."}
          </Text>
        </View>

        {/* Privacy Callout */}
        <View style={[styles.privacyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardTag, { color: theme.colors.textTertiary }]}>
            PRIVACY
          </Text>
          <Text style={[styles.privacyBodyText, { color: theme.colors.text }]}>
            {"Canonical scoring is backend-only. You will not see raw scores here."}
          </Text>
        </View>

        {/* Completed list section header */}
        <View style={styles.completedHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            Completed
          </Text>
          <View style={[styles.badgePill, { backgroundColor: "#1C1F26" }]}>
            <Text style={[styles.badgePillText, { color: theme.colors.textSecondary }]}>
              Last 5
            </Text>
          </View>
        </View>

        {/* List card container */}
        <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {completedAssessments.map((item, idx) => {
            const isLast = idx === completedAssessments.length - 1;
            const isFlagged = item.badgeText === "Flagged";
            return (
              <View
                key={item.id}
                style={[
                  styles.listItemRow,
                  {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.listItemLeft}>
                  <View style={[styles.itemIconWrapper, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemDate, { color: theme.colors.textSecondary }]}>
                      {item.date}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.outcomeBadge,
                    {
                      backgroundColor: isFlagged ? "rgba(239, 68, 68, 0.1)" : "#27272A",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.outcomeBadgeText,
                      {
                        color: isFlagged ? theme.colors.dangerText : theme.colors.text,
                      },
                    ]}
                  >
                    {item.badgeText}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* View all text link */}
        <Pressable style={styles.viewAllBtn} onPress={() => alert("Load full history...")}>
          <Text style={[styles.viewAllText, { color: theme.colors.textSecondary }]}>
            View all
          </Text>
        </Pressable>

        {/* Disclaimer Footer */}
        <Text style={[styles.disclaimerText, { color: theme.colors.textTertiary }]}>
          {"Summaries above are qualitative, never numeric. Aggregated summaries live on `recommendations-summary` for leadership."}
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
  },
  opsecText: {
    fontSize: 11,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bellBtn: {
    position: "relative",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaHeaderContainer: {
    marginBottom: 20,
  },
  metaHeaderTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  pageDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  privacyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  privacyBodyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  completedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemDate: {
    fontSize: 12,
    marginTop: 2,
  },
  outcomeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  outcomeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  viewAllBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 32,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
