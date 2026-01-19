import { ReminderCard } from "@/components/reminder-card";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { EditReminderModal } from "@/components/edit-reminder-modal";

export default function Index() {
  const [isEditReminderModalOpen, setIsEditReminderModalOpen] = useState(false);

  const reminders: { id: string }[] = Array.from({ length: 8 }).map(
    (_, index) => ({
      id: String(index),
    }),
  );

  const onAddReminder = async () => {
    setIsEditReminderModalOpen(true);
  };

  const onEditReminder = async () => {
    setIsEditReminderModalOpen(true);
  };

  return (
    <>
      <SafeAreaView>
        <FlatList
          data={reminders}
          renderItem={() => <ReminderCard onSetEditing={onEditReminder} />}
          keyExtractor={(reminder) => reminder.id}
          contentContainerStyle={styles.list}
        />

        <Pressable
          style={styles.floatingButton}
          android_ripple={{
            color: "rgba(255, 255, 255, .10)",
            foreground: true,
          }}
          onPress={onAddReminder}
        >
          <Ionicons name="add" size={24} style={styles.floatingButtonIcon} />
        </Pressable>
      </SafeAreaView>

      <EditReminderModal
        isOpen={isEditReminderModalOpen}
        setIsOpen={setIsEditReminderModalOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#6750A4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    overflow: "hidden",
  },
  floatingButtonIcon: {
    color: "#fff",
    opacity: 0.8,
  },
});
