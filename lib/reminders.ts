import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { VIBRATION_PATTERNS } from "@/constants/vibration-patterns";

export type Reminder = {
  id: string;
  hour: number;
  minute: number;
  patternId: string;
  description: string;
  enabled: boolean;
  recurrenceEnabled: boolean;
  notificationIds?: string[];
  weekdays: number[];
  customPattern?: number[];
};

export type ReminderDraft = {
  hour: number;
  minute: number;
  patternId: string;
  description: string;
  recurrenceEnabled: boolean;
  weekdays: number[];
};

const CHANNEL_PREFIX = "kire-pattern";

export const buildChannelId = (patternId: string) =>
  `${CHANNEL_PREFIX}-${patternId}`;

export const ensureNotificationChannels = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await Promise.all(
    VIBRATION_PATTERNS.map((pattern) =>
      Notifications.setNotificationChannelAsync(buildChannelId(pattern.id), {
        name: `Kire ${pattern.name}`,
        importance: Notifications.AndroidImportance.MAX,
        sound: null,
        enableVibrate: true,
        vibrationPattern: pattern.pattern,
        showBadge: false,
      }),
    ),
  );
};

export const scheduleReminderNotification = async (reminder: Reminder) => {
  const channelId = buildChannelId(reminder.patternId);
  const baseContent = {
    title: "Kire",
    body: reminder.description,
    sound: false,
    data: { reminderId: reminder.id },
  };

  if (!reminder.recurrenceEnabled) {
    const nextDate = getNextOccurrenceDate(reminder.hour, reminder.minute);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: baseContent,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextDate,
        channelId,
      },
    });
    return [notificationId];
  }

  const weekdays =
    reminder.weekdays.length > 0 ? reminder.weekdays : [0, 1, 2, 3, 4, 5, 6];
  return Promise.all(
    weekdays.map((weekday) =>
      Notifications.scheduleNotificationAsync({
        content: baseContent,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: toExpoWeekday(weekday),
          hour: reminder.hour,
          minute: reminder.minute,
          channelId,
        },
      }),
    ),
  );
};

export const getNextOccurrenceDate = (hour: number, minute: number) => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

const toExpoWeekday = (weekday: number) => {
  const normalized = ((weekday % 7) + 7) % 7;
  return normalized + 1;
};
