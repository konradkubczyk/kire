import {
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Switch } from "@expo/ui/jetpack-compose";
import * as Haptics from "expo-haptics";

import { useState } from "react";

export const ReminderCard = () => {
  const [enabled, setEnabled] = useState(false);

  const onChangeEnabled = async (value: boolean) => {
    setEnabled(value);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Pressable
      android_ripple={{
        color: "rgba(0, 0, 0, .05)",
        foreground: true,
      }}
      style={styles.card}
    >
      <View style={styles.detailsContainer}>
        <Text style={styles.date}>Jan. 20 (Tue)</Text>
        <Text style={styles.time}>14:28</Text>
        <Text style={styles.message}>Get ready for the meeting</Text>
      </View>
      <View style={styles.controlsContainer}>
        <Text style={styles.pattern}>Default</Text>
        <TouchableWithoutFeedback>
          <Switch value={enabled} onValueChange={onChangeEnabled} />
        </TouchableWithoutFeedback>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  detailsContainer: {},
  controlsContainer: {
    justifyContent: "space-between",
  },
  date: {
    fontSize: 12,
  },
  time: {
    fontSize: 24,
  },
  pattern: {
    textAlign: "right",
    fontSize: 12,
  },
  message: {
    paddingTop: 8,
    fontWeight: "semibold",
  },
});
