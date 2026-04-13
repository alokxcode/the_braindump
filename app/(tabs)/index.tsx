import { CreateHomeStyles } from "@/assets/styles/home.styles";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import ThoughtInput from "@/components/ThoughtInput";
import ThoughtRoadTimeline from "@/components/ThoughtRoadTimeline";
import useTheme from "@/hooks/useTheme";
import { useThoughts } from "@/hooks/useThoughts";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThoughtOptionsModal from "../../components/ThoughtOptionsModal";

export default function Index() {
  const { colors } = useTheme();

  const homeStyles = CreateHomeStyles(colors);

  const {
    thoughts,
    isLoading,
    addThought,
    updateThought,
    deleteThought,
    folderPath,
    selectFolder,
  } = useThoughts();

  const [selectedThought, setSelectedThought] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [folderPromptShown, setFolderPromptShown] = useState(false);

  // Prompt user to select folder if not set
  useEffect(() => {
    if (!isLoading && !folderPath && !folderPromptShown) {
      setFolderPromptShown(true);
      Alert.alert(
        "Select Storage Folder",
        "Please select a folder where your thoughts will be stored as daily JSON files.",
        [
          {
            text: "Select Folder",
            onPress: selectFolder,
            style: "default",
          },
          {
            text: "Later",
            onPress: () => {},
            style: "cancel",
          },
        ],
      );
    }
  }, [isLoading, folderPath, folderPromptShown, selectFolder]);

  if (isLoading) return <LoadingSpinner />;

  const openThoughtModal = (thought: any) => {
    setSelectedThought(thought);
    setEditText(thought.text);
    setIsEditMode(false);
  };

  const closeThoughtModal = () => {
    if (isSaving) return;
    setSelectedThought(null);
    setIsEditMode(false);
    setEditText("");
  };

  const handleDeleteThought = async () => {
    if (!selectedThought || isSaving) return;
    setIsSaving(true);
    try {
      await deleteThought(selectedThought._id);
      closeThoughtModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateThought = async () => {
    if (!selectedThought || isSaving) return;
    const trimmedText = editText.trim();
    if (!trimmedText) return;

    setIsSaving(true);
    try {
      await updateThought(selectedThought._id, trimmedText);
      closeThoughtModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditText(selectedThought?.text ?? "");
  };

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      {/* <StatusBar barStyle={colors.statusBarStyle} /> */}
      <KeyboardAvoidingView
        style={homeStyles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 8}
      >
        <SafeAreaView style={homeStyles.safeArea}>
          {/* <Header totalThoughts={thoughts?.length ?? 0} /> */}
          {thoughts.length === 0 ? (
            <EmptyState />
          ) : (
            <ThoughtRoadTimeline
              thoughts={thoughts}
              onPressThought={openThoughtModal}
            />
          )}
          <ThoughtInput onAddThought={addThought} />

          <ThoughtOptionsModal
            visible={selectedThought !== null}
            selectedThought={selectedThought}
            isEditMode={isEditMode}
            editText={editText}
            isSaving={isSaving}
            onClose={closeThoughtModal}
            onChangeEditText={setEditText}
            onSave={handleUpdateThought}
            onCancelEdit={handleCancelEdit}
            onEnterEditMode={() => setIsEditMode(true)}
            onDelete={handleDeleteThought}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
