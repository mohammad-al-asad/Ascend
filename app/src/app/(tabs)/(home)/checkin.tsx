import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomButton } from "../../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "../../../redux/store";
import {
  useGetDailyCheckinQuery,
  useGetWeeklyCheckinGateQuery,
  useGetMonthlyCheckinQuery,
} from "../../../redux/api/checkinApi";
import {
  isDailyCheckinAvailable,
  isWeeklyCheckinAvailable,
  isMonthlyCheckinAvailable,
  getDaysUntilWeeklyCheckin,
  getDaysUntilMonthlyCheckin,
} from "../../../utils/cadenceRules";

export default function CheckinGatewayScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    day0_daily_checkin_status,
    weekly_cadence_start_date,
    monthly_cadence_start_date,
    last_daily_submission,
    last_weekly_submission,
    last_monthly_submission,
  } = useAppSelector((state) => state.checkin);

  const { data: dailyData, isLoading: isDailyLoading } = useGetDailyCheckinQuery();
  const { data: weeklyGate, isLoading: isWeeklyLoading } = useGetWeeklyCheckinGateQuery();
  const { data: monthlyData, isLoading: isMonthlyLoading } = useGetMonthlyCheckinQuery();

  const rawWeeklyGate: any = (weeklyGate as any)?.data || weeklyGate;
  const rawMonthlyData: any = (monthlyData as any)?.data || monthlyData;

  const daysUntilWeekly =
    rawWeeklyGate?.days_until_open !== undefined
      ? Number(rawWeeklyGate.days_until_open)
      : getDaysUntilWeeklyCheckin(weekly_cadence_start_date);

  // Monthly end date calculation
  const monthlyEndDateStr = rawMonthlyData?.period_end;
  let formattedMonthlyEndDate = "";
  let daysUntilMonthly = getDaysUntilMonthlyCheckin(monthly_cadence_start_date);

  if (monthlyEndDateStr) {
    const targetDate = new Date(monthlyEndDateStr);
    if (!isNaN(targetDate.getTime())) {
      formattedMonthlyEndDate = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const now = new Date();
      daysUntilMonthly = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }

  // Resolution rules
  const isServerDailyCompleted = dailyData?.already_completed_today;
  const isLocalDailyAvailable = isDailyCheckinAvailable(last_daily_submission);
  const dailyAvailable = isServerDailyCompleted !== undefined ? !isServerDailyCompleted : isLocalDailyAvailable;

  const isServerWeeklyOpen = rawWeeklyGate ? (!rawWeeklyGate.locked && rawWeeklyGate.days_until_open === 0) : false;
  const isLocalWeeklyAvailable =
    (day0_daily_checkin_status === "completed" || dailyData?.already_completed_today) &&
    isWeeklyCheckinAvailable(weekly_cadence_start_date || rawWeeklyGate?.cadence_start_date || null, last_weekly_submission);
  const weeklyAvailable = rawWeeklyGate ? isServerWeeklyOpen : isLocalWeeklyAvailable;

  const isServerMonthlyOpen = rawMonthlyData?.already_completed_this_period === false && daysUntilMonthly === 0;
  const isLocalMonthlyAvailable =
    (day0_daily_checkin_status === "completed" || dailyData?.already_completed_today) &&
    isMonthlyCheckinAvailable(monthly_cadence_start_date, last_monthly_submission);
  const monthlyAvailable = rawMonthlyData ? isServerMonthlyOpen : isLocalMonthlyAvailable;

  const renderCheckinCard = (
    title: string,
    desc: string,
    isAvailable: boolean,
    lockReason: string,
    onPress: () => void,
    isRecommended?: boolean
  ) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: isRecommended ? theme.colors.primary : theme.colors.cardBorder,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
            {isRecommended && (
              <View style={[styles.badge, { backgroundColor: "rgba(0, 163, 196, 0.2)" }]}>
                <Text style={[styles.badgeText, { color: theme.colors.primary, fontSize: 10 }]}>DUE TODAY</Text>
              </View>
            )}
          </View>

          {isAvailable ? (
            <View style={[styles.badge, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
              <Text style={[styles.badgeText, { color: "#22C55E" }]}>Available</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textTertiary }]}>Locked</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>{desc}</Text>

        <CustomButton
          label={isAvailable ? "Start check-in" : lockReason}
          onPress={onPress}
          disabled={!isAvailable}
          style={{
            width: "100%",
            marginTop: 16,
            backgroundColor: isAvailable ? theme.colors.primary : theme.colors.cardBorder,
            borderWidth: 0,
          }}
          textStyle={{ color: isAvailable ? "#FFFFFF" : theme.colors.textTertiary }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="Check-ins"
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
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Your active check-ins</Text>
        <Text style={[styles.pageDesc, { color: theme.colors.textSecondary }]}>
          Complete your scheduled check-ins to maintain your rolling OPS readiness tracking.
        </Text>

        {/* Daily Check-in */}
        {renderCheckinCard(
          "Daily check-in",
          "6 quick readiness questions tracking physical, sleep, recovery, mental, and limitation drivers.",
          Boolean(dailyAvailable && !weeklyAvailable && !monthlyAvailable),
          dailyAvailable ? "Weekly check-in takes priority today" : "Already submitted today",
          () => router.push("/checkin/daily" as any),
          Boolean(dailyAvailable && !weeklyAvailable && !monthlyAvailable)
        )}

        {/* Weekly Check-in */}
        {renderCheckinCard(
          "Weekly check-in",
          rawWeeklyGate?.cadence_label || "10 questions evaluating consistency, training load, and recovery over the last 7 days.",
          Boolean(weeklyAvailable),
          daysUntilWeekly > 0
            ? `Opens in ${daysUntilWeekly} days`
            : day0_daily_checkin_status === "completed" || dailyData?.already_completed_today
              ? "Already submitted this period"
              : "Requires baseline completion",
          () => router.push("/checkin/weekly" as any),
          Boolean(weeklyAvailable)
        )}

        {/* Monthly Check-in */}
        {renderCheckinCard(
          "Monthly check-in",
          "Comprehensive monthly wellness review, goal alignment, and longitudinal review.",
          Boolean(monthlyAvailable),
          formattedMonthlyEndDate
            ? `Opens on ${formattedMonthlyEndDate}`
            : daysUntilMonthly > 0
              ? `Opens in ${daysUntilMonthly} days`
              : day0_daily_checkin_status === "completed" || dailyData?.already_completed_today
                ? "Already submitted this period"
                : "Requires baseline completion",
          () => router.push("/checkin/monthly" as any),
          Boolean(monthlyAvailable)
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  pageDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});
