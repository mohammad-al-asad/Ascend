import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetUploadDetailQuery } from "../../../redux/api/recordsApi";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  labs: "Labs",
  imaging: "Imaging",
  specialist: "Specialist",
  dme: "DME",
  other: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending PT/IM review",
  reviewed_approved: "Reviewed - approved",
  reviewed_denied: "Reviewed - denied",
  quarantined: "Quarantined",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecordDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isError } = useGetUploadDetailQuery(id ?? "", { skip: !id });

  const statusColor = (() => {
    switch (data?.status) {
      case "reviewed_approved":
        return theme.colors.success;
      case "reviewed_denied":
      case "quarantined":
        return theme.colors.dangerText;
      default:
        return theme.colors.warningText;
    }
  })();

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
        {!id && (
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
            No record selected.
          </Text>
        )}

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}

        {isError && !isLoading && (
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
            Could not load this record. Pull to refresh or try again shortly.
          </Text>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Title block */}
            <View style={styles.titleContainer}>
              <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
                PR-M-054 · RECORDS — DETAIL
              </Text>
              <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
                {data.is_redacted ? "Redacted record" : data.file_name}
              </Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {`${DOCUMENT_TYPE_LABELS[data.document_type] ?? data.document_type} · uploaded ${formatDateTime(data.uploaded_at)}${data.uploaded_by_name ? ` by ${data.uploaded_by_name}` : ""}.`}
              </Text>
            </View>

            {/* Card 1: Record Key-Value Details */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>Record</Text>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Doc-type</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {DOCUMENT_TYPE_LABELS[data.document_type] ?? data.document_type}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>File</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                  {data.is_redacted ? "[redacted]" : `${data.file_name} · ${(data.file_size_bytes / 1024).toFixed(0)} KB`}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Uploaded on</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>{formatDateTime(data.uploaded_at)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Uploaded by</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text }]}>{data.uploaded_by_name ?? "—"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}1F` }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                    {STATUS_LABELS[data.status] ?? data.status}
                  </Text>
                </View>
              </View>

              {data.reviewed_by_name && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Reviewed by</Text>
                  <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                    {`${data.reviewed_by_name} · ${formatDateTime(data.reviewed_at)}`}
                  </Text>
                </View>
              )}

              <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={[styles.detailKey, { color: theme.colors.textTertiary }]}>Access-reason</Text>
                <Text style={[styles.detailVal, { color: theme.colors.text, flex: 1.5 }]}>
                  {data.is_redacted ? "[redacted]" : data.access_reason}
                </Text>
              </View>
            </View>

            {/* Card 2: Access-reason log */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>Access-reason log</Text>
                <View style={styles.counterBadge}>
                  <Text style={[styles.counterBadgeText, { color: theme.colors.textSecondary }]}>
                    {data.access_log.length}
                  </Text>
                </View>
              </View>

              {data.access_log.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No access events yet.</Text>
              ) : (
                data.access_log.map((log, idx) => {
                  const isLast = idx === data.access_log.length - 1;
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
                        <Text style={[styles.logItemDate, { color: theme.colors.textTertiary }]}>
                          {formatDateTime(log.created_at)}
                        </Text>
                        <Text style={[styles.logItemActor, { color: theme.colors.textSecondary }]}>
                          {`${log.actor_name} (${log.actor_role})`}
                        </Text>
                      </View>
                      <Text style={[styles.logItemText, { color: theme.colors.text }]}>
                        {`${log.action.replace(/_/g, " ")} — ${log.note}`}
                      </Text>
                    </View>
                  );
                })
              )}
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
                Trace id M-054
              </Text>
            </View>
          </>
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
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
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
