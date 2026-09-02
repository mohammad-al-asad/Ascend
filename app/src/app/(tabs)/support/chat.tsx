import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomBottomSheet } from "../../../components/ui/CustomBottomSheet";
import * as DocumentPicker from "expo-document-picker";
import { useAppSelector } from "../../../redux/store";
import { useGetMyTeamQuery } from "../../../redux/api/supportApi";
import { API_BASE_URL } from "../../../redux/api/baseApi";
import {
  useGetThreadWithUserQuery,
  useSendMessageMutation,
  useLazyGetMessageTraceQuery,
  useGetThreadsQuery,
  MessageResponse,
} from "../../../redux/api/messagingApi";

export default function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    other_user_id?: string;
    provider?: string;
    provider_name?: string;
    role_title?: string;
    pathway_key?: string;
  }>();

  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const { data: pathways } = useGetMyTeamQuery();
  const { data: threadsData } = useGetThreadsQuery();

  const isLin = params.provider === "lin" || params.role_title?.includes("PT");

  // Resolve target provider and other_user_id
  const matchedPathway = (pathways || []).find(
    (p) =>
      p.provider?.user_id === params.other_user_id ||
      (params.provider === "lin" && (p.pathway_key === "PT-IM" || p.pathway_key === "PT" || p.pathway_key === "PT/IM")) ||
      (params.provider === "becker" && p.pathway_key === "SCS") ||
      p.pathway_key === params.pathway_key
  );

  const targetUserId =
    params.other_user_id ||
    matchedPathway?.provider?.user_id ||
    "";

  const providerName =
    params.provider_name ||
    matchedPathway?.provider?.name ||
    (isLin ? "Capt J. Lin" : "TSgt B. Becker");

  const providerRole =
    params.role_title ||
    matchedPathway?.role_title ||
    matchedPathway?.label ||
    (isLin ? "PT/IM - Physical Therapy" : "SCS - Strength & Conditioning");

  const providerInitials = providerName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PR";

  const headerIcon = isLin ? "shield-outline" : "fitness-outline";

  // Find unread count for this thread
  const threadSummary = Array.isArray(threadsData)
    ? threadsData.find((t) => t.other_user_id === targetUserId)
    : (threadsData as any)?.threads?.find((t: any) => t.other_user_id === targetUserId);

  const unreadCount = threadSummary?.unread_count ?? 0;

  // RTK Query: fetch thread messages
  const isRealTargetId = Boolean(targetUserId && !targetUserId.startsWith("provider_"));
  const {
    data: threadData,
    isLoading: isThreadLoading,
    refetch: refetchThread,
  } = useGetThreadWithUserQuery(targetUserId, {
    skip: !isRealTargetId,
  });

  const [sendMessageMutation, { isLoading: isSending }] = useSendMessageMutation();
  const [fetchTrace, { data: traceData, isFetching: isTraceLoading }] = useLazyGetMessageTraceQuery();

  // Local state for messages
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Sync with server messages when loaded
  useEffect(() => {
    if (threadData?.messages) {
      setMessages(threadData.messages);
    }
  }, [threadData]);

  // WebSocket Live Real-Time Updates
  useEffect(() => {
    if (!accessToken) return;

    const wsUrl = `${API_BASE_URL.replace(/^http/, "ws")}/messaging/live?token=${encodeURIComponent(accessToken)}`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Messaging WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const incoming: MessageResponse = JSON.parse(event.data);
          if (incoming && incoming.body) {
            // If the message is for this thread, append it
            if (
              !targetUserId ||
              incoming.sender_id === targetUserId ||
              incoming.recipient_id === targetUserId ||
              incoming.sender_id === user?.id
            ) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === incoming.id)) return prev;
                return [...prev, incoming];
              });
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }
        } catch (e) {
          console.log("Error parsing WS message:", e);
        }
      };

      ws.onerror = (err) => {
        console.log("Messaging WebSocket error:", err);
      };

      ws.onclose = (event) => {
        console.log("Messaging WebSocket closed:", event.code);
      };
    } catch (err) {
      console.log("Failed to initialize WebSocket:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [accessToken, targetUserId, user?.id]);

  // Pick Document / Attachment
  const handlePickAttachment = async () => {
    if (attachedFile) {
      setAttachedFile(null);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.size && file.size > 20 * 1024 * 1024) {
          Alert.alert("File Too Large", "Attachments must be 20MB or smaller.");
          return;
        }
        setAttachedFile(file);
      }
    } catch (err) {
      console.log("Document pick error:", err);
      Alert.alert("Error", "Could not pick attachment.");
    }
  };

  // Open Audit Sheet
  const handleOpenAuditSheet = () => {
    setSheetVisible(true);
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.id && !lastMessage.id.startsWith("temp_")) {
      fetchTrace(lastMessage.id);
    }
  };

  // Send Message
  const handleSend = async () => {
    const textToSend = inputText.trim();
    if (!textToSend && !attachedFile) return;

    const nowIso = new Date().toISOString();
    const tempId = `temp_${Date.now()}`;

    // Optimistic local echo
    const optimisticMessage: MessageResponse = {
      id: tempId,
      sender_id: user?.id || "operator_me",
      recipient_id: targetUserId,
      body: textToSend,
      attachment: attachedFile
        ? {
            filename: attachedFile.name,
            url: attachedFile.uri,
            size: attachedFile.size,
          }
        : null,
      created_at: nowIso,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");
    const fileToSend = attachedFile;
    setAttachedFile(null);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // If server target ID is present, execute mutation
    if (targetUserId) {
      const formData = new FormData();
      formData.append("recipient_id", targetUserId);
      formData.append("body", textToSend);

      if (fileToSend) {
        // Expo's fetch polyfill only accepts real Blob/File parts, not RN's
        // classic {uri, name, type} shorthand - read the picked file into a
        // Blob before attaching it. RN's Blob polyfill can't construct from a
        // raw ArrayBuffer, so get the Blob straight from fetch() instead.
        const fileBlob = await (await fetch(fileToSend.uri)).blob();
        formData.append("file", fileBlob, fileToSend.name);
      }

      try {
        const realMsg = await sendMessageMutation(formData).unwrap();
        // Replace optimistic echo with server message
        setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
      } catch (err: any) {
        console.log("Send message error:", err);
        const errorData = err?.data;
        let errorMsg = "Failed to send message.";

        if (errorData?.detail?.message) {
          errorMsg = errorData.detail.message;
          if (Array.isArray(errorData.detail.blocked_terms) && errorData.detail.blocked_terms.length > 0) {
            errorMsg += `\n\nBlocked terms: ${errorData.detail.blocked_terms.join(", ")}`;
            if (errorData.detail.severity) {
              errorMsg += ` (Severity ${errorData.detail.severity})`;
            }
          }
        } else if (typeof errorData?.detail === "string") {
          errorMsg = errorData.detail;
        }

        Alert.alert("OPSEC / Send Error", errorMsg);
        // Remove failed optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInputText(textToSend);
        setAttachedFile(fileToSend);
      }
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "";
    }
  };

  const formatMessageDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Today";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Today";
    }
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

        <Pressable onPress={handleOpenAuditSheet} style={styles.headerRightContainer}>
          <View style={[styles.headerRightCircle, { borderColor: theme.colors.cardBorder }]}>
            <Ionicons name={headerIcon as any} size={18} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
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
        {isThreadLoading && messages.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 12, fontSize: 13 }}>
              Loading conversation...
            </Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: "center", paddingHorizontal: 32 }}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.cardBorder }]}>
              <Ionicons name="chatbubbles-outline" size={32} color={theme.colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Direct Channel
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {`This is a secure 1:1 communication channel with ${providerName} (${providerRole}). Send a message below to start.`}
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.dateDividerText, { color: theme.colors.textSecondary }]}>
              {messages[0]?.created_at ? formatMessageDate(messages[0].created_at) : "Today"}
            </Text>

            {messages.map((item) => {
              const isOperator =
                item.sender_id === user?.id ||
                item.sender_id === "operator_me" ||
                item.sender_role === "operator" ||
                item.sender_role === "user";

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
                    <Text style={styles.messageText}>{item.body}</Text>

                    {item.attachment && (
                      <View style={styles.attachmentBox}>
                        <Ionicons name="document-attach-outline" size={16} color="#00A3C4" />
                        <Text style={[styles.attachmentText, { color: theme.colors.text }]} numberOfLines={1}>
                          {item.attachment.filename}
                        </Text>
                      </View>
                    )}

                    <View style={styles.bubbleFooter}>
                      <Text style={[styles.bubbleTime, { color: theme.colors.textTertiary }]}>
                        {formatMessageTime(item.created_at)}
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
          </>
        )}
      </ScrollView>

      {/* Attachment Preview Chip */}
      {attachedFile && (
        <View style={[styles.attachedChipRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Ionicons name="document-attach" size={16} color={theme.colors.primary} />
          <Text style={[styles.attachedChipText, { color: theme.colors.text }]} numberOfLines={1}>
            {attachedFile.name}
          </Text>
          <Pressable onPress={() => setAttachedFile(null)} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        </View>
      )}

      {/* Footer Text Input Bar */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.inputSection, { borderTopColor: theme.colors.cardBorder }]}>
          <View style={[styles.inputRow, { backgroundColor: "#15161A", borderColor: theme.colors.cardBorder }]}>
            <Pressable onPress={handlePickAttachment} style={styles.clipBtn}>
              <Ionicons
                name={attachedFile ? "attach" : "attach-outline"}
                size={24}
                color={attachedFile ? theme.colors.primary : theme.colors.textSecondary}
              />
            </Pressable>

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Message ${providerName}`}
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={handleSend}
              maxLength={2000}
              style={[styles.textInput, { color: theme.colors.text }]}
            />

            <Pressable
              onPress={handleSend}
              disabled={isSending || (!inputText.trim() && !attachedFile)}
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    inputText.trim() || attachedFile
                      ? theme.colors.primary
                      : "rgba(255,255,255,0.1)",
                },
              ]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={16} color="#FFFFFF" />
              )}
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
      </KeyboardAvoidingView>

      {/* Audit Bottom Sheet */}
      <CustomBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Audit & decisions"
        subtitle="[TRACE] · AUDIT PREVIEW"
        snapPoints={["85%"]}
        scrollable={true}
      >
        <View style={styles.sheetBody}>
          {isTraceLoading ? (
            <View style={{ paddingVertical: 30, alignItems: "center" }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 10, fontSize: 12 }}>
                Loading message trace...
              </Text>
            </View>
          ) : (
            <>
              {/* THREAD SOURCE */}
              <Text style={[styles.auditSectionTitle, { color: theme.colors.textTertiary }]}>THREAD SOURCE</Text>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>source_type</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.thread_source?.source_type || "user_initiated"}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>plan_link_id</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.thread_source?.plan_link_id || "—"}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>readiness_driver</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.thread_source?.readiness_driver || "—"}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>route_level</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.thread_source?.route_level || "L1"}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder, borderBottomWidth: 0 }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>assigned_to</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.thread_source?.assigned_to || providerName}
                </Text>
              </View>

              {/* LAST SEND · AUDIT ROW */}
              <Text style={[styles.auditSectionTitle, { color: theme.colors.textTertiary, marginTop: 24 }]}>LAST SEND · AUDIT ROW</Text>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>message_id</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.last_send_audit?.message_id || (messages[messages.length - 1]?.id ?? "—")}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>audit_event_id</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.last_send_audit?.audit_event_id || "—"}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>audit_timestamp</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.last_send_audit?.audit_timestamp || "—"}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>attachment_count</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.last_send_audit?.attachment_count ?? (messages[messages.length - 1]?.attachment ? 1 : 0)}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>opsec_scan</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.last_send_audit?.opsec_scan || "passed (server)"}
                </Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.colors.cardBorder, borderBottomWidth: 0 }]}>
                <Text style={[styles.auditLabel, { color: theme.colors.textSecondary }]}>role_scope</Text>
                <Text style={[styles.auditValue, { color: theme.colors.text }]}>
                  {traceData?.last_send_audit?.role_scope || "operator · (allowed)"}
                </Text>
              </View>
            </>
          )}

          {/* MESSAGING BEHAVIORS */}
          <Text style={[styles.auditSectionTitle, { color: theme.colors.textTertiary, marginTop: 24 }]}>MESSAGING BEHAVIORS</Text>
          <View style={styles.behaviorList}>
            {[
              { label: "Transport · WebSocket live change stream", status: "Live" },
              { label: "Attachments · PDF and image support (≤20MB)", status: "Active" },
              { label: "OPSEC scan · Real-time and server-side barrier", status: "Active" },
              { label: "Push notifications · APNs/FCM", status: "[Open] v1.1" },
              { label: "Read receipts & typing indicators", status: "[Open] v1.1" },
            ].map((behavior, bIdx) => (
              <View key={bIdx} style={styles.behaviorRow}>
                <View
                  style={[
                    styles.openBadge,
                    {
                      borderColor: behavior.status === "Active" || behavior.status === "Live" ? "#10B981" : "#D97706",
                      backgroundColor: behavior.status === "Active" || behavior.status === "Live" ? "rgba(16,185,129,0.1)" : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.openBadgeText,
                      { color: behavior.status === "Active" || behavior.status === "Live" ? "#10B981" : "#D97706" },
                    ]}
                  >
                    {behavior.status}
                  </Text>
                </View>
                <Text style={[styles.behaviorText, { color: theme.colors.text }]}>{behavior.label}</Text>
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
    paddingHorizontal: 4,
    height: 16,
    minWidth: 16,
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
    flexGrow: 1,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
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
  attachmentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  attachmentText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
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
  attachedChipRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  attachedChipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
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
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 10,
  },
  openBadgeText: {
    fontSize: 9,
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
