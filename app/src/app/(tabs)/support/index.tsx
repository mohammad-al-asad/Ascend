import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomSwitch } from "../../../components/ui/CustomSwitch";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Pathway toggle states
  const [nutritionEnabled, setNutritionEnabled] = useState(true);
  const [mentalEnabled, setMentalEnabled] = useState(false);
  const [spiritualEnabled, setSpiritualEnabled] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="My team"
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title and metadata tag */}
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            OPERATOR · MY SUPPORT TEAM · PR-M-040
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>My team</Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            Your assigned providers and pathway enable status. You control who is on your team.
          </Text>
        </View>

        {/* Privacy Info Card */}
        <View style={[styles.infoCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.infoCardTag, { color: theme.colors.textSecondary }]}>PRIVACY</Text>
          <Text style={[styles.infoCardText, { color: theme.colors.textSecondary }]}>
            Your SCS and PT/IM are assigned automatically. The other pathways are optional and you control enable/disable. Toggle changes are logged.
          </Text>
        </View>

        {/* Reach Out Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>REACH OUT</Text>
          <Text style={[styles.cardTitleText, { color: theme.colors.text }]}>Request support</Text>
          <Text style={[styles.cardDescText, { color: theme.colors.textSecondary }]}>
            {"Pick a topic — Fitness, Injury, Nutrition, Mental, or Purpose. We'll route to the right specialist."}
          </Text>
          <Pressable
            onPress={() => router.push("/support/request" as any)}
            style={[styles.cyanButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.cyanButtonText}>Request support</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Assigned Providers Header */}
        <Text style={[styles.assignedHeader, { color: theme.colors.textSecondary }]}>ASSIGNED PROVIDERS</Text>

        {/* Provider 1: Strength & Conditioning */}
        <View style={[styles.providerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.providerRow}>
            <View style={[styles.avatar, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.avatarText, { color: theme.colors.text }]}>SCS</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.providerTitleRow}>
                <Text style={[styles.providerRole, { color: theme.colors.text }]}>
                  Strength & Conditioning Specialist
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: "rgba(217,119,6,0.1)" }]}>
                  <Text style={[styles.statusBadgeText, { color: "#D97706" }]}>● Locked on</Text>
                </View>
              </View>
              <Text style={[styles.providerName, { color: theme.colors.textSecondary }]}>
                tsgt. becker · 10 MDG · USR-9821
              </Text>
            </View>
          </View>
          <Text style={[styles.providerDesc, { color: theme.colors.textSecondary }]}>
            Builds and adjusts your daily training plan, monitors recovery, and runs OFT-aligned conditioning.
          </Text>
          <CustomButton
            label="Send a message"
            onPress={() => router.push("/support/chat?provider=becker" as any)}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Provider 2: Physical Therapy */}
        <View style={[styles.providerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.providerRow}>
            <View style={[styles.avatar, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.avatarText, { color: theme.colors.text }]}>PT</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.providerTitleRow}>
                <Text style={[styles.providerRole, { color: theme.colors.text }]}>
                  Physical Therapy / Injury Management
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: "rgba(217,119,6,0.1)" }]}>
                  <Text style={[styles.statusBadgeText, { color: "#D97706" }]}>● Locked on</Text>
                </View>
              </View>
              <Text style={[styles.providerName, { color: theme.colors.textSecondary }]}>
                capt. lin · 21 MDS · USR-7101
              </Text>
            </View>
          </View>
          <Text style={[styles.providerDesc, { color: theme.colors.textSecondary }]}>
            Injury screening, reconditioning plans, and post-injury return-to-duty clearance.
          </Text>
          <CustomButton
            label="Send a message"
            onPress={() => router.push("/support/chat?provider=lin" as any)}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Provider 3: Performance Nutrition */}
        <View style={[styles.providerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.providerRow}>
            <View style={[styles.avatar, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.avatarText, { color: theme.colors.text }]}>N</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.providerTitleRow}>
                <Text style={[styles.providerRole, { color: theme.colors.text }]}>
                  Performance Nutrition
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: nutritionEnabled ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: nutritionEnabled ? "#10B981" : "#EF4444" }]}>
                    {nutritionEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.providerName, { color: theme.colors.textSecondary }]}>
                ms. delaney · 10 MDG · USR-7301
              </Text>
            </View>
          </View>
          <Text style={[styles.providerDesc, { color: theme.colors.textSecondary }]}>
            Fueling strategies, hydration, and meal-planning tied to training load.
          </Text>
          <CustomSwitch
            label="Pathway enabled"
            value={nutritionEnabled}
            onValueChange={setNutritionEnabled}
          />
          <CustomButton
            label="Send a message (Open in v1.1)"
            onPress={() => {}}
            disabled={true}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Provider 4: Mental Performance */}
        <View style={[styles.providerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.providerRow}>
            <View style={[styles.avatar, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.avatarText, { color: theme.colors.text }]}>B</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.providerTitleRow}>
                <Text style={[styles.providerRole, { color: theme.colors.text }]}>
                  Mental Performance - Behavioral
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: mentalEnabled ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: mentalEnabled ? "#10B981" : "#EF4444" }]}>
                    {mentalEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.providerName, { color: theme.colors.textSecondary }]}>
                dr. fields · 10 MDG · USR-7401
              </Text>
            </View>
          </View>
          <Text style={[styles.providerDesc, { color: theme.colors.textSecondary }]}>
            Stress management, performance anxiety, and mental skills for high-tempo ops.
          </Text>
          <CustomSwitch
            label="Pathway enabled"
            value={mentalEnabled}
            onValueChange={setMentalEnabled}
          />
          <CustomButton
            label="Send a message (Open in v1.1)"
            onPress={() => {}}
            disabled={true}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Provider 5: Purpose / Spiritual */}
        <View style={[styles.providerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.providerRow}>
            <View style={[styles.avatar, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.avatarText, { color: theme.colors.text }]}>C</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.providerTitleRow}>
                <Text style={[styles.providerRole, { color: theme.colors.text }]}>
                  Purpose / Spiritual - Chaplain
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: spiritualEnabled ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: spiritualEnabled ? "#10B981" : "#EF4444" }]}>
                    {spiritualEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.providerName, { color: theme.colors.textSecondary }]}>
                ch. taylor · 10 MDG · USR-7501
              </Text>
            </View>
          </View>
          <Text style={[styles.providerDesc, { color: theme.colors.textSecondary }]}>
            Confidential conversations about purpose, meaning, and values - no record retention beyond minimum required.
          </Text>
          <CustomSwitch
            label="Pathway enabled"
            value={spiritualEnabled}
            onValueChange={setSpiritualEnabled}
          />
          <CustomButton
            label="Send a message (Open in v1.1)"
            onPress={() => {}}
            disabled={true}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Communication preference */}
        <View style={styles.prefSection}>
          <Text style={[styles.prefSectionTitle, { color: theme.colors.text }]}>COMMUNICATION PREFERENCE</Text>
          <Text style={[styles.prefSectionDesc, { color: theme.colors.textSecondary }]}>
            Per IA-10 §3 cross-cutting messaging behaviors, only in-app messaging is enabled in v1. Push notifications and email are open decisions deferred to v1.1.
          </Text>
          <View style={[styles.prefCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={[styles.prefRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.prefKey, { color: theme.colors.text }]}>In-app messaging</Text>
              <Text style={[styles.prefVal, { color: "#10B981" }]}>enabled - v1</Text>
            </View>
            <View style={[styles.prefRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.prefKey, { color: theme.colors.text }]}>Push notifications</Text>
              <Text style={[styles.prefVal, { color: "#D97706" }]}>[Open] v1.1</Text>
            </View>
            <View style={styles.prefRow}>
              <Text style={[styles.prefKey, { color: theme.colors.text }]}>Email digests</Text>
              <Text style={[styles.prefVal, { color: "#D97706" }]}>[Open] v1.1</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>Performing user capt.lin · USR-6601</Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>Policy version ascend-ia-04@1.4.0</Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>Trace SUPPORT-7C1A</Text>
        </View>
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
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoCardTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardDescText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  cyanButton: {
    height: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cyanButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  assignedHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  providerCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
  },
  providerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  providerRole: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  providerName: {
    fontSize: 12,
    marginTop: 4,
  },
  providerDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#27272A",
    paddingTop: 16,
  },
  fadedButton: {
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    flex: 1,
    marginRight: 16,
  },
  fadedButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  prefSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  prefSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prefSectionDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  prefCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  prefKey: {
    fontSize: 13,
    fontWeight: "600",
  },
  prefVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  footerContainer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
  },
});
