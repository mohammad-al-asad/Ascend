import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetFlyAwayKitQuery } from "../../../redux/api/recordsApi";

export default function FlyAwayKitScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading } = useGetFlyAwayKitQuery();

  const handleCallPress = (phone: string) => {
    const rawPhone = phone.split(" ")[0].replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${rawPhone}`);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Header Title component with Lock Badge
  const renderHeaderTitle = () => (
    <View style={styles.headerTitleRow}>
      <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>Fly Away Kit</Text>
      <View style={[styles.headerLockBadge, { borderColor: theme.colors.cardBorder }]}>
        <Ionicons name="lock-closed" size={10} color={theme.colors.textSecondary} style={{ marginRight: 3 }} />
        <Text style={[styles.headerLockBadgeText, { color: theme.colors.textSecondary }]}>Locked</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record. These records are controlled copies.
        </Text>
      </View>

      <CustomHeader
        title={renderHeaderTitle()}
        onBack={() => router.back()}
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellButton}>
            <View style={styles.bellContainer}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
              <View style={[styles.dotIndicator, { backgroundColor: theme.colors.primary }]} />
            </View>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title block */}
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            OPERATOR · RECORDS · PR-M-059
          </Text>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Fly Away Kit</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Quick-reference emergency contacts and rehab status. Read-only — published template.
          </Text>
        </View>

        {/* Lock warning block */}
        <View style={[styles.lockWarningCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.lockWarningLabel, { color: theme.colors.textTertiary }]}>
            CONFIGURATION LOCKED
          </Text>
          <Text style={[styles.lockWarningBody, { color: theme.colors.text }]}>
            This template is versioned and effective-dated. Edits go through your SCS.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ margin: 24 }} color={theme.colors.primary} />
        ) : data ? (
          <>
            {/* Emergency Contacts Section */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Emergency contacts</Text>
            <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              {data.contacts.map((item, idx) => {
                const isLast = idx === data.contacts.length - 1;
                return (
                  <View
                    key={item.id || idx}
                    style={[
                      styles.listItemRow,
                      { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: theme.colors.cardBorder },
                    ]}
                  >
                    <View style={styles.listItemLeft}>
                      <View style={[styles.iconWrapper, { backgroundColor: "#1C1F26" }]}>
                        <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{item.role}</Text>
                        <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                          {item.phone_number} {item.notes ? `· ${item.notes}` : ""}
                        </Text>
                      </View>
                    </View>

                    {/* Right call action */}
                    <Pressable
                      onPress={() => handleCallPress(item.phone_number)}
                      style={[styles.callBadge, { backgroundColor: "#27272A" }]}
                    >
                      <Text style={[styles.callBadgeText, { color: theme.colors.text }]}>Tap to call</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* Rehab Status section */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Rehab status · {data.rehab_status_lines.length} lines</Text>
            <View style={styles.rehabTextContainer}>
              {data.rehab_status_lines.map((line, idx) => (
                <Text key={idx} style={[styles.rehabTextLine, { color: theme.colors.text }]}>{line}</Text>
              ))}
            </View>

            {/* Assigned Provider section */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Assigned provider</Text>
            <View style={styles.providerContainer}>
              <Text style={[styles.providerName, { color: theme.colors.text }]}>
                {data.assigned_provider.name} · {data.assigned_provider.role}
              </Text>
              <Text style={[styles.providerPhone, { color: theme.colors.textSecondary }]}>
                {data.assigned_provider.phone_number}
              </Text>
            </View>

            {/* Bottom published date */}
            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Effective template · locked-on-publish. Last published {formatDate(data.last_published_at)}.
              </Text>
            </View>
          </>
        ) : null}
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
    paddingHorizontal: 16,
  },
  opsecText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  bellButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bellContainer: {
    position: "relative",
  },
  dotIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  headerLockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1F26",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  headerLockBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  titleContainer: {
    marginBottom: 20,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  lockWarningCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  lockWarningLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  lockWarningBody: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 24,
  },
  listItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
  },
  callBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  callBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  rehabTextContainer: {
    paddingLeft: 4,
    marginBottom: 24,
  },
  rehabTextLine: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  providerContainer: {
    paddingLeft: 4,
    marginBottom: 32,
  },
  providerName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  providerPhone: {
    fontSize: 13,
  },
  footerContainer: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
    paddingTop: 16,
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
  },
});
