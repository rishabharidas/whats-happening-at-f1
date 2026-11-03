export type RadioCategory =
  | "ALL"
  | "VICTORY"
  | "STRATEGY"
  | "DRAMA"
  | "OVERTAKE"
  | "TECHNICAL";

export interface RadioTransmission {
  id: string;
  driverNumber: number;
  driverName: string;
  driverCode: string;
  teamName: string;
  teamColour: string;
  headshotUrl?: string;
  speaker: "DRIVER" | "RACE_ENGINEER" | "TEAM_PRINCIPAL";
  speakerName?: string;
  sessionName: string;
  lap?: number;
  date: string;
  category: "VICTORY" | "STRATEGY" | "DRAMA" | "OVERTAKE" | "TECHNICAL";
  transcript: string;
  recordingUrl?: string;
  durationSeconds?: number;
  featured?: boolean;
  isLiveFeed?: boolean;
}

