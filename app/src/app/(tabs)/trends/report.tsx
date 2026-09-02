import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetWellnessReportQuery } from "../../../redux/api/checkinApi";

// Cosmetic only - the backend doesn't send colors, this keeps each
// component visually consistent with the rest of the app.
const COMPONENT_DOT_COLORS: Record<string, string> = {
  "Physical Readiness": "#00A3C4",
  "Sleep Readiness": "#8E8E93",
  "Mental Readiness": "#60A5FA",
  "Nutritional Readiness": "#F59E0B",
  "Spiritual Readiness": "#EAB308",
};

const SEVERITY_DOT_COLORS: Record<string, string> = {
  positive: "#22C55E",
  watch: "#F59E0B",
  notable: "#EF4444",
};

export default function WellnessReportScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, isError } = useGetWellnessReportQuery();

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
        title="Wellness report"
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
            {data?.period_label?.toUpperCase() ?? "PERSONAL WELLNESS · LAST 30 DAYS"}
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Your readiness story
          </Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            {"A 30-day view of your five drivers and what they say together."}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}

        {isError && !isLoading && (
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
            Could not load your wellness report. Pull to refresh or try again shortly.
          </Text>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Card 1: OPS Score Card */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <View style={styles.scoreHeaderRow}>
                <View>
                  <Text style={[styles.cardTagText, { color: theme.colors.textTertiary }]}>AVERAGE OPS</Text>
                  <View style={styles.largeScoreContainer}>
                    <Text style={[styles.largeScoreText, { color: theme.colors.text }]}>
                      {data.average_ops !== null ? Math.round(data.average_ops) : "—"}
                    </Text>
                    <Text style={[styles.largeScoreUnitText, { color: theme.colors.textSecondary }]}>OPS</Text>
                  </View>
                </View>
                {data.average_ops_delta !== null && (
                  <View style={styles.trendBadge}>
                    <Ionicons
                      name={deltaIsUp ? "arrow-up" : "arrow-down"}
                      size={14}
                      color={deltaIsUp ? "#22C55E" : "#EF4444"}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.trendBadgeText, { color: deltaIsUp ? "#22C55E" : "#EF4444" }]}>
                      {`${deltaIsUp ? "+" : ""}${Math.round(data.average_ops_delta)} vs prior 30d`}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardDivider} />

              <View>
                <Text style={[styles.cardTagText, { color: theme.colors.textTertiary, marginBottom: 4 }]}>BAND</Text>
                <Text style={[styles.bandTitleText, { color: theme.colors.text }]}>{data.band}</Text>
                <Text style={[styles.bandDescText, { color: theme.colors.textSecondary }]}>
                  {data.band_narrative}
                </Text>
              </View>
            </View>

            {/* Section: Driver Summary */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Driver summary
            </Text>

            {/* Card 2: Driver summary card */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <View style={styles.driverList}>
                {data.driver_summary.map((item, idx) => {
                  const fillPercentage = item.average_score !== null ? item.average_score : 0;
                  const isLast = idx === data.driver_summary.length - 1;
                  return (
                    <View
                      key={item.readiness_component}
                      style={[
                        styles.driverRow,
                        {
                          borderBottomWidth: isLast ? 0 : 1,
                          borderBottomColor: theme.colors.cardBorder,
                          paddingBottom: isLast ? 0 : 14,
                          marginBottom: isLast ? 0 : 14,
                        },
                      ]}
                    >
                      <View style={styles.driverRowLeft}>
                        <View
                          style={[
                            styles.driverDot,
                            { backgroundColor: COMPONENT_DOT_COLORS[item.readiness_component] ?? theme.colors.primary },
                          ]}
                        />
                        <Text style={[styles.driverLabel, { color: theme.colors.text }]}>
                          {item.signal_label}
                        </Text>
                      </View>

                      <View style={styles.driverRowRight}>
                        <View style={[styles.progressTrack, { backgroundColor: "#27272A" }]}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: theme.colors.primary,
                                width: `${fillPercentage}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.driverScore, { color: theme.colors.text }]}>
                          {item.average_score !== null ? Math.round(item.average_score) : "—"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Section: What stands out */}
            {data.standout_insights.length > 0 && (
              <>
                <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                  What stands out
                </Text>

                <View style={styles.highlightsContainer}>
                  {data.standout_insights.map((item) => (
                    <View
                      key={item.key}
                      style={[
                        styles.highlightCard,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: theme.colors.cardBorder,
                        },
                      ]}
                    >
                      <View style={styles.highlightHeader}>
                        <View style={[styles.highlightDot, { backgroundColor: SEVERITY_DOT_COLORS[item.severity] ?? theme.colors.textSecondary }]} />
                        <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>
                          {item.title}
                        </Text>
                      </View>
                      <Text style={[styles.highlightDesc, { color: theme.colors.textSecondary }]}>
                        {item.body}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Leadership notice privacy footer */}
            <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
              {data.footer_note}
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
  scoreHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  largeScoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  largeScoreText: {
    fontSize: 48,
    fontWeight: "800",
    lineHeight: 48,
  },
  largeScoreUnitText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 6,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#27272A",
    marginVertical: 16,
  },
  bandTitleText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  bandDescText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  driverList: {
    gap: 0,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  driverRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: "30%",
  },
  driverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  driverLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  driverRowRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  driverScore: {
    fontSize: 13,
    fontWeight: "800",
    width: 22,
    textAlign: "right",
  },
  highlightsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  highlightCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  highlightDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  footerNotice: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
