import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../utils/useTheme";
import { CustomHeader } from "../../../components/ui/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useUploadRecordMutation } from "../../../redux/api/recordsApi";

export default function AddRecordScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Form states
  const [docType, setDocType] = useState("");
  const [accessReason, setAccessReason] = useState("");
  const [attachedFile, setAttachedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  const [uploadRecord, { isLoading }] = useUploadRecordMutation();
  
  // UI states
  const [isReasonFocused, setIsReasonFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const documentTypes = ["Labs", "Imaging", "Specialist", "DME", "Others"];

  const handleSelectType = (type: string) => {
    setDocType(type);
    setShowDropdown(false);
  };

  const handleAttachFile = async () => {
    if (attachedFile) {
      // Toggle off / detach
      setAttachedFile(null);
    } else {
      try {
        const result = await DocumentPicker.getDocumentAsync({});
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          if (file.size && file.size > 50 * 1024 * 1024) {
            Alert.alert("File Too Large", "Please select a file smaller than 50MB.");
            return;
          }
          setAttachedFile(file);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not pick document.");
      }
    }
  };

  const mapDocType = (dt: string) => {
    const map: Record<string, string> = {
      "Labs": "labs",
      "Imaging": "imaging",
      "Specialist": "specialist",
      "DME": "dme",
      "Others": "other"
    };
    return map[dt] || "other";
  };

  const handleSubmit = async () => {
    if (!attachedFile || !docType || !isReasonValid) return;
    
    const formData = new FormData();
    formData.append("document_type", mapDocType(docType));
    formData.append("access_reason", accessReason);

    // Expo's fetch polyfill only accepts real Blob/File parts, not RN's
    // classic {uri, name, type} shorthand - read the picked file into a
    // Blob before attaching it. RN's Blob polyfill can't construct from a
    // raw ArrayBuffer, so get the Blob straight from fetch() instead.
    const fileBlob = await (await fetch(attachedFile.uri)).blob();
    formData.append("file", fileBlob, attachedFile.name);

    try {
      const res = await uploadRecord(formData).unwrap();
      if (res.status === "quarantined") {
        Alert.alert(
          "Record Uploaded",
          `Your record has been uploaded but was flagged for quarantine. Awaiting review.`,
          [
            {
              text: "OK",
              onPress: () => router.replace({ pathname: "/profile/record-detail", params: { id: res.id } } as any),
            },
          ]
        );
      } else {
        Alert.alert(
          "Record Added",
          `Successfully queued "${attachedFile.name}" under category "${docType}" for PT/IM review.`,
          [
            {
              text: "OK",
              onPress: () => router.replace({ pathname: "/profile/record-detail", params: { id: res.id } } as any),
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert("Upload Failed", err?.data?.detail || "An error occurred during upload.");
    }
  };

  // Validation
  const isReasonValid = accessReason.trim().length >= 12;
  const isFormValid = docType !== "" && isReasonValid && attachedFile !== null && !isLoading;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* OPSEC banner */}
      <View style={[styles.opsecBanner, { backgroundColor: "#000000" }]}>
        <Text style={[styles.opsecText, { color: "#8E8E93" }]}>
          🔒 CUI // OPSEC — Ascend is not a Government system of record. These records are controlled copies.
        </Text>
      </View>

      <CustomHeader
        title="Add a record"
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
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={[styles.sectionTag, { color: theme.colors.textSecondary }]}>
            PR-M-052 · RECORDS — UPLOAD FORM
          </Text>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Add record</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Choose the document type, write the access-reason, and attach the file.
          </Text>
        </View>

        {/* 1. Document Type Dropdown */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Document type</Text>
          
          <Pressable
            onPress={() => setShowDropdown(!showDropdown)}
            style={[
              styles.dropdownSelector,
              {
                backgroundColor: theme.colors.card,
                borderColor: showDropdown ? theme.colors.primary : theme.colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.dropdownValueText, { color: docType ? theme.colors.text : theme.colors.textTertiary }]}>
              {docType || "Select a type..."}
            </Text>
            <Ionicons
              name={showDropdown ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {/* Dropdown Options List */}
          {showDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              {documentTypes.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => handleSelectType(type)}
                  style={[styles.dropdownOption, { borderBottomColor: theme.colors.cardBorder }]}
                >
                  <Text style={[styles.dropdownOptionText, { color: theme.colors.text }]}>{type}</Text>
                  {docType === type && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            Pick the category that best describes the record.
          </Text>
        </View>

        {/* 2. Access Reason TextArea */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Access-reason *</Text>
          
          <View
            style={[
              styles.textAreaContainer,
              {
                backgroundColor: theme.colors.card,
                borderColor: isReasonFocused
                  ? theme.colors.primary
                  : accessReason.trim().length > 0 && !isReasonValid
                  ? theme.colors.dangerText
                  : theme.colors.cardBorder,
              },
            ]}
          >
            <TextInput
              multiline={true}
              numberOfLines={4}
              placeholder="Why are you sharing this record with your support team?"
              placeholderTextColor={theme.colors.textTertiary}
              value={accessReason}
              onChangeText={setAccessReason}
              onFocus={() => setIsReasonFocused(true)}
              onBlur={() => setIsReasonFocused(false)}
              style={[styles.textAreaInput, { color: theme.colors.text }]}
              textAlignVertical="top"
            />
          </View>
          
          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            <Text style={{ color: isReasonValid ? theme.colors.success : theme.colors.textSecondary }}>
              {accessReason.trim().length} / 12 min
            </Text>{" "}
            · access-reason is logged in your audit trail.
          </Text>
        </View>

        {/* 3. File Selector Dropzone */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>File</Text>
          
          <Pressable
            onPress={handleAttachFile}
            style={[
              styles.dropzoneCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: attachedFile ? theme.colors.primary : theme.colors.cardBorder,
              },
            ]}
          >
            <View style={styles.dropzoneContent}>
              <View style={styles.uploadIconWrapper}>
                <Ionicons
                  name={attachedFile ? "document-attach-outline" : "cloud-upload-outline"}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.dropzoneTextWrapper}>
                <Text style={[styles.dropzoneTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {attachedFile ? attachedFile.name : "Drop file or tap to browse"}
                </Text>
                <Text style={[styles.dropzoneSubtitle, { color: theme.colors.textSecondary }]}>
                  {attachedFile ? `${(attachedFile.size || 0) / 1024 / 1024 > 1 ? ((attachedFile.size || 0) / 1024 / 1024).toFixed(1) + ' MB' : ((attachedFile.size || 0) / 1024).toFixed(1) + ' KB'} · Tap again to remove` : "PDF, image, or DICOM · up to 50 MB"}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* 4. Submit Button */}
        <View style={styles.submitContainer}>
          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid}
            style={[
              styles.submitButton,
              {
                backgroundColor: isFormValid ? theme.colors.primary : "#27272A",
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={[styles.submitButtonText, { color: isFormValid ? "#FFFFFF" : theme.colors.textSecondary }]}>
                  {isFormValid ? "Submit record " : "Complete all fields "}
                </Text>
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={isFormValid ? "#FFFFFF" : theme.colors.textSecondary}
                />
              </>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerCode, { color: theme.colors.textTertiary }]}>
            Trace id M-052 · v1 prototype
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
  titleBlock: {
    marginBottom: 24,
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
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  dropdownValueText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  helpText: {
    fontSize: 11,
    marginTop: 6,
    paddingLeft: 2,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 10,
    height: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textAreaInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    padding: 0,
  },
  dropzoneCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    height: 72,
    justifyContent: "center",
  },
  dropzoneContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#141F21",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dropzoneTextWrapper: {
    flex: 1,
  },
  dropzoneTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  dropzoneSubtitle: {
    fontSize: 11,
  },
  submitContainer: {
    marginTop: 12,
    marginBottom: 32,
  },
  submitButton: {
    flexDirection: "row",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
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
