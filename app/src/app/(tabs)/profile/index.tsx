import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppDispatch } from "../../../redux/store";
import { logout } from "../../../redux/slices/authSlice";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomSwitch } from "../../../components/ui/CustomSwitch";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Local preferences states
  const [darkTheme, setDarkTheme] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = () => {
    dispatch(logout());
    router.replace("/auth/signin" as any);
  };

  const renderIdentityRow = (label: string, value: string, isCac = false) => {
    return (
      <View style={[styles.itemRow, { borderBottomColor: theme.colors.cardBorder }]}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        <View style={styles.rowRight}>
          <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>{value}</Text>
          {isCac && (
            <View style={styles.cacBadge}>
              <Text style={styles.cacBadgeText}>CAC</Text>
            </View>
          )}
        </View>
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
        title="Profile"
        rightElement={
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header tag and title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            RECORDS · PR-M-061
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>Profile & settings</Text>
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            Identity is read from your CAC. Theme and notifications are the only locally controllable settings on this surface.
          </Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>MR</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userNameText, { color: theme.colors.text }]}>Sgt Marcus R. Hayes</Text>
            <Text style={[styles.userRankText, { color: theme.colors.textSecondary }]}>
              E-5 · Sgt · 21 MDS · Bravo Flight
            </Text>
            <Text style={[styles.userIdText, { color: theme.colors.textTertiary }]}>
              marcus.hayes@dws.af.mil · EDIPI 1234567890
            </Text>
          </View>
        </View>

        {/* Identity Category section */}
        <Text style={[styles.categoryHeader, { color: theme.colors.textSecondary }]}>IDENTITY</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {renderIdentityRow("Name", "Sgt Marcus R. Hayes", true)}
          {renderIdentityRow("Rank & grade", "E-5 · Sgt", true)}
          {renderIdentityRow("Unit", "21 MDS · Bravo Flight", true)}
          {renderIdentityRow("Assigned SCS", "TSgt R. Becker")}
          {renderIdentityRow("Assigned PT/IM", "Capt J. Lin")}
          <View style={styles.itemRowNoBorder}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Communications preference</Text>
            <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>Regular</Text>
          </View>
        </View>

        {/* Preferences section */}
        <Text style={[styles.categoryHeader, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {/* Dark Theme toggle */}
          <CustomSwitch
            label="Dark theme"
            value={darkTheme}
            onValueChange={setDarkTheme}
          />

          {/* Notifications toggle */}
          <CustomSwitch
            label="Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />

          {/* Sign-in & activation link */}
          <Pressable
            onPress={() => router.push("/profile/activation" as any)}
            style={styles.itemRowNoBorder}
          >
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Sign-in & activation</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.linkValue, { color: theme.colors.textSecondary, marginRight: 4 }]}>View</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Records section */}
        <Text style={[styles.categoryHeader, { color: theme.colors.textSecondary }]}>RECORDS</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Pressable
            onPress={() => alert("Opening records home...")}
            style={[styles.itemRowNoBorder, { flexDirection: "row", alignItems: "center" }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Ionicons name="folder-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Records home</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.linkValue, { color: theme.colors.textSecondary, marginRight: 4 }]}>6 categories</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Data & Privacy section */}
        <Text style={[styles.categoryHeader, { color: theme.colors.textSecondary }]}>DATA & PRIVACY</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {/* Data use summary */}
          <Pressable
            onPress={() => router.push("/profile/data-use" as any)}
            style={[styles.itemRow, { borderBottomColor: theme.colors.cardBorder }]}
          >
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Data-use summary</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.linkValue, { color: theme.colors.textSecondary, marginRight: 4 }]}>Read</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
            </View>
          </Pressable>

          {/* Privacy notice */}
          <Pressable
            onPress={() => alert("Opening privacy notice...")}
            style={[styles.itemRow, { borderBottomColor: theme.colors.cardBorder }]}
          >
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Privacy notice</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.linkValue, { color: theme.colors.textSecondary, marginRight: 4 }]}>Read</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
            </View>
          </Pressable>

          {/* App version */}
          <View style={styles.itemRowNoBorder}>
            <Text style={[styles.rowLabel, { color: theme.colors.text }]}>App version</Text>
            <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>v1.0.0 · build 2026.07.18</Text>
          </View>
        </View>

        {/* Session log out section */}
        <Text style={[styles.categoryHeader, { color: theme.colors.textSecondary }]}>SESSION</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Pressable onPress={handleSignOut} style={styles.itemRowNoBorder}>
            <Text style={[styles.rowLabel, { color: "#EF4444", fontWeight: "700" }]}>Sign out</Text>
            <Ionicons name="log-out-outline" size={18} color="#D97706" />
          </Pressable>
        </View>
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
  bellButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  userRankText: {
    fontSize: 13,
    marginBottom: 2,
  },
  userIdText: {
    fontSize: 11,
  },
  categoryHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 16,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  itemRowNoBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  linkValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  cacBadge: {
    backgroundColor: "#27272A",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 8,
  },
  cacBadgeText: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "700",
  },
});
