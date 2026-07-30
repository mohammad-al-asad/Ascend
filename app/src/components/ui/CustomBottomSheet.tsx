import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import ExpoBottomSheet, { BottomSheetView, BottomSheetScrollView } from "@expo/ui/community/bottom-sheet";
import { useTheme } from "../../utils/useTheme";

interface CustomBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  snapPoints?: any[];
  children?: React.ReactNode;
  scrollable?: boolean;
}

export const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  snapPoints,
  children,
  scrollable = false,
}) => {
  const theme = useTheme();
  const sheetRef = React.useRef<ExpoBottomSheet>(null);

  const mappedSnapPoints = React.useMemo(() => {
    if (!snapPoints) return ["50%", "90%"];
    return snapPoints.map((p) => {
      if (p === "half") return "50%";
      if (p === "full") return "90%";
      if (p === "fit") return "50%";
      return p;
    });
  }, [snapPoints]);

  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!visible) return;
    }

    const timer = setTimeout(() => {
      if (visible) {
        sheetRef.current?.present();
      } else {
        sheetRef.current?.dismiss();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <ExpoBottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      snapPoints={mappedSnapPoints}
      enablePanDownToClose
      onChange={(index) => {
        if (index === -1) {
          onClose();
        }
      }}
      backgroundStyle={{ backgroundColor: "#1C1C1E" }}
      handleIndicatorStyle={{ backgroundColor: "#8E8E93" }}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header Section inside sheet */}
        <View style={styles.header}>
          <View style={styles.titleWrapper}>
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
                {subtitle}
              </Text>
            )}
            {title && (
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
            )}
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>✕</Text>
          </Pressable>
        </View>

        {/* Scrollable/View Body */}
        {scrollable ? (
          <BottomSheetScrollView style={styles.scrollView} contentContainerStyle={styles.scrollBody}>
            {children}
          </BottomSheetScrollView>
        ) : (
          <View style={styles.body}>{children}</View>
        )}
      </BottomSheetView>
    </ExpoBottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  titleWrapper: {
    flex: 1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
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
  body: {
    padding: 20,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
});
