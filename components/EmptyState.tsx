import useTheme from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

const EmptyState = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={colors.gradients.empty}
        style={styles.emptyIconContainer}
      >
        <MaterialCommunityIcons
          name="thought-bubble"
          size={60}
          color={colors.textMuted}
        />
      </LinearGradient>
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No thoughts yet!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 190,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default EmptyState;
