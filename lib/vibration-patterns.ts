import { VIBRATION_PATTERNS } from "@/constants/vibration-patterns";

export const getVibrationPatternById = (id: string) =>
  VIBRATION_PATTERNS.find((pattern) => pattern.id === id) ??
  VIBRATION_PATTERNS[0];
