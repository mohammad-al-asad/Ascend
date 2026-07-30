import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

interface HistoryItem {
  id: string;
  icon: string;
  iconColor: string;
  dateStr: string;
  details: string;
  status: "OK" | "FAIL";
}

const SIGNIN_HISTORY: HistoryItem[] = [
  {
    id: "h1",
    icon: "shield-checkmark-outline",
    iconColor: "#00A3C4",
    dateStr: "2026-07-18 · 14:22 UTC",
    details: "CAC · PIV · EDIPI 1234567890 · 10.42.18.7",
    status: "OK",
  },
  {
    id: "h2",
    icon: "shield-checkmark-outline",
    iconColor: "#00A3C4",
    dateStr: "2026-07-17 · 06:55 UTC",
    details: "CAC · PIV · EDIPI 1234567890 · 10.42.18.7",
    status: "OK",
  },
  {
    id: "h3",
    icon: "key-outline",
    iconColor: "#8E8E93",
    dateStr: "2026-07-14 · 19:08 UTC",
    details: "Backup code · 1 use consumed of 10",
    status: "OK",
  },
  {
    id: "h4",
    icon: "shield-checkmark-outline",
    iconColor: "#00A3C4",
    dateStr: "2026-07-13 · 07:11 UTC",
    details: "CAC · PIV · EDIPI 1234567890 · 10.42.18.7",
    status: "OK",
  },
  {
    id: "h5",
    icon: "alert-circle-outline",
    iconColor: "#EF4444",
    dateStr: "2026-07-12 · 08:42 UTC",
    details: "CAC insert failed · expired cert · 203.0.113.41",
    status: "FAIL",
  },
];

export default function SigninActivationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmitDeactivation = () => {
    setModalVisible(false);
    Alert.alert("Request Submitted", "Deactivation request has been sent for DWS Admin review.");
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
        title="Sign-in & activation"
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
            RECORDS · PR-M-062
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Sign-in & activation
          </Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            {"Your most recent sign-in and a read-only history of authentication events for this account. Activation is governed by the First-Use Flow State on cold start."}
          </Text>
          
          <View style={[styles.pillBadge, { backgroundColor: "#1C1C1E" }]}>
            <View style={[styles.pillDot, { backgroundColor: theme.colors.textSecondary }]} />
            <Text style={[styles.pillText, { color: theme.colors.textSecondary }]}>
              Read-only · lock on publish
            </Text>
          </View>
        </View>

        {/* Card 1: Last Sign-in Info */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.topRowColumns}>
            <View style={styles.infoCol}>
              <Text style={[styles.colTag, { color: theme.colors.textTertiary }]}>LAST SIGN-IN</Text>
              <Text style={[styles.colValLarge, { color: theme.colors.text }]}>Today · 14:22 UTC</Text>
              <View style={[styles.badgeOutline, { borderColor: "rgba(0, 163, 196, 0.3)" }]}>
                <Ionicons name="shield-outline" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>CAC · PIV authenticated</Text>
              </View>
            </View>

            <View style={styles.infoCol}>
              <Text style={[styles.colTag, { color: theme.colors.textTertiary }]}>METHOD</Text>
              <Text style={[styles.colValLarge, { color: theme.colors.text }]}>CAC · PIV</Text>
              <View style={[styles.badgeOutline, { borderColor: "rgba(0, 163, 196, 0.3)" }]}>
                <Ionicons name="key-outline" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>EDIPI 1234567890</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsDivider} />

          {/* Additional details */}
          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Ionicons name="globe-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[styles.detailItemText, { color: theme.colors.textSecondary }]}>
                10.42.18.7 · USAF base gateway
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="phone-portrait-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[styles.detailItemText, { color: theme.colors.textSecondary }]}>
                iPhone 14 Pro · iOS 17.5
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[styles.detailItemText, { color: theme.colors.textSecondary }]}>
                Pentagon / Arlington, VA
              </Text>
            </View>
          </View>
        </View>

        {/* History Title */}
        <View style={styles.historyTitleBlock}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            Recent sign-in history
          </Text>
          <Text style={[styles.sectionSubHeading, { color: theme.colors.textSecondary }]}>
            5 most recent · audit log retains all
          </Text>
        </View>

        {/* Card 2: History List */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {SIGNIN_HISTORY.map((item, idx) => {
            const isLast = idx === SIGNIN_HISTORY.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.historyRow,
                  {
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <View style={[styles.historyIconCircle, { backgroundColor: "#1C1F26" }]}>
                  <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
                </View>

                <View style={styles.historyTextCol}>
                  <Text style={[styles.historyDate, { color: theme.colors.text }]}>
                    {item.dateStr}
                  </Text>
                  <Text style={[styles.historyDetails, { color: theme.colors.textSecondary }]}>
                    {item.details}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.historyStatusText,
                    { color: item.status === "OK" ? theme.colors.success : "#EF4444" },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Card 3: Deactivate Warning Section */}
        <View style={[styles.deactivateCard, { borderColor: "#D97706", backgroundColor: theme.colors.card }]}>
          <View style={styles.warningCardHeader}>
            <Ionicons name="warning-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
            <Text style={styles.warningCardTag}>Admin-only action</Text>
          </View>
          
          <Text style={[styles.deactivateTitle, { color: theme.colors.text }]}>
            Deactivate account
          </Text>
          
          <Text style={[styles.deactivateDesc, { color: theme.colors.textSecondary }]}>
            Deactivation routes through the DWS Admin queue and writes an immutable audit row. No record is ever deleted. DWS Admin approval required.
          </Text>

          <Pressable
            onPress={() => setModalVisible(true)}
            style={[styles.deactivateButton, { backgroundColor: "#F59E0B" }]}
          >
            <Text style={styles.deactivateButtonText}>Request deactivation</Text>
            <Ionicons name="arrow-forward" size={16} color="#000000" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>

        {/* Footer info text */}
        <Text style={[styles.footerInfoText, { color: theme.colors.textTertiary }]}>
          Sign-in & activation · PR-M-062 · Read-only surface · Lock-on-publish · Full audit log retained
        </Text>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: "#1C1C1E" }]}>
            <View style={styles.warningCardHeader}>
              <Ionicons name="warning-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={[styles.warningCardTag, { color: "#EF4444" }]}>Admin-only action</Text>
            </View>

            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Request account deactivation
            </Text>

            <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>
              A deactivation request will be queued for DWS Admin review. The request writes an immutable audit row tied to your EDIPI and current timestamp. No medical record, workout log, or assessment is deleted.
            </Text>

            {/* Grid metrics details */}
            <View style={[styles.modalGridContainer, { borderColor: theme.colors.cardBorder }]}>
              <View style={[styles.gridRowItem, { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>ROUTING</Text>
                <Text style={[styles.gridValue, { color: theme.colors.text }]}>DWS Admin queue</Text>
              </View>
              <View style={[styles.gridRowItem, { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>AUDIT ROW</Text>
                <Text style={[styles.gridValue, { color: theme.colors.text }]}>Immutable - append-only</Text>
              </View>
              <View style={[styles.gridRowItem, { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>RECORDS AFFECTED</Text>
                <Text style={[styles.gridValue, { color: theme.colors.text }]}>None - retention unchanged</Text>
              </View>
              <View style={styles.gridRowItem}>
                <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>APPROVAL</Text>
                <Text style={[styles.gridValue, { color: theme.colors.text }]}>DWS Admin - two-person rule</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtonsRow}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtnCancel, { borderColor: theme.colors.cardBorder }]}
              >
                <Text style={[styles.cancelBtnText, { color: theme.colors.text }]}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmitDeactivation}
                style={[styles.modalBtnSubmit, { backgroundColor: "#F59E0B" }]}
              >
                <Text style={styles.submitBtnText}>Submit request →</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  topRowColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCol: {
    flex: 1,
  },
  colTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  colValLarge: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  badgeOutline: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  detailsDivider: {
    height: 1,
    backgroundColor: "#27272A",
    marginVertical: 14,
  },
  detailsList: {
    gap: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailItemText: {
    fontSize: 12,
    fontWeight: "500",
  },
  historyTitleBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubHeading: {
    fontSize: 11,
    fontWeight: "500",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  historyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyTextCol: {
    flex: 1,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  historyDetails: {
    fontSize: 11,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 4,
  },
  deactivateCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  warningCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  warningCardTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D97706",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deactivateTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  deactivateDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  deactivateButton: {
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deactivateButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },
  footerInfoText: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalGridContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  gridRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
  modalBtnSubmit: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },
});
