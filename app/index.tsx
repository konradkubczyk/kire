import { ReminderCard } from "@/components/reminder-card";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const reminders: { id: string }[] = Array.from({ length: 8 }).map(
    (_, index) => ({
      id: String(index),
    }),
  );

  return (
    <SafeAreaView>
      <FlatList
        data={reminders}
        renderItem={() => <ReminderCard />}
        keyExtractor={(reminder) => reminder.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    paddingHorizontal: 8,
  },
});
