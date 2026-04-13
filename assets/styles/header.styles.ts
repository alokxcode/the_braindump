import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

const withAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = parseInt(fullHex.slice(0, 2), 16);
  const green = parseInt(fullHex.slice(2, 4), 16);
  const blue = parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const CreateHeaderStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    outer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    card: {
      borderRadius: 28,
      padding: 22,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 10,
    },
    glow: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      top: -90,
      right: -70,
      backgroundColor: withAlpha(colors.primary, 0.12),
    },
    glowSecondary: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      bottom: -55,
      left: -35,
      backgroundColor: withAlpha(colors.success, 0.08),
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    brandMark: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 8,
    },
    copyBlock: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 30,
      lineHeight: 34,
      fontWeight: "800",
      letterSpacing: -0.8,
      color: colors.text,
    },
    countText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textMuted,
    },
  });
  return styles;
};
