import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [workoutsList, setWorkoutsList] = useState([
    {
      id: 1,
      title: "Strength · full body",
      subtitle: "17 Jul · 55 min · RPE 3 · Hip hinge focus",
      category: "Strength",
      icon: "barbell-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 2,
      title: "Cardio · steady zone 2",
      subtitle: "16 Jul · 38 min · RPE 2 · Run, nasal breathing",
      category: "Cardio",
      icon: "pulse-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 3,
      title: "Mobility · hip + t-spine",
      subtitle: "15 Jul · 22 min · RPE 1 · 90-90, world's greatest stretch",
      category: "Mobility",
      icon: "time-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 4,
      title: "Strength · lower",
      subtitle: "14 Jul · 48 min · RPE 4 · Squat pattern",
      category: "Strength",
      icon: "barbell-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 5,
      title: "Cardio · intervals",
      subtitle: "13 Jul · 32 min · RPE 4 · 6 x 400m",
      category: "Cardio",
      icon: "pulse-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 6,
      title: "Mobility · shoulders",
      subtitle: "12 Jul · 18 min · RPE 1 · CARs + scapular work",
      category: "Mobility",
      icon: "time-outline" as keyof typeof Ionicons.glyphMap,
    },
  ]);

  // Dynamically prepend new logged workout if coming back from workout-saved screen
  React.useEffect(() => {
    if (params.title && params.subtitle && params.category) {
      const newWorkout = {
        id: workoutsList.length + 1 + Math.random(),
        title: params.title as string,
        subtitle: params.subtitle as string,
        category: params.category as string,
        icon: (params.category === "Cardio"
          ? "pulse-outline"
          : params.category === "Mobility"
          ? "time-outline"
          : "barbell-outline") as keyof typeof Ionicons.glyphMap,
      };

      const alreadyExists = workoutsList.some((w) => w.subtitle === newWorkout.subtitle);
      if (!alreadyExists) {
        setWorkoutsList((prev) => [newWorkout, ...prev]);
      }
    }
  }, [params]);

  const handleLogPress = () => {
    router.push("/profile/log-workout" as any);
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
        title="Workouts"
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
            PR-M-055 · RECORDS - WORKOUTS
          </Text>
          <View style={styles.titleRow}>
            <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Workout log</Text>
            <Pressable
              onPress={handleLogPress}
              style={[styles.logButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.logButtonText}>+ Log</Text>
            </Pressable>
          </View>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Your recent training log. Tap "Log" to add a session — saved for this page only (prototype).
          </Text>
        </View>

        {/* Section Heading with Counter Badge */}
        <View style={styles.headingRow}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Recent workouts</Text>
          <View style={styles.counterBadge}>
            <Text style={[styles.counterBadgeText, { color: theme.colors.textSecondary }]}>
              Last {workoutsList.length}
            </Text>
          </View>
        </View>

        {/* Card list of workouts */}
        <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {workoutsList.map((item, idx) => {
            const isLast = idx === workoutsList.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.listItemRow,
                  { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: theme.colors.cardBorder },
                ]}
              >
                <View style={styles.listItemLeft}>
                  <View style={[styles.iconWrapper, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name={item.icon} size={18} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                {/* Right category pill badge */}
                <View style={styles.categoryBadge}>
                  <Text style={[styles.categoryBadgeText, { color: theme.colors.text }]}>
                    {item.category}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* RPE guide note footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            RPE = Rate of Perceived Exertion - 1 (very easy) to 5 (maximal).
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
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  logButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  counterBadge: {
    backgroundColor: "#1C1F26",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 24,
  },
  listItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
  },
  categoryBadge: {
    backgroundColor: "#27272A",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
