import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGetMyAssessmentsQuery, AssessmentResponse } from "../../../redux/api/assessmentsApi";

const TYPE_ICONS: Record<string, string> = {
  initial: "barbell-outline",
  annual_follow_up: "refresh-outline",
  quarterly_readiness_check: "flash-outline",
  strength_reassessment: "barbell-outline",
  cardio_reassessment: "pulse-outline",
  recovery_baseline: "time-outline",
};

const TYPE_ICON_COLORS: Record<string, string> = {
  initial: "#00A3C4",
  annual_follow_up: "#8B5CF6",
  quarterly_readiness_check: "#8B5CF6",
  strength_reassessment: "#10B981",
  cardio_reassessment: "#EF4444",
  recovery_baseline: "#F59E0B",
};

export default function AssessmentsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, isError } = useGetMyAssessmentsQuery();

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

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}

        {isError && !isLoading && (
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
            Could not load your assessments. Pull to refresh or try again shortly.
          </Text>
        )}

        {!isLoading && !isError && data && (
          <>
            {data.active.length > 0 && (
              <>
                <Text style={[styles.sectionHeading, { color: theme.colors.text, marginBottom: 12 }]}>
                  Due / scheduled
                </Text>
                <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                  {data.active.map((item, idx) => {
                    const isLast = idx === data.active.length - 1;
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.listItemRow,
                          { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: theme.colors.cardBorder },
                        ]}
                      >
                        <View style={styles.listItemLeft}>
                          <View style={[styles.itemIconWrapper, { backgroundColor: "#1C1F26" }]}>
                            <Ionicons
                              name={(TYPE_ICONS[item.assessment_type] ?? "clipboard-outline") as any}
                              size={18}
                              color={TYPE_ICON_COLORS[item.assessment_type] ?? theme.colors.primary}
                            />
                          </View>
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                              {item.display_title}
                            </Text>
                            <Text style={[styles.itemDate, { color: theme.colors.textSecondary }]}>
                              {item.scheduled_date
                                ? `Scheduled ${item.scheduled_date}`
                                : item.due_date
                                  ? `Due ${item.due_date}`
                                  : "Not yet scheduled"}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.outcomeBadge, { backgroundColor: "#27272A" }]}>
                          <Text style={[styles.outcomeBadgeText, { color: theme.colors.text }]}>
                            {item.status.replace("_", " ")}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* Completed list section header */}
            <View style={styles.completedHeaderRow}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                Completed
              </Text>
              <View style={[styles.badgePill, { backgroundColor: "#1C1F26" }]}>
                <Text style={[styles.badgePillText, { color: theme.colors.textSecondary }]}>
                  {`Last ${Math.min(data.completed.length, data.completed_total)} of ${data.completed_total}`}
                </Text>
              </View>
            </View>

            {data.completed.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No completed assessments yet.
              </Text>
            ) : (
              <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                {data.completed.map((item: AssessmentResponse, idx) => {
                  const isLast = idx === data.completed.length - 1;
                  const isFlagged = item.result_band === "flagged";
                  const badgeText = item.result_band
                    ? item.result_band.charAt(0).toUpperCase() + item.result_band.slice(1)
                    : "—";
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.listItemRow,
                        { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: theme.colors.cardBorder },
                      ]}
                    >
                      <View style={styles.listItemLeft}>
                        <View style={[styles.itemIconWrapper, { backgroundColor: "#1C1F26" }]}>
                          <Ionicons
                            name={(TYPE_ICONS[item.assessment_type] ?? "clipboard-outline") as any}
                            size={18}
                            color={isFlagged ? theme.colors.dangerText : (TYPE_ICON_COLORS[item.assessment_type] ?? theme.colors.primary)}
                          />
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                            {item.display_title}
                          </Text>
                          <Text style={[styles.itemDate, { color: theme.colors.textSecondary }]}>
                            {`${item.completed_date ?? "—"}${item.result_band_label ? ` · ${item.result_band_label}` : ""}`}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.outcomeBadge,
                          { backgroundColor: isFlagged ? "rgba(239, 68, 68, 0.1)" : "#27272A" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.outcomeBadgeText,
                            { color: isFlagged ? theme.colors.dangerText : theme.colors.text },
                          ]}
                        >
                          {badgeText}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Disclaimer Footer */}
            <Text style={[styles.disclaimerText, { color: theme.colors.textTertiary }]}>
              {"Summaries above are qualitative, never numeric. Aggregated summaries live on `recommendations-summary` for leadership."}
            </Text>
          </>
        )}
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
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
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
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
