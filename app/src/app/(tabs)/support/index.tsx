import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomSwitch } from "../../../components/ui/CustomSwitch";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "../../../redux/store";
import {
  useGetMyTeamQuery,
  useTogglePathwayMutation,
  SupportPathway,
} from "../../../redux/api/supportApi";

export default function SupportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  // Local optimistic state overrides for instant UI updates
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, boolean>>({});

  // RTK Query: fetch team pathways and toggle mutation
  const { data: serverPathways, isLoading, isFetching, refetch } = useGetMyTeamQuery();
  const [togglePathway] = useTogglePathwayMutation();

  const pathways = serverPathways || [];

  const handleToggle = async (pathway: SupportPathway, nextVal: boolean) => {
    if (pathway.always_available) return;

    // Immediately update UI optimistically
    setOptimisticOverrides((prev) => ({ ...prev, [pathway.pathway_key]: nextVal }));

    try {
      await togglePathway({ pathway_key: pathway.pathway_key, enabled: nextVal }).unwrap();
    } catch (err: any) {
      // Revert optimistic update on failure
      setOptimisticOverrides((prev) => ({ ...prev, [pathway.pathway_key]: !nextVal }));
      const errMsg = err?.data?.detail?.message || err?.data?.detail || "Failed to update pathway status.";
      Alert.alert("Pathway Update Error", String(errMsg));
    }
  };

  const getAvatarText = (key: string) => {
    switch (key) {
      case "SCS":
        return "SCS";
      case "PT-IM":
      case "PT":
        return "PT";
      case "Nutritionist":
      case "Nutrition":
        return "N";
      case "Mental Performance":
      case "Mental":
        return "B";
      case "Chaplain":
      case "Purpose":
        return "C";
      default:
        return key.slice(0, 2).toUpperCase();
    }
  };

  const getChatParam = (key: string) => {
    if (key === "PT-IM" || key === "PT") return "lin";
    if (key === "SCS") return "becker";
    return key;
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
        title="My team"
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
        <View style={styles.assignedHeaderRow}>
          <Text style={[styles.assignedHeader, { color: theme.colors.textSecondary }]}>ASSIGNED PROVIDERS</Text>
          {isFetching && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>

        {/* Dynamic Provider Cards */}
        {isLoading && pathways.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.descText, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              Loading team pathways...
            </Text>
          </View>
        ) : pathways.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
              No assigned providers found.
            </Text>
          </View>
        ) : (
          pathways.map((pathway) => {
            const isLocked = pathway.always_available || pathway.status === "locked_on";
            const isOverridePresent = optimisticOverrides[pathway.pathway_key] !== undefined;
            const isEnabled = isOverridePresent
              ? optimisticOverrides[pathway.pathway_key]
              : pathway.status === "enabled";
            const avatarCode = getAvatarText(pathway.pathway_key);

            const badgeBg = isLocked
              ? "rgba(217,119,6,0.1)"
              : isEnabled
                ? "rgba(16,185,129,0.1)"
                : "rgba(239,68,68,0.1)";

            const badgeTextColor = isLocked ? "#D97706" : isEnabled ? "#10B981" : "#EF4444";
            const badgeText = isLocked ? "● Locked on" : isEnabled ? "Enabled" : "Disabled";

            return (
              <View
                key={pathway.pathway_key}
                style={[
                  styles.providerCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
                ]}
              >
                <View style={styles.providerRow}>
                  <View style={[styles.avatar, { backgroundColor: "#27272A" }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.text }]}>{avatarCode}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.providerTitleRow}>
                      <Text style={[styles.providerRole, { color: theme.colors.text }]}>
                        {pathway.role_title || pathway.label}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.statusBadgeText, { color: badgeTextColor }]}>{badgeText}</Text>
                      </View>
                    </View>
                    <Text style={[styles.providerName, { color: theme.colors.textSecondary }]}>
                      {pathway.provider?.name || "Not yet assigned"}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.providerDesc, { color: theme.colors.textSecondary }]}>
                  {pathway.description}
                </Text>

                {/* Active Assigned Action */}
                {pathway.assigned_action && (
                  <View
                    style={[
                      styles.actionBadgeBox,
                      { backgroundColor: "rgba(0,163,196,0.08)", borderColor: "rgba(0,163,196,0.2)" },
                    ]}
                  >
                    <Ionicons name="clipboard-outline" size={14} color={theme.colors.primary} />
                    <Text style={[styles.actionBadgeText, { color: theme.colors.text }]}>
                      {pathway.assigned_action.title}
                    </Text>
                  </View>
                )}

                {/* Follow-up Status */}
                {pathway.follow_up_status && (
                  <View
                    style={[
                      styles.followUpBadgeBox,
                      { backgroundColor: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.2)" },
                    ]}
                  >
                    <Ionicons name="time-outline" size={14} color="#D97706" />
                    <Text style={[styles.followUpBadgeText, { color: "#D97706" }]}>
                      Request {pathway.follow_up_status.status}
                    </Text>
                  </View>
                )}

                {/* Optional Pathway Toggle */}
                {!pathway.always_available && (
                  <View style={styles.switchWrapper}>
                    <CustomSwitch
                      label="Pathway enabled"
                      value={isEnabled}
                      onValueChange={(val) => handleToggle(pathway, val)}
                    />
                  </View>
                )}

                {/* Action Button */}
                <CustomButton
                  label={
                    pathway.messaging_available
                      ? "Send a message"
                      : isEnabled
                        ? "Send a message (Open in v1.1)"
                        : "Enable pathway to message"
                  }
                  onPress={() => {
                    if (pathway.messaging_available) {
                      router.push({
                        pathname: "/support/chat",
                        params: {
                          other_user_id: pathway.provider?.user_id || "",
                          provider: getChatParam(pathway.pathway_key),
                          provider_name: pathway.provider?.name || "",
                          role_title: pathway.role_title || pathway.label,
                          pathway_key: pathway.pathway_key,
                        },
                      } as any);
                    }
                  }}
                  disabled={!pathway.messaging_available}
                  style={{ marginTop: 12 }}
                />
              </View>
            );
          })
        )}

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
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            Performing user {user?.full_name || "Operator"} · {user?.id || user?.email || ""}
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            Policy version ascend-ia-04@1.4.0
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            Trace SUPPORT-7C1A
          </Text>
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
  assignedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  assignedHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
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
  actionBadgeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 10,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  followUpBadgeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  followUpBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  switchWrapper: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
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
