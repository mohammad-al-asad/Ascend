import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

interface RecapItem {
  label: string;
  trend: string;
  trendColor: string;
  score: number;
  dotColor: string;
}

const RECAP_ITEMS: RecapItem[] = [
  { label: "Physical", trend: "↗ +4", trendColor: "#00A3C4", score: 82, dotColor: "#00A3C4" },
  { label: "Sleep", trend: "→ ±0", trendColor: "#8E8E93", score: 74, dotColor: "#8E8E93" },
  { label: "Mental", trend: "↗ +6", trendColor: "#00A3C4", score: 75, dotColor: "#60A5FA" },
  { label: "Nutritional", trend: "↗ +2", trendColor: "#00A3C4", score: 71, dotColor: "#F59E0B" },
  { label: "Spiritual", trend: "↗ +1", trendColor: "#00A3C4", score: 84, dotColor: "#EAB308" },
];

interface ReviewDetailRow {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge: string;
}

const REVIEW_DETAILS: ReviewDetailRow[] = [
  {
    id: "d1",
    icon: "calendar-outline",
    iconColor: "#8E8E93",
    title: "Daily check-ins · 30 days",
    subtitle: "28 of 30 days · 93% cadence",
    badge: "Complete",
  },
  {
    id: "d2",
    icon: "fitness-outline",
    iconColor: "#8E8E93",
    title: "Workouts logged",
    subtitle: "21 sessions · 7 strength · 14 conditioning",
    badge: "On plan",
  },
  {
    id: "d3",
    icon: "shield-checkmark-outline",
    iconColor: "#8E8E93",
    title: "OFT currency",
    subtitle: "Current · next test 22 Aug 2026",
    badge: "Current",
  },
  {
    id: "d4",
    icon: "folder-open-outline",
    iconColor: "#8E8E93",
    title: "Medical records added",
    subtitle: "1 MFR upload · PT/IM review complete",
    badge: "Reviewed",
  },
  {
    id: "d5",
    icon: "chatbubble-outline",
    iconColor: "#8E8E93",
    title: "PT/IM notes for you",
    subtitle: "2 notes · continue current plan · follow up at next OFT",
    badge: "2 new",
  },
];

export default function MonthlyReviewScreen() {
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
            TRENDS · PR-M-063
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Monthly review
          </Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            {"Your locked monthly review for July 2026. Generated 28 July · signed off by PT Knox (USR-7101). Read-only on mobile; full editable report lives in the governed workspace."}
          </Text>
        </View>

        {/* Card 1: Review Status */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardTag, { color: theme.colors.textTertiary }]}>
            REVIEW STATUS
          </Text>
          <View style={styles.statusValRow}>
            <View style={[styles.statusIndicatorDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.statusValText, { color: theme.colors.text }]}>
              Ready to view
            </Text>
          </View>
          <Text style={[styles.statusDescText, { color: theme.colors.textSecondary }]}>
            {"Available from 28 July 2026 · 09:00 UTC. The review is locked — no edits from this surface. Reach out to PT Knox to discuss any item."}
          </Text>
        </View>

        {/* Section: 30-day recap */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          30-day recap
        </Text>

        {/* Card 2: 30-day recap grid */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.recapGrid}>
            {RECAP_ITEMS.map((item, idx) => (
              <View key={idx} style={styles.recapGridItem}>
                <View style={styles.recapItemLeft}>
                  <View style={[styles.colorDot, { backgroundColor: item.dotColor }]} />
                  <Text style={[styles.recapLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>
                </View>
                <View style={styles.recapItemRight}>
                  <Text style={[styles.recapTrend, { color: item.trendColor }]}>
                    {item.trend}
                  </Text>
                  <Text style={[styles.recapScore, { color: theme.colors.text }]}>
                    {item.score}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={[styles.recapFooterText, { color: theme.colors.textSecondary }]}>
            {"Average OPS · 77 · Δ +3 vs prior 30 days. Driver hues viz-only; scores are illustrative (PR-M-022 prototype)."}
          </Text>
        </View>

        {/* Section: In this review */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          In this review
        </Text>

        {/* Card 3: In this review checklist */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {REVIEW_DETAILS.map((item, idx) => {
            const isLast = idx === REVIEW_DETAILS.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.checklistRow,
                  {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.checklistRowLeft}>
                  <View style={[styles.checklistIconCircle, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
                  </View>
                  <View style={styles.checklistTextCol}>
                    <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.checklistSubtitle, { color: theme.colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                <View style={[styles.outcomeBadge, { backgroundColor: "#27272A" }]}>
                  <Text style={[styles.outcomeBadgeText, { color: theme.colors.text }]}>
                    {item.badge}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Card 4: Locked on publish warning */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.lockHeader}>
            <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.lockTag, { color: theme.colors.textSecondary }]}>
              Read-only
            </Text>
          </View>
          <Text style={[styles.lockTitle, { color: theme.colors.text }]}>
            Reviews are locked on publish
          </Text>
          <Text style={[styles.lockDesc, { color: theme.colors.textSecondary }]}>
            {"Once a monthly review is signed off by your PT/IM, the contents are immutable. Any annotation, correction, or follow-up question must go through the support thread or the next check-in. This preserves the audit chain — every figure on this page corresponds to a specific event row in the governed log."}
          </Text>
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

        {/* Privacy Notice Footer */}
        <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
          {"Monthly review · PR-M-063 · Locked summary · k-anonymity (k ≥ 5) · audit chain retained"}
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
  lockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  lockTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  lockDesc: {
    fontSize: 13,
    lineHeight: 18,
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
