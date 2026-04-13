import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { useThoughts } from "@/hooks/useThoughts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Setting = () => {
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { deleteAllThoughts, selectFolder, folderPath, currentDateFile } =
    useThoughts();

  const settingStyles = createSettingsStyles(colors);

  const handleResetApp = async () => {
    Alert.alert(
      "Reset App",
      "⚠️ This will delete ALL daily JSON files in your selected folder permanently. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteAllThoughts();
              Alert.alert(
                "App Reset",
                `Successfully deleted ${result.deletedFiles} JSON file${result.deletedFiles === 1 ? "" : "s"}.`,
              );
            } catch (error) {
              console.error("Error deleting all thoughts:", error);
              Alert.alert("Error", "Failed to reset app");
            }
          },
        },
      ],
    );
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await selectFolder();
      if (selected) {
        Alert.alert(
          "Folder Selected",
          `Your thoughts will now be saved to:\n\n${selected}`,
          [{ text: "OK", style: "default" }],
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select folder");
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={settingStyles.container}
    >
      <SafeAreaView style={settingStyles.safeArea}>
        <View style={settingStyles.header}>
          <View style={settingStyles.titleContainer}>
            <LinearGradient
              colors={colors.gradients.background}
              style={settingStyles.iconContainer}
            >
              <Ionicons name="settings" size={28} color={colors.primary} />
            </LinearGradient>
            <Text style={settingStyles.title}>Settings</Text>
          </View>
        </View>
        <ScrollView
          style={settingStyles.scrollView}
          contentContainerStyle={settingStyles.content}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            style={settingStyles.section}
            colors={colors.gradients.background}
          >
            <Text style={settingStyles.sectionTitle}>Preferences</Text>
            <View style={settingStyles.settingItem}>
              <View style={settingStyles.settingLeft}></View>
            </View>
            {/* DARK MODE */}
            <View style={settingStyles.settingItem}>
              <View style={settingStyles.settingLeft}>
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={settingStyles.settingIcon}
                >
                  <Ionicons name="moon" size={18} color="#fff" />
                </LinearGradient>
                <Text style={settingStyles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                thumbColor={"#fff"}
                trackColor={{ false: colors.border, true: colors.primary }}
                ios_backgroundColor={colors.border}
              />
            </View>
          </LinearGradient>
          <LinearGradient
            style={settingStyles.section}
            colors={colors.gradients.background}
          >
            <Text style={settingStyles.sectionTitle}>Storage</Text>
            <View style={settingStyles.storageContainer}>
              {/* LOCAL STORAGE FOLDER */}
              <View style={settingStyles.settingItem}>
                <View style={settingStyles.settingLeft}>
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={settingStyles.settingIcon}
                  >
                    <Ionicons name="folder" size={18} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={settingStyles.settingText}>
                      Storage Folder
                    </Text>
                    <Text
                      style={[
                        settingStyles.storageOptionDescription,
                        { marginTop: 4 },
                      ]}
                      numberOfLines={1}
                    >
                      {folderPath
                        ? folderPath.substring(folderPath.lastIndexOf("/") + 1)
                        : "Select a folder"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* SELECT FOLDER BUTTON */}
              <TouchableOpacity
                onPress={handleSelectFolder}
                style={settingStyles.folderSelector}
              >
                <Ionicons
                  name="cloud-download"
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    settingStyles.folderSelectorText,
                    { color: colors.primary, fontWeight: "600" },
                  ]}
                >
                  Change Folder
                </Text>
              </TouchableOpacity>

              {/* CURRENT DATE FILE INFO */}
              {currentDateFile && (
                <View
                  style={[
                    settingStyles.settingItem,
                    { borderBottomWidth: 0, marginTop: 12 },
                  ]}
                >
                  <View style={settingStyles.settingLeft}>
                    <LinearGradient
                      colors={colors.gradients.success}
                      style={settingStyles.settingIcon}
                    >
                      <Ionicons name="calendar" size={18} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={settingStyles.settingText}>
                        Today's File
                      </Text>
                      <Text
                        style={[
                          settingStyles.storageOptionDescription,
                          { marginTop: 4 },
                        ]}
                        numberOfLines={1}
                      >
                        {currentDateFile.substring(
                          currentDateFile.lastIndexOf("/") + 1,
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
          <LinearGradient
            colors={colors.gradients.surface}
            style={settingStyles.section}
          >
            <Text style={settingStyles.sectionTitleDanger}>Danger Zone</Text>

            <TouchableOpacity
              style={[settingStyles.actionButton, { borderBottomWidth: 0 }]}
              onPress={handleResetApp}
              activeOpacity={0.7}
            >
              <View style={settingStyles.actionLeft}>
                <LinearGradient
                  colors={colors.gradients.danger}
                  style={settingStyles.actionIcon}
                >
                  <Ionicons name="trash" size={18} color="#ffffff" />
                </LinearGradient>
                <Text style={settingStyles.actionTextDanger}>Reset App</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Setting;
