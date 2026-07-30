import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch } from "../../redux/store";
import { loginSuccess, startLogin } from "../../redux/slices/authSlice";
import { useTheme } from "../../utils/useTheme";
import { CustomInput } from "../../components/ui/CustomInput";
import { CustomButton } from "../../components/ui/CustomButton";
import { CustomModal } from "../../components/ui/CustomModal";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Authentication UI state
  const [showBackupForm, setShowBackupForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<"cac" | "backup">("cac");

  // Backup Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [approvalCode, setApprovalCode] = useState("");

  // Authenticating terminal step states
  const [terminalSteps, setTerminalSteps] = useState([
    { text: "Reading card · middleware handshake...", status: "pending" },
    { text: "Validating certificate chain...", status: "pending" },
    { text: "Resolving role and assignments...", status: "pending" },
    { text: "Writing auth_event row...", status: "pending" },
  ]);

  // Run terminal animations inside modal
  useEffect(() => {
    if (!showAuthModal) return;

    const timers: any[] = [];

    // Step 1 finishes, Step 2 starts
    timers.push(
      setTimeout(() => {
        setTerminalSteps((prev) => {
          const next = [...prev];
          next[0].status = "success";
          next[1].status = "active";
          return next;
        });
      }, 1000)
    );

    // Step 2 finishes, Step 3 starts
    timers.push(
      setTimeout(() => {
        setTerminalSteps((prev) => {
          const next = [...prev];
          next[1].status = "success";
          next[2].status = "active";
          return next;
        });
      }, 2000)
    );

    // Step 3 finishes, Step 4 starts
    timers.push(
      setTimeout(() => {
        setTerminalSteps((prev) => {
          const next = [...prev];
          next[2].status = "success";
          next[3].status = "active";
          return next;
        });
      }, 3000)
    );

    // Step 4 finishes
    timers.push(
      setTimeout(() => {
        setTerminalSteps((prev) => {
          const next = [...prev];
          next[3].status = "success";
          return next;
        });
      }, 4000)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [showAuthModal]);

  const handleCacClick = () => {
    setAuthMethod("cac");
    setTerminalSteps([
      { text: "Reading card · middleware handshake...", status: "active" },
      { text: "Validating certificate chain...", status: "pending" },
      { text: "Resolving role and assignments...", status: "pending" },
      { text: "Writing auth_event row...", status: "pending" },
    ]);
    setShowAuthModal(true);
  };

  const handleBackupSubmit = () => {
    if (!username || !password || !approvalCode) return;
    setAuthMethod("backup");
    setTerminalSteps([
      { text: "Reading card · middleware handshake...", status: "active" },
      { text: "Validating certificate chain...", status: "pending" },
      { text: "Resolving role and assignments...", status: "pending" },
      { text: "Writing auth_event row...", status: "pending" },
    ]);
    setShowAuthModal(true);
  };

  const handleCompleteSignIn = () => {
    dispatch(startLogin());

    // Dispatch login success with simulated details
    dispatch(
      loginSuccess({
        username: username || "capt.lin",
        userId: "USR-7101",
        role: "PT/IM",
        provisionedStatus: "active",
        firstLoginTimestamp: new Date().toISOString(),
      })
    );

    setShowAuthModal(false);

    // Navigate to onboarding flow
    router.replace("/onboarding" as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Logo Header */}
        <View style={styles.logoSection}>
          <Image
            source={require("../../../assets/app/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.logoTitle, { color: theme.colors.text }]}>Ascend</Text>
            <Text style={[styles.logoSubtitle, { color: theme.colors.textSecondary }]}>
              Operator app · HPO/H2F readiness
            </Text>
          </View>
        </View>

        {/* Auth Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>
            OPERATOR ENTRY · PR-M-005
          </Text>

          {/* Static title */}
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Sign in to your readiness app
          </Text>

          <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
            For Airmen and operators. Mobile CAC sign-in uses your device middleware — plug in your card reader or pair a Bluetooth reader.
          </Text>

          <CustomButton
            label="Sign in with CAC"
            onPress={handleCacClick}
            icon="💳"
            style={{ width: "100%", marginBottom: 20 }}
          />

          <View style={styles.separatorContainer}>
            <View style={[styles.separatorLine, { backgroundColor: theme.colors.cardBorder }]} />
            <Text style={[styles.separatorText, { color: theme.colors.textTertiary }]}>OR</Text>
            <View style={[styles.separatorLine, { backgroundColor: theme.colors.cardBorder }]} />
          </View>

          {/* Backup verification Toggle button */}
          <Pressable
            onPress={() => setShowBackupForm(!showBackupForm)}
            style={({ pressed }) => [
              styles.backupBtn,
              {
                borderColor: theme.colors.cardBorder,
                backgroundColor: pressed ? "rgba(255,255,255,0.03)" : "transparent",
              },
            ]}
          >
            <Text style={[styles.backupBtnText, { color: theme.colors.text }]}>
              {showBackupForm ? "Collapse backup verification" : "Backup verification"}
            </Text>
            <Text style={[styles.backupChevron, { color: theme.colors.textSecondary }]}>
              {showBackupForm ? "▲" : "▶"}
            </Text>
          </Pressable>

          {/* Backup Form fields */}
          {showBackupForm && (
            <View style={styles.backupFormContainer}>
              <View style={[styles.brownWarningBanner, { backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warningBorder }]}>
                <Text style={[styles.brownWarningText, { color: theme.colors.warningText }]}>
                  ⚠️ Reserved for when CAC middleware is unavailable. Requires supervisor approval and writes an auth_event audit row
                </Text>
              </View>

              <CustomInput
                label="Username"
                placeholder="e.g. capt.lin"
                value={username}
                onChangeText={setUsername}
              />

              <CustomInput
                label="Password"
                placeholder="........"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <CustomInput
                label="Supervisor approval code"
                placeholder="8-character code"
                value={approvalCode}
                onChangeText={setApprovalCode}
              />

              <CustomButton
                label="Continue"
                onPress={handleBackupSubmit}
                disabled={!username || !password || !approvalCode}
                style={{ width: "100%", marginTop: 8 }}
              />
            </View>
          )}

          <Text style={[styles.disclaimerText, { color: theme.colors.textTertiary }]}>
            By signing in, you acknowledge the OPSEC banner above. Every sign-in writes an auth_event row.
          </Text>
        </View>

        {/* Trouble links */}
        <View style={styles.troubleLinksRow}>
          <Pressable onPress={() => router.push("/auth/forgot-password" as any)}>
            <Text style={[styles.troubleLink, { color: theme.colors.textSecondary }]}>Trouble signing in?</Text>
          </Pressable>
          <Text style={{ color: theme.colors.textTertiary }}>•</Text>
          <Text style={[styles.troubleLink, { color: theme.colors.textSecondary }]}>Privacy & data-rights</Text>
        </View>
      </ScrollView>

      {/* Authenticating Terminal Modal */}
      <CustomModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Authenticating..."
      >
        <View style={styles.modalBody}>
          {/* Terminal Box */}
          <View style={styles.terminalBox}>
            {terminalSteps.map((step, idx) => (
              <View key={idx} style={styles.terminalLine}>
                <Text
                  style={[
                    styles.terminalIndicator,
                    {
                      color:
                        step.status === "success"
                          ? theme.colors.success
                          : step.status === "active"
                          ? theme.colors.primary
                          : theme.colors.textTertiary,
                    },
                  ]}
                >
                  {step.status === "success" ? "✔" : "▸"}
                </Text>
                <Text
                  style={[
                    styles.terminalText,
                    {
                      color:
                        step.status === "success"
                          ? "#E4E4E7"
                          : step.status === "active"
                          ? "#FFFFFF"
                          : theme.colors.textTertiary,
                    },
                  ]}
                >
                  {step.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Technical Data Table */}
          <View style={[styles.techTable, { borderColor: theme.colors.cardBorder }]}>
            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>auth_event_id</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>
                {authMethod === "backup" ? "AUTH-892B-C23D" : "AUTH-469F-A11C"}
              </Text>
            </View>

            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>method</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>
                {authMethod === "backup"
                  ? "dod-backup-api"
                  : "dod-mw-test"}
              </Text>
            </View>

            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>credential_id</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>
                {authMethod === "backup" ? "simulated-creds-hash" : "dod-mw-test · simulated"}
              </Text>
            </View>

            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>resolved_user_id</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>USR-7101</Text>
            </View>

            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>resolved_role</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>PT/IM</Text>
            </View>

            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>idp</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>dod-mw · v3.2</Text>
            </View>

            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>policy_version</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>ascend-ia-10@1.4.0</Text>
            </View>

            <View style={[styles.tableRow, { borderBottomColor: theme.colors.cardBorder }]}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>default_surface</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>provider-briefing</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableKey, { color: theme.colors.textSecondary }]}>timestamp</Text>
              <Text style={[styles.tableVal, { color: theme.colors.text }]}>2026-07-30 18:13:21 UTC</Text>
            </View>
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <Pressable onPress={() => setShowAuthModal(false)} style={styles.cancelBtn}>
              <Text style={[styles.cancelBtnText, { color: theme.colors.primary }]}>Cancel</Text>
            </Pressable>
            <CustomButton
              label="Complete sign-in"
              onPress={handleCompleteSignIn}
              disabled={terminalSteps.some((s) => s.status !== "success")}
              style={{ flex: 1, height: 44 }}
            />
          </View>
        </View>
      </CustomModal>
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
    padding: 20,
    alignItems: "center",
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 20,
    marginBottom: 32,
  },
  logoImage: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
  },
  cardTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  cacSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  cacSelectBtnIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  cacSelectTextCol: {
    flex: 1,
  },
  cacSelectBtnTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cacSelectBtnSub: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "700",
  },
  backupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backupBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  backupChevron: {
    fontSize: 12,
  },
  backupFormContainer: {
    width: "100%",
    marginBottom: 16,
  },
  brownWarningBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  brownWarningText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 16,
  },
  troubleLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  troubleLink: {
    fontSize: 12,
    fontWeight: "600",
  },
  leadershipCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 40,
  },
  leadershipTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  leadershipDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  dashboardLink: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalBody: {
    marginTop: 10,
  },
  terminalBox: {
    backgroundColor: "#0D0D0E",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#27272A",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  terminalLine: {
    flexDirection: "row",
    marginBottom: 8,
  },
  terminalIndicator: {
    width: 16,
    fontWeight: "700",
  },
  terminalText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  techTable: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableKey: {
    fontSize: 12,
    fontWeight: "600",
  },
  tableVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  cancelBtn: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
