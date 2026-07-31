import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutSavedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Retrieve parameters passed from log-workout form
  const {
    date = "2026-07-18",
    activityType = "Strength",
    customTitle = "",
    duration = "23",
    rpe = "2",
    completion = "Completed",
    notes = "ssds",
    rating = "3",
  } = params;

  // Format date helper: "2026-07-18" -> "18 Jul 2026"
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = parseInt(month, 10) - 1;
      return `${day} ${months[monthIndex]} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formattedDate = formatDate(date as string);
  const workoutTitle = (activityType === "Others" && customTitle) ? (customTitle as string) : (activityType as string);

  const handleBackToWorkouts = () => {
    // Navigate back to workouts list and pass the workout log parameters to prepend
    router.replace({
      pathname: "/profile/workouts",
      params: {
        title: workoutTitle,
        subtitle: `${formattedDate} · ${duration} min · RPE ${rpe} · ${notes || "No notes"}`,
        category: activityType as string,
      },
    });
  };

  const handleLogAnother = () => {
    router.replace("/profile/log-workout" as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record. These records are controlled copies.
        </Text>
      </View>

      <CustomHeader
        title="Workout saved"
        onBack={handleBackToWorkouts}
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
            PR-M-055 · RECORDS — WORKOUT SAVED
          </Text>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Saved to your log</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            This entry is added to your workout log. Refresh clears it (prototype, in-memory only).
          </Text>
        </View>

        {/* Card 1: WORKOUT DETAILS */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>WORKOUT</Text>
          <Text style={[styles.workoutTitleText, { color: theme.colors.text }]}>{workoutTitle}</Text>
          <Text style={[styles.workoutSubtitleText, { color: theme.colors.textSecondary }]}>
            Today · {formattedDate} · {duration} min · RPE {rpe} / 5
          </Text>
          <Text style={[styles.workoutSubtitleText, { color: theme.colors.textSecondary }]}>
            {completion} · Rating {rating ? `${rating} / 5` : "— / 5"}
          </Text>
        </View>

        {/* Card 2: NOTES */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>NOTES (YOU WROTE)</Text>
          <Text style={[styles.notesText, { color: theme.colors.text }]}>{notes || "—"}</Text>
        </View>

        {/* Card 3: ADHERENCE STATS */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>ADHERENCE</Text>
          <Text style={[styles.adherenceText, { color: theme.colors.text }]}>
            5 of last 6 planned workouts completed · streak 2 weeks.
          </Text>
        </View>

        {/* Card 4: WHAT'S NEXT */}
        <View style={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, marginBottom: 32 }]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textSecondary }]}>What's next</Text>
          <Text style={[styles.nextDescription, { color: theme.colors.textSecondary }]}>
            This entry is added to your recent-workouts list. Limitations and rating are surfaced on the Workouts screen.
          </Text>

          <View style={styles.buttonsContainer}>
            <Pressable
              onPress={handleBackToWorkouts}
              style={[styles.primaryActionBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.primaryActionBtnText}>Back to Workouts</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </Pressable>

            <Pressable
              onPress={handleLogAnother}
              style={[styles.secondaryActionBtn, { backgroundColor: "#27272A" }]}
            >
              <Text style={styles.secondaryActionBtnText}>Log another</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerCode, { color: theme.colors.textTertiary }]}>
            Trace id M-055 · v1 prototype
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
  workoutTitleText: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  workoutSubtitleText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  adherenceText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  nextDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryActionBtn: {
    flexDirection: "row",
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryActionBtn: {
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionBtnText: {
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
