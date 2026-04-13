import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

export const CreateThoughtItemStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: {
      marginBottom: 0,
    },
  });

  return styles;
};
