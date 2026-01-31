import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  DateTimePicker,
  Picker,
  Switch,
  TextInput,
} from "@expo/ui/jetpack-compose";
import { MaterialIcons } from "@expo/vector-icons";
import { VIBRATION_PATTERNS } from "@/constants/vibration-patterns";
import { Reminder, ReminderDraft } from "@/lib/reminders";
import { DEFAULT_WEEKDAYS, WEEKDAYS } from "@/constants/weekdays";

type EditReminderModalProps = {
  isOpen: boolean;
  reminder?: Reminder | null;
  onClose: () => void;
  onSave: (draft: ReminderDraft) => void;
  onDelete?: (id: string) => void;
};

export const EditReminderModal = ({
  isOpen,
  reminder,
  onClose,
  onSave,
  onDelete,
}: EditReminderModalProps) => {
  const vibrationPatternOptions = useMemo(
    () => VIBRATION_PATTERNS.map(({ name }) => name),
    [],
  );

  const initialDate = reminder
    ? (() => {
        const currentDate = new Date();

        currentDate.setHours(reminder.hour);
        currentDate.setMinutes(reminder.minute);

        return currentDate;
      })()
    : new Date();

  const [time, setTime] = useState(initialDate);

  const [patternId, setPatternId] = useState(
    reminder?.patternId ?? VIBRATION_PATTERNS[0].id,
  );

  const [message, setMessage] = useState(reminder?.description ?? "");

  const [recurrenceEnabled, setRecurrenceEnabled] = useState(
    reminder?.recurrenceEnabled ?? true,
  );

  const [weekdays, setWeekdays] = useState<number[]>(
    reminder?.weekdays ?? DEFAULT_WEEKDAYS,
  );

  const selectedPatternIndex = useMemo(
    () =>
      Math.max(
        0,
        VIBRATION_PATTERNS.findIndex((p) => p.id === patternId),
      ),
    [patternId],
  );

  const canSave =
    message.trim().length > 0 && (!recurrenceEnabled || weekdays.length > 0);

  const selectPattern = ({
    nativeEvent: { index },
  }: {
    nativeEvent: { index: number };
  }) => {
    const nextPattern = VIBRATION_PATTERNS[index];

    setPatternId(nextPattern.id);
    Vibration.vibrate(nextPattern.pattern);
  };

  const handleSave = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    onSave({
      hour: time.getHours(),
      minute: time.getMinutes(),
      patternId,
      description: trimmedMessage,
      recurrenceEnabled,
      weekdays,
    });
  };

  const toggleWeekday = (weekday: number) => {
    setWeekdays((prev) => {
      if (prev.includes(weekday)) {
        return prev.filter((day) => day !== weekday);
      }

      return [...prev, weekday];
    });
  };

  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      animationType="fade"
      transparent
    >
      <KeyboardAvoidingView style={styles.backdrop} behavior="height">
        <SafeAreaView style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <DateTimePicker
              displayedComponents="hourAndMinute"
              initialDate={initialDate.toISOString()}
              onDateSelected={setTime}
              style={styles.timePicker}
            />

            <View style={styles.section}>
              <Text style={styles.label}>Vibration pattern</Text>
              <Picker
                options={vibrationPatternOptions}
                selectedIndex={selectedPatternIndex}
                onOptionSelected={selectPattern}
                variant="radio"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput defaultValue={message} onChangeText={setMessage} />
            </View>

            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <Text style={styles.label}>Recurring</Text>
                <Switch
                  value={recurrenceEnabled}
                  onValueChange={setRecurrenceEnabled}
                />
              </View>
              {recurrenceEnabled ? (
                <View style={styles.weekdayRow}>
                  {WEEKDAYS.map((weekday) => {
                    const selected = weekdays.includes(weekday.value);
                    return (
                      <Pressable
                        key={weekday.value}
                        onPress={() => toggleWeekday(weekday.value)}
                        style={[
                          styles.weekdayPill,
                          selected && styles.weekdayPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.weekdayText,
                            selected && styles.weekdayTextSelected,
                          ]}
                        >
                          {weekday.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View style={styles.actions}>
              <View style={styles.leftActions}>
                {reminder ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete reminder"
                    onPress={() => onDelete?.(reminder.id)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.deleteButtonPressed,
                    ]}
                  >
                    <MaterialIcons
                      name="delete"
                      size={22}
                      color={styles.deleteIcon.color}
                    />
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.rightActions}>
                <Button
                  variant="outlined"
                  onPress={onClose}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  style={styles.actionButton}
                  disabled={!canSave}
                  onPress={handleSave}
                >
                  {reminder ? "Save" : "Add"}
                </Button>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, .4)",
    justifyContent: "center",
  },
  content: {
    maxHeight: "90%",
    borderRadius: 28,
    marginHorizontal: 16,
    backgroundColor: "#FFFBFE",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6750A4",
  },
  timePicker: {
    marginTop: 20,
    height: 380,
    width: "100%",
  },
  patternPicker: {
    gap: 8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekdayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  weekdayPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#EEE7F6",
  },
  weekdayPillSelected: {
    backgroundColor: "#6750A4",
  },
  weekdayText: {
    fontSize: 12,
    color: "#3b2d56",
  },
  weekdayTextSelected: {
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftActions: {
    flex: 1,
    justifyContent: "flex-start",
  },
  rightActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  actionButton: {
    minWidth: 90,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    backgroundColor: "rgba(179, 38, 30, 0.12)",
  },
  deleteIcon: {
    color: "#B3261E",
  },
});
