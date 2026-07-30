import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

interface SparklineProps {
  color: string;
  points: string;
}

const Sparkline: React.FC<SparklineProps> = ({ color, points }) => {
  return (
    <View style={styles.sparklineContainer}>
      <Svg height="30" width="100%">
        <Path d={points} fill="none" stroke={color} strokeWidth={2} />
      </Svg>
    </View>
  );
};

export default function TrendsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  // Mock SVG paths for sparklines
  const sparklineData = {
    physical: "M0,20 Q20,10 40,25 T80,18 T120,24 T160,10 T200,8",
    nutrition: "M0,22 Q20,24 40,16 T80,20 T120,14 T160,18 T200,15",
    mental: "M0,25 Q20,22 40,24 T80,18 T120,20 T160,14 T200,12",
    sleep: "M0,18 Q20,20 40,14 T80,24 T120,20 T160,26 T200,22",
  };

  // Mock OPS History grid colors
  const opsGridColors = [
    theme.colors.primary, // Physical
    "#71717A",           // Sleep (grey)
    "#2563EB",           // Mental (blue)
    "#D97706",           // Nutrition (amber)
  ];

  const renderHistoryGridRow = (rowLabel: string) => {
    // Generate 12 colored square indicators per row
    const squares = [0, 1, 2, 3, 0, 1, 3, 0, 2, 0, 1, 3];
    return (
      <View style={styles.gridRow}>
        <Text style={[styles.gridRowLabel, { color: theme.colors.textSecondary }]}>
          {rowLabel}
        </Text>
        <View style={styles.gridBlocksContainer}>
          {squares.map((colorIdx, idx) => (
            <View
              key={idx}
              style={[
                styles.gridBlock,
                { backgroundColor: opsGridColors[colorIdx] },
              ]}
            />
          ))}
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            TRENDS · LAST 7 DAYS
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>Trends</Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            A 30-day look across your four readiness drivers. Tap any driver for its detail.
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

        {/* Driver Overview Grid */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Driver overview</Text>
        <Text style={[styles.compareLabel, { color: theme.colors.textTertiary }]}>
          ▲ vs prior period
        </Text>

        <View style={styles.driverGrid}>
          {/* Card 1: Physical */}
          <View style={[styles.driverCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.driverHeader}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.driverName, { color: theme.colors.textSecondary }]}>Physical</Text>
            </View>
            <Text style={[styles.driverScore, { color: theme.colors.text }]}>82</Text>
            <Sparkline color={theme.colors.primary} points={sparklineData.physical} />
          </View>

          {/* Card 2: Nutrition */}
          <View style={[styles.driverCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.driverHeader}>
              <View style={[styles.dot, { backgroundColor: "#D97706" }]} />
              <Text style={[styles.driverName, { color: theme.colors.textSecondary }]}>Nutrition</Text>
            </View>
            <Text style={[styles.driverScore, { color: theme.colors.text }]}>76</Text>
            <Sparkline color="#D97706" points={sparklineData.nutrition} />
          </View>

          {/* Card 3: Mental */}
          <View style={[styles.driverCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.driverHeader}>
              <View style={[styles.dot, { backgroundColor: "#2563EB" }]} />
              <Text style={[styles.driverName, { color: theme.colors.textSecondary }]}>Mental</Text>
            </View>
            <Text style={[styles.driverScore, { color: theme.colors.text }]}>69</Text>
            <Sparkline color="#2563EB" points={sparklineData.mental} />
          </View>

          {/* Card 4: Sleep */}
          <View style={[styles.driverCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.driverHeader}>
              <View style={[styles.dot, { backgroundColor: "#71717A" }]} />
              <Text style={[styles.driverName, { color: theme.colors.textSecondary }]}>Sleep</Text>
            </View>
            <Text style={[styles.driverScore, { color: theme.colors.text }]}>74</Text>
            <Sparkline color="#71717A" points={sparklineData.sleep} />
          </View>

          {/* Card 5: Spiritual */}
          <View style={[styles.driverCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, width: "100%" }]}>
            <View style={styles.driverHeader}>
              <View style={[styles.dot, { backgroundColor: "#B45309" }]} />
              <Text style={[styles.driverName, { color: theme.colors.textSecondary }]}>Spiritual</Text>
            </View>
            <Text style={[styles.driverScore, { color: theme.colors.text }]}>82</Text>
            <View style={styles.spiritualProgressWrapper}>
              <Text style={[styles.spiritualMultiplier, { color: theme.colors.textTertiary }]}>× .15</Text>
              <View style={[styles.progressBarBg, { backgroundColor: theme.colors.cardBorder }]}>
                <View style={[styles.progressBarFill, { backgroundColor: "#B45309", width: "82%" }]} />
              </View>
            </View>
          </View>
        </View>

        {/* OPS History section */}
        <View style={styles.opsHistoryContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>OPS history · 30 days</Text>
          <Text style={[styles.opsHistorySubText, { color: theme.colors.textTertiary }]}>Color = driver mix, not status</Text>

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

            {/* Legend row */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Physical</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#71717A" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Sleep</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#2563EB" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Mental</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#D97706" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Nutritional</Text>
              </View>
            </View>

            {/* Extra Legend line */}
            <View style={[styles.legendItem, { marginTop: 8, paddingHorizontal: 10 }]}>
              <View style={[styles.legendDot, { backgroundColor: "#FFFFFF", borderRadius: 2 }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Spirituality</Text>
            </View>

            <Text style={[styles.legendBannerNote, { color: theme.colors.textTertiary }]}>
              Bands are <Text style={{ color: theme.colors.text, fontWeight: "700" }}>readiness labels</Text>, not status colors. Each cell carries a driver hue for visualization only.
            </Text>
          </View>
        </View>

        {/* Next Windows schedule list */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Next windows</Text>
        <View style={[styles.scheduleCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {/* Row 1 */}
          <View style={[styles.scheduleRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <View style={styles.scheduleLeft}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} style={styles.scheduleIcon} />
              <View>
                <Text style={[styles.scheduleName, { color: theme.colors.text }]}>OFT — monthly components</Text>
                <Text style={[styles.scheduleDate, { color: theme.colors.textSecondary }]}>Scheduled · 22 July</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: "#1C1C1E" }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>Operational</Text>
            </View>
          </View>

          {/* Row 2 */}
          <Pressable
            onPress={() => router.push("/trends/review" as any)}
            style={styles.scheduleRow}
          >
            <View style={styles.scheduleLeft}>
              <Ionicons name="stats-chart-outline" size={18} color={theme.colors.textSecondary} style={styles.scheduleIcon} />
              <View>
                <Text style={[styles.scheduleName, { color: theme.colors.text }]}>Monthly review</Text>
                <Text style={[styles.scheduleDate, { color: theme.colors.textSecondary }]}>Available · 28 July</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: "#1C1C1E" }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>Cadence</Text>
            </View>
          </Pressable>
        </View>

        {/* Public Report Callout banner */}
        <Pressable
          onPress={() => router.push("/trends/report" as any)}
          style={[styles.reportCallout, { borderColor: theme.colors.primary }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.reportCalloutTag, { color: theme.colors.primary }]}>PUBLIC AGGREGATE</Text>
            <Text style={[styles.reportCalloutTitle, { color: theme.colors.text }]}>Open full wellness report</Text>
            <Text style={[styles.reportCalloutSub, { color: theme.colors.textSecondary }]}>
              Unit-level readiness — anonymity protected (k ≥ 5)
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
        </Pressable>

        <Text style={[styles.refreshText, { color: theme.colors.textTertiary }]}>
          Trends refresh after every check-in submit · Last updated 14 min ago
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
    borderRadius: 20,
    padding: 4,
  },
  pillButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  compareLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 16,
  },
  driverGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  driverCard: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  driverName: {
    fontSize: 12,
    fontWeight: "600",
  },
  driverScore: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  sparklineContainer: {
    height: 30,
    marginTop: 4,
  },
  spiritualProgressWrapper: {
    marginTop: 8,
  },
  spiritualMultiplier: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  opsHistoryContainer: {
    marginBottom: 32,
  },
  opsHistorySubText: {
    fontSize: 11,
    marginBottom: 12,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  gridTimelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  timelineText: {
    fontSize: 11,
    fontWeight: "700",
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  gridRowLabel: {
    width: 60,
    fontSize: 12,
    fontWeight: "600",
  },
  gridBlocksContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridBlock: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    flexWrap: "wrap",
    gap: 8,
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
    fontWeight: "600",
  },
  legendBannerNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#27272A",
    paddingTop: 12,
  },
  scheduleCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scheduleIcon: {
    marginRight: 12,
  },
  scheduleName: {
    fontSize: 14,
    fontWeight: "700",
  },
  scheduleDate: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  reportCallout: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(0,163,196,0.03)",
  },
  reportCalloutTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reportCalloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  reportCalloutSub: {
    fontSize: 12,
  },
  refreshText: {
    fontSize: 11,
    textAlign: "center",
  },
});
