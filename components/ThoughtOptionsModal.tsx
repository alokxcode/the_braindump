import { CreateHomeStyles } from "@/assets/styles/home.styles";
import { CreateThoughtOptionsModalStyles } from "@/assets/styles/thoughtOptionsModal.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ThoughtOptionsModalProps {
  visible: boolean;
  selectedThought: any;
  isEditMode: boolean;
  editText: string;
  isSaving: boolean;
  onClose: () => void;
  onChangeEditText: (text: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEnterEditMode: () => void;
  onDelete: () => void;
}

const ThoughtOptionsModal = ({
  visible,
  selectedThought,
  isEditMode,
  editText,
  isSaving,
  onClose,
  onChangeEditText,
  onSave,
  onCancelEdit,
  onEnterEditMode,
  onDelete,
}: ThoughtOptionsModalProps) => {
  const { colors } = useTheme();
  const homeStyles = CreateHomeStyles(colors);
  const modalStyles = CreateThoughtOptionsModalStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={modalStyles.overlay}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={modalStyles.modalCard}
        >
          <View style={modalStyles.handle} />

          <View style={modalStyles.headerRow}>
            <View style={modalStyles.headerIconWrap}>
              <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
            </View>
            <View style={modalStyles.headerTextWrap}>
              <Text style={modalStyles.title}>Thought options</Text>
              <Text style={modalStyles.subtitle} numberOfLines={1}>
                Choose what to do with this thought
              </Text>
            </View>
          </View>

          {isEditMode ? (
            <>
              <Text style={modalStyles.sectionLabel}>Edit thought</Text>
              <TextInput
                value={editText}
                onChangeText={onChangeEditText}
                editable={!isSaving}
                multiline
                autoFocus
                style={[homeStyles.editInput, modalStyles.editInput]}
                placeholder="Edit thought"
                placeholderTextColor={colors.textMuted}
              />

              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  disabled={isSaving || editText.trim().length === 0}
                  onPress={onSave}
                  style={[
                    modalStyles.actionButton,
                    modalStyles.primaryButton,
                    (isSaving || editText.trim().length === 0) &&
                      modalStyles.buttonDisabled,
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={modalStyles.buttonTextLight}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isSaving}
                  onPress={onCancelEdit}
                  style={[
                    modalStyles.actionButton,
                    modalStyles.secondaryButton,
                  ]}
                >
                  <Ionicons name="close-circle" size={18} color={colors.text} />
                  <Text style={modalStyles.buttonTextDark}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <LinearGradient
                colors={[colors.surface, colors.bg]}
                style={modalStyles.previewCard}
              >
                <Text style={modalStyles.sectionLabel}>Preview</Text>
                <Text style={modalStyles.previewText} numberOfLines={5}>
                  {selectedThought?.text}
                </Text>
              </LinearGradient>

              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  disabled={isSaving}
                  onPress={onEnterEditMode}
                  style={[modalStyles.actionButton, modalStyles.primaryButton]}
                >
                  <Ionicons name="pencil" size={18} color="#fff" />
                  <Text style={modalStyles.buttonTextLight}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isSaving}
                  onPress={onDelete}
                  style={[
                    modalStyles.actionButton,
                    modalStyles.dangerButton,
                    isSaving && modalStyles.dangerButtonDisabled,
                  ]}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={modalStyles.buttonTextLight}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ThoughtOptionsModal;
