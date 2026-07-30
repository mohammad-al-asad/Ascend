import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput as RNTextInput,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  saveOnboardingAnswer,
  saveOnboardingFollowUp,
  completeOnboarding,
} from "../../redux/slices/authSlice";
import { useTheme } from "../../utils/useTheme";
import { CustomHeader } from "../../components/ui/CustomHeader";
import { CustomSwitch } from "../../components/ui/CustomSwitch";
import { CustomButton } from "../../components/ui/CustomButton";
import { CustomBottomSheet } from "../../components/ui/CustomBottomSheet";
import questionsData from "./questions.json";
import { SafeAreaView } from "react-native-safe-area-context";

// Define TypeScript interfaces for question data
interface FollowUpOption {
  label: string;
  description: string;
  disabled?: boolean;
  value?: boolean;
}

interface FollowUpConfig {
  type: "severity-sheet" | "toggle-sheet" | "role-sheet" | "text-sheet";
  title: string;
  triggerOptions: string[];
  options?: FollowUpOption[];
  placeholder?: string;
  maxLength?: number;
}

interface Question {
  id: number;
  category: string;
  question: string;
  description: string;
  options: string[];
  routingText?: string;
  routingTrigger?: string[];
  followUp?: FollowUpConfig;
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Retrieve auth data from Redux
  const user = useAppSelector((state) => state.auth.user);
  const answers = useAppSelector((state) => state.auth.onboardingAnswers);
  const followUps = useAppSelector((state) => state.auth.onboardingFollowUps);

  // Flow steps:
  // Step 0: Welcome Screen
  // Step 1: Before We Begin (Consent)
  // Step 2..21: Questions 1..20
  // Step 22: Completion Success Screen
  const [currentStep, setCurrentStep] = useState(0);

  // Consent Screen (Step 1) States
  const [dataConsent, setDataConsent] = useState(false);
  const [wellnessOptIn, setWellnessOptIn] = useState(false);

  // Main Question Step (Step 2..21) States
  const questionIndex = currentStep - 2;
  const currentQuestion = (questionsData as Question[])[questionIndex];

  // Local answer tracking
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Follow-up Sheet States
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [tempFollowUpOption, setTempFollowUpOption] = useState<string | null>(null);
  const [tempTextValue, setTempTextValue] = useState("");

  // Role toggles for role-sheet follow-up (Question 18)
  const [roleToggles, setRoleToggles] = useState({
    Nutritionist: false,
    MentalPerformance: false,
    Chaplain: false,
    SCS: true, // Required / locked on
  });

  const handleNextStep = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!dataConsent) return;
      setCurrentStep(2);
      resetQuestionState(0);
    } else if (currentStep >= 2 && currentStep <= 21) {
      if (!selectedOption) return;

      // Save answer in Redux
      dispatch(
        saveOnboardingAnswer({
          questionId: currentQuestion.id,
          answer: selectedOption,
        })
      );

      // Advance step
      if (currentStep === 21) {
        setCurrentStep(22);
      } else {
        const nextIndex = questionIndex + 1;
        setCurrentStep(currentStep + 1);
        resetQuestionState(nextIndex);
      }
    } else if (currentStep === 22) {
      dispatch(completeOnboarding());
      // Go back to entry index route
      router.replace("/(tabs)" as any);
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
      const prevIndex = questionIndex - 1;
      setCurrentStep(currentStep - 1);
      resetQuestionState(prevIndex);
    }
  };

  const resetQuestionState = (index: number) => {
    const q = (questionsData as Question[])[index];
    const savedAns = answers[q.id] || null;
    setSelectedOption(savedAns);

    // Reload follow-up values if pre-saved
    const savedFollowUp = followUps[q.id];
    if (q.followUp) {
      if (q.followUp.type === "text-sheet") {
        setTempTextValue(savedFollowUp || "");
      } else if (q.followUp.type === "role-sheet") {
        setRoleToggles(
          savedFollowUp || {
            Nutritionist: false,
            MentalPerformance: false,
            Chaplain: false,
            SCS: true,
          }
        );
      } else {
        setTempFollowUpOption(savedFollowUp || null);
      }
    } else {
      setTempFollowUpOption(null);
      setTempTextValue("");
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);

    // Check if selecting this option triggers a follow-up sheet
    if (
      currentQuestion?.followUp &&
      currentQuestion.followUp.triggerOptions.includes(option)
    ) {
      // Open Bottom Sheet
      setIsSheetVisible(true);
    }
  };

  const handleSaveFollowUp = () => {
    let finalFollowUpVal: any = null;

    if (currentQuestion?.followUp) {
      const type = currentQuestion.followUp.type;
      if (type === "text-sheet") {
        finalFollowUpVal = tempTextValue;
      } else if (type === "role-sheet") {
        finalFollowUpVal = roleToggles;
      } else {
        finalFollowUpVal = tempFollowUpOption;
      }

      // Save in Redux
      dispatch(
        saveOnboardingFollowUp({
          questionId: currentQuestion.id,
          followUpAnswer: finalFollowUpVal,
        })
      );
    }

    setIsSheetVisible(false);
  };

  // Render Progress Indicator Bar (20 segments)
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
                    ? "rgba(0, 163, 196, 0.4)" // Past steps dimmed cyan
                    : theme.colors.cardBorder,
              },
            ]}
          />
        ))}
      </View>
    );
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
            {/* Shield Logo */}
            <Image
              source={require("../../../assets/app/logo.png")}
              style={styles.largeLogoImage}
              resizeMode="contain"
            />

            <Text style={[styles.stepSubTitle, { color: theme.colors.textSecondary }]}>
              FIRST USE · OPERATOR MOBILE · PR-M-001
            </Text>

            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Welcome, {user?.username || "Capt. Lin"}
            </Text>

            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Your readiness baseline helps your team support you from day one. It takes about 3 minutes.
            </Text>

            {/* Debugging Metadata */}
            <View style={styles.metaBox}>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Performing user {user?.username || "capt.lin"} · {user?.userId || "USR-6601"}
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Policy version ascend-ia-01@1.4.0
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Read first_use_state.account_provisioned_status={user?.provisionedStatus || "active"}
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Read first_use_state.first_login_timestamp={user?.firstLoginTimestamp || "2026-07-17T08:42:00Z"}
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Read first_use_state.onboarding_status=incomplete
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Trace FIRSTUSE-9F2A
              </Text>
            </View>

            <CustomButton
              label="Begin your readiness baseline"
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
            <Text style={[styles.stepSubTitle, { color: theme.colors.textSecondary }]}>
              FIRST-USE · ONBOARDING · PR-M-002
            </Text>

            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Before we begin</Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Two short confirmations before your baseline questions begin.
            </Text>

            {/* Privacy Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
              ]}
            >
              <Text style={[styles.cardHeaderTag, { color: theme.colors.textTertiary }]}>
                PRIVACY SUMMARY
              </Text>
              <Text style={[styles.cardBodyText, { color: theme.colors.text, fontWeight: "700" }]}>
                Your answers are visible to your assigned providers. You control optional pathways in
                My team.
              </Text>
            </View>

            {/* Switch Confirmations */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder },
              ]}
            >
              <Text style={[styles.cardHeaderTag, { color: theme.colors.textTertiary }]}>
                CONFIRMATIONS
              </Text>

              <CustomSwitch
                label="Data-use consent"
                description="I consent to Ascend processing my readiness data per the privacy summary above."
                value={dataConsent}
                onValueChange={setDataConsent}
              />

              <CustomSwitch
                label="Wellness recommendations"
                description="Send me wellness recommendations via in-app messages."
                value={wellnessOptIn}
                onValueChange={setWellnessOptIn}
              />
            </View>

            {/* Medical Record Disclaimer */}
            <View style={[styles.disclaimerBox, { backgroundColor: "#1C1F26" }]}>
              <Text style={styles.infoIcon}>ℹ</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.disclaimerHeader, { color: "#FFFFFF" }]}>NOT A MEDICAL RECORD</Text>
                <Text style={[styles.disclaimerDesc, { color: theme.colors.textSecondary }]}>
                  Ascend is not a Government system of record. Your medical record stays with your
                  healthcare team.
                </Text>
              </View>
            </View>

            <View style={styles.buttonWrapper}>
              <CustomButton
                label="Continue"
                onPress={handleNextStep}
                disabled={!dataConsent}
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
                Performing user {user?.username || "capt.lin"} · {user?.userId || "USR-6601"}
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Policy version ascend-ia-01@1.4.0
              </Text>
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                Trace FIRSTUSE-7C2B
              </Text>
            </View>
          </View>
        )}

        {/* ================= STEP 2..21: QUESTIONS ================= */}
        {currentStep >= 2 && currentStep <= 21 && currentQuestion && (
          <View style={styles.innerContent}>
            {/* Step Indicators */}
            <View style={styles.questionHeader}>
              <Text style={[styles.questionStepText, { color: theme.colors.textSecondary }]}>
                QUESTION {currentQuestion.id} OF 20
              </Text>
              <Text style={[styles.questionTimeText, { color: theme.colors.textSecondary }]}>
                ABOUT {Math.max(1, Math.ceil((21 - currentStep) / 4))} MINUTES
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
                {currentQuestion.category}
              </Text>
              <Text style={[styles.questionTitleText, { color: theme.colors.text }]}>
                {currentQuestion.question}
              </Text>
              <Text style={[styles.questionDescText, { color: theme.colors.textSecondary }]}>
                {currentQuestion.description}
              </Text>

              {/* Radio options */}
              <View style={styles.optionsList}>
                {currentQuestion.options.map((option, idx) => {
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
                      <Text style={[styles.optionText, { color: theme.colors.text }]}>
                        {option}
                      </Text>
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: isActive ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                      >
                        {isActive && (
                          <View
                            style={[
                              styles.radioDot,
                              { backgroundColor: theme.colors.primary },
                            ]}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Conditional Warning / Routing Note */}
              {selectedOption && currentQuestion.routingTrigger?.includes(selectedOption) && currentQuestion.routingText && (
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
                  <Text style={[styles.bannerText, { color: theme.colors.warningText }]}>
                    {currentQuestion.routingText}
                  </Text>
                </View>
              )}
            </View>

            {/* Bottom response button */}
            <CustomButton
              label={selectedOption ? "Next question" : "Choose a response"}
              onPress={handleNextStep}
              disabled={!selectedOption}
              icon="➔"
              style={{ width: "100%", marginTop: 16 }}
            />

            <Text style={[styles.onboardingFooterText, { color: theme.colors.textTertiary }]}>
              Your responses are used to build your readiness baseline, not evaluation.
            </Text>
          </View>
        )}

        {/* ================= STEP 22: COMPLETION SCREEN ================= */}
        {currentStep === 22 && (
          <View style={styles.innerContent}>
            {/* Big Success Icon */}
            <View style={[styles.successIconContainer, { backgroundColor: "#132D21" }]}>
              <Text style={styles.successIconText}>✔</Text>
            </View>

            <Text style={[styles.stepSubTitle, { color: theme.colors.textSecondary }]}>
              FIRST-USE · COMPLETED · PR-M-022
            </Text>

            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Readiness baseline set
            </Text>

            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary, textAlign: "center" }]}>
              Thank you! Your responses have been securely synced. You can now access your readiness
              dashboard.
            </Text>

            <CustomButton
              label="Enter Dashboard"
              onPress={handleNextStep}
              style={{ width: "100%", marginTop: 32 }}
            />
          </View>
        )}
      </ScrollView>

      {/* ================= FOLLOW-UP BOTTOM SHEET ================= */}
      {currentQuestion?.followUp && (
        <CustomBottomSheet
          visible={isSheetVisible}
          onClose={() => setIsSheetVisible(false)}
          title={currentQuestion.followUp.title}
          subtitle="OPTIONAL FOLLOW-UP"
        >
          <View style={styles.sheetBody}>
            {/* Content variant based on followUp type */}
            {currentQuestion.followUp.type === "severity-sheet" &&
              currentQuestion.followUp.options?.map((option, idx) => {
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
                      <Text style={[styles.sheetOptionDesc, { color: theme.colors.textSecondary }]}>
                        {option.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: isActive ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {isActive && (
                        <View
                          style={[
                            styles.radioDot,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}

            {currentQuestion.followUp.type === "toggle-sheet" &&
              currentQuestion.followUp.options?.map((option, idx) => {
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
                      <Text style={[styles.sheetOptionLabel, { color: theme.colors.text, marginBottom: 0 }]}>
                        {option.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: isActive ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {isActive && (
                        <View
                          style={[
                            styles.radioDot,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}

            {currentQuestion.followUp.type === "role-sheet" && (
              <View style={styles.checkboxList}>
                {currentQuestion.followUp.options?.map((option, idx) => (
                  <CustomSwitch
                    key={idx}
                    label={option.label}
                    description={option.description}
                    value={roleToggles[option.label as keyof typeof roleToggles]}
                    onValueChange={(val) => {
                      if (option.disabled) return;
                      setRoleToggles((prev) => ({
                        ...prev,
                        [option.label]: val,
                      }));
                    }}
                    disabled={option.disabled}
                  />
                ))}
                <Text style={[styles.sheetNoteText, { color: theme.colors.textTertiary }]}>
                  Select all that apply. SC and PT/IM are locked on.
                </Text>
              </View>
            )}

            {currentQuestion.followUp.type === "text-sheet" && (
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
                  placeholder={currentQuestion.followUp.placeholder}
                  placeholderTextColor={theme.colors.textTertiary}
                  maxLength={currentQuestion.followUp.maxLength}
                  value={tempTextValue}
                  onChangeText={setTempTextValue}
                />
                <Text style={[styles.charCounter, { color: theme.colors.textTertiary }]}>
                  {tempTextValue.length} / {currentQuestion.followUp.maxLength}
                </Text>
              </View>
            )}

            {/* Bottom Actions inside Sheet */}
            <CustomButton
              label="Save follow-up"
              onPress={handleSaveFollowUp}
              disabled={
                currentQuestion.followUp.type === "text-sheet"
                  ? tempTextValue.trim().length === 0
                  : currentQuestion.followUp.type === "role-sheet"
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
  },
  innerContent: {
    alignItems: "center",
    width: "100%",
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
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  metaBox: {
    width: "100%",
    backgroundColor: "#0D0D0E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1F1F23",
    padding: 16,
    gap: 6,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  metaText: {
    fontSize: 11,
    lineHeight: 16,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  cardBodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  disclaimerBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 18,
    color: "#00A3C4",
    marginRight: 12,
    fontWeight: "bold",
  },
  disclaimerHeader: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  disclaimerDesc: {
    fontSize: 13,
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
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  questionStepText: {
    fontSize: 11,
    fontWeight: "700",
  },
  questionTimeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stepBadge: {
    backgroundColor: "#1F1F23",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressBarContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 4,
    height: 4,
    marginBottom: 24,
  },
  progressBarSegment: {
    flex: 1,
    borderRadius: 2,
  },
  questionCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
  },
  questionTitleText: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  questionDescText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routingBanner: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
  },
  bannerIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontWeight: "500",
  },
  onboardingFooterText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 16,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    color: "#34D399",
  },
  sheetBody: {
    gap: 12,
  },
  sheetOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  sheetOptionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  sheetOptionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkboxList: {
    width: "100%",
  },
  sheetNoteText: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
  },
  textInputWrapper: {
    width: "100%",
  },
  textArea: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  charCounter: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
  },
});
