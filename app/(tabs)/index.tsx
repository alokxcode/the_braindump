import { CreateHomeStyles } from "@/assets/styles/home.styles";
import Header from "@/components/Header";
import useTheme from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { toggleDarkMode, colors } = useTheme();

  const homeStyles = CreateHomeStyles(colors);
  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      {/* <StatusBar barStyle={colors.statusBarStyle} /> */}
      <SafeAreaView style={homeStyles.safeArea}>
        <Header />
        <Text>Edit app/index.tsx to edit this screen.</Text>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Text>Togle Dark Mode</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}
