import { ReminderCard } from "@/components/reminder-card";
import {
  AppState,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { EditReminderModal } from "@/components/edit-reminder-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  ensureNotificationChannels,
  Reminder,
  ReminderDraft,
  scheduleReminderNotification,
} from "@/lib/reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = "kire.reminders.v1";
const DEFAULT_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

const createId = () =>
  `rem-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeReminder = (reminder: Reminder): Reminder => {
  const legacyNotificationId = (
    reminder as Reminder & {
      notificationId?: string;
    }
  ).notificationId;
  const notificationIds =
    reminder.notificationIds ??
    (legacyNotificationId ? [legacyNotificationId] : []);

  return {
    ...reminder,
    weekdays:
      Array.isArray(reminder.weekdays) && reminder.weekdays.length > 0
        ? reminder.weekdays
        : DEFAULT_WEEKDAYS,
    notificationIds,
  };
};

const cancelScheduledNotifications = async (ids: string[]) => {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
};

const reconcileScheduledStatuses = async (items: Reminder[]) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((item) => item.identifier));

  return items.map((reminder) => {
    if (!reminder.enabled) {
      return reminder;
    }
    const notificationIds = reminder.notificationIds ?? [];
    const hasScheduled = notificationIds.some((id) => scheduledIds.has(id));
    return hasScheduled
      ? reminder
      : { ...reminder, enabled: false, notificationIds: [] };
  });
};

export default function Index() {
  const [isEditReminderModalOpen, setIsEditReminderModalOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(
    null,
  );
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refreshReminderStatuses = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = new Set(scheduled.map((item) => item.identifier));
    setReminders((prev) =>
      prev.map((reminder) => {
        if (!reminder.enabled) {
          return reminder;
        }
        const notificationIds = reminder.notificationIds ?? [];
        const hasScheduled = notificationIds.some((id) => scheduledIds.has(id));
        return hasScheduled
          ? reminder
          : { ...reminder, enabled: false, notificationIds: [] };
      }),
    );
  };

  const editingReminder = useMemo(
    () => reminders.find((reminder) => reminder.id === editingReminderId),
    [editingReminderId, reminders],
  );

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort(
        (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
      ),
    [reminders],
  );

  useEffect(() => {
    const initialize = async () => {
      const permissions = await Notifications.getPermissionsAsync();

      if (!permissions.granted) {
        await Notifications.requestPermissionsAsync();
      }

      await ensureNotificationChannels();

      const storedReminders = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedReminders) {
        try {
          const parsed = JSON.parse(storedReminders) as Reminder[];
          const normalized = parsed.map(normalizeReminder);
          const reconciled = await reconcileScheduledStatuses(normalized);
          setReminders(reconciled);
        } catch {
          setReminders([]);
        }
      }
      setIsReady(true);
    };

    initialize();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const reminderId = notification.request.content.data?.reminderId;
        if (!reminderId) {
          return;
        }
        setReminders((prev) =>
          prev.map((item) =>
            item.id === reminderId && !item.recurrenceEnabled
              ? { ...item, enabled: false, notificationIds: [] }
              : item,
          ),
        );
      },
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshReminderStatuses();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [isReady, reminders]);

  const openAddReminder = () => {
    setEditingReminderId(null);
    setIsEditReminderModalOpen(true);
  };

  const openEditReminder = (id: string) => {
    setEditingReminderId(id);
    setIsEditReminderModalOpen(true);
  };

  const closeModal = () => {
    setIsEditReminderModalOpen(false);
    setEditingReminderId(null);
  };

  const onSaveReminder = async (draft: ReminderDraft) => {
    const existing = editingReminder;
    const reminderId = existing?.id ?? createId();
    const enabled = existing?.enabled ?? true;

    let notificationIds = existing?.notificationIds ?? [];
    if (notificationIds.length > 0) {
      await cancelScheduledNotifications(notificationIds);
      notificationIds = [];
    }

    if (enabled) {
      notificationIds = await scheduleReminderNotification({
        id: reminderId,
        hour: draft.hour,
        minute: draft.minute,
        patternId: draft.patternId,
        description: draft.description,
        enabled,
        recurrenceEnabled: draft.recurrenceEnabled,
        weekdays: draft.weekdays,
      });
    }

    const updatedReminder: Reminder = {
      id: reminderId,
      hour: draft.hour,
      minute: draft.minute,
      patternId: draft.patternId,
      description: draft.description,
      enabled,
      recurrenceEnabled: draft.recurrenceEnabled,
      weekdays: draft.weekdays,
      notificationIds,
    };

    setReminders((prev) => {
      if (existing) {
        return prev.map((reminder) =>
          reminder.id === updatedReminder.id ? updatedReminder : reminder,
        );
      }
      return [...prev, updatedReminder];
    });

    closeModal();
  };

  const onDeleteReminder = async (id: string) => {
    const reminder = reminders.find((item) => item.id === id);
    if (reminder?.notificationIds?.length) {
      await cancelScheduledNotifications(reminder.notificationIds);
    }

    setReminders((prev) => prev.filter((item) => item.id !== id));
    closeModal();
  };

  const onToggleReminderEnabled = async (id: string, value: boolean) => {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) {
      return;
    }

    let notificationIds = reminder.notificationIds ?? [];
    if (value) {
      if (notificationIds.length > 0) {
        await cancelScheduledNotifications(notificationIds);
      }
      notificationIds = await scheduleReminderNotification({
        ...reminder,
        enabled: true,
      });
    } else if (notificationIds.length > 0) {
      await cancelScheduledNotifications(notificationIds);
      notificationIds = [];
    }

    setReminders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: value, notificationIds } : item,
      ),
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={sortedReminders}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onEdit={openEditReminder}
              onToggleEnabled={onToggleReminderEnabled}
            />
          )}
          keyExtractor={(reminder) => reminder.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No reminders yet</Text>
              <Text style={styles.emptyBody}>
                Tap the plus button to add a quiet nudge.
              </Text>
            </View>
          }
        />

        <Pressable
          style={styles.floatingButton}
          android_ripple={{
            color: "rgba(255, 255, 255, .10)",
            foreground: true,
          }}
          onPress={openAddReminder}
        >
          <Ionicons name="add" size={24} style={styles.floatingButtonIcon} />
        </Pressable>
      </SafeAreaView>

      <EditReminderModal
        isOpen={isEditReminderModalOpen}
        reminder={editingReminder ?? null}
        onClose={closeModal}
        onSave={onSaveReminder}
        onDelete={onDeleteReminder}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 80,
    flexGrow: 1,
  },
  emptyState: {
    marginTop: 120,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyBody: {
    fontSize: 14,
    color: "#4a4a4a",
    textAlign: "center",
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
