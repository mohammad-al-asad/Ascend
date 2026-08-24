import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../utils/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../../components/ui/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import {
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation
} from "../../redux/api/authApi";

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [verifyResetCode, { isLoading: isVerifyLoading }] = useVerifyResetCodeMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  // Requirements checks
  const hasMinLength = newPassword.length >= 8 && newPassword.length <= 128;
  const hasNumber = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const allRequirementsMet = hasMinLength && hasNumber && hasUppercase && passwordsMatch;

  const handleSendCode = async () => {
    if (!email) return;
    setErrorMsg(null);
    try {
      await forgotPassword({ email }).unwrap();
      // Always advances to 200, safe
      setStep(2);
    } catch (err) {
      // Backend is account-existence-safe, advance anyway
      setStep(2);
    }
  };

  const getCodeStr = () => otp.join("");

  const handleVerify = async () => {
    const code = getCodeStr();
    if (code.length !== 4) return;
    setErrorMsg(null);
    try {
      await verifyResetCode({ email, code }).unwrap();
      setStep(3);
    } catch (err: any) {
      if (err.status === 400 && err.data?.detail) {
        setErrorMsg(typeof err.data.detail === "string" ? err.data.detail : "Invalid or expired reset code.");
      } else {
        setErrorMsg("Failed to verify code.");
      }
    }
  };

  const handleDone = async () => {
    if (!allRequirementsMet) return;
    setErrorMsg(null);
    try {
      await resetPassword({
        email,
        code: getCodeStr(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      }).unwrap();
      router.replace("/auth/signin" as any);
    } catch (err: any) {
      if (err.status === 400 && err.data?.detail) {
        const detailStr = typeof err.data.detail === "string" ? err.data.detail : "Error resetting password.";
        setErrorMsg(detailStr);
        if (detailStr.includes("expired") || detailStr.includes("Invalid reset code")) {
           // Go back to step 1
           setStep(1);
           setOtp(["", "", "", ""]);
        }
      } else {
        setErrorMsg("Failed to reset password.");
      }
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.opsecBanner, { backgroundColor: "#000000", flexDirection: "row", gap: 6 }]}>
        <Image source={require("../../../public/LockIcon.svg")} style={{ width: 10, height: 10 }} />
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          CUI // OPSEC — Ascend is not a Government system of record
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <Image
            source={require("../../../assets/app/logo.png")}
            style={{ width: 36, height: 36, marginRight: 10 }}
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
          {step === 1 && (
            <>
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>RECOVERY PROTOCOL · PR-M-009</Text>
              </View>

              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Reset your password
              </Text>

              <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                Enter your registered email address and we will send you secure recovery instructions.
              </Text>

              {errorMsg && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: "#B6B6BD" }]}>Registered Email address</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "#0d0d0d", borderColor: theme.colors.cardBorder }]}>
                  <TextInput
                    placeholder="operator@ascend.mil"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    style={[styles.input, { color: theme.colors.text, outlineStyle: "none" } as any]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <CustomButton
                label={isForgotLoading ? "Sending..." : "Send Verification Code"}
                icon={
                  <Image
                    source={require("../../../public/RightDirectionIcon.svg")}
                    style={{ width: 16, height: 16 }}
                    resizeMode="contain"
                  />
                }
                iconPosition="right"
                onPress={handleSendCode}
                disabled={isForgotLoading || !email}
                style={{ width: "100%", marginBottom: 24, backgroundColor: "#00B4D8", borderWidth: 0, opacity: (isForgotLoading || !email) ? 0.7 : 1 }}
                textStyle={{ color: "#FFFFFF", fontWeight: "600" }}
                glow={true}
              />

              <Pressable style={styles.returnLinkContainer} onPress={() => router.push("/auth/signin" as any)}>
                <Ionicons name="arrow-back" size={16} color="#A1A1AA" />
                <Text style={styles.returnLinkText}>Return to Sign In</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>RECOVERY PROTOCOL</Text>
              </View>

              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Reset your password
              </Text>

              <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                Enter your registered email address and we will send you secure recovery instructions.
              </Text>

              <View style={styles.step2InnerBox}>
                <View style={styles.keyIconWrapper}>
                  <Image source={require("../../../public/KeyIcon.svg")} style={{ width: 20, height: 20 }} resizeMode="contain" />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.text, textAlign: "center", fontSize: 16, marginBottom: 8 }]}>
                  Check your inbox
                </Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary, textAlign: "center", marginBottom: 24 }]}>
                  Recovery link sent to{"\n"}
                  <Text style={{ color: "#00B4D8" }}>{email}</Text>. Please check your{"\n"}inbox and follow the instructions.
                </Text>

                {errorMsg && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                )}

                <View style={styles.otpContainer}>
                  {otp.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      style={[
                        styles.otpBox,
                        {
                          borderColor: digit ? "#F57C00" : theme.colors.cardBorder,
                          color: theme.colors.text,
                        }
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, idx)}
                    />
                  ))}
                </View>

                <CustomButton
                  label={isVerifyLoading ? "Verifying..." : "Verify"}
                  onPress={handleVerify}
                  disabled={isVerifyLoading || getCodeStr().length !== 4}
                  style={{ width: "100%", marginBottom: 16, backgroundColor: "#00B4D8", borderWidth: 0, opacity: (isVerifyLoading || getCodeStr().length !== 4) ? 0.7 : 1 }}
                  textStyle={{ color: "#FFFFFF", fontWeight: "600" }}
                />

                <Pressable onPress={handleSendCode}>
                  <Text style={styles.resendText}>{isForgotLoading ? "Sending..." : "Didn't receive OTP? Try again"}</Text>
                </Pressable>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>SECURITY PROTOCOL</Text>
              </View>

              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                New password
              </Text>

              <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                Set your new password to continue
              </Text>

              {errorMsg && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* New Password */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: "#B6B6BD" }]}>New Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "#0d0d0d", borderColor: theme.colors.cardBorder }]}>
                  <TextInput
                    placeholder="New Password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    style={[styles.input, { color: theme.colors.text, outlineStyle: "none" } as any]}
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIconContainer}>
                    <Image
                      source={require("../../../public/EyeIcon.svg")}
                      style={{ width: 16, height: 16 }}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: "#B6B6BD" }]}>Confirm Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "#0d0d0d", borderColor: theme.colors.cardBorder }]}>
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    style={[styles.input, { color: theme.colors.text, outlineStyle: "none" } as any]}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconContainer}>
                    <Image
                      source={require("../../../public/EyeIcon.svg")}
                      style={{ width: 16, height: 16 }}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>Password requirements:</Text>
                <View style={styles.requirementsGrid}>
                  <View style={styles.reqRow}>
                    <Ionicons name="checkmark" size={14} color={hasMinLength ? "#4ADE80" : "#52525B"} />
                    <Text style={[styles.reqText, { color: hasMinLength ? "#4ADE80" : "#52525B" }]}>8 to 128 characters</Text>
                  </View>
                  <View style={styles.reqRow}>
                    <Ionicons name="checkmark" size={14} color={hasUppercase ? "#4ADE80" : "#52525B"} />
                    <Text style={[styles.reqText, { color: hasUppercase ? "#4ADE80" : "#52525B" }]}>One uppercase letter</Text>
                  </View>
                  <View style={styles.reqRow}>
                    <Ionicons name="checkmark" size={14} color={hasNumber ? "#4ADE80" : "#52525B"} />
                    <Text style={[styles.reqText, { color: hasNumber ? "#4ADE80" : "#52525B" }]}>One number</Text>
                  </View>
                  <View style={styles.reqRow}>
                    <Ionicons name="checkmark" size={14} color={passwordsMatch ? "#4ADE80" : "#52525B"} />
                    <Text style={[styles.reqText, { color: passwordsMatch ? "#4ADE80" : "#52525B" }]}>Passwords match</Text>
                  </View>
                </View>
              </View>

              <CustomButton
                label={isResetLoading ? "Saving..." : "Done"}
                onPress={handleDone}
                disabled={!allRequirementsMet || isResetLoading}
                style={{ width: "100%", marginBottom: 24, backgroundColor: "#FFFFFF", borderWidth: 0, opacity: (!allRequirementsMet || isResetLoading) ? 0.7 : 1 }}
                textStyle={{ color: "#000000", fontWeight: "600" }}
              />

              <Pressable style={styles.returnLinkContainer} onPress={() => router.push("/auth/signin" as any)}>
                <Ionicons name="arrow-back" size={16} color="#A1A1AA" />
                <Text style={styles.returnLinkText}>Return to Sign In</Text>
              </Pressable>
            </>
          )}

          <View style={[styles.complianceBox, { borderTopColor: theme.colors.cardBorder }]}>
            <Image
              source={require("../../../public/CheckIcon.svg")}
              style={{ width: 14, height: 14, marginRight: 8, marginTop: 2, tintColor: "#00B4D8" }}
              resizeMode="contain"
            />
            <Text style={[styles.complianceText, { color: theme.colors.textSecondary }]}>
              By signing in, you acknowledge compliance policy. Every sign-in writes an auth_event row.
            </Text>
          </View>
        </View>

        <Pressable onPress={() => router.push("/auth/privacy" as any)}>
          <Text style={[styles.troubleLink, { color: "#00D4C8" }]}>Privacy & data-rights</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  opsecBanner: {
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  opsecText: { fontSize: 11, fontWeight: "600" },
  scrollContent: { padding: 20, alignItems: "center" },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 20,
    marginBottom: 32,
  },
  logoTitle: { fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },
  logoSubtitle: { fontSize: 12, marginTop: 2 },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
  },
  tagContainer: {
    backgroundColor: "rgba(3, 165, 182, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 24,
    borderTopWidth: 1.17,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  tagText: { fontSize: 10, fontWeight: "700", color: "#A1A1AA", letterSpacing: 0.5 },
  cardTitle: { fontSize: 20, fontWeight: "500", marginBottom: 8 },
  cardDesc: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
  },
  inputContainer: { marginBottom: 20, width: "100%" },
  label: { fontSize: 12, fontWeight: "400", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: { flex: 1, height: "100%", fontSize: 15 },
  returnLinkContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24 },
  returnLinkText: { color: "#A1A1AA", fontSize: 13, fontWeight: "500", marginLeft: 6 },
  step2InnerBox: {
    backgroundColor: "rgba(3, 165, 182, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(3, 165, 182, 0.2)",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  keyIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(3, 165, 182, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  otpContainer: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 24 },
  otpBox: {
    width: 52,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#0d0d0d",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  resendText: { color: "#A1A1AA", fontSize: 15 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  eyeIconContainer: { padding: 4 },
  requirementsBox: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: { color: "#A1A1AA", fontSize: 12, marginBottom: 12 },
  requirementsGrid: { flexDirection: "row", flexWrap: "wrap" },
  reqRow: { flexDirection: "row", alignItems: "center", width: "50%", marginBottom: 8 },
  reqText: { fontSize: 12, marginLeft: 6 },
  complianceBox: { flexDirection: "row", paddingTop: 20, borderTopWidth: 1, alignItems: "flex-start" },
  complianceText: { flex: 1, fontSize: 11, fontWeight: "400", lineHeight: 16 },
  troubleLink: { fontSize: 12, fontWeight: "500" },
});
