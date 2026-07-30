import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

interface TopicOption {
  id: string;
  icon: string;
  iconColor: string;
  label: string;
  desc: string;
}

const TOPIC_OPTIONS: TopicOption[] = [
  {
    id: "fitness",
    icon: "pulse-outline",
    iconColor: "#00A3C4",
    label: "Fitness",
    desc: "Plan, training, OFT. → PT/IM",
  },
  {
    id: "injury",
    icon: "medical-outline",
    iconColor: "#60A5FA",
    label: "Injury-Recovery",
    desc: "Rehab, return-to-performance. → PT/IM",
  },
  {
    id: "nutrition",
    icon: "nutrition-outline",
    iconColor: "#F59E0B",
    label: "Nutrition",
    desc: "Fuel, hydration, habits. → Nutritionist",
  },
  {
    id: "mental",
    icon: "shield-outline",
    iconColor: "#10B981",
    label: "Mental",
    desc: "Stress, focus, performance. → Mental Performance",
  },
  {
    id: "purpose",
    icon: "sunny-outline",
    iconColor: "#EAB308",
    label: "Purpose",
    desc: "Values, meaning, direction. → Purpose (chaplain)",
  },
];

export default function RequestSupportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [contextText, setContextText] = useState("");

  const handleContinue = () => {
    if (!selectedTopic) {
      Alert.alert("Select a Topic", "Please select a topic before continuing.");
      return;
    }
    Alert.alert(
      "Request Sent",
      `Your support request for ${
        TOPIC_OPTIONS.find((t) => t.id === selectedTopic)?.label
      } has been submitted.`
    );
    router.back();
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
        title="Request support"
        onBack={() => router.back()}
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            PICK A TOPIC
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Request support
          </Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            {"Pick a topic. We'll route to the right specialist."}
          </Text>
        </View>

        {/* List of Topic Selectable Cards */}
        <View style={styles.topicsList}>
          {TOPIC_OPTIONS.map((item) => {
            const isSelected = selectedTopic === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedTopic(item.id)}
                style={[
                  styles.topicCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.topicCardLeft}>
                  <View style={[styles.topicIconCircle, { backgroundColor: "#1C1F26" }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                  </View>
                  <View style={styles.topicTextCol}>
                    <Text style={[styles.topicLabel, { color: theme.colors.text }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.topicDesc, { color: theme.colors.textSecondary }]}>
                      {item.desc}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                      backgroundColor: isSelected ? theme.colors.primary : "transparent",
                    },
                  ]}
                >
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Section: Add context (optional) */}
        <View style={[styles.contextCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={styles.contextHeaderRow}>
            <Text style={[styles.contextTitle, { color: theme.colors.text }]}>
              Add context (optional)
            </Text>
            <Text style={[styles.counterText, { color: theme.colors.textSecondary }]}>
              {`${contextText.length} / 280`}
            </Text>
          </View>

          <TextInput
            multiline
            numberOfLines={4}
            maxLength={280}
            value={contextText}
            onChangeText={setContextText}
            placeholder="Share anything that helps the specialist prepare. Av..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[
              styles.textInput,
              {
                color: theme.colors.text,
                borderColor: theme.colors.cardBorder,
                backgroundColor: "#15161A",
              },
            ]}
          />

          <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
            Do not share operational schedules, tactics, unit movement, or OPSEC content.
          </Text>
        </View>

        {/* Disclaimer Text */}
        <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
          This is for performance support. It is not crisis care or medical advice.
        </Text>

        {/* Continue CTA Button */}
        <Pressable
          onPress={handleContinue}
          style={[styles.continueBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </Pressable>

        {/* Confidentiality notice footer */}
        <Text style={[styles.footerNotice, { color: theme.colors.textTertiary }]}>
          {"CUI // OPSEC · This request is visible only to your assigned specialist."}
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
  bellBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleBlock: {
    marginBottom: 20,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },
  topicsList: {
    gap: 12,
    marginBottom: 24,
  },
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  topicCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  topicIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topicTextCol: {
    flex: 1,
    marginRight: 8,
  },
  topicLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  topicDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contextCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  contextHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contextTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  counterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    fontSize: 13,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 11,
    lineHeight: 16,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  continueBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  footerNotice: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
