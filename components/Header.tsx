import { CreateHeaderStyles } from "@/assets/styles/header.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

interface HeaderProps {
  totalThoughts: number;
}

const Header = ({ totalThoughts }: HeaderProps) => {
  const { colors } = useTheme();
  const styles = CreateHeaderStyles(colors);

  return (
    <View style={styles.outer}>
      <LinearGradient
        colors={colors.gradients.surface}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.glow} />
        <View style={styles.glowSecondary} />

        <View style={styles.topRow}>
          <View style={styles.brandMark}>
            <Ionicons name="sparkles" size={22} color="#ffffff" />
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.title}>BrainDump</Text>
            <Text style={styles.countText}>{totalThoughts} thoughts</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Header;
