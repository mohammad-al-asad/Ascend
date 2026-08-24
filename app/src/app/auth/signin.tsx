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
import { useLoginMutation } from "../../redux/api/authApi";
import { useTheme } from "../../utils/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../../components/ui/CustomButton";
import { useAppDispatch } from "../../redux/store";
import { setCredentials } from "../../redux/slices/authSlice";

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailSignIn = async () => {
    setErrorMsg(null);
    try {
      const result = await login({ email, password }).unwrap();
      
      // Explicitly set the token in authSlice
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
        })
      );

      if (result.user?.onboarding_completed) {
        router.replace("/(tabs)/(home)" as any);
      } else {
        router.replace("/onboarding" as any);
      }
    } catch (err: any) {
      if (err.status === 401) {
        setErrorMsg("Invalid email or password.");
      } else if (err.status === 403) {
        setErrorMsg("This account is inactive.");
      } else if (err.status === 503) {
        setErrorMsg("Database is temporarily unavailable. Please try again shortly.");
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
    }
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
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>OPERATOR ENTRY</Text>
          </View>

          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Sign in to your account
          </Text>

          <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
            Access readiness tracking, fitness logs & performance analytics.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => {}}
          >
            <Image
              source={require("../../../public/GoogleIcon.svg")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </Pressable>

          <View style={styles.separatorContainer}>
            <View style={[styles.separatorLine, { backgroundColor: theme.colors.cardBorder }]} />
            <Text style={[styles.separatorText, { color: theme.colors.textTertiary }]}>OR</Text>
            <View style={[styles.separatorLine, { backgroundColor: theme.colors.cardBorder }]} />
          </View>

          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: "#B6B6BD" }]}>Email address</Text>
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

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: "#B6B6BD" }]}>Password</Text>
              <Pressable onPress={() => router.push("/auth/forgot-password" as any)}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </Pressable>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: "#0d0d0d", borderColor: theme.colors.cardBorder }]}>
              <TextInput
                placeholder="••••••••••••"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.colors.text, outlineStyle: "none" } as any]}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                <Image
                  source={require("../../../public/EyeIcon.svg")}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </View>

          <CustomButton
            label={isLoading ? "Signing in..." : "Sign in with Email"}
            icon={
              <Image 
                source={require("../../../public/RightDirectionIcon.svg")} 
                style={{ width: 16, height: 16 }} 
                resizeMode="contain" 
              />
            }
            iconPosition="right"
            onPress={handleEmailSignIn}
            disabled={isLoading || !email || !password}
            style={{ width: "100%", marginBottom: 24, backgroundColor: "#00B4D8", borderWidth: 0, opacity: (isLoading || !email || !password) ? 0.7 : 1 }}
            textStyle={{ color: "#FFFFFF", fontWeight: "600" }}
            glow={true}
          />

          <View style={styles.signupRow}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Don't have an account? </Text>
            <Pressable onPress={() => router.push("/auth/signup" as any)}>
              <Text style={{ color: "#00B4D8", fontSize: 13, fontWeight: "600" }}>Sign up</Text>
            </Pressable>
          </View>

          <View style={[styles.complianceBox, { borderTopColor: theme.colors.cardBorder }]}>
            <Image
              source={require("../../../public/CheckIcon.svg")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.complianceText, { color: theme.colors.textSecondary }]}>
              By signing in, you acknowledge compliance policy. Every sign-in writes an auth_event row.
            </Text>
          </View>
        </View>

        {/* Trouble links */}
        <Pressable onPress={() => router.push("/auth/privacy" as any)}>
          <Text style={[styles.troubleLink, { color: "#00D4C8" }]}>Privacy & data-rights</Text>
        </Pressable>
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
    width: 24,
    height: 24,
    marginRight: 12,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: "700",
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
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A1A1AA",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
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
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 12,
    color: "#00B4D8",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
  },
  eyeIconContainer: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
    color: "#A1A1AA",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  complianceBox: {
    flexDirection: "row",
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: "flex-start",
  },
  complianceIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  complianceText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 16,
  },
  troubleLink: {
    fontSize: 12,
    fontWeight: "500",
  },
  googleBtn: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    width: "100%",
  },
  googleBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
  },
});
