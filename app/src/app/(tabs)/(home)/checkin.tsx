import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomButton } from "../../../components/ui/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckinGatewayScreen() {
  const theme = useTheme();
  const router = useRouter();

  const handleStartCheckin = () => {
    // Navigate back to the onboarding questionnaire flow
    router.push("/onboarding" as any);
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
        title="Check-in"
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
        {/* Calendar locked status header */}
        <View style={styles.lockStatusHeader}>
          <View style={[styles.calendarIconCircle, { backgroundColor: "rgba(0, 163, 196, 0.15)" }]}>
            <Ionicons name="calendar" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.lockStatusTag, { color: theme.colors.textTertiary }]}>
            CHECK-IN LOCKED
          </Text>
          <Text style={[styles.lockStatusTitle, { color: theme.colors.text }]}>
            {"Weekly check-in opens in 0 days."}
          </Text>
          <Text style={[styles.lockStatusDesc, { color: theme.colors.textSecondary }]}>
            {"Your last weekly check-in was on 07 Jan 26."} 
          </Text>
          <Text style={[styles.lockStatusDesc, { color: theme.colors.textSecondary }]}>
            {"Cadence resets every Tuesday at 0600 local."}
          </Text>
        </View>

        {/* Card 1: Cadence parameters */}
        <View style={[styles.paramsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {/* Row 1 */}
          <View style={[styles.paramRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.paramLabel, { color: theme.colors.textTertiary }]}>CADENCE</Text>
            <Text style={[styles.paramValueLarge, { color: theme.colors.text }]}>Weekly · Tue</Text>
            <Text style={[styles.paramSubtext, { color: theme.colors.textSecondary }]}>first_use_state.weekly_cadence</Text>
          </View>
          {/* Row 2 */}
          <View style={[styles.paramRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.paramLabel, { color: theme.colors.textTertiary }]}>LAST SUBMITTED</Text>
            <Text style={[styles.paramValueLarge, { color: theme.colors.text }]}>07 Jan 26</Text>
            <Text style={[styles.paramSubtext, { color: theme.colors.textSecondary }]}>Tue 09:14</Text>
          </View>
          {/* Row 3 */}
          <View style={styles.paramRow}>
            <Text style={[styles.paramLabel, { color: theme.colors.textTertiary }]}>NEXT OPENS</Text>
            <Text style={[styles.paramValueLarge, { color: theme.colors.text }]}>10 Jan 26 · 0600</Text>
            <Text style={[styles.paramSubtext, { color: theme.colors.textSecondary }]}>+7n cadence</Text>
          </View>
        </View>

        {/* Card 2: Date tracking parameters */}
        <View style={[styles.paramsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {/* Row 1 */}
          <View style={[styles.paramRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.paramLabel, { color: theme.colors.textTertiary }]}>TODAY</Text>
            <Text style={[styles.paramValueLarge, { color: theme.colors.text }]}>18 Jul 26</Text>
          </View>
          {/* Row 2 */}
          <View style={[styles.paramRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.paramLabel, { color: theme.colors.textTertiary }]}>OPENS IN</Text>
            <Text style={[styles.paramValueLarge, { color: theme.colors.text }]}>0 days</Text>
          </View>
          {/* Row 3 */}
          <View style={styles.paramRow}>
            <Text style={[styles.paramLabel, { color: theme.colors.textTertiary }]}>CADENCE START</Text>
            <Text style={[styles.paramValueLarge, { color: theme.colors.text }]}>07 Jan 26</Text>
          </View>
        </View>

        {/* Card 3: Locked Posture Callout Card */}
        <View style={[styles.postureCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardTag, { color: theme.colors.textTertiary }]}>
            LOCKED POSTURE · THIS SURFACE
          </Text>
          
          <View style={styles.ruleList}>
            <View style={styles.ruleRow}>
              <Ionicons name="checkmark" size={16} color={theme.colors.success} style={{ marginRight: 10 }} />
              <Text style={[styles.ruleText, { color: theme.colors.text }]}>
                Daily cadence is always available · separate flow
              </Text>
            </View>
            <View style={styles.ruleRow}>
              <Ionicons name="checkmark" size={16} color={theme.colors.success} style={{ marginRight: 10 }} />
              <Text style={[styles.ruleText, { color: theme.colors.text }]}>
                Weekly cadence · Tue reset honored · next open 10 Jan 26 - 0600
              </Text>
            </View>
            <View style={styles.ruleRow}>
              <Ionicons name="checkmark" size={16} color={theme.colors.success} style={{ marginRight: 10 }} />
              <Text style={[styles.ruleText, { color: theme.colors.text }]}>
                This gate is informational · no scoring, no audit write
              </Text>
            </View>
            <View style={styles.ruleRow}>
              <Ionicons name="checkmark" size={16} color={theme.colors.success} style={{ marginRight: 10 }} />
              <Text style={[styles.ruleText, { color: theme.colors.text }]}>
                OPS / D6 / O3 / O16 isolation unaffected on this surface
              </Text>
            </View>
            <View style={styles.ruleRow}>
              <Ionicons name="checkmark" size={16} color={theme.colors.success} style={{ marginRight: 10 }} />
              <Text style={[styles.ruleText, { color: theme.colors.text }]}>
                Same-day replacement rule preserved on PR-M-021 redirect
              </Text>
            </View>
          </View>
        </View>

        {/* Trace correlation footer */}
        <Text style={[styles.traceText, { color: theme.colors.textTertiary }]}>
          TRACE · CORRELATION  7K2P-2D8M-WLCK
        </Text>

        {/* Cyan Action Button */}
        <CustomButton
          label="Open Daily check-in"
          onPress={handleStartCheckin}
          icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          iconPosition="right"
          style={styles.submitBtn}
        />
        <Text style={[styles.submitBtnSub, { color: theme.colors.textTertiary }]}>
          {"Daily check-in is always available - your weekly cadence is unaffected."}
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
  lockStatusHeader: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  calendarIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  lockStatusTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  lockStatusTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  lockStatusDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: "85%",
  },
  paramsCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  paramRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  paramLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  paramValueLarge: {
    fontSize: 15,
    fontWeight: "800",
  },
  paramSubtext: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: "monospace",
  },
  postureCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  ruleList: {
    gap: 12,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  ruleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontWeight: "500",
  },
  traceText: {
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 24,
    fontFamily: "monospace",
  },
  submitBtn: {
    width: "100%",
  },
  submitBtnSub: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
