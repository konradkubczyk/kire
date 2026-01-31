export type VibrationPattern = {
  id: string;
  name: string;
  pattern: number[];
};

export const VIBRATION_PATTERNS: VibrationPattern[] = [
  { id: "default", name: "Default", pattern: [0, 500] },
  {
    id: "short-pulses",
    name: "Short pulses",
    pattern: [0, 100, 100, 100, 100, 100],
  },
  { id: "long-pulses", name: "Long pulses", pattern: [0, 500, 200, 500] },
  { id: "rapid", name: "Rapid", pattern: [0, 50, 50, 50, 50, 50, 50, 50] },
  { id: "heartbeat", name: "Heartbeat", pattern: [0, 100, 100, 300, 100, 100] },
  {
    id: "mechanical",
    name: "Mechanical",
    pattern: [0, 200, 100, 200, 100, 200],
  },
  { id: "double-pulse", name: "Double Pulse", pattern: [0, 100, 50, 100] },
  { id: "siren", name: "Siren", pattern: [0, 500, 500, 500, 500] },
];
