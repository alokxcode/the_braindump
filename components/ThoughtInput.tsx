import { CreateThoughtInputStyles } from "@/assets/styles/thoughtInput.styles";
import { playThoughtSound } from "@/utils/playThoughtSound";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ThoughtInputProps {
  onAddThought: (text: string) => Promise<unknown>;
}

const ThoughtInput = ({ onAddThought }: ThoughtInputProps) => {
  const { colors } = useTheme();
  const thoughtInputStyles = CreateThoughtInputStyles(colors);

  const [thought, setThought] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    const trimmedThought = thought.trim();
    if (!trimmedThought || isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onAddThought(trimmedThought);
      playThoughtSound();
      setThought("");
    } catch {
      setErrorMessage("Could not save thought. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || thought.trim().length === 0;

  return (
    <View style={thoughtInputStyles.container}>
      <View style={thoughtInputStyles.inputRow}>
        <TextInput
          value={thought}
          onChangeText={setThought}
          placeholder="Write a thought..."
          placeholderTextColor={colors.textMuted}
          style={thoughtInputStyles.input}
          multiline
          returnKeyType="done"
          blurOnSubmit
          editable={!isSubmitting}
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          style={[
            thoughtInputStyles.sendButton,
            isDisabled && thoughtInputStyles.sendButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isDisabled}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="arrow-up" size={22} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* {errorMessage ? (
        <Text style={thoughtInputStyles.errorText}>{errorMessage}</Text>
      ) : (
        <Text>
          Error sdlfkjas;ldfja;lksdjf aksdjfa;ldkfja;k
          jl;jadskflajskdfjal;sdjf;alskdjfa
        </Text>
      )} */}
    </View>
  );
};

export default ThoughtInput;
