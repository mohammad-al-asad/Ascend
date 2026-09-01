import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector } from "../../../redux/store";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { CustomButton } from "../../../components/ui/CustomButton";
import { CustomBottomSheet } from "../../../components/ui/CustomBottomSheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Polygon, Line, Text as SvgText, Path } from "react-native-svg";
import {
  useGetHomeDashboardQuery,
  useGetWeeklyCheckinGateQuery,
  useGetDriverDetailQuery,
  DriverTrend,
  SupportPreviewItem,
  UpcomingItem,
} from "../../../redux/api/checkinApi";

const DRIVER_COLORS: Record<string, string> = {
  "Physical Readiness": "#00A3C4",
  "Sleep Readiness": "#8B5CF6",
  "Mental Performance": "#3B82F6",
  "Nutritional Readiness": "#10B981",
  "Spiritual Readiness": "#F59E0B",
};

const DRIVER_SHORT_NAMES: Record<string, string> = {
  "Physical Readiness": "Physical",
  "Sleep Readiness": "Sleep",
  "Mental Performance": "Mental",
  "Nutritional Readiness": "Nutritional",
  "Spiritual Readiness": "Spiritual",
};

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Retrieve user & auth state from Redux
  const user = useAppSelector((state) => state.auth.user);
  const { last_monthly_submission, monthly_cadence_start_date } = useAppSelector(
    (state) => state.checkin
  );

  // RTK Query queries
  const {
    data: homeData,
    refetch,
    isFetching,
  } = useGetHomeDashboardQuery(undefined, {
    pollingInterval: 60000,
  });
  const { data: weeklyGate } = useGetWeeklyCheckinGateQuery();

  // Detail Sheet State
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("Physical Readiness");
  const { data: driverDetail, isFetching: isDriverLoading } = useGetDriverDetailQuery(
    selectedDriver,
    {
      skip: !isDetailSheetVisible,
    }
  );

  // Readiness Score & Ops data
  const opsScore = homeData?.current_ops?.ops_score ?? user?.current_ops_score ?? 0;
  const opsBand = homeData?.current_ops?.ops_band ?? user?.current_ops_band ?? "Pending";
  const confidenceLevel =
    homeData?.current_ops?.confidence_level ??
    user?.ops_confidence_level ??
    "Medium confidence";
  const trendDelta = homeData?.current_ops?.trend_delta;
  const lastUpdated =
    homeData?.last_updated_label ||
    (homeData?.current_ops?.last_updated_at
      ? `Updated ${new Date(homeData.current_ops.last_updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "Updated recently");

  // Component Scores for Pentagon Radar
  const componentScores = homeData?.component_scores || user?.current_component_scores || {};
  const physicalVal = componentScores["Physical Readiness"] ?? 0;
  const sleepVal = componentScores["Sleep Readiness"] ?? 0;
  const mentalVal = componentScores["Mental Performance"] ?? 0;
  const nutritionalVal = componentScores["Nutritional Readiness"] ?? 0;
  const spiritualVal = componentScores["Spiritual Readiness"] ?? 0;

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
    return angles
      .map((angle) => {
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Data polygon points
  const values = [physicalVal, sleepVal, mentalVal, nutritionalVal, spiritualVal];
  const dataPoints = angles
    .map((angle, i) => {
      const r = radius * (Math.max(10, Math.min(100, values[i])) / 100);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  // Custom static dynamic date
  const getFormattedDate = () => {
    if (homeData?.date_label) return homeData.date_label.toUpperCase();
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const months = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];
    const now = new Date();
    return `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]}`;
  };

  // Check-in Cadence State Resolution
  const isAlreadyCompletedToday =
    Boolean(
      homeData?.todays_checkin?.already_completed_today ??
      homeData?.todays_checkin?.already_completed
    );
  const isWeeklyOpen = weeklyGate ? (!weeklyGate.locked && weeklyGate.days_until_open === 0) : false;

  // Monthly 30-day calculation fallback
  const isMonthlyOpen = (() => {
    if (!monthly_cadence_start_date) return false;
    const now = new Date().getTime();
    const start = new Date(monthly_cadence_start_date).getTime();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const currentPeriod = Math.floor((now - start) / THIRTY_DAYS_MS);
    if (!last_monthly_submission) return currentPeriod >= 1;
    const lastSub = new Date(last_monthly_submission).getTime();
    const lastSubPeriod = Math.floor((lastSub - start) / THIRTY_DAYS_MS);
    return currentPeriod > lastSubPeriod;
  })();

  const handleStartCheckin = () => {
    if (isAlreadyCompletedToday) {
      router.push("/(tabs)/(home)/checkin" as any);
      return;
    }

    if (isWeeklyOpen) {
      router.push("/checkin/weekly" as any);
    } else if (isMonthlyOpen) {
      router.push("/checkin/monthly" as any);
    } else {
      router.push("/checkin/daily" as any);
    }
  };

  const handleOpenDriver = (driverName: string) => {
    setSelectedDriver(driverName);
    setIsDetailSheetVisible(true);
  };

  const driverTrends: DriverTrend[] = homeData?.driver_trends || [];
  const supportPreviewList: SupportPreviewItem[] = homeData?.support_preview || [];
  const upcomingList: UpcomingItem[] = homeData?.upcoming || [];

  // Sparkline generator from numeric trend points
  const renderSparkline = (points: number[], color: string) => {
    const width = 90;
    const height = 20;
    if (!points || points.length < 2) {
      return (
        <Svg width={width} height={height} style={styles.sparkline}>
          <Path d={`M0,${height / 2} L${width},${height / 2}`} fill="none" stroke={color} strokeWidth="1.5" />
        </Svg>
      );
    }
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const step = width / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = idx * step;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
      <Svg width={width} height={height} style={styles.sparkline}>
        <Path
          d={`M${coords.join(" L")}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };

  // Area Chart generator for bottom sheet
  const renderSheetAreaChart = (points: any[]) => {
    const width = 320;
    const height = 75;
    const numericPoints = (points || [])
      .map((p) => (typeof p === "object" ? p.score : p))
      .filter((v) => typeof v === "number");

    if (numericPoints.length < 2) {
      return (
        <Svg viewBox={`0 0 ${width} ${height}`} style={styles.sheetChartSvg}>
          <Path d={`M0,${height / 2} L${width},${height / 2}`} fill="none" stroke={theme.colors.primary} strokeWidth="2" />
        </Svg>
      );
    }

    const min = Math.min(...numericPoints);
    const max = Math.max(...numericPoints);
    const range = max - min || 1;
    const step = width / (numericPoints.length - 1);

    const coords = numericPoints.map((p: number, idx: number) => {
      const x = idx * step;
      const y = height - ((p - min) / range) * (height - 20) - 10;
      return { x, y };
    });

    const lineD = `M${coords.map((c: any) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" L")}`;
    const areaD = `${lineD} L${width},${height} L0,${height} Z`;

    return (
      <Svg viewBox={`0 0 ${width} ${height}`} style={styles.sheetChartSvg}>
        <Path d={areaD} fill="rgba(0, 163, 196, 0.12)" />
        <Path
          d={lineD}
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };

  const todayForYou = homeData?.today_for_you;

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
      >
        {/* Greeting Banner */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.dateText, { color: "#8E8E93" }]}>{getFormattedDate()}</Text>
          <Text style={[styles.greetingText, { color: theme.colors.text }]}>
            {homeData?.greeting
              ? homeData.greeting
              : `Morning, ${user?.full_name?.split(" ")[0] || "Operator"}`}
          </Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.textSecondary }]}>
            {homeData?.subtitle || "Here's a quick look at your current readiness profile."}
          </Text>
        </View>

        {/* Current OPR / Readiness Score Card */}
        <View
          style={[
            styles.oprCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>CURRENT OPS</Text>
            {trendDelta !== undefined && trendDelta !== null && (
              <View style={styles.deltaBadge}>
                <Ionicons
                  name={trendDelta >= 0 ? "trending-up" : "trending-down"}
                  size={12}
                  color={trendDelta >= 0 ? "#22C55E" : "#EF4444"}
                />
                <Text
                  style={[
                    styles.deltaText,
                    { color: trendDelta >= 0 ? "#22C55E" : "#EF4444" },
                  ]}
                >
                  {trendDelta > 0 ? `+${trendDelta}` : `${trendDelta}`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.oprValueRow}>
            <Text style={[styles.oprValueText, { color: theme.colors.text }]}>{opsScore}</Text>
            <View style={[styles.yellowDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.oprScaleText, { color: theme.colors.textTertiary }]}>OPS SCORE</Text>
          </View>

          {/* OPR Track Bar */}
          <View style={[styles.oprTrack, { backgroundColor: "#1F1F23" }]}>
            <View
              style={[
                styles.oprFill,
                {
                  width: `${Math.max(5, Math.min(100, opsScore))}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>

          {/* Badge & Info Row */}
          <View style={styles.oprMetaRow}>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: "rgba(0, 163, 196, 0.1)", borderColor: "rgba(0, 163, 196, 0.2)" },
              ]}
            >
              <View style={[styles.badgeIndicator, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.confidenceText, { color: theme.colors.primary }]}>{confidenceLevel}</Text>
            </View>
            <Text style={[styles.updatedText, { color: theme.colors.textTertiary }]}>{lastUpdated}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.cardBorder }]} />

          {/* Band Row */}
          <View style={styles.bandRow}>
            <Text style={[styles.bandLabel, { color: theme.colors.textTertiary }]}>BAND</Text>
            <Text style={[styles.bandTitle, { color: theme.colors.text }]}>{opsBand?.toUpperCase()}</Text>
            <Text style={[styles.bandDesc, { color: theme.colors.textSecondary }]}>
              {homeData?.current_ops?.band_meaning || "You're in a stable readiness range. Maintain your routine."}
            </Text>
          </View>
        </View>

        {/* Today's Check-in Card (Only shown when an active check-in is pending) */}
        {!isAlreadyCompletedToday && (
          <View
            style={[
              styles.checkInCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>
                TODAY'S CHECK-IN
              </Text>
              {isWeeklyOpen ? (
                <View style={[styles.badgeDone, { backgroundColor: "rgba(0, 163, 196, 0.15)" }]}>
                  <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: "700" }}>WEEKLY DUE</Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.checkInTitle, { color: theme.colors.text }]}>
              {homeData?.todays_checkin?.title
                ? homeData.todays_checkin.title
                : isWeeklyOpen
                  ? "Weekly check-in is open (Day 7 review)."
                  : isMonthlyOpen
                    ? "Monthly wellness review is ready (Day 30)."
                    : "Five questions, about a minute."}
            </Text>

            <Text style={[styles.checkInDesc, { color: theme.colors.textSecondary }]}>
              {homeData?.todays_checkin?.body
                ? homeData.todays_checkin.body
                : isWeeklyOpen
                  ? "A deeper 7-day review of your training load, recovery, and consistency."
                  : isMonthlyOpen
                    ? "Align your longitudinal readiness and wellness goals with your support team."
                    : "Daily check-ins keep your OPS current and your care team informed."}
            </Text>

            <CustomButton
              label={
                homeData?.todays_checkin?.cta_label ||
                (isWeeklyOpen
                  ? "Start weekly check-in"
                  : isMonthlyOpen
                    ? "Start monthly review"
                    : "Start daily check-in")
              }
              onPress={handleStartCheckin}
              icon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
              iconPosition="right"
              style={styles.checkInBtn}
            />
          </View>
        )}

        {/* TODAY FOR YOU RECOMMENDATION (IF ACTIVE) */}
        {todayForYou && (
          <View
            style={[
              styles.recommendationCard,
              {
                backgroundColor: theme.colors.card,
                borderColor:
                  todayForYou.severity === "high"
                    ? "rgba(239, 68, 68, 0.4)"
                    : "rgba(0, 163, 196, 0.3)",
              },
            ]}
          >
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationTag}>
                <Ionicons
                  name="sparkles"
                  size={12}
                  color={todayForYou.severity === "high" ? "#EF4444" : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.recommendationTagText,
                    {
                      color:
                        todayForYou.severity === "high" ? "#EF4444" : theme.colors.primary,
                    },
                  ]}
                >
                  TODAY FOR YOU · {todayForYou.readiness_component?.toUpperCase() || "READINESS"}
                </Text>
              </View>
              {todayForYou.severity && (
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor:
                        todayForYou.severity === "high"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(245, 158, 11, 0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.severityText,
                      {
                        color:
                          todayForYou.severity === "high" ? "#EF4444" : "#F59E0B",
                      },
                    ]}
                  >
                    {todayForYou.severity.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
              {todayForYou.title}
            </Text>
            <Text style={[styles.recommendationBody, { color: theme.colors.textSecondary }]}>
              {todayForYou.body || todayForYou.suggested_action}
            </Text>

            {todayForYou.specialist_action && (
              <Pressable
                style={[styles.specialistActionBtn, { backgroundColor: "rgba(0, 163, 196, 0.08)" }]}
                onPress={() => router.push("/(tabs)/support" as any)}
              >
                <Ionicons name="chatbubbles-outline" size={14} color={theme.colors.primary} />
                <Text style={[styles.specialistActionText, { color: theme.colors.primary }]}>
                  {todayForYou.specialist_action}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
              </Pressable>
            )}
          </View>
        )}

        {/* Driver Trends Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Driver trends</Text>
          <Pressable style={styles.seeAllBtn} onPress={() => router.push("/(tabs)/trends" as any)}>
            <Text style={[styles.seeAllText, { color: theme.colors.textSecondary }]}>See all trends</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {driverTrends.map((driver, idx) => {
            const compName = driver.readiness_component;
            const shortName = driver.signal_label || DRIVER_SHORT_NAMES[compName] || compName;
            const color = DRIVER_COLORS[compName] || theme.colors.primary;
            const scoreVal = driver.current_score ?? componentScores[compName] ?? "--";

            return (
              <Pressable
                key={driver.readiness_component || idx}
                onPress={() => handleOpenDriver(compName)}
                style={[
                  styles.trendCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
                ]}
              >
                <View style={styles.trendCardHeader}>
                  <View style={[styles.trendIndicatorDot, { backgroundColor: color }]} />
                  <Text style={[styles.trendCategoryText, { color: theme.colors.textSecondary }]}>
                    {shortName}
                  </Text>
                  {driver.stale && (
                    <View style={styles.staleBadge}>
                      <Text style={styles.staleBadgeText}>Stale</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.trendValueText, { color: theme.colors.text }]}>{scoreVal}</Text>
                {renderSparkline(driver.trend_points, color)}
              </Pressable>
            );
          })}
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
              <Text style={[styles.cardTag, { color: theme.colors.textSecondary }]}>READINESS PROFILE</Text>
              <Text style={[styles.radarTitle, { color: theme.colors.text }]}>Your five drivers</Text>
            </View>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: "rgba(0, 163, 196, 0.1)", borderColor: "rgba(0, 163, 196, 0.2)" },
              ]}
            >
              <View style={[styles.badgeIndicator, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.confidenceText, { color: theme.colors.primary }]}>{confidenceLevel}</Text>
            </View>
          </View>
          <Text style={[styles.radarDesc, { color: theme.colors.textSecondary }]}>
            A live snapshot of the components shaping your current OPS score.
          </Text>

          {/* Custom SVG Pentagon Radar Chart */}
          <View style={styles.radarChartWrapper}>
            <Svg width="280" height="260">
              {[25, 50, 75, 100].map((level) => (
                <Polygon
                  key={level}
                  points={getPentagonPoints(radius * (level / 100))}
                  fill="none"
                  stroke="#27272A"
                  strokeWidth="1"
                />
              ))}

              {angles.map((angle, idx) => {
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return <Line key={idx} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#27272A" strokeWidth="1" />;
              })}

              <Polygon points={dataPoints} fill="rgba(0, 163, 196, 0.15)" stroke={theme.colors.primary} strokeWidth="1.5" />

              {/* Physical */}
              <SvgText x={centerX} y={centerY - radius - 15} fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                Physical
              </SvgText>
              <SvgText x={centerX} y={centerY - radius - 3} fill="#8E8E93" fontSize="10" textAnchor="middle">
                {physicalVal.toString()}
              </SvgText>

              {/* Sleep */}
              <SvgText x={centerX + radius * Math.cos(angles[1]) + 24} y={centerY + radius * Math.sin(angles[1]) - 3} fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                Sleep
              </SvgText>
              <SvgText x={centerX + radius * Math.cos(angles[1]) + 24} y={centerY + radius * Math.sin(angles[1]) + 9} fill="#8E8E93" fontSize="10" textAnchor="middle">
                {sleepVal.toString()}
              </SvgText>

              {/* Mental */}
              <SvgText x={centerX + radius * Math.cos(angles[2]) + 12} y={centerY + radius * Math.sin(angles[2]) + 15} fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                Mental
              </SvgText>
              <SvgText x={centerX + radius * Math.cos(angles[2]) + 12} y={centerY + radius * Math.sin(angles[2]) + 27} fill="#8E8E93" fontSize="10" textAnchor="middle">
                {mentalVal.toString()}
              </SvgText>

              {/* Nutritional */}
              <SvgText x={centerX + radius * Math.cos(angles[3]) - 24} y={centerY + radius * Math.sin(angles[3]) + 15} fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                Nutritional
              </SvgText>
              <SvgText x={centerX + radius * Math.cos(angles[3]) - 24} y={centerY + radius * Math.sin(angles[3]) + 27} fill="#8E8E93" fontSize="10" textAnchor="middle">
                {nutritionalVal.toString()}
              </SvgText>

              {/* Spiritual */}
              <SvgText x={centerX + radius * Math.cos(angles[4]) - 24} y={centerY + radius * Math.sin(angles[4]) - 3} fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                Spiritual
              </SvgText>
              <SvgText x={centerX + radius * Math.cos(angles[4]) - 24} y={centerY + radius * Math.sin(angles[4]) + 9} fill="#8E8E93" fontSize="10" textAnchor="middle">
                {spiritualVal.toString()}
              </SvgText>
            </Svg>
          </View>

          {/* Legend Grid */}
          <View style={styles.legendGrid}>
            <View style={styles.legendRow}>
              <Pressable onPress={() => handleOpenDriver("Physical Readiness")} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Physical</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{physicalVal}</Text>
              </Pressable>
              <Pressable onPress={() => handleOpenDriver("Sleep Readiness")} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#8B5CF6" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Sleep</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{sleepVal}</Text>
              </Pressable>
            </View>

            <View style={styles.legendRow}>
              <Pressable onPress={() => handleOpenDriver("Mental Performance")} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Mental</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{mentalVal}</Text>
              </Pressable>
              <Pressable onPress={() => handleOpenDriver("Nutritional Readiness")} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Nutritional</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{nutritionalVal}</Text>
              </Pressable>
            </View>

            <View style={styles.legendRow}>
              <Pressable onPress={() => handleOpenDriver("Spiritual Readiness")} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Spiritual</Text>
                <Text style={[styles.legendVal, { color: theme.colors.text }]}>{spiritualVal}</Text>
              </Pressable>
              <View style={styles.legendItem} />
            </View>
          </View>
        </View>

        {/* Talk to your team */}
        {supportPreviewList.length > 0 && (
          <>
            <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Talk to your team</Text>
              <Pressable style={styles.openSupportBtn} onPress={() => router.push("/(tabs)/support" as any)}>
                <Text style={[styles.openSupportText, { color: theme.colors.primary }]}>Open support</Text>
                <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} style={{ marginLeft: 4 }} />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
              {supportPreviewList.map((item, idx) => {
                const iconName =
                  item.key === "scs"
                    ? "barbell-outline"
                    : item.key === "pt_im"
                      ? "heart-half-outline"
                      : "shield-checkmark-outline";
                const iconColor =
                  item.key === "scs"
                    ? theme.colors.primary
                    : item.key === "pt_im"
                      ? "#10B981"
                      : "#F59E0B";

                return (
                  <Pressable
                    key={item.key || idx}
                    onPress={() => router.push("/(tabs)/support" as any)}
                    style={[styles.teamCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                  >
                    <View style={[styles.teamIconWrapper, { backgroundColor: `${iconColor}1A` }]}>
                      <Ionicons name={iconName as any} size={20} color={iconColor} />
                    </View>
                    <Text style={[styles.teamTitle, { color: theme.colors.text }]}>{item.label}</Text>
                    <Text style={[styles.teamDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.teamStatusBadge}>
                      <Text style={[styles.teamStatusText, { color: theme.colors.textSecondary }]}>
                        {item.availability_status}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Upcoming Section */}
        {upcomingList.length > 0 && (
          <>
            <Text style={[styles.sectionHeading, { color: theme.colors.text, marginTop: 16, marginBottom: 12 }]}>
              Upcoming
            </Text>

            <View style={[styles.agendaCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              {upcomingList.map((item, idx) => {
                const isLast = idx === upcomingList.length - 1;
                const iconName =
                  item.key === "weekly_checkin"
                    ? "calendar-outline"
                    : item.key === "oft"
                      ? "fitness-outline"
                      : "clipboard-outline";

                const routeTarget =
                  item.key === "weekly_checkin"
                    ? "/(tabs)/(home)/checkin"
                    : item.key === "oft"
                      ? "/(tabs)/(home)/oft"
                      : "/(tabs)/(home)/assessments";

                return (
                  <Pressable
                    key={item.key || idx}
                    onPress={() => router.push(routeTarget as any)}
                    style={[
                      styles.agendaItemRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder },
                    ]}
                  >
                    <View style={styles.agendaLeft}>
                      <View style={[styles.agendaIconWrapper, { backgroundColor: "#27272A" }]}>
                        <Ionicons name={iconName as any} size={16} color={theme.colors.textSecondary} />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[styles.agendaItemTitle, { color: theme.colors.text }]}>{item.title}</Text>
                        <Text style={[styles.agendaItemSubtitle, { color: theme.colors.textSecondary }]}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.agendaBadge, { backgroundColor: "#27272A" }]}>
                      <Text style={[styles.agendaBadgeText, { color: theme.colors.text }]}>{item.tag}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Footer */}
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          Pull to refresh · {lastUpdated}
        </Text>
      </ScrollView>

      {/* ================= DRIVER DETAIL BOTTOM SHEET ================= */}
      <CustomBottomSheet
        visible={isDetailSheetVisible}
        onClose={() => setIsDetailSheetVisible(false)}
        title={selectedDriver}
        subtitle="DRIVER DETAIL"
        snapPoints={["80%"]}
        scrollable={true}
      >
        {isDriverLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 32 }} />
        ) : (
          <>
            <Text style={[styles.sheetSubtitleText, { color: theme.colors.textSecondary }]}>
              Current score {driverDetail?.current_score ?? componentScores[selectedDriver] ?? 75} · band{" "}
              {driverDetail?.score_band || opsBand}
            </Text>

            {/* Chart Card */}
            <View style={[styles.sheetChartCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
              {renderSheetAreaChart(driverDetail?.trend_points || [])}
              <Text style={[styles.sheetChartFooter, { color: theme.colors.textTertiary }]}>
                Rolling trend points · {driverDetail?.trend_direction?.toUpperCase() || "STABLE"}
              </Text>
            </View>

            {/* Grid of Metric Cards */}
            <View style={styles.sheetGrid}>
              <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
                <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>TREND</Text>
                <View style={styles.sheetGridValueRow}>
                  <Ionicons
                    name={
                      driverDetail?.trend_direction === "down"
                        ? "trending-down"
                        : "trending-up"
                    }
                    size={14}
                    color={
                      driverDetail?.trend_direction === "down"
                        ? "#EF4444"
                        : theme.colors.success
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>
                    {driverDetail?.trend_direction?.toUpperCase() || "STABLE"}
                  </Text>
                </View>
                <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>vs. prior 30d</Text>
              </View>

              <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
                <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>7D Δ</Text>
                <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>
                  {driverDetail?.delta_7d !== undefined && driverDetail?.delta_7d !== null
                    ? `${driverDetail.delta_7d > 0 ? "+" : ""}${driverDetail.delta_7d}`
                    : "--"}
                </Text>
                <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>7-day delta</Text>
              </View>

              <View style={[styles.sheetGridCard, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
                <Text style={[styles.sheetGridLabel, { color: theme.colors.textTertiary }]}>30D Δ</Text>
                <Text style={[styles.sheetGridVal, { color: theme.colors.text }]}>
                  {driverDetail?.delta_30d !== undefined && driverDetail?.delta_30d !== null
                    ? `${driverDetail.delta_30d > 0 ? "+" : ""}${driverDetail.delta_30d}`
                    : "--"}
                </Text>
                <Text style={[styles.sheetGridSub, { color: theme.colors.textTertiary }]}>30-day delta</Text>
              </View>
            </View>

            {/* Influences List */}
            {driverDetail?.influences && driverDetail.influences.length > 0 && (
              <>
                <Text style={[styles.sheetSectionHeader, { color: theme.colors.textTertiary }]}>INFLUENCES</Text>
                <View style={styles.sheetActionList}>
                  {driverDetail.influences.map((inf, idx) => (
                    <View
                      key={inf.key || idx}
                      style={[
                        styles.sheetActionItem,
                        { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder },
                      ]}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={theme.colors.primary}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.influenceTitle, { color: theme.colors.text }]}>{inf.title}</Text>
                        <Text style={[styles.influenceDetail, { color: theme.colors.textSecondary }]}>
                          {inf.detail}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Try This Recommendations */}
            {driverDetail?.try_this && driverDetail.try_this.length > 0 && (
              <>
                <Text style={[styles.sheetSectionHeader, { color: theme.colors.textTertiary }]}>TRY THIS</Text>
                <View style={styles.sheetActionList}>
                  {driverDetail.try_this.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.sheetActionItem,
                        { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={theme.colors.primary}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={[styles.sheetActionText, { color: theme.colors.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* CTA Button */}
            <CustomButton
              label={driverDetail?.support_cta_label || "Talk to Support Team"}
              onPress={() => {
                setIsDetailSheetVisible(false);
                router.push((driverDetail?.support_route as any) || "/(tabs)/support");
              }}
              icon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
              iconPosition="right"
              style={styles.sheetSubmitBtn}
            />
          </>
        )}
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
    padding: 20,
    paddingBottom: 60,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    lineHeight: 20,
  },
  oprCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
    gap: 4,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: "700",
  },
  oprValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  oprValueText: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 48,
  },
  yellowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    marginBottom: 6,
  },
  oprScaleText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  oprTrack: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    marginBottom: 16,
    overflow: "hidden",
  },
  oprFill: {
    height: "100%",
    borderRadius: 3,
  },
  oprMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontWeight: "600",
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
    flexDirection: "column",
  },
  bandLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bandTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bandDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkInCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  badgeDone: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: "600",
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
  recommendationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recommendationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recommendationTagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  recommendationBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  specialistActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  specialistActionText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "500",
  },
  horizontalScrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  trendCard: {
    width: 145,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
    height: 108,
  },
  trendCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  trendCategoryText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  staleBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  staleBadgeText: {
    color: "#EF4444",
    fontSize: 9,
    fontWeight: "700",
  },
  trendValueText: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 4,
  },
  sparkline: {
    alignSelf: "flex-end",
  },
  radarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  radarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  radarTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  radarDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  radarChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  legendGrid: {
    marginTop: 16,
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    flex: 1,
  },
  legendVal: {
    fontSize: 14,
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    height: 140,
    justifyContent: "space-between",
  },
  teamIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  teamTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },
  teamDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  teamStatusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  agendaItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
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
    justifyContent: "center",
    alignItems: "center",
  },
  agendaItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  agendaItemSubtitle: {
    fontSize: 12,
  },
  agendaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  agendaBadgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
  sheetSubtitleText: {
    fontSize: 13,
    marginBottom: 16,
  },
  sheetChartCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sheetChartSvg: {
    width: "100%",
    height: 70,
  },
  sheetChartFooter: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 8,
  },
  sheetGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  sheetGridCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  sheetGridLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sheetGridValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  sheetGridVal: {
    fontSize: 16,
    fontWeight: "700",
  },
  sheetGridSub: {
    fontSize: 10,
  },
  sheetSectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sheetActionList: {
    gap: 8,
    marginBottom: 20,
  },
  sheetActionItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  sheetActionText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  influenceTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  influenceDetail: {
    fontSize: 12,
  },
  sheetSubmitBtn: {
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
  },
});
