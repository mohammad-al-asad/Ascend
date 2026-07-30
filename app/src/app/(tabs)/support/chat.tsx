import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomBottomSheet } from "../../../components/ui/CustomBottomSheet";

interface Message {
  id: string;
  sender: "provider" | "operator";
  text: string;
  time: string;
}

const BECKER_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "provider",
    text: "Morning capt.lin — sharing the sleep plan we built from Q12 last week. Targets are based on your D5 trajectory, not your raw number.",
    time: "09:12",
  },
  {
    id: "m2",
    sender: "operator",
    text: "Thanks TSgt Becker. Question: do I cut the late caffeine entirely or taper it? I usually have one around 1900.",
    time: "09:14",
  },
  {
    id: "m3",
    sender: "provider",
    text: "Taper. Move it to 1600 for 5 days, then drop. Plan adjusts on day 3 if your check-in shows the window closing. No raw score — just the bucket.",
    time: "09:16",
  },
  {
    id: "m4",
    sender: "operator",
    text: "Got it. I'll log in the plan_link and re-check Wednesday.",
    time: "09:18",
  },
  {
    id: "m5",
    sender: "provider",
    text: "Perfect. Also flagging: your Sunday PT session moved earlier by 30 min — that's PT/IM scope, not mine. I'll coordinate with them through the SCS handoff.",
    time: "09:21",
  },
  {
    id: "m6",
    sender: "operator",
    text: "Copy. Quick clarification — the plan-link ID in the assignment note matches the one in my trends card, right?",
    time: "09:24",
  },
  {
    id: "m7",
    sender: "provider",
    text: "Same plan_link. If it ever drifts, ping me here and I'll re-issue. PT/IM is on a separate thread with their own trace.",
    time: "09:26",
  },
  {
    id: "m8",
    sender: "operator",
    text: "Confirmed. I'll start tonight and check in Wednesday.",
    time: "09:28",
  },
];

const LIN_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "provider",
    text: "Marcus, review of your 7D physical score shows a slight drop. How is the left shoulder knee extension feeling post-workout?",
    time: "09:10",
  },
  {
    id: "m2",
    sender: "operator",
    text: "A bit tight after the overhead lifts yesterday, Capt. No sharp pain, just dull stiffness.",
    time: "09:12",
  },
  {
    id: "m3",
    sender: "provider",
    text: "Stick to the pre-hab routine: 3 sets of banded external rotations before lifting. If tightness persists past 48h, drop the overhead weight by 10%.",
    time: "09:15",
  },
  {
    id: "m4",
    sender: "operator",
    text: "Understood, I'll log it in the pre-hab tracker and follow up after Friday's session.",
    time: "09:18",
  },
];

export default function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { provider } = useLocalSearchParams();
  const isLin = provider === "lin";

  const providerName = isLin ? "Capt J. Lin" : "Tsgt B. Becker";
  const providerInitials = isLin ? "CL" : "BB";
  const providerRole = isLin ? "PT/IM - Physical Therapy" : "SCS - Strength & Conditioning";
  const headerIcon = isLin ? "shield-outline" : "fitness-outline";

  const [messages, setMessages] = useState<Message[]>(isLin ? LIN_MESSAGES : BECKER_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const newMessage: Message = {
      id: Math.random().toString(),
      sender: "operator",
      text: inputText,
      time: timeStr,
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Defer scroll to end
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record.
        </Text>
      </View>

      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: theme.colors.cardBorder }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={[styles.avatarCircle, { backgroundColor: "#27272A" }]}>
          <Text style={[styles.avatarText, { color: theme.colors.text }]}>
            {providerInitials}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.providerNameText, { color: theme.colors.text }]} numberOfLines={1}>
            {providerName}
          </Text>
          <View style={styles.providerSubRow}>
            <Text style={[styles.providerRoleText, { color: theme.colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
              {providerRole}
            </Text>
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { color: "#10B981" }]} numberOfLines={1}>
              Assigned · active pathway
            </Text>
          </View>
        </View>

        <Pressable onPress={() => setSheetVisible(true)} style={styles.headerRightContainer}>
          <View style={[styles.headerRightCircle, { borderColor: theme.colors.cardBorder }]}>
            <Ionicons name={headerIcon as any} size={18} color={theme.colors.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>8</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Alert Warning Bar */}
      <View style={[styles.warningBar, { backgroundColor: "#1A1510", borderColor: "#D97706" }]}>
        <Ionicons name="warning-outline" size={16} color="#D97706" style={{ marginRight: 8 }} />
        <Text style={styles.warningBarText}>
          Do not share schedules, tactics, unit movement, or OPSEC content. Keywords auto-flag before send.
        </Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <Text style={[styles.dateDividerText, { color: theme.colors.textSecondary }]}>
          Today · 2026-07-18
        </Text>

        {messages.map((item) => {
          const isOperator = item.sender === "operator";
          return (
            <View
              key={item.id}
              style={[
                styles.messageRow,
                isOperator ? styles.rowOperator : styles.rowProvider,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isOperator
                    ? [styles.bubbleOperator, { backgroundColor: "#0F5B6C" }]
                    : [styles.bubbleProvider, { backgroundColor: "#1C1C1E" }],
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
                <View style={styles.bubbleFooter}>
                  <Text style={[styles.bubbleTime, { color: theme.colors.textTertiary }]}>
                    {item.time}
                  </Text>
                  {isOperator && (
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color="#00A3C4"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer Text Input Bar */}
      <View style={[styles.inputSection, { borderTopColor: theme.colors.cardBorder }]}>
        <View style={[styles.inputRow, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
          <Pressable style={styles.clipBtn}>
            <Ionicons name="attach-outline" size={24} color={theme.colors.textSecondary} />
          </Pressable>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${providerName}`}
            placeholderTextColor={theme.colors.textTertiary}
            onSubmitEditing={handleSend}
            style={[styles.textInput, { color: theme.colors.text }]}
          />

          <Pressable
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.inputMetaRow}>
          <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
            {`${inputText.length} / 2,000`}
          </Text>
          <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
            OPSEC scan on send · server re-validates
          </Text>
        </View>
      </View>

      {/* Audit Bottom Sheet */}
      <CustomBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Audit & decisions"
        subtitle="[TRACE] · AUDIT PREVIEW · 8 [OPEN] DECISIONS"
        snapPoints={["85%"]}
        scrollable={true}
      >
        <View style={styles.sheetBody}>
          {/* THREAD SOURCE */}
          <Text style={[styles.auditSectionTitle, { color: theme.colors.textTertiary }]}>THREAD SOURCE</Text>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>source_type</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>provider_plan_link</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>plan_link_id</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>{isLin ? "8B5C-3N1R-XOPZ" : "7G4A-2K9R-REYE"}</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>question_id</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>{isLin ? "Q15" : "Q12"}</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>readiness_driver</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>{isLin ? "Physical · D1" : "Sleep · D5"}</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>route_level</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>L1</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder, borderBottomWidth: 0 }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>assigned_to</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>{isLin ? "capt.lin" : "tsgt.becker"}</Text>
          </View>

          {/* LAST SEND · AUDIT ROW */}
          <Text style={[styles.auditSectionTitle, { color: theme.colors.textTertiary, marginTop: 24 }]}>LAST SEND · AUDIT ROW</Text>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>message_id</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>MSG-2026-0142</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>audit_event_id</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>MSG-AUD-0142</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>audit_timestamp</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>2026-07-18 09:14 UTC</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>attachment_count</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>0</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>opsec_scan</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>passed (client + server)</Text>
          </View>
          <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder, borderBottomWidth: 0 }]}>
            <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>role_scope</Text>
            <Text style={[styles.auditValue, { color: theme.colors.text }]}>{isLin ? "operator · pt · (allowed)" : "operator · scs · (allowed)"}</Text>
          </View>

          {/* OPEN MESSAGING BEHAVIORS */}
          <Text style={[styles.auditSectionTitle, { color: theme.colors.textTertiary, marginTop: 24 }]}>[OPEN] MESSAGING BEHAVIORS</Text>
          <View style={styles.behaviorList}>
            {[
              "Transport · WebSocket vs polling",
              "Push notifications · APNs/FCM",
              "Read receipts",
              "Typing indicators",
              "Group threads vs 1:1",
              "Attachment types (PDF + image only in v1)",
              "Retention window",
              "Crisis-keyword vs L5"
            ].map((behavior, bIdx) => (
              <View key={bIdx} style={styles.behaviorRow}>
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>[Open]</Text>
                </View>
                <Text style={[styles.behaviorText, { color: theme.colors.text }]}>{behavior}</Text>
              </View>
            ))}
          </View>

          {/* Close Action */}
          <Pressable onPress={() => setSheetVisible(false)} style={styles.sheetCloseBtn}>
            <Text style={{ color: theme.colors.textSecondary, fontWeight: "700", fontSize: 13 }}>Close</Text>
          </Pressable>
        </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  providerNameText: {
    fontSize: 15,
    fontWeight: "800",
  },
  providerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  providerRoleText: {
    fontSize: 11,
    flexShrink: 1,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
    marginHorizontal: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  headerRightContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerRightCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#D97706",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  warningBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  warningBarText: {
    color: "#D97706",
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    width: "100%",
  },
  rowProvider: {
    justifyContent: "flex-start",
  },
  rowOperator: {
    justifyContent: "flex-end",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "80%",
  },
  bubbleProvider: {
    borderTopLeftRadius: 4,
  },
  bubbleOperator: {
    borderTopRightRadius: 4,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
  },
  bubbleFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 10,
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  clipBtn: {
    padding: 4,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
    paddingVertical: 0,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  inputMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  metaText: {
    fontSize: 10,
  },
  sheetBody: {
    paddingBottom: 16,
  },
  auditSectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  auditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  auditLabel: {
    fontSize: 12,
  },
  auditValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  behaviorList: {
    marginTop: 4,
    gap: 8,
  },
  behaviorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  openBadge: {
    borderWidth: 1,
    borderColor: "#D97706",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 10,
  },
  openBadgeText: {
    color: "#D97706",
    fontSize: 8,
    fontWeight: "800",
  },
  behaviorText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sheetCloseBtn: {
    alignSelf: "flex-end",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
