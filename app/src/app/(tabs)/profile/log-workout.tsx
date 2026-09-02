import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogWorkoutMutation } from "../../../redux/api/workoutsApi";

const ACTIVITY_UI_TO_API: Record<string, string> = {
  Strength: "strength",
  Cardio: "cardio",
  Mobility: "mobility",
  Others: "other",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LogWorkoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [logWorkout, { isLoading }] = useLogWorkoutMutation();

  // Form states
  const [dateStr, setDateStr] = useState(todayIso());
  const [activityType, setActivityType] = useState("Strength");
  const [customTitle, setCustomTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [rpeRating, setRpeRating] = useState(2);
  const [completion, setCompletion] = useState("Completed");
  const [notes, setNotes] = useState("");
  const [sessionRating, setSessionRating] = useState(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI state
  const [showDropdown, setShowDropdown] = useState(false);

  const activityOptions = ["Strength", "Cardio", "Mobility", "Others"];

  const handleSelectActivity = (type: string) => {
    setActivityType(type);
    setShowDropdown(false);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      const result = await logWorkout({
        activity_date: dateStr,
        activity_type: ACTIVITY_UI_TO_API[activityType] as any,
        custom_title: activityType === "Others" ? customTitle : undefined,
        duration_minutes: parseInt(duration, 10),
        intensity: rpeRating,
        completion_status: completion === "Completed" ? "completed" : "partial",
        notes: notes || undefined,
        session_rating: sessionRating,
      }).unwrap();

      router.push({
        pathname: "/profile/workout-saved",
        params: {
          id: result.id,
          activity_date: result.activity_date,
          activity_type: result.activity_type,
          custom_title: result.custom_title ?? "",
          duration_minutes: String(result.duration_minutes),
          intensity: String(result.intensity),
          completion_status: result.completion_status,
          notes: result.notes ?? "",
          session_rating: result.session_rating !== null ? String(result.session_rating) : "",
          reported_limitation: String(result.reported_limitation),
        },
      });
    } catch (e: any) {
      setErrorMessage(e?.data?.detail ?? "Could not save this workout. Check the fields and try again.");
    }
  };

  const isFormValid = dateStr.trim().length > 0 && duration.trim().length > 0 && Number(duration) > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record. These records are controlled copies.
        </Text>
      </View>

      <CustomHeader
        title="Log workout"
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
        <View style={styles.titleBlock}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            PR-M-055 · RECORDS — LOG WORKOUT
          </Text>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Log a workout</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Record the date, activity, duration, and how it felt.
          </Text>
        </View>

        {/* 1. Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Date *</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <TextInput
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textTertiary}
              style={[styles.textInput, { color: theme.colors.text }]}
            />
          </View>
          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            Defaults to today. Pick another day if logging after the fact.
          </Text>
        </View>

        {/* 2. Activity Type Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Activity type *</Text>
          <Pressable
            onPress={() => setShowDropdown(!showDropdown)}
            style={[
              styles.dropdownSelector,
              {
                backgroundColor: theme.colors.card,
                borderColor: showDropdown ? theme.colors.primary : theme.colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.dropdownValueText, { color: theme.colors.text }]}>{activityType}</Text>
            <Ionicons
              name={showDropdown ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {showDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              {activityOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => handleSelectActivity(option)}
                  style={[styles.dropdownOption, { borderBottomColor: theme.colors.cardBorder }]}
                >
                  <Text style={[styles.dropdownOptionText, { color: theme.colors.text }]}>{option}</Text>
                  {activityType === option && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            Pick the category that best describes this session.
          </Text>
        </View>

        {/* 3. Custom Title */}
        {activityType === "Others" && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Custom title (only for "Other") *</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <TextInput
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="Enter custom title"
                placeholderTextColor={theme.colors.textTertiary}
                style={[styles.textInput, { color: theme.colors.text }]}
              />
            </View>
          </View>
        )}

        {/* 4. Duration Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Duration (minutes) *</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 30"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="number-pad"
              style={[styles.textInput, { color: theme.colors.text }]}
            />
          </View>
          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            Whole minutes · 1–600.
          </Text>
        </View>

        {/* 5. Intensity (RPE 1-5) */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Intensity (RPE 1–5) *</Text>
          <View style={styles.ratingsRow}>
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected = rpeRating === rating;
              return (
                <Pressable
                  key={rating}
                  onPress={() => setRpeRating(rating)}
                  style={[
                    styles.ratingItem,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.ratingItemText, { color: isSelected ? "#FFFFFF" : theme.colors.textSecondary }]}>
                    {rating}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            RPE = Rate of Perceived Exertion · 1 (very easy) to 5 (maximal).
          </Text>
        </View>

        {/* 6. Completion Tabs */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Completion</Text>
          <View style={styles.tabsRow}>
            {["Completed", "Partial"].map((tab) => {
              const isSelected = completion === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setCompletion(tab)}
                  style={[
                    styles.tabItem,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.tabItemText, { color: isSelected ? "#FFFFFF" : theme.colors.textSecondary }]}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 7. Notes Text Area */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Notes / limitations (optional)</Text>
          <View style={[styles.textAreaBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <TextInput
              multiline={true}
              numberOfLines={4}
              placeholder="Write notes here..."
              placeholderTextColor={theme.colors.textTertiary}
              value={notes}
              onChangeText={(text) => setNotes(text.slice(0, 280))}
              style={[styles.textAreaInput, { color: theme.colors.text }]}
              textAlignVertical="top"
            />
          </View>
          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            {notes.length} / 280 · mentioning pain, injury, or a limitation creates a real SCS review item.
          </Text>
        </View>

        {/* 8. Session Rating */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Session rating</Text>
          <View style={styles.ratingsRow}>
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected = sessionRating === rating;
              return (
                <Pressable
                  key={rating}
                  onPress={() => setSessionRating(rating)}
                  style={[
                    styles.ratingItem,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.ratingItemText, { color: isSelected ? "#FFFFFF" : theme.colors.textSecondary }]}>
                    {rating}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            How did the session feel overall?
          </Text>
        </View>

        {errorMessage && (
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{errorMessage}</Text>
        )}

        {/* Save button */}
        <View style={styles.submitContainer}>
          <Pressable
            onPress={handleSave}
            disabled={!isFormValid || isLoading || (activityType === "Others" && !customTitle.trim())}
            style={[
              styles.submitButton,
              {
                backgroundColor: isFormValid && !isLoading ? theme.colors.primary : "#27272A",
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={[styles.submitButtonText, { color: isFormValid ? "#FFFFFF" : theme.colors.textSecondary }]}>
                  Save workout
                </Text>
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={isFormValid ? "#FFFFFF" : theme.colors.textSecondary}
                />
              </>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerCode, { color: theme.colors.textTertiary }]}>
            Trace id M-055
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
  titleBlock: {
    marginBottom: 24,
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
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 14,
    fontWeight: "500",
    padding: 0,
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  dropdownValueText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  ratingsRow: {
    flexDirection: "row",
    gap: 8,
  },
  ratingItem: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingItemText: {
    fontSize: 14,
    fontWeight: "700",
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabItem: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemText: {
    fontSize: 14,
    fontWeight: "700",
  },
  textAreaBox: {
    borderWidth: 1,
    borderRadius: 10,
    height: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textAreaInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    padding: 0,
  },
  helpText: {
    fontSize: 11,
    marginTop: 6,
    paddingLeft: 2,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  submitContainer: {
    marginTop: 12,
    marginBottom: 32,
  },
  submitButton: {
    flexDirection: "row",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 14,
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
