export const VIBRATION_PATTERNS: { name: string; pattern: number[] }[] = [
  { name: "Default", pattern: [0, 500] },
  { name: "Short pulses", pattern: [0, 100, 100, 100, 100, 100] },
  { name: "Long pulses", pattern: [0, 500, 200, 500] },
  { name: "Rapid", pattern: [0, 50, 50, 50, 50, 50, 50, 50] },
  { name: "Heartbeat", pattern: [0, 100, 100, 300, 100, 100] },
  { name: "Mechanical", pattern: [0, 200, 100, 200, 100, 200] },
  { name: "Double Pulse", pattern: [0, 100, 50, 100] },
  { name: "Siren", pattern: [0, 500, 500, 500, 500] },
];
