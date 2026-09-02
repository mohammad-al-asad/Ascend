import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetWorkoutsQuery } from "../../../redux/api/workoutsApi";

const ACTIVITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  strength: "barbell-outline",
  cardio: "pulse-outline",
  mobility: "time-outline",
  recovery: "leaf-outline",
  other: "ellipsis-horizontal-outline",
};

const ACTIVITY_LABELS: Record<string, string> = {
  strength: "Strength",
  cardio: "Cardio",
  mobility: "Mobility",
  recovery: "Recovery",
  other: "Other",
};

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day} ${months[parseInt(month, 10) - 1]}`;
  } catch {
    return dateStr;
  }
}

export default function WorkoutsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, isError } = useGetWorkoutsQuery();
  const workouts = data?.workouts ?? [];

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
            Your recent training log, last 30 days.
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}

        {isError && !isLoading && (
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
            Could not load your workout log. Pull to refresh or try again shortly.
          </Text>
        )}

        {!isLoading && !isError && (
          <>
            {/* Section Heading with Counter Badge */}
            <View style={styles.headingRow}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Recent workouts</Text>
              <View style={styles.counterBadge}>
                <Text style={[styles.counterBadgeText, { color: theme.colors.textSecondary }]}>
                  {workouts.length}
                </Text>
              </View>
            </View>

            {workouts.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No workouts logged in the last 30 days.
              </Text>
            ) : (
              <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                {workouts.map((item, idx) => {
                  const isLast = idx === workouts.length - 1;
                  const title =
                    item.activity_type === "other" && item.custom_title
                      ? item.custom_title
                      : `${ACTIVITY_LABELS[item.activity_type] ?? item.activity_type}${item.custom_title ? ` · ${item.custom_title}` : ""}`;
                  const subtitleParts = [
                    formatDate(item.activity_date),
                    `${item.duration_minutes} min`,
                    `RPE ${item.intensity}`,
                  ];
                  if (item.notes) subtitleParts.push(item.notes);
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
                          <Ionicons
                            name={ACTIVITY_ICONS[item.activity_type] ?? "barbell-outline"}
                            size={18}
                            color={item.reported_limitation ? theme.colors.dangerText : theme.colors.textSecondary}
                          />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{title}</Text>
                          <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                            {subtitleParts.join(" · ")}
                          </Text>
                        </View>
                      </View>

                      {/* Right category pill badge */}
                      <View style={styles.categoryBadge}>
                        <Text style={[styles.categoryBadgeText, { color: theme.colors.text }]}>
                          {ACTIVITY_LABELS[item.activity_type] ?? item.activity_type}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

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
    alignItems: "center",
    justifyContent: "space-between",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  logButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
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
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
  },
  counterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#1C1F26",
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#27272A",
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  footerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
