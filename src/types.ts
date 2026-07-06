import { ReactNode } from "react";

export interface ServiceData {
  id: string;
  name: string;
  icon: any; // Lucide icon
  received: number;
  executed: number;
}

export interface ContractData {
  type: string;
  active: number;
  inactive: number;
}

export interface MaintenanceSite {
  id: number;
  name: string;
  general: number | string;
  furniture: number | string;
  decor: number | string;
  fireAlarm: number | string;
  waterLeak: number | string;
  doors: number | string;
  lighting: number | string;
  flooring: number | string;
  ac: number | string;
  outdoorSigns: number | string;
  electrical: number | string;
  elevators: number | string;
}

export interface LogisticsData {
  id: number;
  label: string;
  total: number | string;
  rep: number | string;
  emiratesPost: number | string;
  aramex: number | string;
  distribution: number | string;
  other: number | string;
  isPercentage?: boolean;
}

export interface SecurityData {
  id: number;
  label: string;
  cards: number | string;
  visitors: number | string;
  supplierVisitors: number | string;
  meetingRooms: number | string;
  evacuation: number | string;
  securityReports: number | string;
  emergencies: number | string;
}

export interface TaskData {
  id: number;
  topic: string;
  task: string;
  status: string;
  completion: number;
}

export interface ChallengeData {
  id: number;
  challenge: string;
  update: string;
  recommendation: string;
}
