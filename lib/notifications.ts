import { Reminder } from "@/lib/reminders";
import * as Notifications from "expo-notifications";
import { DEFAULT_WEEKDAYS } from "@/constants/weekdays";

export const createId = () =>
  `rem-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const normalizeReminder = (reminder: Reminder): Reminder => {
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

export const cancelScheduledNotifications = async (ids: string[]) => {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
};

export const reconcileScheduledStatuses = async (items: Reminder[]) => {
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
