import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetProfileQuery,
  useUpdateProfileSettingsMutation,
  ProfileSettingsRequest,
} from "../../../redux/api/usersApi";

type SexOption = "M" | "F" | "prefer_not_to_say";

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const [updateSettings, { isLoading: isSubmitting }] = useUpdateProfileSettingsMutation();

  // Form states
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<SexOption | null>(null);
  const [heightIn, setHeightIn] = useState("");
  const [weightLb, setWeightLb] = useState("");

  // Input focus tracking
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Initialize form when profile data loads
  useEffect(() => {
    if (profile) {
      if (profile.date_of_birth) {
        setDob(profile.date_of_birth);
      }
      if (profile.sex) {
        setSex(profile.sex);
      }
      if (profile.height_in != null) {
        setHeightIn(String(profile.height_in));
      }
      if (profile.weight_lb != null) {
        setWeightLb(String(profile.weight_lb));
      }
    }
  }, [profile]);

  // Client-side validations
  const dobValidation = useMemo(() => {
    const trimmed = dob.trim();
    if (!trimmed) {
      return { isValid: true, error: null, impliedAge: null };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return {
        isValid: false,
        error: "Date must be in YYYY-MM-DD format (e.g. 1998-03-15)",
        impliedAge: null,
      };
    }

    const [year, month, day] = trimmed.split("-").map(Number);
    if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
      return { isValid: false, error: "Invalid calendar date", impliedAge: null };
    }

    const birthDate = new Date(Date.UTC(year, month - 1, day));
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (birthDate > todayUtc) {
      return { isValid: false, error: "Date of birth cannot be in the future", impliedAge: null };
    }

    let age = todayUtc.getUTCFullYear() - birthDate.getUTCFullYear();
    const monthDiff = todayUtc.getUTCMonth() - birthDate.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && todayUtc.getUTCDate() < birthDate.getUTCDate())) {
      age--;
    }

    if (age < 16 || age > 80) {
      return {
        isValid: false,
        error: `Must imply an age between 16 and 80 (currently ${age} yrs)`,
        impliedAge: age,
      };
    }

    return { isValid: true, error: null, impliedAge: age };
  }, [dob]);

  const heightValidation = useMemo(() => {
    const trimmed = heightIn.trim();
    if (!trimmed) {
      return { isValid: true, error: null, feetInches: null };
    }

    const num = Number(trimmed);
    if (isNaN(num) || !Number.isInteger(num)) {
      return { isValid: false, error: "Height must be a whole number of inches", feetInches: null };
    }

    if (num < 36 || num > 96) {
      return { isValid: false, error: "Height must be between 36 and 96 inches", feetInches: null };
    }

    const feet = Math.floor(num / 12);
    const inches = num % 12;
    return { isValid: true, error: null, feetInches: `${feet}' ${inches}"` };
  }, [heightIn]);

  const weightValidation = useMemo(() => {
    const trimmed = weightLb.trim();
    if (!trimmed) {
      return { isValid: true, error: null };
    }

    const num = Number(trimmed);
    if (isNaN(num) || !Number.isInteger(num)) {
      return { isValid: false, error: "Weight must be a whole number of pounds" };
    }

    if (num < 60 || num > 500) {
      return { isValid: false, error: "Weight must be between 60 and 500 pounds" };
    }

    return { isValid: true, error: null };
  }, [weightLb]);

  const isFormValid = dobValidation.isValid && heightValidation.isValid && weightValidation.isValid;

  // Compute delta (send only what changed)
  const changes = useMemo(() => {
    const delta: ProfileSettingsRequest = {};

    const trimmedDob = dob.trim();
    const initialDob = profile?.date_of_birth || "";
    if (trimmedDob !== initialDob && trimmedDob !== "") {
      delta.date_of_birth = trimmedDob;
    }

    const initialSex = profile?.sex ?? null;
    if (sex !== initialSex && sex !== null) {
      delta.sex = sex;
    }

    const trimmedHeight = heightIn.trim();
    const heightNum = trimmedHeight !== "" ? parseInt(trimmedHeight, 10) : null;
    const initialHeight = profile?.height_in ?? null;
    if (heightNum !== null && heightNum !== initialHeight) {
      delta.height_in = heightNum;
    }

    const trimmedWeight = weightLb.trim();
    const weightNum = trimmedWeight !== "" ? parseInt(trimmedWeight, 10) : null;
    const initialWeight = profile?.weight_lb ?? null;
    if (weightNum !== null && weightNum !== initialWeight) {
      delta.weight_lb = weightNum;
    }

    return delta;
  }, [dob, sex, heightIn, weightLb, profile]);

  const hasChanges = Object.keys(changes).length > 0;

  const handleSave = async () => {
    if (!isFormValid || !hasChanges || isSubmitting) return;

    try {
      await updateSettings(changes).unwrap();
      Alert.alert(
        "Profile Updated",
        "Your biometric changes have been saved and real values synced to the staff dashboard.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error("Biometrics update failed:", err);
      const detail = err?.data?.detail;
      let message = "An error occurred while updating biometrics.";

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        // FastAPI / Pydantic 422 error list
        message = detail
          .map((item: any) => {
            const loc = Array.isArray(item.loc) ? item.loc.filter((l: any) => l !== "body").join(".") : "";
            return loc ? `${loc}: ${item.msg}` : item.msg;
          })
          .join("\n");
      } else if (detail && typeof detail === "object") {
        message = JSON.stringify(detail);
      }

      Alert.alert("Validation Error (422)", message);
    }
  };

  const sexOptions: { key: SexOption; label: string; sublabel: string }[] = [
    { key: "M", label: "Male", sublabel: "M" },
    { key: "F", label: "Female", sublabel: "F" },
    { key: "prefer_not_to_say", label: "Prefer not to say", sublabel: "PNS" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Biometric parameters are protected health indicators.
        </Text>
      </View>

      <CustomHeader
        title="Edit Biometrics"
        onBack={() => router.back()}
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Tag and Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
              RECORDS · PR-M-062 · BIOMETRICS
            </Text>
            <Text style={[styles.titleText, { color: theme.colors.text }]}>Edit biometrics</Text>
            <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
              Update your physical measurements and personal information. Values are used for staff dashboard readiness monitoring.
            </Text>
          </View>

          {/* Clinician authorized notice */}
          <View style={[styles.noticeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.noticeHeader}>
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.noticeTitle, { color: theme.colors.text }]}>Clinical Boundary</Text>
            </View>
            <Text style={[styles.noticeBody, { color: theme.colors.textSecondary }]}>
              Allergy and medication records remain strictly clinician-authorized and cannot be self-entered. Only core biometrics (DOB, sex, height, weight) are managed here.
            </Text>
          </View>

          {isProfileLoading ? (
            <View style={{ padding: 32, alignItems: "center" }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>Loading profile...</Text>
            </View>
          ) : (
            <>
              {/* Field 1: Date of Birth */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelRow}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Date of birth (DOB)</Text>
                  {dobValidation.impliedAge !== null && (
                    <Text style={[styles.fieldHint, { color: theme.colors.primary }]}>
                      Implied age: {dobValidation.impliedAge} yrs
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        focusedField === "dob"
                          ? theme.colors.primary
                          : dob.trim() && !dobValidation.isValid
                          ? theme.colors.dangerText
                          : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholder="YYYY-MM-DD (e.g. 1998-03-15)"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={dob}
                    onChangeText={setDob}
                    onFocus={() => setFocusedField("dob")}
                    onBlur={() => setFocusedField(null)}
                    maxLength={10}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {dob.length > 0 && (
                    <Pressable onPress={() => setDob("")} hitSlop={8}>
                      <Ionicons name="close-circle" size={16} color={theme.colors.textTertiary} />
                    </Pressable>
                  )}
                </View>
                {dob.trim() !== "" && !dobValidation.isValid ? (
                  <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
                    {dobValidation.error}
                  </Text>
                ) : (
                  <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
                    Must be in the past and imply an age between 16 and 80.
                  </Text>
                )}
              </View>

              {/* Field 2: Sex */}
              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Sex</Text>
                <View style={styles.sexOptionsContainer}>
                  {sexOptions.map((opt) => {
                    const isSelected = sex === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => setSex(opt.key)}
                        style={[
                          styles.sexChip,
                          {
                            backgroundColor: isSelected ? "rgba(0, 163, 196, 0.15)" : theme.colors.card,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                          },
                        ]}
                      >
                        <Ionicons
                          name={isSelected ? "radio-button-on" : "radio-button-off"}
                          size={16}
                          color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.sexChipText,
                            {
                              color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                              fontWeight: isSelected ? "700" : "500",
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
                  Biological sex classification for biometric assessments.
                </Text>
              </View>

              {/* Field 3: Height */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelRow}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Height (inches)</Text>
                  {heightValidation.feetInches && (
                    <Text style={[styles.fieldHint, { color: theme.colors.primary }]}>
                      ≈ {heightValidation.feetInches}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        focusedField === "height"
                          ? theme.colors.primary
                          : heightIn.trim() && !heightValidation.isValid
                          ? theme.colors.dangerText
                          : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Ionicons name="resize-outline" size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholder="e.g. 70 (for 5'10&quot;)"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={heightIn}
                    onChangeText={setHeightIn}
                    onFocus={() => setFocusedField("height")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Text style={[styles.unitBadge, { color: theme.colors.textSecondary }]}>inches</Text>
                </View>
                {heightIn.trim() !== "" && !heightValidation.isValid ? (
                  <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
                    {heightValidation.error}
                  </Text>
                ) : (
                  <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
                    Valid range: 36 – 96 inches (3&apos;0&quot; – 8&apos;0&quot;).
                  </Text>
                )}
              </View>

              {/* Field 4: Weight */}
              <View style={styles.fieldBlock}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Weight (pounds)</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        focusedField === "weight"
                          ? theme.colors.primary
                          : weightLb.trim() && !weightValidation.isValid
                          ? theme.colors.dangerText
                          : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Ionicons name="speedometer-outline" size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholder="e.g. 185"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={weightLb}
                    onChangeText={setWeightLb}
                    onFocus={() => setFocusedField("weight")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Text style={[styles.unitBadge, { color: theme.colors.textSecondary }]}>lbs</Text>
                </View>
                {weightLb.trim() !== "" && !weightValidation.isValid ? (
                  <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
                    {weightValidation.error}
                  </Text>
                ) : (
                  <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
                    Valid range: 60 – 500 pounds.
                  </Text>
                )}
              </View>

              {/* Server-Computed Metrics (Read-only) */}
              <View style={styles.fieldBlock}>
                <Text style={[styles.categoryHeader, { color: theme.colors.textSecondary }]}>
                  SERVER-COMPUTED METRICS
                </Text>
                <View style={[styles.computedCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                  <View style={styles.computedRow}>
                    <View style={styles.computedCol}>
                      <Text style={[styles.computedLabel, { color: theme.colors.textSecondary }]}>Age (server-computed)</Text>
                      <Text style={[styles.computedValue, { color: theme.colors.text }]}>
                        {profile?.age != null ? `${profile.age} yrs` : "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.computedCol}>
                      <Text style={[styles.computedLabel, { color: theme.colors.textSecondary }]}>BMI (server-computed)</Text>
                      <Text style={[styles.computedValue, { color: theme.colors.text }]}>
                        {profile?.bmi != null ? `${profile.bmi}` : "Not provided"}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.divider, { backgroundColor: theme.colors.cardBorder }]} />
                  <Text style={[styles.computedNote, { color: theme.colors.textTertiary }]}>
                    Age is computed from date of birth; BMI is computed using the imperial formula from height and weight. These values update on save.
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                <Pressable
                  onPress={handleSave}
                  disabled={!hasChanges || !isFormValid || isSubmitting}
                  style={[
                    styles.saveButton,
                    {
                      backgroundColor:
                        !hasChanges || !isFormValid || isSubmitting
                          ? theme.colors.primaryDisabled
                          : theme.colors.primary,
                    },
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.saveButtonText}>
                        {hasChanges ? "Save changes" : "No changes to save"}
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => router.back()}
                  disabled={isSubmitting}
                  style={[styles.cancelButton, { borderColor: theme.colors.cardBorder }]}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  titleText: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  noticeBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  fieldBlock: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  unitBadge: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  helperText: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  sexOptionsContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  sexChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sexChipText: {
    fontSize: 13,
  },
  categoryHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  computedCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  computedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  computedCol: {
    flex: 1,
  },
  computedLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  computedValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  computedNote: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: 12,
    gap: 12,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
