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

export interface FireExtinguisherData {
  active: number;
  inactive: number;
  notes: string;
}

export interface HazardNoteData {
  closed: number;
  notClosed: number;
  notes: string;
}

export type ReportStatus = "draft" | "ready_for_review" | "in_review" | "approved" | "archived";

export interface ReportAuditEntry {
  id: string;
  action: "create" | "submit_review" | "review" | "approve" | "return_for_edit" | "request_correction" | "archive";
  actionLabel: string;
  performedBy: string;
  role?: string;
  timestamp: string;
  notes?: string;
}

export interface ApprovedReportSnapshot {
  id: string;
  yearMonth: string;
  year: number;
  month: number;
  monthName: string;
  version: number;
  status: ReportStatus;
  approvedAt: string;
  approvedBy: {
    name: string;
    role: string;
    signature?: string;
  };
  preparedBy: {
    name: string;
    role: string;
    date?: string;
    signature?: string;
  };
  summary: {
    totalReceived: number;
    totalExecuted: number;
    overallCompletion: number;
    topServiceName?: string;
    topServiceReceived?: number;
    totalServicesCount: number;
  };
  services: Array<{
    id: string;
    name: string;
    received: number;
    executed: number;
  }>;
  contracts: ContractData[];
  fireExtinguishers: FireExtinguisherData;
  hazardNotes: HazardNoteData;
  maintenanceSites: MaintenanceSite[];
  maintenanceServices: {
    fromFacilities: number;
    fromOthers: number;
    costPettyCash: string | number;
    costPurchaseOrder: string | number;
  };
  logistics: LogisticsData[];
  security: SecurityData[];
  tasks: TaskData[];
  challenges: ChallengeData[];
  auditTrail: ReportAuditEntry[];
  correctionReason?: string;
  isSuperseded?: boolean;
  supersededBy?: string;
}
