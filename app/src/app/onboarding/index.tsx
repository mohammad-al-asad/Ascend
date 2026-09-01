import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput as RNTextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  saveOnboardingAnswer,
  saveOnboardingFollowUp,
  updateUser,
} from "../../redux/slices/authSlice";
import { saveUser } from "../../utils/authStorage";
import { useTheme } from "../../utils/useTheme";
import { CustomHeader } from "../../components/ui/CustomHeader";
import { CustomSwitch } from "../../components/ui/CustomSwitch";
import { CustomButton } from "../../components/ui/CustomButton";
import { CustomBottomSheet } from "../../components/ui/CustomBottomSheet";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetOnboardingIntroQuery,
  useSubmitOnboardingConsentMutation,
  useGetOnboardingQuestionsQuery,
  useSubmitOnboardingAnswerMutation,
  useCompleteOnboardingBaselineMutation,
  OnboardingQuestion,
} from "../../redux/api/checkinApi";

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Retrieve auth data from Redux
  const user = useAppSelector((state) => state.auth.user);
  const answers = useAppSelector((state) => state.auth.onboardingAnswers);
  const followUps = useAppSelector((state) => state.auth.onboardingFollowUps);

  // RTK Query Hooks
  const { data: introData, isLoading: isIntroLoading } = useGetOnboardingIntroQuery();
  const { data: serverQuestions, isLoading: isQuestionsLoading } = useGetOnboardingQuestionsQuery();
  const [submitConsent, { isLoading: isConsentSubmitting }] = useSubmitOnboardingConsentMutation();
  const [submitAnswer, { isLoading: isAnswerSubmitting }] = useSubmitOnboardingAnswerMutation();
  const [completeBaseline, { isLoading: isBaselineSubmitting }] = useCompleteOnboardingBaselineMutation();

  // Questions array strictly from backend API
  const questions: OnboardingQuestion[] =
    Array.isArray(serverQuestions)
      ? serverQuestions
      : (serverQuestions as any)?.questions && Array.isArray((serverQuestions as any).questions)
        ? (serverQuestions as any).questions
        : (serverQuestions as any)?.data && Array.isArray((serverQuestions as any).data)
          ? (serverQuestions as any).data
          : [];

  // Flow steps:
  // Step 0: Welcome Screen
  // Step 1: Before We Begin (Consent)
  // Step 2..21: Questions 1..20
  // Step 22: Completion Success Screen
  const [currentStep, setCurrentStep] = useState(0);

  // Consent Screen (Step 1) States
  const [dataConsent, setDataConsent] = useState(false);
  const [wellnessOptIn, setWellnessOptIn] = useState(false);

  // Baseline result storage
  const [baselineResult, setBaselineResult] = useState<{
    opsScore: number;
    opsBand: string;
    componentScores: Record<string, number>;
  } | null>(null);

  // Main Question Step (Step 2..21) States
  const questionIndex = Math.max(0, Math.min(Math.max(0, questions.length - 1), currentStep - 2));
  const currentQuestion: OnboardingQuestion | undefined = questions[questionIndex];

  // Local answer tracking
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Follow-up Sheet States
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [tempFollowUpOption, setTempFollowUpOption] = useState<string | null>(null);
  const [tempTextValue, setTempTextValue] = useState("");

  // Role toggles for role-sheet follow-up
  const [roleToggles, setRoleToggles] = useState<Record<string, boolean>>({
    Nutritionist: false,
    MentalPerformance: false,
    Chaplain: false,
    SCS: true, // Required / locked on
  });

  // Prepopulate state when navigating between questions
  const resetQuestionState = (index: number) => {
    if (!questions[index]) return;
    const q = questions[index];
    const savedAns =
      (answers[q.id] as string) ||
      (Array.isArray(q.current_answer)
        ? q.current_answer[0]
        : typeof q.current_answer === "string"
          ? q.current_answer
          : null);
    setSelectedOption(savedAns);

    // Reload follow-up values if pre-saved
    const savedFollowUp = followUps[q.id] || q.current_follow_up_answer;
    const followUpConfig = q.follow_up || q.followUp;
    if (followUpConfig) {
      const fType = followUpConfig.type?.replace("-", "_");
      if (fType === "text_sheet") {
        setTempTextValue(typeof savedFollowUp === "string" ? savedFollowUp : "");
      } else if (fType === "role_sheet") {
        if (Array.isArray(savedFollowUp)) {
          setRoleToggles({
            Nutritionist: savedFollowUp.includes("Nutritionist"),
            MentalPerformance:
              savedFollowUp.includes("Mental Performance") ||
              savedFollowUp.includes("MentalPerformance"),
            Chaplain: savedFollowUp.includes("Chaplain"),
            SCS: true,
          });
        } else if (typeof savedFollowUp === "object" && savedFollowUp !== null) {
          setRoleToggles(savedFollowUp as Record<string, boolean>);
        } else {
          setRoleToggles({
            Nutritionist: false,
            MentalPerformance: false,
            Chaplain: false,
            SCS: true,
          });
        }
      } else {
        setTempFollowUpOption(typeof savedFollowUp === "string" ? savedFollowUp : null);
      }
    } else {
      setTempFollowUpOption(null);
      setTempTextValue("");
    }
  };

  useEffect(() => {
    if (currentStep >= 2 && currentStep <= 21 && questions.length > 0) {
      resetQuestionState(currentStep - 2);
    }
  }, [currentStep, questions]);

  const checkFollowUpTrigger = (question: OnboardingQuestion | undefined, option: string | null) => {
    if (!question || !option) return false;
    const followUpConfig = question.follow_up || question.followUp;
    if (!followUpConfig) return false;
    const triggers = (followUpConfig.trigger_options || followUpConfig.triggerOptions || []).map((t: any) =>
      typeof t === "object" ? t.label || t.title || String(t) : String(t)
    );
    return (
      triggers.length === 0 ||
      triggers.includes(option) ||
      Boolean(followUpConfig.required_when_triggered) ||
      Boolean(question.follow_up_required)
    );
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!dataConsent) return;
      try {
        await submitConsent({
          data_use_consent: true,
          wellness_recommendations_opt_in: wellnessOptIn,
          policy_version: introData?.policy_version || "v1.0",
        }).unwrap();
      } catch (err) {
        console.log("Consent submission error:", err);
      }
      setCurrentStep(2);
    } else if (currentStep >= 2 && currentStep <= 21) {
      if (!selectedOption || !currentQuestion) return;

      const followUpConfig = currentQuestion.follow_up || currentQuestion.followUp;
      const fType = followUpConfig?.type?.replace("-", "_");
      const isFollowUpTriggered = checkFollowUpTrigger(currentQuestion, selectedOption);

      const hasFollowUpAnswer =
        fType === "text_sheet"
          ? Boolean(tempTextValue.trim())
          : fType === "role_sheet"
            ? Object.keys(roleToggles).some((k) => roleToggles[k])
            : Boolean(tempFollowUpOption);

      // If follow-up is triggered and not yet provided, open the sheet to ask for it
      if (isFollowUpTriggered && !hasFollowUpAnswer && !isSheetVisible) {
        setIsSheetVisible(true);
        return;
      }

      // Extract follow-up answer if applicable
      let followUpAnswerPayload: any = undefined;
      if (followUpConfig) {
        if (fType === "text_sheet") {
          followUpAnswerPayload = tempTextValue.trim() || undefined;
        } else if (fType === "role_sheet") {
          const activeRoles = Object.keys(roleToggles).filter((k) => roleToggles[k]);
          if (!activeRoles.includes("SCS")) activeRoles.push("SCS");
          followUpAnswerPayload = activeRoles;
        } else {
          followUpAnswerPayload = tempFollowUpOption || undefined;
        }
      }

      // Format main answer payload correctly for multi_select vs single_select
      let answerPayload: string | string[] = selectedOption;
      if (currentQuestion.answer_type === "multi_select") {
        if (currentQuestion.id === 18 && Array.isArray(followUpAnswerPayload) && followUpAnswerPayload.length > 0) {
          answerPayload = followUpAnswerPayload;
        } else if (Array.isArray(selectedOption)) {
          answerPayload = selectedOption;
        } else {
          answerPayload = [selectedOption];
        }
      }

      // Save answer in Redux state for fast UI recovery
      dispatch(
        saveOnboardingAnswer({
          questionId: currentQuestion.id,
          answer: selectedOption,
        })
      );
      if (followUpAnswerPayload) {
        dispatch(
          saveOnboardingFollowUp({
            questionId: currentQuestion.id,
            followUpAnswer: followUpAnswerPayload,
          })
        );
      }

      // Submit to backend API
      try {
        await submitAnswer({
          question_id: currentQuestion.id,
          answer: answerPayload,
          follow_up_answer: followUpAnswerPayload,
        }).unwrap();
      } catch (err: any) {
        console.error("Answer submission error:", err);
        return; // Do NOT advance if answer failed to save!
      }

      // Advance step
      if (currentStep === 21) {
        // Complete Baseline
        try {
          const res = await completeBaseline().unwrap();
          if (res) {
            setBaselineResult({
              opsScore: res.baseline_ops_score,
              opsBand: res.baseline_band,
              componentScores: res.component_scores,
            });
            const updatedUser = {
              ...(user || {}),
              onboarding_completed: true,
              onboarding_status: "completed",
              onboarding_baseline_ops_score: res.baseline_ops_score,
              onboarding_baseline_band: res.baseline_band,
              onboarding_component_scores: res.component_scores,
            };
            dispatch(updateUser(updatedUser as any));
            await saveUser(updatedUser);
          }
          setCurrentStep(22);
        } catch (err: any) {
          console.error("Baseline complete error:", err);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 22) {
      if (user) {
        const updatedUser = {
          ...user,
          onboarding_completed: true,
          onboarding_status: "completed",
        };
        dispatch(updateUser(updatedUser as any));
        await saveUser(updatedUser);
      }
      // Navigate to Home Tab
      router.replace("/(tabs)/(home)" as any);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 0) {
      router.replace("/auth/signin" as any);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);

    // Open follow-up sheet when user chooses an option that triggers follow-up
    if (checkFollowUpTrigger(currentQuestion, option)) {
      setIsSheetVisible(true);
    }
  };

  const handleSaveFollowUp = () => {
    let finalFollowUpVal: any = null;
    const followUpConfig = currentQuestion?.follow_up || currentQuestion?.followUp;

    if (followUpConfig && currentQuestion) {
      const fType = followUpConfig.type?.replace("-", "_");
      if (fType === "text_sheet") {
        finalFollowUpVal = tempTextValue.trim();
      } else if (fType === "role_sheet") {
        const activeRoles = Object.keys(roleToggles).filter((k) => roleToggles[k]);
        if (!activeRoles.includes("SCS")) activeRoles.push("SCS");
        finalFollowUpVal = activeRoles;
      } else {
        finalFollowUpVal = tempFollowUpOption;
      }

      dispatch(
        saveOnboardingFollowUp({
          questionId: currentQuestion.id,
          followUpAnswer: finalFollowUpVal,
        })
      );
    }

    setIsSheetVisible(false);
  };

  // Progress Bar (20 segments)
  const renderProgressBar = () => {
    const qCount = 20;
    const activeIndex = questionIndex;

    return (
      <View style={styles.progressBarContainer}>
        {Array.from({ length: qCount }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressBarSegment,
              {
                backgroundColor:
                  i === activeIndex
                    ? theme.colors.primary
                    : i < activeIndex
                      ? "rgba(0, 163, 196, 0.4)"
                      : theme.colors.cardBorder,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const followUpConfig = currentQuestion?.follow_up || currentQuestion?.followUp;
  const normalizedFollowUpType = followUpConfig?.type?.replace("-", "_");
  const rawTriggers = currentQuestion?.routing_trigger || currentQuestion?.routingTrigger || [];
  const routingTriggers = rawTriggers.map((t: any) =>
    typeof t === "object" ? t.label || t.title || String(t) : String(t)
  );
  const routingText = currentQuestion?.routing_text || currentQuestion?.routingText;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000", flexDirection: "row", gap: 6 }]}>
        <Image source={require("../../../public/LockIcon.svg")} style={{ width: 10, height: 10 }} />
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          {introData?.opsec_notice_text || "CUI // OPSEC — Ascend is not a Government system of record."}
        </Text>
      </View>

      <CustomHeader
        title={
          currentStep === 0
            ? "Welcome"
            : currentStep === 1
              ? "Before we begin"
              : currentStep === 22
                ? "Completed"
                : "Onboarding"
        }
        onBack={handleBackStep}
        rightElement={
          currentStep >= 2 && currentStep <= 21 ? (
            <View style={styles.stepBadge}>
              <Text style={[styles.stepBadgeText, { color: theme.colors.textSecondary }]}>
                {currentStep - 1} / 20
              </Text>
            </View>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ================= STEP 0: WELCOME SCREEN ================= */}
        {currentStep === 0 && (
          <View style={styles.innerContent}>
            <Image
              source={require("../../../assets/app/logo.png")}
              style={styles.largeLogoImage}
              resizeMode="contain"
            />

            <Text style={[styles.stepSubTitle, { color: theme.colors.textSecondary, alignSelf: "flex-start" }]}>
              FIRST USE · OPERATOR MOBILE
            </Text>

            <Text style={[styles.stepTitle, { color: theme.colors.text, alignSelf: "flex-start" }]}>
              {introData?.welcome_name ? `Welcome, ${introData.welcome_name}` : `Welcome, ${user?.full_name || "Airman"}`}
            </Text>

            <Text
              style={[
                styles.stepDesc,
                { color: theme.colors.textSecondary, alignSelf: "flex-start", textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              {introData?.intro_body ||
                "Your readiness baseline helps your team support you from day one. It takes about 3 minutes."}
            </Text>

            <View style={{ flex: 1 }} />

            <CustomButton
              label={introData?.cta_label || "Begin your readiness baseline"}
              onPress={handleNextStep}
              icon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
              iconPosition="right"
              style={{ width: "100%", marginTop: 24 }}
            />
          </View>
        )}

        {/* ================= STEP 1: CONSENT SCREEN ================= */}
        {currentStep === 1 && (
          <View style={styles.innerContent}>
            <Text style={[styles.stepSubTitle, { color: theme.colors.textSecondary, alignSelf: "flex-start" }]}>
              FIRST-USE · ONBOARDING
            </Text>

            <Text style={[styles.stepTitle, { color: theme.colors.text, alignSelf: "flex-start" }]}>Before we begin</Text>
            <Text
              style={[
                styles.stepDesc,
                { color: theme.colors.textSecondary, alignSelf: "flex-start", textAlign: "left", paddingHorizontal: 0 },
              ]}
            >
              Two short confirmations before your baseline questions begin.
            </Text>

            {/* Privacy Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
              ]}
            >
              <Text style={[styles.cardHeaderTag, { color: theme.colors.textTertiary }]}>PRIVACY SUMMARY</Text>
              <Text style={[styles.cardBodyText, { color: theme.colors.text, fontWeight: "700" }]}>
                {introData?.privacy_summary ||
                  "Your answers are visible to your assigned providers. You control optional pathways in My team."}
              </Text>
            </View>

            {/* Switch Confirmations */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
              ]}
            >
              <Text style={[styles.cardHeaderTag, { color: theme.colors.textTertiary }]}>CONFIRMATIONS</Text>

              <CustomSwitch
                label={introData?.consent_required_label || "Data-use consent"}
                description={
                  introData?.consent_required_description ||
                  "I consent to Ascend processing my readiness data per the privacy summary above."
                }
                value={dataConsent}
                onValueChange={setDataConsent}
              />

              <CustomSwitch
                label={introData?.optional_opt_in_label || "Wellness recommendations"}
                description={
                  introData?.optional_opt_in_description ||
                  "Send me wellness recommendations via in-app messages."
                }
                value={wellnessOptIn}
                onValueChange={setWellnessOptIn}
              />
            </View>

            {/* Medical Record Disclaimer */}
            <View style={[styles.disclaimerBox, { backgroundColor: "#1C1F26" }]}>
              <Image
                source={require("../../../public/InfoIcon.svg")}
                style={{ width: 18, height: 18, marginRight: 12, tintColor: "#00A3C4" }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.disclaimerHeader, { color: "#FFFFFF" }]}>NOT A MEDICAL RECORD</Text>
                <Text style={[styles.disclaimerDesc, { color: theme.colors.textSecondary }]}>
                  Ascend is not a Government system of record. Your medical record stays with your healthcare team.
                </Text>
              </View>
            </View>

            <View style={styles.buttonWrapper}>
              <CustomButton
                label={isConsentSubmitting ? "Submitting..." : "Continue"}
                onPress={handleNextStep}
                disabled={!dataConsent || isConsentSubmitting}
                icon="➔"
                style={{ width: "100%" }}
              />
              {!dataConsent && (
                <Text style={[styles.errorLabel, { color: theme.colors.textTertiary }]}>
                  Consent required to continue
                </Text>
              )}
            </View>

            {/* Footer Metadata */}
            <View style={{ marginTop: 24, alignItems: "center" }}>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Performing user {user?.full_name || "Airman"} · {user?.email}
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Policy version {introData?.policy_version || "v1.0"}
              </Text>
              {introData?.trace_id && (
                <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                  Trace {introData.trace_id}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ================= STEP 2..21: QUESTIONS ================= */}
        {currentStep >= 2 && currentStep <= 21 && (isQuestionsLoading || !currentQuestion) && (
          <View style={[styles.innerContent, { paddingVertical: 40, alignItems: "center" }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary, marginTop: 16 }]}>
              Loading questions...
            </Text>
          </View>
        )}
        {currentStep >= 2 && currentStep <= 21 && currentQuestion && (
          <View style={styles.innerContent}>
            <View style={styles.questionHeader}>
              <Text style={[styles.questionStepText, { color: theme.colors.textSecondary }]}>
                QUESTION {currentQuestion.id || currentQuestion.question_number || currentStep - 1} OF {questions.length || 20}
              </Text>
              <Text style={[styles.questionTimeText, { color: theme.colors.textSecondary }]}>
                {currentQuestion.estimated_time_label
                  ? currentQuestion.estimated_time_label.toUpperCase()
                  : `ABOUT ${Math.max(1, Math.ceil((21 - currentStep) / 4))} MINUTES`}
              </Text>
            </View>

            {renderProgressBar()}

            {/* Question Card */}
            <View
              style={[
                styles.questionCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
              ]}
            >
              <Text style={[styles.cardHeaderTag, { color: theme.colors.primary }]}>
                {currentQuestion.readiness_component
                  ? `${currentQuestion.readiness_component.toUpperCase()} · BASELINE`
                  : currentQuestion.category?.includes("BASELINE")
                    ? currentQuestion.category
                    : `${currentQuestion.category || "READINESS"} · BASELINE`}
              </Text>
              <Text style={[styles.questionTitleText, { color: theme.colors.text }]}>
                {currentQuestion.question}
              </Text>
              <Text style={[styles.questionDescText, { color: theme.colors.textSecondary }]}>
                {currentQuestion.description}
              </Text>

              {/* Radio options */}
              <View style={styles.optionsList}>
                {(currentQuestion.options || []).map((optionItem: any, idx: number) => {
                  const option =
                    typeof optionItem === "object"
                      ? optionItem.label || optionItem.title || optionItem.text || String(optionItem)
                      : String(optionItem);
                  const isActive = selectedOption === option;

                  return (
                    <Pressable
                      key={idx}
                      onPress={() => handleOptionSelect(option)}
                      style={[
                        styles.optionRow,
                        {
                          borderColor: isActive ? theme.colors.primary : theme.colors.cardBorder,
                          backgroundColor: isActive ? "rgba(0,163,196,0.05)" : "transparent",
                        },
                      ]}
                    >
                      <Text style={[styles.optionText, { color: theme.colors.text }]}>{option}</Text>
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: isActive ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                      >
                        {isActive && (
                          <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Conditional Warning / Routing Note */}
              {selectedOption && routingTriggers.includes(selectedOption) && routingText && (
                <View
                  style={[
                    styles.routingBanner,
                    {
                      backgroundColor: theme.colors.warningBg,
                      borderColor: theme.colors.warningBorder,
                    },
                  ]}
                >
                  <Text style={styles.bannerIcon}>⚠️</Text>
                  <Text style={[styles.bannerText, { color: theme.colors.warningText }]}>{routingText}</Text>
                </View>
              )}
            </View>

            {/* Bottom response button */}
            <CustomButton
              label={
                isAnswerSubmitting || isBaselineSubmitting
                  ? "Saving..."
                  : selectedOption
                    ? currentStep === 21
                      ? "Complete Baseline"
                      : currentQuestion.submit_label || "Next question"
                    : "Choose a response"
              }
              onPress={handleNextStep}
              disabled={!selectedOption || isAnswerSubmitting || isBaselineSubmitting}
              // icon="➔"
              style={{ width: "100%", marginTop: 16 }}
            />

            <Text style={[styles.onboardingFooterText, { color: theme.colors.textTertiary }]}>
              {currentQuestion.footer_note ||
                "Your responses are used to build your readiness baseline, not evaluation."}
            </Text>
          </View>
        )}

        {/* ================= STEP 22: COMPLETION SCREEN ================= */}
        {currentStep === 22 && (
          <View style={styles.innerContent}>
            <View style={[styles.successIconContainer, { backgroundColor: "#132D21" }]}>
              <Text style={styles.successIconText}>✔</Text>
            </View>

            <Text style={[styles.stepSubTitle, { color: theme.colors.textSecondary }]}>FIRST-USE · COMPLETED</Text>

            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Readiness baseline set</Text>

            {baselineResult ? (
              <View
                style={[
                  styles.resultCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
                ]}
              >
                <Text style={[styles.resultOpsScore, { color: theme.colors.primary }]}>
                  {baselineResult.opsScore}
                </Text>
                <Text style={[styles.resultOpsBand, { color: theme.colors.text }]}>
                  BAND: {baselineResult.opsBand?.toUpperCase()}
                </Text>
                <Text style={[styles.stepDesc, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                  Your initial 5-driver readiness profile has been computed and Day 0 check-in recorded.
                </Text>
              </View>
            ) : (
              <Text style={[styles.stepDesc, { color: theme.colors.textSecondary, textAlign: "center" }]}>
                Thank you! Your responses have been securely synced. You can now access your readiness dashboard.
              </Text>
            )}

            <CustomButton
              label="Enter Dashboard"
              onPress={handleNextStep}
              style={{ width: "100%", marginTop: 32 }}
            />
          </View>
        )}
      </ScrollView>

      {/* ================= FOLLOW-UP BOTTOM SHEET ================= */}
      {followUpConfig && (
        <CustomBottomSheet
          visible={isSheetVisible}
          onClose={() => setIsSheetVisible(false)}
          title={followUpConfig.title}
          subtitle="OPTIONAL FOLLOW-UP"
        >
          <View style={styles.sheetBody}>
            {(normalizedFollowUpType === "severity_sheet" || normalizedFollowUpType === "toggle_sheet") &&
              followUpConfig.options?.map((option, idx) => {
                const isActive = tempFollowUpOption === option.label;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setTempFollowUpOption(option.label)}
                    style={[
                      styles.sheetOptionRow,
                      {
                        borderColor: isActive ? theme.colors.primary : "#27272A",
                        backgroundColor: isActive ? "rgba(0,163,196,0.05)" : "transparent",
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sheetOptionLabel, { color: theme.colors.text }]}>
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text style={[styles.sheetOptionDesc, { color: theme.colors.textSecondary }]}>
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: isActive ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {isActive && (
                        <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />
                      )}
                    </View>
                  </Pressable>
                );
              })}

            {normalizedFollowUpType === "role_sheet" && (
              <View style={styles.checkboxList}>
                {followUpConfig.options?.map((option, idx) => (
                  <CustomSwitch
                    key={idx}
                    label={option.label}
                    description={option.description}
                    value={roleToggles[option.label] ?? false}
                    onValueChange={(val) => {
                      if (option.disabled || option.label === "SCS") return;
                      setRoleToggles((prev) => ({
                        ...prev,
                        [option.label]: val,
                      }));
                    }}
                    disabled={option.disabled || option.label === "SCS"}
                  />
                ))}
                <Text style={[styles.sheetNoteText, { color: theme.colors.textTertiary }]}>
                  Select all that apply. SCS is locked on.
                </Text>
              </View>
            )}

            {normalizedFollowUpType === "text_sheet" && (
              <View style={styles.textInputWrapper}>
                <RNTextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.cardBorder,
                      color: theme.colors.text,
                    },
                  ]}
                  multiline
                  placeholder={followUpConfig.placeholder || "Enter follow-up details..."}
                  placeholderTextColor={theme.colors.textTertiary}
                  maxLength={followUpConfig.max_length || followUpConfig.maxLength || 120}
                  value={tempTextValue}
                  onChangeText={setTempTextValue}
                />
                <Text style={[styles.charCounter, { color: theme.colors.textTertiary }]}>
                  {tempTextValue.length} / {followUpConfig.max_length || followUpConfig.maxLength || 120}
                </Text>
              </View>
            )}

            <CustomButton
              label="Save follow-up"
              onPress={handleSaveFollowUp}
              disabled={
                normalizedFollowUpType === "text_sheet"
                  ? tempTextValue.trim().length === 0
                  : normalizedFollowUpType === "role_sheet"
                    ? false
                    : !tempFollowUpOption
              }
              style={{ width: "100%", marginTop: 24 }}
            />
          </View>
        </CustomBottomSheet>
      )}
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
    flexGrow: 1,
  },
  innerContent: {
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  largeLogoImage: {
    width: 80,
    height: 80,
    marginTop: 40,
    marginBottom: 24,
  },
  stepSubTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 16,
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  card: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardBodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimerBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  disclaimerHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  disclaimerDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
  },
  errorLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 16,
  },
  stepBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  questionStepText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  questionTimeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 4,
    marginBottom: 24,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  questionCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  questionTitleText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 24,
  },
  questionDescText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  optionsList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    paddingRight: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routingBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  bannerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    fontWeight: "500",
  },
  onboardingFooterText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 28,
    color: "#22C55E",
  },
  resultCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  resultOpsScore: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 4,
  },
  resultOpsBand: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sheetBody: {
    paddingBottom: 24,
  },
  sheetOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  sheetOptionLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  sheetOptionDesc: {
    fontSize: 12,
  },
  checkboxList: {
    gap: 12,
    marginBottom: 16,
  },
  sheetNoteText: {
    fontSize: 12,
    marginTop: 8,
  },
  textInputWrapper: {
    marginBottom: 16,
  },
  textArea: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    height: 100,
    textAlignVertical: "top",
  },
  charCounter: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
});
