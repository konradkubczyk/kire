import {
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Switch } from "@expo/ui/jetpack-compose";
import * as Haptics from "expo-haptics";

import { useMemo } from "react";
import { Reminder } from "@/lib/reminders";
import { getVibrationPatternById } from "@/lib/vibration-patterns";
import { formatWeekdays } from "@/lib/weekdays";

type ReminderCardProps = {
  reminder: Reminder;
  onEdit: (id: string) => void;
  onToggleEnabled: (id: string, value: boolean) => void;
};

export const ReminderCard = ({
  reminder,
  onEdit,
  onToggleEnabled,
}: ReminderCardProps) => {
  const timeLabel = useMemo(() => {
    const date = new Date();

    date.setHours(reminder.hour);
    date.setMinutes(reminder.minute);

    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [reminder.hour, reminder.minute]);

  const patternLabel = useMemo(
    () => getVibrationPatternById(reminder.patternId).name,
    [reminder.patternId],
  );

  const cadenceLabel = useMemo(() => {
    if (!reminder.recurrenceEnabled) {
      return "One-off";
    }

    const weekdays =
      reminder.weekdays.length > 0 ? reminder.weekdays : [0, 1, 2, 3, 4, 5, 6];

    if (weekdays.length >= 7) {
      return "Recurring · Daily";
    }

    const label = formatWeekdays(weekdays);

    return label.length > 0 ? `Recurring · ${label}` : "Recurring";
  }, [reminder.recurrenceEnabled, reminder.weekdays]);

  const handleEdit = () => {
    onEdit(reminder.id);
  };

  const handleToggleEnabled = async (value: boolean) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggleEnabled(reminder.id, value);
  };

  return (
    <Pressable
      android_ripple={{
        color: "rgba(0, 0, 0, .05)",
        foreground: true,
      }}
      style={[styles.card, !reminder.enabled && styles.cardDisabled]}
      onPress={handleEdit}
    >
      <View style={styles.detailsContainer}>
        <Text style={styles.cadence}>{cadenceLabel}</Text>
        <Text style={styles.time}>{timeLabel}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {reminder.description}
        </Text>
      </View>
      <View style={styles.controlsContainer}>
        <Text style={styles.pattern}>{patternLabel}</Text>
        <TouchableWithoutFeedback>
          <Switch
            value={reminder.enabled}
            onValueChange={handleToggleEnabled}
          />
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
    minHeight: 96,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  detailsContainer: {},
  controlsContainer: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cadence: {
    fontSize: 12,
    color: "#4a4a4a",
  },
  time: {
    fontSize: 24,
  },
  pattern: {
    textAlign: "right",
    fontSize: 12,
    color: "#4a4a4a",
  },
  message: {
    paddingTop: 8,
    fontWeight: "600",
  },
});
