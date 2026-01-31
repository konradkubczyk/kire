import { WEEKDAY_LABELS } from "@/constants/weekdays";

export const formatWeekdays = (weekdays: number[]) => {
  const normalized = Array.from(
    new Set(weekdays.map((day) => ((day % 7) + 7) % 7)),
  ).sort((a, b) => a - b);

  if (normalized.length === 0) {
    return "";
  }

  const segments: string[] = [];
  let rangeStart = normalized[0];
  let rangeEnd = normalized[0];

  const flushRange = () => {
    if (rangeStart === rangeEnd) {
      segments.push(WEEKDAY_LABELS[rangeStart]);
      return;
    }
    segments.push(
      `${WEEKDAY_LABELS[rangeStart]} - ${WEEKDAY_LABELS[rangeEnd]}`,
    );
  };

  for (let i = 1; i < normalized.length; i += 1) {
    const day = normalized[i];
    if (day === rangeEnd + 1) {
      rangeEnd = day;
      continue;
    }
    flushRange();
    rangeStart = day;
    rangeEnd = day;
  }
  flushRange();

  return segments.join(", ");
};
