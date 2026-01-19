import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { Dispatch, SetStateAction, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  DateTimePicker,
  Picker,
  TextInput,
} from "@expo/ui/jetpack-compose";
import { VIBRATION_PATTERNS } from "@/constants/vibration-patterns";

type EditReminderModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const EditReminderModal = ({
  isOpen,
  setIsOpen,
}: EditReminderModalProps) => {
  const initialTime = new Date();
  const vibrationPatternOptions = VIBRATION_PATTERNS.map(({ name }) => name);

  const [time, setTime] = useState(initialTime);
  const [patternIndex, setPatternIndex] = useState(0);
  const [message, setMessage] = useState("");

  const onClose = () => setIsOpen(false);

  const selectPattern = ({
    nativeEvent: { index },
  }: {
    nativeEvent: { index: number };
  }) => {
    setPatternIndex(index);
    Vibration.vibrate(VIBRATION_PATTERNS[index].pattern);
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
              initialDate={initialTime.toISOString()}
              onDateSelected={setTime}
              style={styles.timePicker}
            />

            <View style={styles.section}>
              <Text style={styles.label}>Vibration pattern</Text>
              <Picker
                options={vibrationPatternOptions}
                selectedIndex={patternIndex}
                onOptionSelected={selectPattern}
                variant="radio"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput defaultValue={message} onChangeText={setMessage} />
            </View>

            <View style={styles.actions}>
              <Button
                variant="outlined"
                onPress={onClose}
                style={styles.actionButton}
              >
                Close
              </Button>
              <Button style={styles.actionButton}>Add</Button>
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
  actions: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    justifyContent: "flex-end",
  },
  actionButton: {
    minWidth: 90,
  },
});
