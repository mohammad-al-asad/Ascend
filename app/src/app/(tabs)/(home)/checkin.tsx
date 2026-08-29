import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomButton } from "../../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "../../../redux/store";
import { isDailyCheckinAvailable, isWeeklyCheckinAvailable, isMonthlyCheckinAvailable } from "../../../utils/cadenceRules";

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

  const dailyAvailable = isDailyCheckinAvailable(last_daily_submission);
  const weeklyAvailable = day0_daily_checkin_status === "completed" && isWeeklyCheckinAvailable(weekly_cadence_start_date, last_weekly_submission);
  const monthlyAvailable = day0_daily_checkin_status === "completed" && isMonthlyCheckinAvailable(monthly_cadence_start_date, last_monthly_submission);

  const renderCheckinCard = (
    title: string,
    desc: string,
    isAvailable: boolean,
    lockReason: string,
    onPress: () => void
  ) => {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
          {isAvailable ? (
            <View style={[styles.badge, { backgroundColor: "rgba(0, 163, 196, 0.15)" }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Available</Text>
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
          style={{ width: "100%", marginTop: 16, backgroundColor: isAvailable ? theme.colors.primary : theme.colors.cardBorder, borderWidth: 0 }}
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
          Complete your check-ins to provide your team with updated readiness data.
        </Text>

        {renderCheckinCard(
          "Daily check-in",
          "Update your daily physical and mental readiness status.",
          dailyAvailable,
          "Already submitted",
          () => router.push("/checkin/daily" as any)
        )}

        {renderCheckinCard(
          "Weekly check-in",
          "A deeper review of your consistency and recovery over the last 7 days.",
          weeklyAvailable,
          day0_daily_checkin_status === "completed" ? "Already submitted" : "Requires Day 0 completion",
          () => router.push("/checkin/weekly" as any)
        )}

        {renderCheckinCard(
          "Monthly check-in",
          "Review your broader wellness trends and align your goals.",
          monthlyAvailable,
          day0_daily_checkin_status === "completed" ? "Already submitted" : "Requires Day 0 completion",
          () => router.push("/checkin/monthly" as any)
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
