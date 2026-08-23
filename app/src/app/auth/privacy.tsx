import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../../utils/useTheme";

export default function PrivacyScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>Privacy & Data Rights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>Data Collection</Text>
          <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
            Ascend respects your privacy. We collect data necessary for performance analytics and readiness tracking as requested by our services.
          </Text>

          <Text style={[styles.heading, { color: theme.colors.text, marginTop: 24 }]}>Your Rights</Text>
          <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
            You have the right to access, rectify, or erase any personal data we have collected. Please contact support for any requests.
          </Text>

          <Text style={[styles.heading, { color: theme.colors.text, marginTop: 24 }]}>OPSEC Notice</Text>
          <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
            This application is not a Government system of record. Every login is logged as an auth_event row.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
});
