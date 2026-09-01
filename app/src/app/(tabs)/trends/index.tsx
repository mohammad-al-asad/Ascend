import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomBottomSheet } from "../../../components/ui/CustomBottomSheet";
import { CustomButton } from "../../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetTrendsQuery, useGetDriverDetailQuery } from "../../../redux/api/checkinApi";

const DRIVER_COLORS: Record<string, string> = {
  "Physical Readiness": "#00A3C4",
  "Physical": "#00A3C4",
  "Sleep Readiness": "#8B5CF6",
  "Sleep": "#8B5CF6",
  "Mental Performance": "#3B82F6",
  "Mental Readiness": "#3B82F6",
  "Mental": "#3B82F6",
  "Nutritional Readiness": "#10B981",
  "Nutrition": "#10B981",
  "Nutritional": "#10B981",
  "Spiritual Readiness": "#F59E0B",
  "Spiritual": "#F59E0B",
};

export default function TrendsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const daysNumber = selectedTimeRange === "7d" ? 7 : selectedTimeRange === "90d" ? 90 : 30;
  const { data: trendsData, isFetching, refetch } = useGetTrendsQuery(daysNumber);

  const rawTrendsData: any = (trendsData as any)?.data || trendsData;
  const driverOverview = rawTrendsData?.driver_overview || [];
  const nextWindows = rawTrendsData?.next_windows || [];
  const opsSeries = rawTrendsData?.ops_series || [];
  const opsHistory = rawTrendsData?.ops_history || [];
  const publicAggregate = rawTrendsData?.public_aggregate;

  // Latest OPS metrics from trends
  const latestOps = opsSeries.length > 0 ? opsSeries[opsSeries.length - 1] : null;
  const latestOpsScore = latestOps?.ops_score;
  const latestOpsBand = latestOps?.ops_band || "Ready";
  const latestOpsConfidence = latestOps?.confidence_level || "medium";

  // Detail Sheet State
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("Physical Readiness");
  const { data: driverDetail, isFetching: isDriverLoading } = useGetDriverDetailQuery(
    selectedDriver,
    {
      skip: !isDetailSheetVisible,
    }
  );

  const handleOpenDriver = (driverName: string) => {
    setSelectedDriver(driverName);
    setIsDetailSheetVisible(true);
  };

  const renderSparkline = (points: number[], color: string) => {
    const width = 140;
    const height = 28;
    if (!points || points.length === 0) {
      return (
        <View style={styles.sparklineContainer}>
          <Svg height={height} width="100%">
            <Path d={`M0,${height / 2} L${width},${height / 2}`} fill="none" stroke="#333336" strokeWidth={1.5} strokeDasharray="3,3" />
          </Svg>
        </View>
      );
    }
    if (points.length === 1) {
      const p = points[0];
      const y = height - (Math.min(100, Math.max(0, p)) / 100) * (height - 8) - 4;
      return (
        <View style={styles.sparklineContainer}>
          <Svg height={height} width="100%">
            <Path d={`M0,${y.toFixed(1)} L${width},${y.toFixed(1)}`} fill="none" stroke={color} strokeWidth={2} opacity={0.8} />
          </Svg>
        </View>
      );
    }
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const step = width / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = idx * step;
      const y = height - ((p - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
      <View style={styles.sparklineContainer}>
        <Svg height={height} width="100%">
          <Path
            d={`M${coords.join(" L")}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  };

  const getDriverColor = (dominantDriver?: string) => {
    if (!dominantDriver) return "#71717A";
    return DRIVER_COLORS[dominantDriver] || "#71717A";
  };

  const renderHistoryGridRow = (bandLabel: string) => {
    const matchingDays = opsHistory.filter(
      (item: any) => item.ops_band?.toLowerCase() === bandLabel.toLowerCase()
    );
    const displayBlocks = matchingDays.slice(0, 12);
    const blocksCount = Math.max(displayBlocks.length, 12);

    return (
      <View style={styles.gridRow}>
        <Text style={[styles.gridRowLabel, { color: theme.colors.textSecondary }]}>
          {bandLabel}
        </Text>
        <View style={styles.gridBlocksContainer}>
          {Array.from({ length: blocksCount }).map((_, idx) => {
            const item = displayBlocks[idx];
            const color = item ? getDriverColor(item.dominant_driver) : "#27272A";
            return (
              <View
                key={idx}
                style={[
                  styles.gridBlock,
                  { backgroundColor: color, opacity: item ? 1 : 0.2 },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="Trends"
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            TRENDS · {rawTrendsData?.period_label?.toUpperCase() || `LAST ${daysNumber} DAYS`}
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>Trends</Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            A {daysNumber}-day longitudinal look across your readiness drivers. Tap any driver for detailed metrics.
          </Text>
        </View>

        {/* Time Range Pills Selector */}
        <View style={styles.timeRangeContainer}>
          <Text style={[styles.timeRangeLabel, { color: theme.colors.textSecondary }]}>TIME RANGE</Text>
          <View style={[styles.pillsRow, { backgroundColor: "#1C1C1E" }]}>
            {(["7d", "30d", "90d"] as const).map((range) => {
              const isActive = selectedTimeRange === range;
              return (
                <Pressable
                  key={range}
                  onPress={() => setSelectedTimeRange(range)}
                  style={[
                    styles.pillButton,
                    {
                      backgroundColor: isActive ? theme.colors.primary : "transparent",
                    },
                  ]}
                >
                  <Text style={[styles.pillText, { color: isActive ? "#FFFFFF" : theme.colors.textSecondary }]}>
                    {range}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* OPS Score Summary Card */}
        {latestOps && (
          <View style={[styles.opsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.opsCardHeader}>
              <Text style={[styles.opsCardTitle, { color: theme.colors.textSecondary }]}>
                {rawTrendsData?.period_label || `Last ${daysNumber} days`} OPS
              </Text>
              <View style={[styles.confidenceBadge, { backgroundColor: "rgba(0, 163, 196, 0.15)" }]}>
                <Text style={[styles.confidenceText, { color: theme.colors.primary }]}>
                  {latestOpsConfidence} confidence
                </Text>
              </View>
            </View>

            <View style={styles.opsScoreRow}>
              <Text style={[styles.opsScoreLarge, { color: theme.colors.text }]}>
                {latestOpsScore !== undefined && latestOpsScore !== null ? Math.round(latestOpsScore) : "--"}
              </Text>
              <View style={[styles.bandBadge, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
                <Text style={[styles.bandBadgeText, { color: theme.colors.success }]}>
                  {latestOpsBand}
                </Text>
              </View>
            </View>

            <View style={styles.opsTrackContainer}>
              <View
                style={[
                  styles.opsTrackFill,
                  {
                    width: `${Math.min(100, Math.max(5, latestOpsScore || 0))}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Driver Overview Grid */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Driver overview</Text>
        <Text style={[styles.compareLabel, { color: theme.colors.textTertiary }]}>
          ▲ vs prior {daysNumber}d period
        </Text>

        <View style={styles.driverGrid}>
          {driverOverview.map((item: any, idx: number) => {
            const compName = item.readiness_component;
            const color = DRIVER_COLORS[compName] || DRIVER_COLORS[item.signal_label] || theme.colors.primary;
            const isSpiritual = compName?.toLowerCase().includes("spiritual");
            const hasScore = item.current_score !== null && item.current_score !== undefined;

            return (
              <Pressable
                key={compName || idx}
                onPress={() => handleOpenDriver(compName)}
                style={[
                  styles.driverCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.cardBorder,
                    width: isSpiritual ? "100%" : "48%",
                  },
                ]}
              >
                <View style={styles.driverHeader}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={[styles.driverName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {item.signal_label || compName}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginVertical: 4 }}>
                  <Text style={[styles.driverScore, { color: theme.colors.text }]}>
                    {hasScore ? item.current_score : "--"}
                  </Text>
                  {item.delta_vs_prior_period !== undefined && item.delta_vs_prior_period !== null && (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: item.delta_vs_prior_period >= 0 ? "#22C55E" : "#EF4444",
                      }}
                    >
                      {item.delta_vs_prior_period > 0 ? `+${item.delta_vs_prior_period}` : `${item.delta_vs_prior_period}`}
                    </Text>
                  )}
                </View>
                {renderSparkline(item.trend_points || (hasScore ? [item.current_score] : []), color)}
              </Pressable>
            );
          })}
        </View>

        {/* OPS History section */}
        <View style={styles.opsHistoryContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>OPS history · 30 days</Text>
          <Text style={[styles.opsHistorySubText, { color: theme.colors.textTertiary }]}>
            Color = dominant driver mix, not status
          </Text>

          <View style={[styles.historyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            {/* Timeline Headers */}
            <View style={styles.gridTimelineHeader}>
              <Text style={[styles.timelineText, { color: theme.colors.textTertiary }]}>30d ago</Text>
              <Text style={[styles.timelineText, { color: theme.colors.textTertiary }]}>15d ago</Text>
              <Text style={[styles.timelineText, { color: theme.colors.textTertiary }]}>Today</Text>
            </View>

            {/* Grid rows */}
            {renderHistoryGridRow("Ready")}
            {renderHistoryGridRow("Monitor")}
            {renderHistoryGridRow("Caution")}
            {renderHistoryGridRow("High Priority")}

            {/* Legend row */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Physical</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#8B5CF6" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Sleep</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Mental</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Nutrition</Text>
              </View>
            </View>

            <Text style={[styles.legendBannerNote, { color: theme.colors.textTertiary }]}>
              Bands are <Text style={{ color: theme.colors.text, fontWeight: "700" }}>readiness labels</Text>, not status colors. Each cell carries a driver hue for visualization only.
            </Text>
          </View>
        </View>

        {/* Next Windows schedule list */}
        {nextWindows && nextWindows.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Next windows</Text>
            <View style={[styles.scheduleCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              {nextWindows.map((win: any, idx: number) => {
                const isLast = idx === nextWindows.length - 1;
                return (
                  <Pressable
                    key={win.key || idx}
                    onPress={() => {
                      // if (win.key === "oft") router.push("/(tabs)/(home)/oft" as any);
                      // else if (win.key === "monthly_review") router.push("/trends/review" as any);
                      // else router.push("/(tabs)/(home)/checkin" as any);
                      if (win.key === "monthly_review") router.push("/(tabs)/(home)/checkin" as any)
                    }}
                    style={[
                      styles.scheduleRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
                    ]}
                  >
                    <View style={styles.scheduleLeft}>
                      <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} style={styles.scheduleIcon} />
                      <View>
                        <Text style={[styles.scheduleName, { color: theme.colors.text }]}>{win.title}</Text>
                        <Text style={[styles.scheduleDate, { color: theme.colors.textSecondary }]}>{win.subtitle}</Text>
                      </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: "#1C1C1E" }]}>
                      <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>{win.tag}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Public Report Callout banner */}
        <Pressable
          onPress={() => router.push("/trends/report" as any)}
          style={[styles.reportCallout, { borderColor: theme.colors.primary }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.reportCalloutTag, { color: theme.colors.primary }]}>PUBLIC AGGREGATE</Text>
            <Text style={[styles.reportCalloutSub, { color: theme.colors.textSecondary }]}>
              {publicAggregate?.reason || "Unit-level readiness — anonymity protected (k ≥ 5)"}
            </Text>
          </View>
        </Pressable>

        <Text style={[styles.refreshText, { color: theme.colors.textTertiary }]}>
          Trends refresh after every check-in submit · {rawTrendsData?.last_updated_label || "Updated recently"}
        </Text>
      </ScrollView>

      {/* Driver Detail Bottom Sheet */}
      <CustomBottomSheet
        visible={isDetailSheetVisible}
        onClose={() => setIsDetailSheetVisible(false)}
        title={selectedDriver}
        subtitle="DRIVER DETAIL"
        snapPoints={["80%"]}
        scrollable={true}
      >
        {isDriverLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 32 }} />
        ) : (
          <>
            <Text style={[styles.sheetSubtitleText, { color: theme.colors.textSecondary }]}>
              Current score {driverDetail?.current_score ?? 75} · band {driverDetail?.score_band || "Ready"}
            </Text>

            {/* Grid of Metric Cards */}
            <View style={styles.sheetGrid}>
              <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
                <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>TREND</Text>
                <View style={styles.sheetGridValueRow}>
                  <Ionicons
                    name={driverDetail?.trend_direction === "down" ? "trending-down" : "trending-up"}
                    size={14}
                    color={driverDetail?.trend_direction === "down" ? "#EF4444" : theme.colors.success}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>
                    {driverDetail?.trend_direction?.toUpperCase() || "STABLE"}
                  </Text>
                </View>
                <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>vs. prior 30d</Text>
              </View>

              <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
                <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>7D Δ</Text>
                <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>
                  {driverDetail?.delta_7d !== undefined && driverDetail?.delta_7d !== null
                    ? `${driverDetail.delta_7d > 0 ? "+" : ""}${driverDetail.delta_7d}`
                    : "--"}
                </Text>
                <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>7-day delta</Text>
              </View>

              <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
                <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>30D Δ</Text>
                <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>
                  {driverDetail?.delta_30d !== undefined && driverDetail?.delta_30d !== null
                    ? `${driverDetail.delta_30d > 0 ? "+" : ""}${driverDetail.delta_30d}`
                    : "--"}
                </Text>
                <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>30-day delta</Text>
              </View>
            </View>

            {/* Influences List */}
            {driverDetail?.influences && driverDetail.influences.length > 0 && (
              <>
                <Text style={[styles.sheetSectionHeader, { color: theme.colors.textTertiary }]}>INFLUENCES</Text>
                <View style={styles.sheetActionList}>
                  {driverDetail.influences.map((inf: any, idx: number) => (
                    <View
                      key={inf.key || idx}
                      style={[
                        styles.sheetActionItem,
                        { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder },
                      ]}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={theme.colors.primary}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.influenceTitle, { color: theme.colors.text }]}>{inf.title}</Text>
                        <Text style={[styles.influenceDetail, { color: theme.colors.textSecondary }]}>
                          {inf.detail}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Try This Recommendations */}
            {driverDetail?.try_this && driverDetail.try_this.length > 0 && (
              <>
                <Text style={[styles.sheetSectionHeader, { color: theme.colors.textTertiary }]}>TRY THIS</Text>
                <View style={styles.sheetActionList}>
                  {driverDetail.try_this.map((item: string, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.sheetActionItem,
                        { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={theme.colors.primary}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={[styles.sheetActionText, { color: theme.colors.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* CTA Button */}
            <CustomButton
              label={driverDetail?.support_cta_label || "Talk to Support Team"}
              onPress={() => {
                setIsDetailSheetVisible(false);
                router.push((driverDetail?.support_route as any) || "/(tabs)/support");
              }}
              icon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
              iconPosition="right"
              style={styles.sheetSubmitBtn}
            />
          </>
        )}
      </CustomBottomSheet>
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
  bellButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  timeRangeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 2,
  },
  pillButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  opsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  opsCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  opsCardTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  opsScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  opsScoreLarge: {
    fontSize: 36,
    fontWeight: "800",
  },
  bandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bandBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  opsTrackContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  opsTrackFill: {
    height: "100%",
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  compareLabel: {
    fontSize: 12,
    marginBottom: 16,
  },
  driverGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  driverCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
    height: 120,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  driverName: {
    fontSize: 13,
    fontWeight: "600",
  },
  driverScore: {
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 4,
  },
  sparklineContainer: {
    height: 30,
    justifyContent: "center",
  },
  opsHistoryContainer: {
    marginBottom: 32,
  },
  opsHistorySubText: {
    fontSize: 12,
    marginBottom: 16,
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  gridTimelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 60,
    marginBottom: 12,
  },
  timelineText: {
    fontSize: 10,
    fontWeight: "600",
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  gridRowLabel: {
    width: 55,
    fontSize: 11,
    fontWeight: "600",
  },
  gridBlocksContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  gridBlock: {
    flex: 1,
    height: 18,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
  },
  legendBannerNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
  },
  scheduleCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleIcon: {
    marginRight: 12,
  },
  scheduleName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  scheduleDate: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  reportCallout: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    backgroundColor: "rgba(0, 163, 196, 0.05)",
    marginBottom: 24,
  },
  reportCalloutTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reportCalloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  reportCalloutSub: {
    fontSize: 12,
  },
  refreshText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
  sheetSubtitleText: {
    fontSize: 13,
    marginBottom: 16,
  },
  sheetGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  sheetGridCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  sheetGridLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sheetGridValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  sheetGridVal: {
    fontSize: 16,
    fontWeight: "700",
  },
  sheetGridSub: {
    fontSize: 10,
  },
  sheetSectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sheetActionList: {
    gap: 8,
    marginBottom: 20,
  },
  sheetActionItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  sheetActionText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  influenceTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  influenceDetail: {
    fontSize: 12,
  },
  sheetSubmitBtn: {
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
  },
});
