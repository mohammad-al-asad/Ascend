import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput as RNTextInput, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../utils/useTheme";
import { CustomHeader } from "../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { dailyQuestions, weeklyQuestions, monthlyQuestions } from "../../config/checkinQuestions";
import {
  saveDailyAnswer,
  saveWeeklyAnswer,
  saveMonthlyAnswer,
  submitDailyCheckin as submitDailySlice,
  submitWeeklyCheckin as submitWeeklySlice,
  submitMonthlyCheckin as submitMonthlySlice,
} from "../../redux/slices/checkinSlice";
import {
  useGetDailyCheckinQuery,
  useSubmitDailyCheckinMutation,
  useGetWeeklyCheckinQuery,
  useSubmitWeeklyCheckinMutation,
  useGetMonthlyCheckinQuery,
  useSubmitMonthlyCheckinMutation,
} from "../../redux/api/checkinApi";

export default function DynamicCheckinScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { day0_daily_checkin_status, daily_answers, weekly_answers, monthly_answers } = useAppSelector(
    (state) => state.checkin
  );

  // RTK Query hooks
  const { data: serverDaily, isLoading: isDailyLoading } = useGetDailyCheckinQuery(undefined, {
    skip: type !== "daily",
  });
  const { data: serverWeekly, isLoading: isWeeklyLoading } = useGetWeeklyCheckinQuery(undefined, {
    skip: type !== "weekly",
  });
  const { data: serverMonthly, isLoading: isMonthlyLoading } = useGetMonthlyCheckinQuery(undefined, {
    skip: type !== "monthly",
  });

  const [submitDailyMutation, { isLoading: isDailySubmitting }] = useSubmitDailyCheckinMutation();
  const [submitWeeklyMutation, { isLoading: isWeeklySubmitting }] = useSubmitWeeklyCheckinMutation();
  const [submitMonthlyMutation, { isLoading: isMonthlySubmitting }] = useSubmitMonthlyCheckinMutation();

  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});

  let rawQuestions: any[] = [];
  let answers: Record<string, string> = {};
  let title = "";
  let headerTitle = "";
  let isDay0 = false;
  let saveAction: any = null;
  let sliceSubmitAction: any = null;
  let fallbackQuestions: any[] = [];

  if (type === "daily") {
    rawQuestions = serverDaily?.questions && serverDaily.questions.length > 0 ? serverDaily.questions : dailyQuestions;
    fallbackQuestions = dailyQuestions;
    answers = daily_answers;
    isDay0 = day0_daily_checkin_status === "pending" || !!serverDaily?.is_day_zero;
    title = isDay0 ? "Today's check-in" : "Daily check-in";
    headerTitle = isDay0 ? "Day 0 check-in" : "Daily check-in";
    saveAction = saveDailyAnswer;
    sliceSubmitAction = submitDailySlice;
  } else if (type === "weekly") {
    const weeklyList = Array.isArray(serverWeekly) ? serverWeekly : serverWeekly?.questions;
    rawQuestions = weeklyList && weeklyList.length > 0 ? weeklyList : weeklyQuestions;
    fallbackQuestions = weeklyQuestions;
    answers = weekly_answers;
    title = "Weekly check-in";
    headerTitle = "Weekly check-in";
    saveAction = saveWeeklyAnswer;
    sliceSubmitAction = submitWeeklySlice;
  } else if (type === "monthly") {
    const monthlyList = Array.isArray(serverMonthly) ? serverMonthly : serverMonthly?.questions;
    rawQuestions = monthlyList && monthlyList.length > 0 ? monthlyList : monthlyQuestions;
    fallbackQuestions = monthlyQuestions;
    answers = monthly_answers;
    title = "Monthly check-in";
    headerTitle = "Monthly check-in";
    saveAction = saveMonthlyAnswer;
    sliceSubmitAction = submitMonthlySlice;
  }

  // Merge each question with options from fallback questions if options are missing from the server
  const questions = rawQuestions.map((q: any, idx: number) => {
    let options = q.options;
    if (!options || options.length === 0) {
      const match = fallbackQuestions.find(
        (f) =>
          f.id === q.id ||
          f.id === q.label ||
          f.id === `D${idx + 1}` ||
          f.id === `W${idx + 1}` ||
          f.id === `M${idx + 1}` ||
          f.question === q.question
      );
      if (match) {
        options = match.options;
      }
    }
    return {
      ...q,
      options: options || [],
    };
  });

  const handleSelectOption = (questionId: string, optionTitleOrId: string) => {
    dispatch(saveAction({ id: questionId, answer: optionTitleOrId }));
  };

  const isAllAnswered =
    questions.length > 0 &&
    questions.every((q) => {
      const qId = String(q.id || q.question_id || q.label);
      return Boolean(answers[qId] || answers[q.id]);
    });

  const isSubmitting = isDailySubmitting || isWeeklySubmitting || isMonthlySubmitting;

  const handleSubmit = async () => {
    if (!isAllAnswered || isSubmitting) return;

    try {
      if (type === "daily") {
        const payload = questions.map((q, idx) => {
          const qId = q.question_id || q.id || idx + 1;
          const userAns = answers[String(q.id)] || answers[String(q.label)] || answers[q.id] || "";
          return {
            question_id: typeof qId === "number" ? qId : idx + 1,
            answer: userAns,
            follow_up_answer: followUpAnswers[String(q.id)] || undefined,
          };
        });

        await submitDailyMutation({ answers: payload }).unwrap();
      } else if (type === "weekly") {
        const payload = questions.map((q, idx) => {
          const qId = q.question_id || q.id || idx + 1;
          const userAns = answers[String(q.id)] || answers[String(q.label)] || answers[q.id] || "";
          return {
            question_id: typeof qId === "number" ? qId : idx + 101,
            answer: userAns,
          };
        });

        await submitWeeklyMutation({ answers: payload }).unwrap();
      } else if (type === "monthly") {
        const payload = questions.map((q, idx) => {
          const qId = q.question_id || q.id || idx + 1;
          const userAns = answers[String(q.id)] || answers[String(q.label)] || answers[q.id] || "";
          return {
            question_id: typeof qId === "number" ? qId : idx + 201,
            answer: userAns,
          };
        });

        await submitMonthlyMutation({ answers: payload }).unwrap();
      }

      // Update Redux slice state
      dispatch(sliceSubmitAction());
      router.replace("/(tabs)/(home)" as any);
    } catch (err) {
      console.log("Checkin submit error:", err);
      // Even if network error occurs, save locally and go home
      dispatch(sliceSubmitAction());
      router.replace("/(tabs)/(home)" as any);
    }
  };

  const getMissingCount = () => {
    return questions.filter((q) => {
      const qId = String(q.id || q.question_id || q.label);
      return !answers[qId] && !answers[q.id];
    }).length;
  };

  const submitLabel = isSubmitting
    ? "Submitting responses..."
    : isAllAnswered
      ? "Submit Check-in >"
      : `Answer ${getMissingCount()} more to submit >`;

  const isLoading =
    (type === "daily" && isDailyLoading && !serverDaily) ||
    (type === "weekly" && isWeeklyLoading && !serverWeekly) ||
    (type === "monthly" && isMonthlyLoading && !serverMonthly);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader title={headerTitle} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          {isDay0 && <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>DAY 0 · BASELINE</Text>}

          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{title}</Text>

          {isDay0 && (
            <View style={[styles.badge, { backgroundColor: "rgba(0, 163, 196, 0.15)" }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>DAY 0</Text>
            </View>
          )}

          <Text style={[styles.pageDesc, { color: theme.colors.textSecondary }]}>
            {isDay0
              ? "Tell us how you're starting. Your responses seed your rolling OPS and start the weekly + monthly cadence."
              : type === "weekly"
                ? "Review your physical consistency, recovery, and readiness drivers over the last 7 days."
                : type === "monthly"
                  ? "Longitudinal wellness and goal alignment check-in across all 5 readiness pillars."
                  : "Tell us how you're starting today. Your responses directly update your rolling OPS score."}
          </Text>
        </View>

        {questions.map((q, idx) => {
          const qKey = String(q.id || q.code || q.label || idx + 1);
          const currentAnswer = answers[qKey] || answers[String(q.id)] || answers[String(q.label)];
          const driverLabel = q.readiness_component || q.driver || q.category || "";

          return (
            <View key={qKey} style={styles.questionBlock}>
              <View style={styles.questionHeader}>
                <View style={[styles.questionTag, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                  <Text style={[styles.questionTagText, { color: theme.colors.textSecondary }]}>
                    {(idx + 1).toString().padStart(2, "0")}
                  </Text>
                </View>
                <Text style={[styles.questionTitle, { color: theme.colors.text }]}>
                  {driverLabel ? `${driverLabel} · ` : ""}
                  {q.question}
                </Text>
              </View>

              <View style={styles.optionsList}>
                {(q.options || []).map((opt: any, optIdx: number) => {
                  const optTitle =
                    typeof opt === "object" && opt !== null
                      ? opt.label || opt.title || opt.text || opt.name || opt.value || opt.option || ""
                      : String(opt || "");

                  const optSubtitle =
                    typeof opt === "object" && opt !== null
                      ? opt.subtitle || opt.description || opt.desc || opt.detail || opt.subtext || undefined
                      : undefined;

                  const optId =
                    typeof opt === "object" && opt !== null
                      ? opt.id !== undefined
                        ? String(opt.id)
                        : opt.code || optTitle || String(optIdx)
                      : String(opt || optIdx);

                  const isFlag =
                    typeof opt === "object" && opt !== null
                      ? Boolean(opt.flag || opt.flag_only || opt.is_flag || opt.flagged)
                      : false;

                  const isSelected = Boolean(
                    currentAnswer &&
                    (currentAnswer === optTitle ||
                      currentAnswer === optId ||
                      (typeof opt === "object" && opt.label && currentAnswer === opt.label) ||
                      (typeof opt === "object" && opt.title && currentAnswer === opt.title))
                  );

                  return (
                    <Pressable
                      key={optId || optIdx}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: isSelected
                            ? isFlag
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(0, 163, 196, 0.1)"
                            : theme.colors.card,
                          borderColor: isSelected
                            ? isFlag
                              ? "#EF4444"
                              : theme.colors.primary
                            : theme.colors.cardBorder,
                        },
                      ]}
                      onPress={() => handleSelectOption(qKey, optTitle || optId)}
                    >
                      <View style={styles.optionContent}>
                        <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{optTitle}</Text>
                        {optSubtitle ? (
                          <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                            {optSubtitle}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: isSelected
                              ? isFlag
                                ? "#EF4444"
                                : theme.colors.primary
                              : theme.colors.cardBorder,
                          },
                          isSelected && { backgroundColor: isFlag ? "#EF4444" : theme.colors.primary },
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>

              {/* Follow-up Note for Limitation or specific question */}
              {(driverLabel?.toLowerCase().includes("limitation") || q.follow_up_required) && currentAnswer && (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.followUpLabel, { color: theme.colors.textSecondary }]}>
                    Optional notes for your support team:
                  </Text>
                  <RNTextInput
                    style={[
                      styles.followUpInput,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.cardBorder,
                        color: theme.colors.text,
                      },
                    ]}
                    placeholder="Describe any specifics or limitations (max 120 chars)..."
                    placeholderTextColor={theme.colors.textTertiary}
                    maxLength={120}
                    value={followUpAnswers[qKey] || ""}
                    onChangeText={(val) => setFollowUpAnswers((prev) => ({ ...prev, [qKey]: val }))}
                  />
                </View>
              )}
            </View>
          );
        })}

        <Pressable
          style={[
            styles.submitBtn,
            { backgroundColor: isAllAnswered && !isSubmitting ? theme.colors.primary : theme.colors.cardBorder },
          ]}
          onPress={handleSubmit}
          disabled={!isAllAnswered || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.submitBtnText, { color: isAllAnswered ? "#FFFFFF" : theme.colors.textTertiary }]}>
              {submitLabel}
            </Text>
          )}
        </Pressable>

        <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
          Your responses are used for readiness support and team coordination.
        </Text>
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
    paddingBottom: 60,
  },
  headerBlock: {
    marginBottom: 32,
    alignItems: "flex-start",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pageDesc: {
    fontSize: 15,
    lineHeight: 22,
  },
  questionBlock: {
    marginBottom: 32,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  questionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
  },
  questionTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    lineHeight: 24,
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionContent: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  followUpLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  followUpInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
  },
  submitBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footerNotice: {
    textAlign: "center",
    fontSize: 12,
  },
});
