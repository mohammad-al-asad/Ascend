import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordDetailScreen() {
  const theme = useTheme();
  const router = useRouter();

  const auditLogRows = [
    { field: "audit_event_id", value: "AUD-9F31-7C04" },
    { field: "record_id", value: "REC-0142-KNEE-MRI" },
    { field: "actor_user_id", value: "USR-6601" },
    { field: "actor_role", value: "Operator" },
    { field: "action", value: "view_record" },
    { field: "access_reason_id", value: "AR-22A1-0C" },
    { field: "assignment_id", value: "ASN-PT-6601" },
    { field: "policy_version", value: "ascend-ia-06@1.4.0" },
    { field: "timestamp", value: "2026-07-18 · 11:42:18 UTC" },
  ];

  const accessLogData = [
    {
      date: "02 Jul 2026 · 14:22 UTC",
      actor: "Capt. Lin (USR-6601)",
      text: "Tracking right knee injury recovery for return-to-performance plan",
    },
    {
      date: "02 Jul 2026 · 14:23 UTC",
      actor: "system - OPSEC scan",
      text: "Scan complete · no OPSEC keywords detected · routed to PT/IM queue",
    },
    {
      date: "02 Jul 2026 · 16:08 UTC",
      actor: "PT Knox (USR-7101)",
      text: "Opened record for review",
    },
    {
      date: "02 Jul 2026 · 16:09 UTC",
      actor: "PT Knox (USR-7101)",
      text: "Coordinating with orthopedist · expects imaging follow-up",
    },
    {
      date: "05 Jul 2026 · 09:41 UTC",
      actor: "Capt. Lin (USR-6601)",
      text: "Re-opened record to check on PT/IM note",
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record. These records are controlled copies.
        </Text>
      </View>

      <CustomHeader
        title="Record detail"
        onBack={() => router.back()}
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellButton}>
            <View style={styles.bellContainer}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
              <View style={[styles.dotIndicator, { backgroundColor: theme.colors.primary }]} />
            </View>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title block */}
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            PR-M-054 · RECORDS — DETAIL
          </Text>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Right knee MRI</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Full record · uploaded 02 Jul 2026 by Capt. Lin - PT/IM review pending.
          </Text>
        </View>

        {/* Card 1: Record Key-Value Details */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>Record</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Doc-type</Text>
            <Text style={[styles.detailVal, { color: theme.colors.text }]}>Imaging - DICOM</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>File</Text>
            <Text style={[styles.detailVal, { color: theme.colors.text }]}>—</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Uploaded on</Text>
            <Text style={[styles.detailVal, { color: theme.colors.text }]}>02 Jul 2026 · 14:22 UTC</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Uploaded by</Text>
            <Text style={[styles.detailVal, { color: theme.colors.text }]}>Capt. Alex Lin (USR-6601)</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.warningText }]} />
              <Text style={[styles.statusBadgeText, { color: theme.colors.warningText }]}>
                Pending PT/IM review
              </Text>
            </View>
          </View>
          
          <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Access-reason</Text>
            <Text style={[styles.detailVal, { color: theme.colors.text, flex: 1.5 }]}>
              Tracking right knee injury recovery for return-to-performance plan
            </Text>
          </View>
        </View>

        {/* Card 2: Access-reason log */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>Access-reason log</Text>
            <View style={styles.counterBadge}>
              <Text style={[styles.counterBadgeText, { color: theme.colors.textSecondary }]}>LAST 5</Text>
            </View>
          </View>

          {accessLogData.map((log, idx) => {
            const isLast = idx === accessLogData.length - 1;
            return (
              <View
                key={idx}
                style={[
                  styles.logItemBlock,
                  {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.cardBorder,
                    paddingBottom: isLast ? 0 : 14,
                    marginBottom: isLast ? 0 : 14,
                  },
                ]}
              >
                <View style={styles.logItemHeader}>
                  <Text style={[styles.logItemDate, { color: theme.colors.textTertiary }]}>{log.date}</Text>
                  <Text style={[styles.logItemActor, { color: theme.colors.textSecondary }]}>{log.actor}</Text>
                </View>
                <Text style={[styles.logItemText, { color: theme.colors.text }]}>{log.text}</Text>
              </View>
            );
          })}
        </View>

        {/* Card 3: Audit log */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>Audit log</Text>
            <View style={styles.readOnlyBadge}>
              <Text style={[styles.readOnlyBadgeText, { color: theme.colors.textTertiary }]}>READ-ONLY</Text>
            </View>
          </View>

          {/* Table Header */}
          <View style={[styles.tableRowHeader, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.tableColTitle, { color: theme.colors.textTertiary }]}>FIELD</Text>
            <Text style={[styles.tableColTitle, { color: theme.colors.textTertiary }]}>VALUE</Text>
          </View>

          {/* Table Rows */}
          {auditLogRows.map((row, idx) => {
            const isLast = idx === auditLogRows.length - 1;
            return (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: theme.colors.cardBorder },
                ]}
              >
                <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>{row.field}</Text>
                <Text style={[styles.tableVal, { color: theme.colors.text }]} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Actions Row */}
        <View style={styles.bottomButtonsRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.actionBtn, { backgroundColor: "#27272A" }]}
          >
            <Ionicons name="arrow-back" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Back to uploads</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/(home)" as any)}
            style={[styles.actionBtn, { backgroundColor: "#27272A" }]}
          >
            <Ionicons name="home-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Operator home</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerCode, { color: theme.colors.textTertiary }]}>
            Trace id M-054 · v1 prototype
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
    paddingHorizontal: 16,
  },
  opsecText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  bellButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bellContainer: {
    position: "relative",
  },
  dotIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  titleContainer: {
    marginBottom: 20,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  counterBadge: {
    backgroundColor: "#1C1F26",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  readOnlyBadge: {
    backgroundColor: "#1C1F26",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  readOnlyBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
    paddingVertical: 12,
  },
  detailKey: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
    flex: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  logItemBlock: {
    borderBottomWidth: 1,
  },
  logItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  logItemDate: {
    fontSize: 11,
    fontWeight: "500",
  },
  logItemActor: {
    fontSize: 11,
    fontWeight: "600",
  },
  logItemText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tableRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 6,
  },
  tableColTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableKey: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  tableVal: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    maxWidth: "60%",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  footerContainer: {
    alignItems: "center",
  },
  footerCode: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    textAlign: "center",
  },
});
