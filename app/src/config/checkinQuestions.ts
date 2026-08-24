export type CheckinQuestionOption = {
  id: string;
  title: string;
  subtitle?: string;
  score?: number;
  flag?: string;
};

export type CheckinQuestion = {
  id: string;
  driver: string;
  question: string;
  options: CheckinQuestionOption[];
};

export const dailyQuestions: CheckinQuestion[] = [
  {
    id: "D1",
    driver: "Physical",
    question: "How ready does your body feel for today's demands?",
    options: [
      { id: "D1_1", title: "Below standard", subtitle: "My body feels drained", score: 25 },
      { id: "D1_2", title: "Building", subtitle: "I can manage but with effort", score: 50 },
      { id: "D1_3", title: "Ready", subtitle: "I am functioning at my normal level", score: 75 },
      { id: "D1_4", title: "Peak", subtitle: "My body feels energized", score: 100 },
    ],
  },
  {
    id: "D2",
    driver: "Sleep",
    question: "How much sleep did you get last night?",
    options: [
      { id: "D2_1", title: "<5h", subtitle: "Less than five hours", score: 25 },
      { id: "D2_2", title: "5 - 6h", subtitle: "About five to six hours", score: 50 },
      { id: "D2_3", title: "6 - 8h", subtitle: "A solid six to eight hours", score: 75 },
      { id: "D2_4", title: "8+h", subtitle: "Eight hours or more", score: 100 },
    ],
  },
  {
    id: "D3",
    driver: "Recovery",
    question: "How recovered do you feel overall?",
    options: [
      { id: "D3_1", title: "Poor", subtitle: "I feel worn down", score: 25 },
      { id: "D3_2", title: "Fair", subtitle: "I am still recovering", score: 50 },
      { id: "D3_3", title: "Good", subtitle: "I feel restored", score: 75 },
      { id: "D3_4", title: "Excellent", subtitle: "Fully recovered and ready", score: 100 },
    ],
  },
  {
    id: "D4",
    driver: "Nutrition",
    question: "How well are you fueling and hydrating?",
    options: [
      { id: "D4_1", title: "Below standard", subtitle: "Skipping meals or hydration", score: 25 },
      { id: "D4_2", title: "Adequate", subtitle: "Some meals and hydration", score: 50 },
      { id: "D4_3", title: "Strong", subtitle: "On plan with meals + hydration", score: 75 },
      { id: "D4_4", title: "Peak", subtitle: "On top of meals and hydration", score: 100 },
    ],
  },
  {
    id: "D5",
    driver: "Mental",
    question: "How is your stress and focus right now?",
    options: [
      { id: "D5_1", title: "Stressed", subtitle: "Focus is hard to hold", score: 25 },
      { id: "D5_2", title: "Managing", subtitle: "Focus is workable", score: 50 },
      { id: "D5_3", title: "Steady", subtitle: "I can focus and adapt", score: 75 },
      { id: "D5_4", title: "Sharp", subtitle: "Mentally clear and present", score: 100 },
    ],
  },
  {
    id: "D6",
    driver: "Pain, injury, or limitation",
    question: "Anything limiting you today?",
    options: [
      { id: "D6_1", title: "None", subtitle: "Nothing to flag", score: 100 },
      { id: "D6_2", title: "Something to flag", subtitle: "My support team will review", score: 50, flag: "PT/IM review" },
    ],
  },
];

export const weeklyQuestions: CheckinQuestion[] = [
  {
    id: "W1",
    driver: "Physical",
    question: "How consistent was your physical activity this week?",
    options: [
      { id: "W1_1", title: "Very inconsistent", score: 25 },
      { id: "W1_2", title: "Inconsistent", score: 50 },
      { id: "W1_3", title: "Consistent", score: 75 },
      { id: "W1_4", title: "Very consistent", score: 100 },
    ],
  },
  {
    id: "W2",
    driver: "Physical",
    question: "Did pain, injury, profile, or limitation affect your training this week?",
    options: [
      { id: "W2_1", title: "Significantly", score: 25, flag: "PT/IM review" },
      { id: "W2_2", title: "Moderately", score: 50, flag: "PT/IM review" },
      { id: "W2_3", title: "Slightly", score: 75, flag: "SCS note" },
      { id: "W2_4", title: "Not at all", score: 100 },
    ],
  },
  {
    id: "W3",
    driver: "Nutritional",
    question: "How consistent were your meals this week?",
    options: [
      { id: "W3_1", title: "Very inconsistent", score: 25 },
      { id: "W3_2", title: "Inconsistent", score: 50 },
      { id: "W3_3", title: "Consistent", score: 75 },
      { id: "W3_4", title: "Very consistent", score: 100 },
    ],
  },
  {
    id: "W4",
    driver: "Nutritional",
    question: "How well did hydration support your energy and recovery?",
    options: [
      { id: "W4_1", title: "Not at all", score: 25 },
      { id: "W4_2", title: "Slightly", score: 50 },
      { id: "W4_3", title: "Mostly", score: 75 },
      { id: "W4_4", title: "Fully", score: 100 },
    ],
  },
  {
    id: "W5",
    driver: "Mental",
    question: "How high was your stress level overall this week?",
    options: [
      { id: "W5_1", title: "Very high", score: 25 },
      { id: "W5_2", title: "High", score: 50 },
      { id: "W5_3", title: "Low", score: 75 },
      { id: "W5_4", title: "Very low", score: 100 },
    ],
  },
  {
    id: "W6",
    driver: "Mental",
    question: "How well did you stay focused during demanding tasks?",
    options: [
      { id: "W6_1", title: "Very low", score: 25 },
      { id: "W6_2", title: "Low", score: 50 },
      { id: "W6_3", title: "Good", score: 75 },
      { id: "W6_4", title: "Excellent", score: 100 },
    ],
  },
  {
    id: "W7",
    driver: "Spiritual",
    question: "How motivated did you feel toward your responsibilities this week?",
    options: [
      { id: "W7_1", title: "Very low", score: 25 },
      { id: "W7_2", title: "Low", score: 50 },
      { id: "W7_3", title: "Good", score: 75 },
      { id: "W7_4", title: "Strong", score: 100 },
    ],
  },
  {
    id: "W8",
    driver: "Spiritual",
    question: "How connected did you feel to your purpose, values, or team?",
    options: [
      { id: "W8_1", title: "Not connected", score: 25 },
      { id: "W8_2", title: "Slightly connected", score: 50 },
      { id: "W8_3", title: "Connected", score: 75 },
      { id: "W8_4", title: "Strongly connected", score: 100 },
    ],
  },
  {
    id: "W9",
    driver: "Sleep",
    question: "How consistent was your sleep schedule this week?",
    options: [
      { id: "W9_1", title: "Very inconsistent", score: 25 },
      { id: "W9_2", title: "Inconsistent", score: 50 },
      { id: "W9_3", title: "Consistent", score: 75 },
      { id: "W9_4", title: "Very consistent", score: 100 },
    ],
  },
  {
    id: "W10",
    driver: "Sleep",
    question: "How well did you recover after demanding days?",
    options: [
      { id: "W10_1", title: "Not recovered", score: 25 },
      { id: "W10_2", title: "Slightly recovered", score: 50 },
      { id: "W10_3", title: "Recovered", score: 75 },
      { id: "W10_4", title: "Fully recovered", score: 100 },
    ],
  },
];

export const monthlyQuestions: CheckinQuestion[] = [
  {
    id: "M1",
    driver: "Physical",
    question: "How has your physical readiness changed this month?",
    options: [
      { id: "M1_1", title: "Declined significantly", score: 25 },
      { id: "M1_2", title: "Declined somewhat", score: 50 },
      { id: "M1_3", title: "Stayed stable", score: 75 },
      { id: "M1_4", title: "Improved", score: 100 },
    ],
  },
  {
    id: "M2",
    driver: "Physical",
    question: "How confident are you in your current training plan?",
    options: [
      { id: "M2_1", title: "Not confident", score: 25 },
      { id: "M2_2", title: "Slightly confident", score: 50 },
      { id: "M2_3", title: "Confident", score: 75 },
      { id: "M2_4", title: "Very confident", score: 100 },
    ],
  },
  {
    id: "M3",
    driver: "Nutritional",
    question: "How consistent were your nutrition habits this month?",
    options: [
      { id: "M3_1", title: "Very inconsistent", score: 25 },
      { id: "M3_2", title: "Inconsistent", score: 50 },
      { id: "M3_3", title: "Consistent", score: 75 },
      { id: "M3_4", title: "Very consistent", score: 100 },
    ],
  },
  {
    id: "M4",
    driver: "Nutritional",
    question: "How much did nutrition support your energy, recovery, or training?",
    options: [
      { id: "M4_1", title: "Not at all", score: 25 },
      { id: "M4_2", title: "Slightly", score: 50 },
      { id: "M4_3", title: "Mostly", score: 75 },
      { id: "M4_4", title: "Fully", score: 100 },
    ],
  },
  {
    id: "M5",
    driver: "Mental",
    question: "How well did you manage stress this month?",
    options: [
      { id: "M5_1", title: "Poorly", score: 25 },
      { id: "M5_2", title: "Fairly", score: 50 },
      { id: "M5_3", title: "Well", score: 75 },
      { id: "M5_4", title: "Very well", score: 100 },
    ],
  },
  {
    id: "M6",
    driver: "Mental",
    question: "How mentally prepared do you feel for upcoming demands?",
    options: [
      { id: "M6_1", title: "Not prepared", score: 25 },
      { id: "M6_2", title: "Slightly prepared", score: 50 },
      { id: "M6_3", title: "Prepared", score: 75 },
      { id: "M6_4", title: "Very prepared", score: 100 },
    ],
  },
  {
    id: "M7",
    driver: "Spiritual",
    question: "How aligned did your actions feel with your purpose, values, or priorities this month?",
    options: [
      { id: "M7_1", title: "Not aligned", score: 25 },
      { id: "M7_2", title: "Slightly aligned", score: 50 },
      { id: "M7_3", title: "Aligned", score: 75 },
      { id: "M7_4", title: "Strongly aligned", score: 100 },
    ],
  },
  {
    id: "M8",
    driver: "Spiritual",
    question: "How supported or connected did you feel this month?",
    options: [
      { id: "M8_1", title: "Not supported", score: 25 },
      { id: "M8_2", title: "Slightly supported", score: 50 },
      { id: "M8_3", title: "Supported", score: 75 },
      { id: "M8_4", title: "Strongly supported", score: 100 },
    ],
  },
  {
    id: "M9",
    driver: "Sleep",
    question: "How would you rate your sleep quality this month?",
    options: [
      { id: "M9_1", title: "Very poor", score: 25 },
      { id: "M9_2", title: "Poor", score: 50 },
      { id: "M9_3", title: "Good", score: 75 },
      { id: "M9_4", title: "Excellent", score: 100 },
    ],
  },
  {
    id: "M10",
    driver: "Sleep",
    question: "How well did you recover from demanding days this month?",
    options: [
      { id: "M10_1", title: "Not recovered", score: 25 },
      { id: "M10_2", title: "Slightly recovered", score: 50 },
      { id: "M10_3", title: "Recovered", score: 75 },
      { id: "M10_4", title: "Fully recovered", score: 100 },
    ],
  },
];
