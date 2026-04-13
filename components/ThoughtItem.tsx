import { CreateHomeStyles } from "@/assets/styles/home.styles";
import { CreateThoughtItemStyles } from "@/assets/styles/thoughtItem.styles";
import useTheme from "@/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

interface ThoughtItemProps {
  item: any;
  onPress: (thought: any) => void;
}

const formatCreationTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const ThoughtItem = ({ item, onPress }: ThoughtItemProps) => {
  const { colors } = useTheme();
  const homeStyles = CreateHomeStyles(colors);
  const thoughtItemStyles = CreateThoughtItemStyles(colors);

  return (
    <View style={homeStyles.todoItemWrapper}>
      <TouchableOpacity
        activeOpacity={0.92}
        onLongPress={() => onPress(item)}
        delayLongPress={250}
      >
        <LinearGradient
          colors={colors.gradients.surface}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[homeStyles.todoItem, thoughtItemStyles.card]}
        >
          <View>
            <Text style={[homeStyles.todoText, thoughtItemStyles.text]}>
              {item.text}
            </Text>
            <View style={homeStyles.thoughtMetaRow}>
              <Text style={homeStyles.thoughtTime}>
                {formatCreationTime(item._creationTime)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default ThoughtItem;
