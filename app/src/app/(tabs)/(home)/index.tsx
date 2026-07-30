import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector } from "../../../redux/store";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomBottomSheet } from "../../../components/ui/CustomBottomSheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Polygon, Line, Text as SvgText, Path } from "react-native-svg";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Retrieve user & onboarding details from state
  const user = useAppSelector((state) => state.auth.user);
  const answers = useAppSelector((state) => state.auth.onboardingAnswers);

  const [isDetailSheetVisible, setIsDetailSheetVisible] = React.useState(false);


  // Helper to calculate mock readiness index based on actual onboarding responses
  const getReadinessScore = () => {
    let score = 78; // baseline shown in mockup
    if (answers[1] === "Peak") score += 8;
    else if (answers[1] === "Ready") score += 4;
    else if (answers[1] === "Below standard") score -= 12;

    if (answers[8] === "Calm") score += 6;
    else if (answers[8] === "Overwhelmed") score -= 14;

    if (answers[13] === "7 or more") score += 4;
    else if (answers[13] === "Less than 4") score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const readinessScore = getReadinessScore();

  // Driver metrics (default values from screenshot, customizable by onboarding answers)
  const physicalVal = answers[1] === "Peak" ? 92 : answers[1] === "Ready" ? 82 : answers[1] === "Below standard" ? 58 : 82;
  const sleepVal = answers[13] === "7 or more" ? 88 : answers[13] === "Less than 4" ? 54 : 74;
  const mentalVal = answers[8] === "Calm" ? 84 : answers[8] === "Overwhelmed" ? 52 : 69;
  const nutritionalVal = answers[4] === "3 structured meals" ? 76 : answers[4] === "Skip meals" ? 48 : 56;
  const spiritualVal = 84; // default baseline

  // SVG Radar Chart Constants
  const centerX = 140;
  const centerY = 130;
  const radius = 75;

  const angles = [
    -Math.PI / 2, // Physical (top)
    -Math.PI / 2 + (2 * Math.PI) / 5, // Sleep (top-right)
    -Math.PI / 2 + (4 * Math.PI) / 5, // Mental (bottom-right)
    -Math.PI / 2 + (6 * Math.PI) / 5, // Nutritional (bottom-left)
    -Math.PI / 2 + (8 * Math.PI) / 5, // Spiritual (top-left)
  ];

  // Concentric pentagon points
  const getPentagonPoints = (r: number) => {
    return angles.map((angle) => {
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  // Data polygon points
  const values = [physicalVal, sleepVal, mentalVal, nutritionalVal, spiritualVal];
  const dataPoints = angles.map((angle, i) => {
    const r = radius * (values[i] / 100);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  // Custom static dynamic date
  const getFormattedDate = () => {
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const months = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    const now = new Date();
    return `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]}`;
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
        title="Today"
        rightElement={
          <View style={styles.headerRight}>
            <Pressable style={styles.bellBtn} onPress={() => router.push("/notifications" as any)}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
              <View style={[styles.bellDot, { backgroundColor: theme.colors.primary }]} />
            </Pressable>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting Banner */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.dateText, { color: "#8E8E93" }]}>
            {getFormattedDate()}
          </Text>
          <Text style={[styles.greetingText, { color: theme.colors.text }]}>
            Morning, {user?.username ? user.username.split(" ")[1] || user.username : "Alex"}
          </Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.textSecondary }]}>
            {"Here's a quick look at how things are going."}
          </Text>
        </View>

        {/* Current OPR Card */}
        <View
          style={[
            styles.oprCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>
            CURRENT OPR
          </Text>
          <View style={styles.oprValueRow}>
            <Text style={[styles.oprValueText, { color: theme.colors.text }]}>
              {readinessScore}
            </Text>
            <View style={[styles.yellowDot, { backgroundColor: theme.colors.warningText }]} />
            <Text style={[styles.oprScaleText, { color: theme.colors.textTertiary }]}>
              OPR
            </Text>
          </View>

          {/* OPR Track Bar */}
          <View style={[styles.oprTrack, { backgroundColor: "#1F1F23" }]}>
            <View
              style={[
                styles.oprFill,
                {
                  width: `${readinessScore}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>

          {/* Badge & Info Row */}
          <View style={styles.oprMetaRow}>
            <View style={[styles.confidenceBadge, { backgroundColor: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" }]}>
              <View style={[styles.badgeIndicator, { backgroundColor: theme.colors.warningText }]} />
              <Text style={[styles.confidenceText, { color: theme.colors.warningText }]}>
                Medium confidence
              </Text>
            </View>
            <Text style={[styles.updatedText, { color: theme.colors.textTertiary }]}>
              Updated 14 min ago
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.cardBorder }]} />

          {/* Band Row */}
          <View style={styles.bandRow}>
            <Text style={[styles.bandLabel, { color: theme.colors.textTertiary }]}>BAND</Text>
            <Text style={[styles.bandTitle, { color: theme.colors.text }]}>Monitor</Text>
            <Text style={[styles.bandDesc, { color: theme.colors.textSecondary }]}>
              {"You're in a stable range. Keep your routine going."}
            </Text>
          </View>
        </View>

        {/* Today's Check-in Card */}
        <View
          style={[
            styles.checkInCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>
            {"TODAY'S CHECK-IN"}
          </Text>
          <Text style={[styles.checkInTitle, { color: theme.colors.text }]}>
            Five questions, about a minute.
          </Text>
          <Text style={[styles.checkInDesc, { color: theme.colors.textSecondary }]}>
            Daily check-ins keep your OPR current and your support team informed.
          </Text>
          <CustomButton
            label="Start daily check-in"
            onPress={() => router.push("/onboarding" as any)}
            icon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
            iconPosition="right"
            style={styles.checkInBtn}
          />
        </View>

        {/* Driver Trends Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            Driver trends
          </Text>
          <Pressable style={styles.seeAllBtn}>
            <Text style={[styles.seeAllText, { color: theme.colors.textSecondary }]}>
              See all
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {/* Card 1: Physical */}
          <Pressable
            onPress={() => setIsDetailSheetVisible(true)}
            style={[styles.trendCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
          >
            <View style={styles.trendCardHeader}>
              <View style={[styles.trendIndicatorDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.trendCategoryText, { color: theme.colors.textSecondary }]}>Physical</Text>
            </View>
            <Text style={[styles.trendValueText, { color: theme.colors.text }]}>{physicalVal}</Text>
            <Svg width="90" height="20" style={styles.sparkline}>
              <Path d="M0,15 Q25,8 45,12 T90,5" fill="none" stroke={theme.colors.primary} strokeWidth="1.5" />
            </Svg>
          </Pressable>

          {/* Card 2: Sleep */}
          <View style={[styles.trendCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.trendCardHeader}>
              <View style={[styles.trendIndicatorDot, { backgroundColor: "#8B5CF6" }]} />
              <Text style={[styles.trendCategoryText, { color: theme.colors.textSecondary }]}>Sleep</Text>
            </View>
            <Text style={[styles.trendValueText, { color: theme.colors.text }]}>{sleepVal}</Text>
            <Svg width="90" height="20" style={styles.sparkline}>
              <Path d="M0,10 Q20,15 40,8 T90,12" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
            </Svg>
          </View>

          {/* Card 3: Mental */}
          <View style={[styles.trendCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.trendCardHeader}>
              <View style={[styles.trendIndicatorDot, { backgroundColor: "#3B82F6" }]} />
              <Text style={[styles.trendCategoryText, { color: theme.colors.textSecondary }]}>Mental</Text>
            </View>
            <Text style={[styles.trendValueText, { color: theme.colors.text }]}>{mentalVal}</Text>
            <Svg width="90" height="20" style={styles.sparkline}>
              <Path d="M0,12 Q22,4 45,14 T90,8" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
            </Svg>
          </View>
        </ScrollView>

        {/* Readiness Profile Radar */}
        <View
          style={[
            styles.radarCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.radarHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>
                READINESS PROFILE
              </Text>
              <Text style={[styles.radarTitle, { color: theme.colors.text }]}>
                Your five drivers
              </Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" }]}>
              <View style={[styles.badgeIndicator, { backgroundColor: theme.colors.warningText }]} />
              <Text style={[styles.confidenceText, { color: theme.colors.warningText }]}>
                Medium confidence
              </Text>
            </View>
          </View>
          <Text style={[styles.radarDesc, { color: theme.colors.textSecondary }]}>
            A visual snapshot of the components shaping your current OPR.
          </Text>

          {/* Custom SVG Pentagon Radar Chart */}
          <View style={styles.radarChartWrapper}>
            <Svg width="280" height="260">
              {/* Concentric grid pentagons */}
              {[25, 50, 75, 100].map((level) => (
                <Polygon
                  key={level}
                  points={getPentagonPoints(radius * (level / 100))}
                  fill="none"
                  stroke="#27272A"
                  strokeWidth="1"
                />
              ))}

              {/* Pentagon Axes */}
              {angles.map((angle, idx) => {
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return (
                  <Line
                    key={idx}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="#27272A"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Polygon */}
              <Polygon
                points={dataPoints}
                fill="rgba(0, 163, 196, 0.15)"
                stroke={theme.colors.primary}
                strokeWidth="1.5"
              />

              {/* Text Labels positioned around vertices */}
              {/* Top - Physical */}
              <SvgText
                x={centerX}
                y={centerY - radius - 15}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {`Physical`}
              </SvgText>
              <SvgText
                x={centerX}
                y={centerY - radius - 3}
                fill="#8E8E93"
                fontSize="10"
                textAnchor="middle"
              >
                {physicalVal.toString()}
              </SvgText>

              {/* Top-Right - Sleep */}
              <SvgText
                x={centerX + radius * Math.cos(angles[1]) + 24}
                y={centerY + radius * Math.sin(angles[1]) - 3}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {`Sleep`}
              </SvgText>
              <SvgText
                x={centerX + radius * Math.cos(angles[1]) + 24}
                y={centerY + radius * Math.sin(angles[1]) + 9}
                fill="#8E8E93"
                fontSize="10"
                textAnchor="middle"
              >
                {sleepVal.toString()}
              </SvgText>

              {/* Bottom-Right - Mental */}
              <SvgText
                x={centerX + radius * Math.cos(angles[2]) + 12}
                y={centerY + radius * Math.sin(angles[2]) + 15}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {`Mental`}
              </SvgText>
              <SvgText
                x={centerX + radius * Math.cos(angles[2]) + 12}
                y={centerY + radius * Math.sin(angles[2]) + 27}
                fill="#8E8E93"
                fontSize="10"
                textAnchor="middle"
              >
                {mentalVal.toString()}
              </SvgText>

              {/* Bottom-Left - Nutritional */}
              <SvgText
                x={centerX + radius * Math.cos(angles[3]) - 24}
                y={centerY + radius * Math.sin(angles[3]) + 15}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {`Nutritional`}
              </SvgText>
              <SvgText
                x={centerX + radius * Math.cos(angles[3]) - 24}
                y={centerY + radius * Math.sin(angles[3]) + 27}
                fill="#8E8E93"
                fontSize="10"
                textAnchor="middle"
              >
                {nutritionalVal.toString()}
              </SvgText>

              {/* Top-Left - Spiritual */}
              <SvgText
                x={centerX + radius * Math.cos(angles[4]) - 24}
                y={centerY + radius * Math.sin(angles[4]) - 3}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                {`Spiritual`}
              </SvgText>
              <SvgText
                x={centerX + radius * Math.cos(angles[4]) - 24}
                y={centerY + radius * Math.sin(angles[4]) + 9}
                fill="#8E8E93"
                fontSize="10"
                textAnchor="middle"
              >
                {spiritualVal.toString()}
              </SvgText>
            </Svg>
          </View>

          {/* Legend Grid */}
          <View style={styles.legendGrid}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Physical</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{physicalVal}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#8B5CF6" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Sleep</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{sleepVal}</Text>
              </View>
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Mental</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{mentalVal}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Nutritional</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{nutritionalVal}</Text>
              </View>
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Spiritual</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{spiritualVal}</Text>
              </View>
              <View style={styles.legendItem} />
            </View>
          </View>
        </View>

        {/* Today for you */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text, marginTop: 12, marginBottom: 12 }]}>
          Today for you
        </Text>

        <View style={[styles.todayCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.todayGoalRow}>
            <View style={styles.goalBadge}>
              <Ionicons name="compass-outline" size={12} color={theme.colors.primary} />
              <Text style={[styles.goalBadgeText, { color: theme.colors.primary }]}>Goal</Text>
            </View>
            <Text style={[styles.goalSubtext, { color: theme.colors.textTertiary }]}>Sleep · G2</Text>
          </View>

          <Text style={[styles.todayTitleText, { color: theme.colors.text }]}>
            Add a 20-minute wind-down tonight
          </Text>
          <Text style={[styles.todayBodyText, { color: theme.colors.textSecondary }]}>
            Your sleep readiness has been flat for four days. A short, screen-free wind-down has helped others in your unit this week.
          </Text>

          <View style={styles.todayActionsRow}>
            <Pressable
              onPress={() => setIsDetailSheetVisible(true)}
              style={[styles.actionBtnFilled, { backgroundColor: "#27272A" }]}
            >
              <Text style={[styles.actionBtnFilledText, { color: theme.colors.text }]}>Open action</Text>
            </Pressable>
            <Pressable style={styles.actionBtnText}>
              <Text style={[styles.actionBtnTextLabel, { color: theme.colors.textSecondary }]}>Dismiss</Text>
            </Pressable>
          </View>
        </View>

        {/* Talk to your team */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            Talk to your team
          </Text>
          <Pressable style={styles.openSupportBtn}>
            <Text style={[styles.openSupportText, { color: theme.colors.primary }]}>
              Open support
            </Text>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {/* Card 1: Fitness */}
          <View style={[styles.teamCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={[styles.teamIconWrapper, { backgroundColor: "rgba(0, 163, 196, 0.1)" }]}>
              <Ionicons name="barbell-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={[styles.teamTitle, { color: theme.colors.text }]}>Fitness</Text>
            <Text style={[styles.teamDesc, { color: theme.colors.textSecondary }]}>Plan, training, OPR</Text>
            <View style={styles.teamStatusBadge}>
              <Text style={[styles.teamStatusText, { color: theme.colors.textSecondary }]}>Active</Text>
            </View>
          </View>

          {/* Card 2: Injury/Recovery */}
          <View style={[styles.teamCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={[styles.teamIconWrapper, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
              <Ionicons name="heart-half-outline" size={20} color="#10B981" />
            </View>
            <Text style={[styles.teamTitle, { color: theme.colors.text }]}>Injury/Recovery</Text>
            <Text style={[styles.teamDesc, { color: theme.colors.textSecondary }]}>Rehab, return-to-perf</Text>
            <View style={styles.teamStatusBadge}>
              <Text style={[styles.teamStatusText, { color: theme.colors.textSecondary }]}>Available</Text>
            </View>
          </View>
        </ScrollView>

        {/* Upcoming Section */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text, marginTop: 16, marginBottom: 12 }]}>
          Upcoming
        </Text>

        <View
          style={[
            styles.agendaCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          {/* Agenda Item 1 */}
          <Pressable
            onPress={() => router.push("/checkin" as any)}
            style={[styles.agendaItemRow, { borderBottomColor: theme.colors.cardBorder }]}
          >
            <View style={styles.agendaLeft}>
              <View style={[styles.agendaIconWrapper, { backgroundColor: "#27272A" }]}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.agendaItemTitle, { color: theme.colors.text }]}>Weekly check-in</Text>
                <Text style={[styles.agendaItemSubtitle, { color: theme.colors.textSecondary }]}>Available in 2 days</Text>
              </View>
            </View>
            <View style={[styles.agendaBadge, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.agendaBadgeText, { color: theme.colors.text }]}>Cadence</Text>
            </View>
          </Pressable>

          {/* Agenda Item 2 */}
          <Pressable
            onPress={() => router.push("/oft" as any)}
            style={[styles.agendaItemRow, { borderBottomColor: theme.colors.cardBorder }]}
          >
            <View style={styles.agendaLeft}>
              <View style={[styles.agendaIconWrapper, { backgroundColor: "#27272A" }]}>
                <Ionicons name="add-circle-outline" size={16} color={theme.colors.textSecondary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.agendaItemTitle, { color: theme.colors.text }]}>OFT – monthly components</Text>
                <Text style={[styles.agendaItemSubtitle, { color: theme.colors.textSecondary }]}>Scheduled - 22 July</Text>
              </View>
            </View>
            <View style={[styles.agendaBadge, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.agendaBadgeText, { color: theme.colors.text }]}>Operational</Text>
            </View>
          </Pressable>

          {/* Agenda Item 3 */}
          <Pressable
            onPress={() => router.push("/assessments" as any)}
            style={styles.agendaItemRow}
          >
            <View style={styles.agendaLeft}>
              <View style={[styles.agendaIconWrapper, { backgroundColor: "#27272A" }]}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.agendaItemTitle, { color: theme.colors.text }]}>Initial HPO/H2P assessment</Text>
                <Text style={[styles.agendaItemSubtitle, { color: theme.colors.textSecondary }]}>Complete by 15 Aug · 20d left</Text>
              </View>
            </View>
            <View style={[styles.agendaBadge, { backgroundColor: "#27272A" }]}>
              <Text style={[styles.agendaBadgeText, { color: theme.colors.text }]}>Program</Text>
            </View>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          Pull to refresh · Last updated 14 min ago
        </Text>
      </ScrollView>

      {/* ================= DETAIL BOTTOM SHEET ================= */}
      <CustomBottomSheet
        visible={isDetailSheetVisible}
        onClose={() => setIsDetailSheetVisible(false)}
        title="Physical readiness"
        subtitle="DRIVER DETAIL"
        snapPoints={["80%"]}
        scrollable={true}
      >
        <Text style={[styles.sheetSubtitleText, { color: theme.colors.textSecondary }]}>
          Updated 14:02 · score band Ready
        </Text>

        {/* Chart Card */}
        <View style={[styles.sheetChartCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
          <Svg viewBox="0 0 320 80" style={styles.sheetChartSvg}>
            <Path
              d="M0,50 Q40,48 80,45 T160,35 T240,42 T320,25"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="2"
            />
            <Path
              d="M0,50 Q40,48 80,45 T160,35 T240,42 T320,25 L320,80 L0,80 Z"
              fill="rgba(0, 163, 196, 0.08)"
            />
          </Svg>
          <Text style={[styles.sheetChartFooter, { color: theme.colors.textTertiary }]}>
            Last 30 days · placeholder
          </Text>
        </View>

        {/* Grid of 4 Cards */}
        <View style={styles.sheetGrid}>
          {/* Item 1: Trend */}
          <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>TREND</Text>
            <View style={styles.sheetGridValueRow}>
              <Ionicons name="trending-up" size={14} color={theme.colors.success} style={{ marginRight: 4 }} />
              <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>Up</Text>
            </View>
            <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>vs. prior 30d</Text>
          </View>

          {/* Item 2: 7D Delta */}
          <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>7D Δ</Text>
            <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>+4.2</Text>
            <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>placeholder</Text>
          </View>

          {/* Item 3: 30D Delta */}
          <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>30D Δ</Text>
            <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>+9.6</Text>
            <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>placeholder</Text>
          </View>

          {/* Item 4: Peer Cohort */}
          <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>PEER COHORT</Text>
            <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>Top 28%</Text>
            <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>k-anonymous</Text>
          </View>
        </View>

        {/* Action List Section */}
        <Text style={[styles.sheetSectionHeader, { color: theme.colors.textTertiary }]}>TRY THIS</Text>
        <View style={styles.sheetActionList}>
          <View style={[styles.sheetActionItem, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.sheetActionText, { color: theme.colors.text }]}>
              {"Log a 10-minute mobility session before tomorrow's shift."}
            </Text>
          </View>
          <View style={[styles.sheetActionItem, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.sheetActionText, { color: theme.colors.text }]}>
              {"Pair today's check-in with a brief walk after lunch."}
            </Text>
          </View>
          <View style={[styles.sheetActionItem, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.sheetActionText, { color: theme.colors.text }]}>
              {"Schedule your next readiness check-in before Friday."}
            </Text>
          </View>
        </View>

        {/* Influences Section */}
        <View style={[styles.influencesContainer, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
          <View style={styles.influencesHeader}>
            <Text style={[styles.influencesHeaderText, { color: theme.colors.text }]}>What influences this</Text>
            <Ionicons name="chevron-up" size={14} color={theme.colors.textSecondary} />
          </View>
          <View style={styles.influencesBody}>
            <View style={styles.influenceRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.influenceTitle, { color: theme.colors.text }]}>Daily check-ins</Text>
                <Text style={[styles.influenceSub, { color: theme.colors.textTertiary }]}>
                  {"Last 7 days logged on time · placeholder"}
                </Text>
              </View>
            </View>
            <View style={[styles.influenceDivider, { backgroundColor: theme.colors.cardBorder }]} />
            <View style={styles.influenceRow}>
              <Ionicons name="barbell-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.influenceTitle, { color: theme.colors.text }]}>Activity band</Text>
                <Text style={[styles.influenceSub, { color: theme.colors.textTertiary }]}>
                  {"Daily steps below cohort median · placeholder"}
                </Text>
              </View>
            </View>
            <View style={[styles.influenceDivider, { backgroundColor: theme.colors.cardBorder }]} />
            <View style={styles.influenceRow}>
              <Ionicons name="repeat-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.influenceTitle, { color: theme.colors.text }]}>Recovery trend</Text>
                <Text style={[styles.influenceSub, { color: theme.colors.textTertiary }]}>
                  {"Variability rising across last 4 days · placeholder"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Talk to my PT/IM Submit Button */}
        <CustomButton
          label="Talk to my PT/IM"
          onPress={() => alert("Connecting to your PT/IM...")}
          icon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
          iconPosition="right"
          style={styles.sheetSubmitBtn}
        />
        <Text style={[styles.sheetSubmitBtnSub, { color: theme.colors.textTertiary }]}>
          {"Routes to your PT/IM in My Support Team"}
        </Text>
      </CustomBottomSheet>
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
    padding: 16,
    paddingBottom: 40,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bellBtn: {
    position: "relative",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  greetingContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
  },
  oprCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  oprValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  oprValueText: {
    fontSize: 56,
    fontWeight: "900",
    lineHeight: 60,
  },
  yellowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
    marginTop: -20,
  },
  oprScaleText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    alignSelf: "flex-end",
    paddingBottom: 10,
  },
  oprTrack: {
    height: 4,
    borderRadius: 2,
    width: "100%",
    marginBottom: 16,
  },
  oprFill: {
    height: "100%",
    borderRadius: 2,
  },
  oprMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "700",
  },
  updatedText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 16,
  },
  bandRow: {
    gap: 4,
  },
  bandLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bandTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  bandDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkInCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  checkInDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  checkInBtn: {
    width: "100%",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  horizontalScrollContent: {
    paddingRight: 16,
    gap: 12,
    marginBottom: 24,
  },
  trendCard: {
    width: 110,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  trendCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trendIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  trendCategoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  trendValueText: {
    fontSize: 24,
    fontWeight: "800",
  },
  sparkline: {
    marginTop: 4,
  },
  radarCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  radarHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  radarTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  radarDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  radarChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  legendGrid: {
    gap: 8,
    paddingHorizontal: 8,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    flex: 1,
  },
  legendVal: {
    fontSize: 13,
    fontWeight: "700",
    marginRight: 16,
  },
  todayCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  todayGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(0, 163, 196, 0.1)",
    gap: 4,
  },
  goalBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  goalSubtext: {
    fontSize: 11,
    fontWeight: "600",
  },
  todayTitleText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  todayBodyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  todayActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtnFilled: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnFilledText: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionBtnText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtnTextLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  openSupportBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  openSupportText: {
    fontSize: 13,
    fontWeight: "600",
  },
  teamCard: {
    width: 160,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  teamIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  teamTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  teamDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  teamStatusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1F1F23",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  teamStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  agendaCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  agendaItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  agendaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  agendaIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  agendaItemTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  agendaItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  agendaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  agendaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  sheetSubtitleText: {
    fontSize: 13,
    marginTop: -4,
    marginBottom: 16,
  },
  sheetChartCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sheetChartSvg: {
    width: "100%",
    height: 80,
  },
  sheetChartFooter: {
    fontSize: 11,
    marginTop: 8,
  },
  sheetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  sheetGridCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  sheetGridLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sheetGridValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetGridVal: {
    fontSize: 16,
    fontWeight: "800",
  },
  sheetGridSub: {
    fontSize: 10,
  },
  sheetSectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sheetActionList: {
    gap: 8,
    marginBottom: 16,
  },
  sheetActionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  sheetActionText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontWeight: "500",
  },
  influencesContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  influencesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  influencesHeaderText: {
    fontSize: 14,
    fontWeight: "700",
  },
  influencesBody: {
    marginTop: 16,
    gap: 12,
  },
  influenceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  influenceTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  influenceSub: {
    fontSize: 11,
    marginTop: 2,
  },
  influenceDivider: {
    height: 1,
    width: "100%",
  },
  sheetSubmitBtn: {
    width: "100%",
    marginTop: 8,
  },
  sheetSubmitBtnSub: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
});
