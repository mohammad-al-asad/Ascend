import { useMemo } from "react";

export const useTheme = () => {
  return useMemo(() => {
    return {
      colors: {
        background: "#121214",      // Deep near-black
        card: "#18181B",            // Zinc 900 card background
        cardBorder: "#27272A",      // Zinc 800 border
        text: "#FFFFFF",            // Pure white text
        textSecondary: "#A1A1AA",   // Zinc 400 secondary text
        textTertiary: "#71717A",    // Zinc 500 tertiary/placeholder text
        primary: "#00A3C4",         // Cyan accent color
        primaryHover: "#00B4D8",    // Lighter cyan for hover/active
        primaryDisabled: "#003A45", // Dark cyan for disabled state
        warningBg: "#2C2213",       // OPSEC banner / warning bg (brownish-yellow)
        warningBorder: "#B45309",   // Amber 700 border
        warningText: "#F59E0B",     // Amber 500 text
        dangerBg: "#2D1515",        // Red bg
        dangerText: "#EF4444",      // Red text
        success: "#10B981",         // Emerald green
        overlay: "rgba(0, 0, 0, 0.75)"
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
      }
    };
  }, []);
};
