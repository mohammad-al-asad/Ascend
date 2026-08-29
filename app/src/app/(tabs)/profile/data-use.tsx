import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetDataUseSummaryQuery } from "../../../redux/api/recordsApi";
import { ActivityIndicator } from "react-native";

export default function DataUseScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useGetDataUseSummaryQuery();

  const renderSectionList = (items: any[]) => {
    return (
      <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <View
              key={idx}
              style={[
                styles.itemRow,
                {
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: theme.colors.cardBorder,
                  paddingBottom: isLast ? 0 : 14,
                  marginBottom: isLast ? 0 : 14,
                },
              ]}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: "#1C1F26" }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.icon_color} />
                </View>
                <View style={styles.itemTextContainer}>
                  <View style={styles.itemTitleRow}>
                    <Text style={[styles.itemTitleText, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  <Text style={[styles.itemDescText, { color: theme.colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
              </View>

              <View style={[styles.badge, { backgroundColor: "#27272A" }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                  {item.badge}
                </Text>
              </View>
            </View>
          );
        })}
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
        title="Data-use summary"
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
            OPERATOR · RECORDS · PR-M-064
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Data-use summary
          </Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            {"A plain-language look at what Ascend stores, who can see it, and where the boundaries are. No PII on this page — this is just the rules."}
          </Text>
        </View>

        {/* System Boundary Banner */}
        <View style={[styles.boundaryCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.boundaryTag, { color: theme.colors.textSecondary }]}>
            SYSTEM-OF-RECORD BOUNDARY
          </Text>
          <Text style={[styles.boundaryText, { color: theme.colors.text }]}>
            Ascend is not OMPF/iPERMS, MHS GENESIS, or AHLTA. Medical records you upload into Ascend are controlled copies used for performance support — they are not authoritative records.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ margin: 24 }} color={theme.colors.primary} />
        ) : data ? (
          <>
            {/* Section: What Ascend stores */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              What Ascend stores
            </Text>
            {renderSectionList(data.what_we_store)}

            {/* Section: What Ascend does not store */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              What Ascend does not store
            </Text>
            {renderSectionList(data.what_we_do_not_store)}

            {/* Section: Who can see your data */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Who can see your data
            </Text>
            <Text style={[styles.sectionSubtext, { color: theme.colors.textSecondary }]}>
              Access is role-bound and minimum-necessary. Every read of a medical record is audited.
            </Text>
            {renderSectionList(data.who_can_see)}

            {/* Section: What we audit */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              What we audit
            </Text>
            {renderSectionList(data.what_we_audit)}
          </>
        ) : null}

        {/* Section: Your controls */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Your controls
        </Text>

        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, marginBottom: 16 }]}>
          <View style={styles.itemRowNoBorder}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: "#1C1F26" }]}>
                <Ionicons name="settings-outline" size={18} color="#00A3C4" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitleText, { color: theme.colors.text }]}>
                  Consent toggles
                </Text>
                <Text style={[styles.itemDescText, { color: theme.colors.textSecondary }]}>
                  Set during onboarding. Data-use consent + recommendation messages opt-in. Updated through your SCS.
                </Text>
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                Read-only here
              </Text>
            </View>
          </View>
        </View>

        {/* Account Deactivation Card */}
        <View style={[styles.deactivateCard, { borderColor: "#EF4444" }]}>
          <View style={styles.deactivateLeft}>
            <View style={styles.deactivateIconCircle}>
              <Ionicons name="warning-outline" size={18} color="#EF4444" />
            </View>
            <View style={styles.deactivateTextCol}>
              <View style={styles.deactivateHeaderRow}>
                <Text style={[styles.deactivateTitleText, { color: theme.colors.text }]}>
                  Deactivate your account
                </Text>
                <View style={styles.irreversibleBadge}>
                  <Text style={styles.irreversibleBadgeText}>IRREVERSIBLE</Text>
                </View>
              </View>
              <Text style={[styles.deactivateDescText, { color: theme.colors.textSecondary }]}>
                Routes an audit-trail entry to the admin queue. No data deletion occurs from this surface.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/profile/activation" as any)}
            style={[styles.requestBtn, { borderColor: theme.colors.cardBorder }]}
          >
            <Text style={[styles.requestBtnText, { color: theme.colors.text }]}>
              Request
            </Text>
            <Ionicons name="arrow-forward" size={12} color={theme.colors.text} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        {/* Footer trace notice notice */}
        <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
          {"Trace id M-064 · v1 prototype · plain-language summary; full notice available on the Fly Away Kit page."}
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
  boundaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  boundaryTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  boundaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  sectionSubtext: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 12,
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemRowNoBorder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  itemTitleText: {
    fontSize: 13,
    fontWeight: "800",
  },
  itemDescText: {
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "center",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },
  deactivateCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1D1314",
    marginBottom: 24,
  },
  deactivateLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  deactivateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    marginRight: 12,
  },
  deactivateTextCol: {
    flex: 1,
  },
  deactivateHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    flexWrap: "wrap",
    gap: 6,
  },
  deactivateTitleText: {
    fontSize: 13,
    fontWeight: "800",
  },
  irreversibleBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  irreversibleBadgeText: {
    color: "#F59E0B",
    fontSize: 8,
    fontWeight: "800",
  },
  deactivateDescText: {
    fontSize: 11,
    lineHeight: 15,
  },
  requestBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  requestBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  footerNotice: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
