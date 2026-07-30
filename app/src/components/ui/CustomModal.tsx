import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "../../utils/useTheme";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const theme = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: "#1C1C1E", // Dark slate modal bg
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
