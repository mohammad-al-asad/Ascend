import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetMonthlyReviewQuery } from "../../../redux/api/checkinApi";

// Cosmetic only - the backend doesn't send colors.
const COMPONENT_DOT_COLORS: Record<string, string> = {
  "Physical Readiness": "#00A3C4",
  "Sleep Readiness": "#8E8E93",
  "Mental Readiness": "#60A5FA",
  "Nutritional Readiness": "#F59E0B",
  "Spiritual Readiness": "#EAB308",
};

function trendArrow(delta: number | null): { text: string; color: string } {
  if (delta === null) return { text: "—", color: "#8E8E93" };
  if (delta > 0) return { text: `↗ +${Math.round(delta)}`, color: "#00A3C4" };
  if (delta < 0) return { text: `↘ ${Math.round(delta)}`, color: "#EF4444" };
  return { text: "→ ±0", color: "#8E8E93" };
}

export default function MonthlyReviewScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, isError } = useGetMonthlyReviewQuery();

  const deltaIsUp = (data?.average_ops_delta ?? 0) >= 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="Monthly review"
        onBack={() => router.back()}
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            {data?.period_label ? `TRENDS · ${data.period_label.toUpperCase()}` : "TRENDS"}
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Monthly review
          </Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            {data
              ? `A live summary of your last 30 days (${data.period_start} to ${data.period_end}). Updates automatically as new data comes in — it isn't signed off or locked.`
              : "A live summary of your last 30 days."}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}

        {isError && !isLoading && (
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
            Could not load your monthly review. Pull to refresh or try again shortly.
          </Text>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Card 1: Review Status */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <Text style={[styles.cardTag, { color: theme.colors.textTertiary }]}>
                REVIEW STATUS
              </Text>
              <View style={styles.statusValRow}>
                <View style={[styles.statusIndicatorDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.statusValText, { color: theme.colors.text }]}>
                  Draft summary
                </Text>
              </View>
              <Text style={[styles.statusDescText, { color: theme.colors.textSecondary }]}>
                {"This is an on-demand summary of your own data — not a signed or locked report. Message your team if you have questions about any item."}
              </Text>
            </View>

            {/* Section: 30-day recap */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              30-day recap
            </Text>

            {/* Card 2: 30-day recap grid */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <View style={styles.recapGrid}>
                {data.thirty_day_recap.map((item) => {
                  const trend = trendArrow(item.delta_vs_prior_period);
                  return (
                    <View key={item.readiness_component} style={styles.recapGridItem}>
                      <View style={styles.recapItemLeft}>
                        <View
                          style={[
                            styles.colorDot,
                            { backgroundColor: COMPONENT_DOT_COLORS[item.readiness_component] ?? theme.colors.primary },
                          ]}
                        />
                        <Text style={[styles.recapLabel, { color: theme.colors.text }]}>
                          {item.signal_label}
                        </Text>
                      </View>
                      <View style={styles.recapItemRight}>
                        <Text style={[styles.recapTrend, { color: trend.color }]}>
                          {trend.text}
                        </Text>
                        <Text style={[styles.recapScore, { color: theme.colors.text }]}>
                          {item.current_score !== null ? Math.round(item.current_score) : "—"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              <Text style={[styles.recapFooterText, { color: theme.colors.textSecondary }]}>
                {data.average_ops_score !== null
                  ? `Average OPS · ${Math.round(data.average_ops_score)}${
                      data.average_ops_delta !== null
                        ? ` · Δ ${deltaIsUp ? "+" : ""}${Math.round(data.average_ops_delta)} vs prior 30 days`
                        : ""
                    }`
                  : "Not enough data yet for an average OPS this period."}
              </Text>
            </View>

            {/* Section: In this review */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              In this review
            </Text>

            {/* Card 3: In this review checklist */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <View
                style={[styles.checklistRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }]}
              >
                <View style={styles.checklistRowLeft}>
                  <View style={[styles.checklistIconCircle, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                  </View>
                  <View style={styles.checklistTextCol}>
                    <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                      Daily check-ins · 30 days
                    </Text>
                    <Text style={[styles.checklistSubtitle, { color: theme.colors.textSecondary }]}>
                      {`${data.daily_checkins.days_logged} of ${data.daily_checkins.days_total} days · ${Math.round(data.daily_checkins.cadence_percent)}% cadence`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.outcomeBadge, { backgroundColor: "#27272A" }]}>
                  <Text style={[styles.outcomeBadgeText, { color: theme.colors.text }]}>
                    {data.daily_checkins.cadence_percent >= 90 ? "On cadence" : "Below cadence"}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.checklistRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }]}
              >
                <View style={styles.checklistRowLeft}>
                  <View style={[styles.checklistIconCircle, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name="fitness-outline" size={16} color="#8E8E93" />
                  </View>
                  <View style={styles.checklistTextCol}>
                    <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                      Workouts logged
                    </Text>
                    <Text style={[styles.checklistSubtitle, { color: theme.colors.textSecondary }]}>
                      {`${data.workout_summary.total_sessions} sessions · ${data.workout_summary.completed_sessions} completed · ${data.workout_summary.missed_sessions} missed`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.outcomeBadge, { backgroundColor: "#27272A" }]}>
                  <Text style={[styles.outcomeBadgeText, { color: theme.colors.text }]}>
                    {data.workout_summary.recent_adherence_label}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.checklistRow,
                  data.provider_notes.length > 0
                    ? { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }
                    : { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.checklistRowLeft}>
                  <View style={[styles.checklistIconCircle, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#8E8E93" />
                  </View>
                  <View style={styles.checklistTextCol}>
                    <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                      OFT currency
                    </Text>
                    <Text style={[styles.checklistSubtitle, { color: theme.colors.textSecondary }]}>
                      {data.oft_status.next_scheduled_relative
                        ? `Next test ${data.oft_status.next_scheduled_relative}`
                        : data.oft_status.latest_test_date
                          ? `Last test ${data.oft_status.latest_test_date}`
                          : "No OFT record yet"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.outcomeBadge, { backgroundColor: "#27272A" }]}>
                  <Text style={[styles.outcomeBadgeText, { color: theme.colors.text }]}>
                    {data.oft_status.current_status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              {data.provider_notes.length > 0 && (
                <View style={[styles.checklistRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.checklistRowLeft}>
                    <View style={[styles.checklistIconCircle, { backgroundColor: "#1C1F26" }]}>
                      <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
                    </View>
                    <View style={styles.checklistTextCol}>
                      <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                        Notes from your team
                      </Text>
                      <Text style={[styles.checklistSubtitle, { color: theme.colors.textSecondary }]}>
                        {data.provider_notes[0].body}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.outcomeBadge, { backgroundColor: "#27272A" }]}>
                    <Text style={[styles.outcomeBadgeText, { color: theme.colors.text }]}>
                      {`${data.provider_notes.length} new`}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Button Actions */}
            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => router.back()}
                style={[styles.outlineBtn, { borderColor: theme.colors.cardBorder }]}
              >
                <Ionicons name="arrow-back" size={16} color={theme.colors.text} style={{ marginRight: 6 }} />
                <Text style={[styles.outlineBtnText, { color: theme.colors.text }]}>
                  Back to trends
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/support" as any)}
                style={[styles.filledBtn, { backgroundColor: "#27272A" }]}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.filledBtnText}>
                  Open support thread
                </Text>
              </Pressable>
            </View>

            {/* Footer */}
            <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
              {`Personal monthly review · draft · generated ${new Date(data.generated_at).toLocaleString()}`}
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
  bellBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  titleBlock: {
    marginBottom: 20,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  statusValRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusValText: {
    fontSize: 20,
    fontWeight: "800",
  },
  statusDescText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  recapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  recapGridItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recapItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recapLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  recapItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  recapTrend: {
    fontSize: 11,
    fontWeight: "700",
    marginRight: 8,
  },
  recapScore: {
    fontSize: 14,
    fontWeight: "800",
  },
  recapFooterText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#27272A",
    paddingTop: 12,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  checklistRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checklistIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checklistTextCol: {
    flex: 1,
    marginRight: 8,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  checklistSubtitle: {
    fontSize: 11,
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
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  filledBtn: {
    flex: 1.2,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filledBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  footerNotice: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
