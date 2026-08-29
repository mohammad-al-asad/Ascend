import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetRecordsHomeQuery } from "../../../redux/api/recordsApi";

export default function RecordsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading } = useGetRecordsHomeQuery();

  const handleCardPress = (key: string) => {
    switch (key) {
      case "oft":
        router.push("/profile/oft" as any);
        break;
      case "assessments":
        router.push("/profile/assessments" as any);
        break;
      case "uploads":
        router.push("/profile/uploads" as any);
        break;
      case "workouts":
        router.push("/profile/workouts" as any);
        break;
      case "reconditioning":
        Alert.alert(
          "Reconditioning Plan",
          "Your active Return-to-Performance plan is managed by your primary care therapist."
        );
        break;
      case "flyaway":
        router.push("/profile/flyaway" as any);
        break;
      default:
        break;
    }
  };

  const getCategoryData = (key: string, defaultTitle: string, defaultSub: string) => {
    if (!data) return { title: defaultTitle, subtitle: defaultSub };
    const cat = data.categories.find(c => c.key === key);
    return cat ? { title: cat.label, subtitle: cat.subtitle } : { title: defaultTitle, subtitle: defaultSub };
  };

  const renderCard = (
    key: string,
    defaultTitle: string,
    defaultSubtitlePrefix: string,
    iconName: keyof typeof Ionicons.glyphMap,
    badgeText?: string
  ) => {
    const { title, subtitle } = getCategoryData(key, defaultTitle, defaultSubtitlePrefix);

    return (
      <Pressable
        onPress={() => handleCardPress(key)}
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.cardBorder,
          },
        ]}
      >
        {/* Left Icon Badge */}
        <View style={[styles.iconBadge, { backgroundColor: "#141F21" }]}>
          <Ionicons name={iconName} size={20} color={theme.colors.primary} />
        </View>

        {/* Center Content */}
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
          <View style={styles.subtitleRow}>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
            {badgeText && (
              <View style={[styles.statusBadge, { backgroundColor: "rgba(16, 185, 129, 0.12)", marginLeft: 6 }]}>
                <Text style={[styles.statusBadgeText, { color: theme.colors.success }]}>
                  {badgeText}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right Chevron */}
        <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
      </Pressable>
    );
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
        title="Records"
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
        {/* Smiley Face Graphic Container */}
        <View style={styles.smileyContainer}>
          <Svg width={96} height={96} viewBox="0 0 96 96">
            <Circle cx={48} cy={48} r={44} stroke={theme.colors.primary} strokeWidth={2.5} fill="none" />
            {/* Happy curved eyes */}
            <Path d="M 32 46 Q 38 36 44 46" stroke={theme.colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Path d="M 52 46 Q 58 36 64 46" stroke={theme.colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {/* Smiling mouth */}
            <Path d="M 36 58 Q 48 70 60 58" stroke={theme.colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </Svg>
        </View>

        {/* Header Text Block */}
        <View style={styles.headerTextBlock}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            RECORDS · PR-M-050
          </Text>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
            What's on your records?
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Choose what you'd like to see. Every category is one tap away — none are subordinate to another.
          </Text>
        </View>

        {/* Warning / Controlled Copies Info Card */}
        <View style={[styles.warningCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
            These records are controlled copies. Ascend is not a Government system of record.
          </Text>
        </View>

        {/* List of Category Cards */}
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <View style={styles.cardsList}>
            {renderCard("uploads", "My Uploads", "Medical record history · last 14 Jun 2026", "folder-outline")}
            {renderCard("workouts", "Workouts Log", "Recent activity · Strength · Tue 16 Jul", "fitness-outline")}
            {renderCard("oft", "OFT Status", "Current test cycle · ", "timer-outline", "Current")}
            {renderCard("reconditioning", "Reconditioning Plan", "Active plan · Return-to-Performance", "flash-outline")}
            {renderCard("assessments", "Assessments", "Initial status · ", "document-text-outline", "Complete")}
            {renderCard("flyaway", "Fly Away Kit", "Read-only preview · last export 02 Jul 2026", "cube-outline")}
          </View>
        )}

        {/* Monospace Metadata Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>Records home</Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>PR-M-050 · IA-05 §2</Text>
          
          <Text style={[styles.footerLabel, { color: theme.colors.textTertiary }]}>Source</Text>
          <Text style={[styles.footerCode, { color: theme.colors.textTertiary }]}>
            medical_record_upload · workout_log · oft_status ·{"\n"}
            reconditioning_plan · assessment_status · fly_away_kit
          </Text>
          
          <Text style={[styles.footerLabel, { color: theme.colors.textTertiary }]}>OPS</Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>not recomputed on this surface</Text>
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
    paddingTop: 32,
    paddingBottom: 48,
  },
  smileyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headerTextBlock: {
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  warningCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  cardsList: {
    marginBottom: 32,
  },
  cardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardSubtitle: {
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
    paddingTop: 24,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  footerLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  footerCode: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 4,
  },
});
