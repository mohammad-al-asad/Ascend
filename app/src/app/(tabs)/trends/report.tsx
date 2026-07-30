import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

interface DriverRow {
  label: string;
  dotColor: string;
  score: number;
  maxScore: number;
}

const DRIVER_SUMMARY_ITEMS: DriverRow[] = [
  { label: "Physical", dotColor: "#00A3C4", score: 82, maxScore: 100 },
  { label: "Sleep", dotColor: "#8E8E93", score: 74, maxScore: 100 },
  { label: "Mental", dotColor: "#60A5FA", score: 69, maxScore: 100 },
  { label: "Nutritional", dotColor: "#F59E0B", score: 76, maxScore: 100 },
  { label: "Spiritual", dotColor: "#EAB308", score: 84, maxScore: 100 },
];

interface StandoutHighlight {
  id: string;
  dotColor: string;
  title: string;
  desc: string;
}

const HIGHLIGHTS: StandoutHighlight[] = [
  {
    id: "h1",
    dotColor: "#22C55E",
    title: "Sleep is trending up",
    desc: "Three of the last four weeks beat your 60-day average.",
  },
  {
    id: "h2",
    dotColor: "#F59E0B",
    title: "Mental is steady but lowest",
    desc: "Worth a conversation with your team if it stays under 70.",
  },
  {
    id: "h3",
    dotColor: "#EF4444",
    title: "Mid-month dip",
    desc: "A one-week dip in physical, now recovered. Worth noting.",
  },
];

export default function WellnessReportScreen() {
  const theme = useTheme();
  const router = useRouter();

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
            PERSONAL WELLNESS · LAST 30 DAYS
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Your readiness story
          </Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            {"A 30-day view of your five drivers and what they say together."}
          </Text>
        </View>

        {/* Card 1: OPS Score Card */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.scoreHeaderRow}>
            <View>
              <Text style={[styles.cardTagText, { color: theme.colors.textTertiary }]}>AVERAGE OPS</Text>
              <View style={styles.largeScoreContainer}>
                <Text style={[styles.largeScoreText, { color: theme.colors.text }]}>76</Text>
                <Text style={[styles.largeScoreUnitText, { color: theme.colors.textSecondary }]}>OPS</Text>
              </View>
            </View>
            <View style={styles.trendBadge}>
              <Ionicons name="arrow-up" size={14} color="#22C55E" style={{ marginRight: 4 }} />
              <Text style={styles.trendBadgeText}>+3 vs prior 30d</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View>
            <Text style={[styles.cardTagText, { color: theme.colors.textTertiary, marginBottom: 4 }]}>BAND</Text>
            <Text style={[styles.bandTitleText, { color: theme.colors.text }]}>Monitor</Text>
            <Text style={[styles.bandDescText, { color: theme.colors.textSecondary }]}>
              Mostly stable, one dip mid-month.
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
            {DRIVER_SUMMARY_ITEMS.map((item, idx) => {
              const fillPercentage = (item.score / item.maxScore) * 100;
              const isLast = idx === DRIVER_SUMMARY_ITEMS.length - 1;
              return (
                <View
                  key={idx}
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
                    <View style={[styles.driverDot, { backgroundColor: item.dotColor }]} />
                    <Text style={[styles.driverLabel, { color: theme.colors.text }]}>
                      {item.label}
                    </Text>
                  </View>

                  <View style={styles.driverRowRight}>
                    {/* Custom progress track */}
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
                      {item.score}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section: What stands out */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          What stands out
        </Text>

        {/* Standout highlight cards */}
        <View style={styles.highlightsContainer}>
          {HIGHLIGHTS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.highlightCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <View style={styles.highlightHeader}>
                <View style={[styles.highlightDot, { backgroundColor: item.dotColor }]} />
                <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
              </View>
              <Text style={[styles.highlightDesc, { color: theme.colors.textSecondary }]}>
                {item.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Leadership notice privacy footer */}
        <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
          {"Your personal wellness report · k-anonymity protected · unit-level views live on the leadership surface"}
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
    color: "#22C55E",
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
