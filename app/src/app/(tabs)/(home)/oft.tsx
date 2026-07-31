import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function OftCurrencyScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Test cadence list items matching the reference screenshot
  const testCadenceList = [
    {
      id: 1,
      title: "Last test",
      date: "22 May 2026",
      badgeText: "Completed",
      icon: "calendar-outline",
      iconColor: theme.colors.textSecondary,
    },
    {
      id: 2,
      title: "Next test",
      date: "22 Aug 2026",
      badgeText: "Scheduled",
      icon: "time-outline",
      iconColor: theme.colors.primary,
    },
    {
      id: 3,
      title: "Items passed",
      date: "5 of 5",
      badgeText: "All pass",
      icon: "checkmark-outline",
      iconColor: theme.colors.success,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title="OFT currency"
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
        {/* Meta Header */}
        <View style={styles.metaHeaderContainer}>
          <Text style={[styles.metaHeaderTag, { color: "#8E8E93" }]}>
            OPERATOR · RECORDS · PR-M-056
          </Text>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
            OFT currency
          </Text>
          <Text style={[styles.pageDesc, { color: theme.colors.textSecondary }]}>
            {"Your operational fitness test status. Updated from your last OFT event."}
          </Text>
        </View>

        {/* OFT Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardTag, { color: theme.colors.textTertiary }]}>
            OFT STATUS
          </Text>
          <View style={styles.statusValRow}>
            <View style={[styles.statusIndicatorDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.statusValText, { color: theme.colors.text }]}>
              Current
            </Text>
          </View>
          <Text style={[styles.statusDescText, { color: theme.colors.textSecondary }]}>
            {"You are current on OFT. Next event scheduled in 38 days."}
          </Text>
        </View>

        {/* Test Cadence Section */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Test cadence
        </Text>

        {/* Cadence List container */}
        <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {testCadenceList.map((item, idx) => {
            const isLast = idx === testCadenceList.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.listItemRow,
                  {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.listItemLeft}>
                  <View style={[styles.itemIconWrapper, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemDate, { color: theme.colors.textSecondary }]}>
                      {item.date}
                    </Text>
                  </View>
                </View>
                <View style={[styles.outcomeBadge, { backgroundColor: "#27272A" }]}>
                  <Text style={[styles.outcomeBadgeText, { color: theme.colors.text }]}>
                    {item.badgeText}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Disclaimer Notice */}
        <Text style={[styles.disclaimerText, { color: theme.colors.textTertiary }]}>
          {"OFT events are scheduled by your unit. Ascend displays the last and next test dates from the governed OFT event log."}
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
  metaHeaderContainer: {
    marginBottom: 20,
  },
  metaHeaderTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  pageDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
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
  listContainer: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemDate: {
    fontSize: 12,
    marginTop: 2,
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
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
