import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../utils/useTheme";
import { CustomHeader } from "../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { dailyQuestions, weeklyQuestions, monthlyQuestions, CheckinQuestion } from "../../config/checkinQuestions";
import { saveDailyAnswer, saveWeeklyAnswer, saveMonthlyAnswer, submitDailyCheckin, submitWeeklyCheckin, submitMonthlyCheckin } from "../../redux/slices/checkinSlice";

export default function DynamicCheckinScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { day0_daily_checkin_status, daily_answers, weekly_answers, monthly_answers } = useAppSelector((state) => state.checkin);
  
  let questions: CheckinQuestion[] = [];
  let answers: Record<string, string> = {};
  let title = "";
  let headerTitle = "";
  let isDay0 = false;
  let saveAction: any = null;
  let submitAction: any = null;

  if (type === "daily") {
    questions = dailyQuestions;
    answers = daily_answers;
    isDay0 = day0_daily_checkin_status === "pending";
    title = isDay0 ? "Today's check-in" : "Daily check-in";
    headerTitle = isDay0 ? "Day 0 check-in" : "Daily check-in";
    saveAction = saveDailyAnswer;
    submitAction = submitDailyCheckin;
  } else if (type === "weekly") {
    questions = weeklyQuestions;
    answers = weekly_answers;
    title = "Weekly check-in";
    headerTitle = "Weekly check-in";
    saveAction = saveWeeklyAnswer;
    submitAction = submitWeeklyCheckin;
  } else if (type === "monthly") {
    questions = monthlyQuestions;
    answers = monthly_answers;
    title = "Monthly check-in";
    headerTitle = "Monthly check-in";
    saveAction = saveMonthlyAnswer;
    submitAction = submitMonthlyCheckin;
  }

  const handleSelectOption = (questionId: string, optionId: string) => {
    dispatch(saveAction({ id: questionId, answer: optionId }));
  };

  const isAllAnswered = questions.every((q) => answers[q.id]);

  const handleSubmit = () => {
    if (isAllAnswered) {
      dispatch(submitAction());
      router.replace("/(tabs)/(home)" as any);
    }
  };

  const getMissingCount = () => {
    return questions.filter((q) => !answers[q.id]).length;
  };

  const submitLabel = isAllAnswered
    ? "Submit >"
    : `Answer ${getMissingCount()} more to submit >`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      <CustomHeader
        title={headerTitle}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          {isDay0 && (
            <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>DAY 0 · BASELINE</Text>
          )}
          
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>{title}</Text>
          
          {isDay0 && (
            <View style={[styles.badge, { backgroundColor: "rgba(0, 163, 196, 0.15)" }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>DAY 0</Text>
            </View>
          )}

          <Text style={[styles.pageDesc, { color: theme.colors.textSecondary }]}>
            {isDay0
              ? "Tell us how you're starting. Your responses seed your rolling OPS and start the weekly + monthly cadence."
              : "Tell us how you're starting. Your responses seed your rolling OPS."}
          </Text>
        </View>

        {questions.map((q, idx) => (
          <View key={q.id} style={styles.questionBlock}>
            <View style={styles.questionHeader}>
              <View style={[styles.questionTag, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <Text style={[styles.questionTagText, { color: theme.colors.textSecondary }]}>
                  {(idx + 1).toString().padStart(2, '0')}
                </Text>
              </View>
              <Text style={[styles.questionTitle, { color: theme.colors.text }]}>
                {q.driver} · {q.question}
              </Text>
            </View>

            <View style={styles.optionsList}>
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.id;
                const isFlag = opt.flag; // if it has a flag
                
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected
                          ? (isFlag ? "rgba(239, 68, 68, 0.1)" : "rgba(0, 163, 196, 0.1)")
                          : theme.colors.card,
                        borderColor: isSelected
                          ? (isFlag ? "#EF4444" : theme.colors.primary)
                          : theme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => handleSelectOption(q.id, opt.id)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{opt.title}</Text>
                      {opt.subtitle && (
                        <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>{opt.subtitle}</Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: isSelected ? (isFlag ? "#EF4444" : theme.colors.primary) : theme.colors.cardBorder },
                        isSelected && { backgroundColor: isFlag ? "#EF4444" : theme.colors.primary }
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable
          style={[
            styles.submitBtn,
            { backgroundColor: isAllAnswered ? theme.colors.primary : theme.colors.cardBorder }
          ]}
          onPress={handleSubmit}
          disabled={!isAllAnswered}
        >
          <Text style={[styles.submitBtnText, { color: isAllAnswered ? "#FFFFFF" : theme.colors.textTertiary }]}>
            {submitLabel}
          </Text>
        </Pressable>

        <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
          Your responses are used for readiness support and evaluation.
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
