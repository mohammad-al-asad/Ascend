import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetUploadsQuery } from "../../../redux/api/recordsApi";

export default function MyUploadsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filterTabs = ["All", "Labs", "Imaging", "Specialist", "DME", "Others"];

  const mapDocTypeToQuery = (dt: string) => {
    const map: Record<string, string> = {
      "Labs": "labs",
      "Imaging": "imaging",
      "Specialist": "specialist",
      "DME": "dme",
      "Others": "other"
    };
    return map[dt] || "";
  };

  const { data, isLoading } = useGetUploadsQuery({
    document_type: activeTab === "All" ? undefined : mapDocTypeToQuery(activeTab),
    search: searchQuery || undefined
  });

  const getIcon = (docType: string): keyof typeof Ionicons.glyphMap => {
    switch (docType) {
      case "labs": return "flask-outline";
      case "imaging": return "image-outline";
      case "specialist": return "document-text-outline";
      case "dme": return "medical-outline";
      default: return "folder-outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "reviewed_approved": return theme.colors.success;
      case "reviewed_denied": return theme.colors.dangerText;
      case "quarantined": return theme.colors.warningText;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case "reviewed_approved": return "rgba(16, 185, 129, 0.12)";
      case "reviewed_denied": return "rgba(239, 68, 68, 0.12)";
      case "quarantined": return "rgba(245, 158, 11, 0.12)";
      default: return "rgba(161, 161, 170, 0.12)";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAddPress = () => {
    router.push("/profile/add-record" as any);
  };

  const handleViewItem = (id: string) => {
    router.push({ pathname: "/profile/record-detail", params: { id } } as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record. These records are controlled copies.
        </Text>
      </View>

      <CustomHeader
        title="Records · Uploads"
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
            PR-M-051 · RECORDS - UPLOADS
          </Text>
          <View style={styles.titleRow}>
            <Text style={[styles.mainTitle, { color: theme.colors.text }]}>My uploads</Text>
            <Pressable
              onPress={handleAddPress}
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Medical records you have shared with your support team. Uploads are scanned, then reviewed.
          </Text>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search uploads"
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.colors.text }]}
            autoCapitalize="none"
          />
        </View>

        {/* Tabs filters */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabButton,
                    isActive
                      ? { backgroundColor: theme.colors.primary }
                      : { backgroundColor: "#1C1F26", borderWidth: 1, borderColor: theme.colors.cardBorder },
                  ]}
                >
                  <Text style={[styles.tabButtonText, { color: isActive ? "#FFFFFF" : theme.colors.textSecondary }]}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* List of Uploads */}
        <View style={[styles.listContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {isLoading ? (
            <ActivityIndicator style={{ margin: 24 }} color={theme.colors.primary} />
          ) : data && data.length > 0 ? (
            data.map((item, idx) => {
              const isLast = idx === data.length - 1;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.listItemRow,
                    { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: theme.colors.cardBorder },
                  ]}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.iconWrapper, { backgroundColor: "#141F21" }]}>
                      <Ionicons name={getIcon(item.document_type)} size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.itemTextContent}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {item.file_name} · {formatDate(item.uploaded_at)}
                      </Text>
                      <View style={styles.itemBadgeRow}>
                        <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {item.file_type} · {formatSize(item.file_size_bytes)} · {item.access_reason}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusBg(item.status) },
                          ]}
                        >
                          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                            {item.status.replace("_", " ")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Pressable onPress={() => handleViewItem(item.id)} style={styles.viewLink}>
                    <Text style={[styles.viewLinkText, { color: theme.colors.primary }]}>View</Text>
                  </Pressable>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>No matching uploads found</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerCode, { color: theme.colors.textTertiary }]}>
            Trace id M-051 · v1 prototype
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  addButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  tabsWrapper: {
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 32,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTextContent: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  itemBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemSubtitle: {
    fontSize: 12,
    maxWidth: "70%",
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  viewLink: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  viewLinkText: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  footerContainer: {
    alignItems: "center",
  },
  footerCode: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    textAlign: "center",
  },
});
