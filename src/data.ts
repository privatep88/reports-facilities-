import {
  Wrench,
  Banknote,
  Truck,
  Users,
  FileText,
  ArrowRightLeft,
  Coffee,
  Sparkles,
  Recycle,
  Landmark,
  KeyRound,
} from "lucide-react";
import {
  ServiceData,
  ContractData,
  MaintenanceSite,
  LogisticsData,
  SecurityData,
  TaskData,
  ChallengeData,
  FireExtinguisherData,
  HazardNoteData,
} from "./types";

export const initialServices: ServiceData[] = [
  { id: "s1", name: "طلبات الصيانة", icon: Wrench, received: 45, executed: 45 },
  { id: "s2", name: "النثرية Petty Cash", icon: Banknote, received: 12, executed: 12 },
  { id: "s3", name: "طلبات الدعم اللوجستي", icon: Truck, received: 38, executed: 35 },
  { id: "s4", name: "خدمات الاستقبال", icon: Users, received: 156, executed: 156 },
  { id: "s5", name: "طلبات صرف", icon: FileText, received: 8, executed: 8 },
  { id: "s6", name: "طلبات حركات الأصول", icon: ArrowRightLeft, received: 15, executed: 13 },
  { id: "s7", name: "طلبات الضيافة", icon: Coffee, received: 67, executed: 67 },
  { id: "s8", name: "طلبات النظافة", icon: Sparkles, received: 22, executed: 22 },
  { id: "s9", name: "طلبات إدارة النفايات", icon: Recycle, received: 18, executed: 18 },
  { id: "s10", name: "طلبات وخدمات حكومية", icon: Landmark, received: 5, executed: 4 },
  { id: "s11", name: "طلبات تصريح او الغاء دخول", icon: KeyRound, received: 0, executed: 0 },
];

export const contracts: ContractData[] = [
  { type: "العقود الإيجارية", active: 0, inactive: 0 },
  { type: "الرخص التجارية", active: 0, inactive: 0 },
  { type: "عقود الخدمات", active: 0, inactive: 0 },
];

export const maintenanceSites: MaintenanceSite[] = [
  { id: 1, name: "مقر إنجازات", general: "-", furniture: "-", decor: "-", fireAlarm: "-", waterLeak: "-", doors: "-", lighting: "-", flooring: "-", ac: "-", outdoorSigns: "-", electrical: "-", elevators: "-" },
  { id: 2, name: "مقر الدوريات", general: "-", furniture: "-", decor: "-", fireAlarm: "-", waterLeak: "-", doors: "-", lighting: "-", flooring: "-", ac: "-", outdoorSigns: "-", electrical: "-", elevators: "-" },
  { id: 3, name: "مقر ابن بطوطة", general: "-", furniture: "-", decor: "-", fireAlarm: "-", waterLeak: "-", doors: "-", lighting: "-", flooring: "-", ac: "-", outdoorSigns: "-", electrical: "-", elevators: "-" },
  { id: 4, name: "مقر تقييم عجمان", general: "-", furniture: "-", decor: "-", fireAlarm: "-", waterLeak: "-", doors: "-", lighting: "-", flooring: "-", ac: "-", outdoorSigns: "-", electrical: "-", elevators: "-" },
  { id: 5, name: "مقر دوريات عجمان", general: "-", furniture: "-", decor: "-", fireAlarm: "-", waterLeak: "-", doors: "-", lighting: "-", flooring: "-", ac: "-", outdoorSigns: "-", electrical: "-", elevators: "-" },
];

export const logisticsData: LogisticsData[] = [
  { id: 1, label: "الطلبات", total: 0, rep: 0, emiratesPost: 0, aramex: 0, distribution: 0, other: 0 },
  { id: 2, label: "النسبة المئوية", total: "-", rep: "0.0%", emiratesPost: "0.0%", aramex: "0.0%", distribution: "0.0%", other: "0.0%", isPercentage: true },
];

export const securityData: SecurityData[] = [
  { id: 1, label: "الطلبات المستلمة", cards: "-", visitors: "-", supplierVisitors: "-", meetingRooms: "-", evacuation: "-", securityReports: "-", emergencies: "-" },
  { id: 2, label: "الطلبات المنفذة", cards: "-", visitors: "-", supplierVisitors: "-", meetingRooms: "-", evacuation: "-", securityReports: "-", emergencies: "-" },
];

export const tasksData: TaskData[] = [
  { id: 1, topic: "-", task: "-", status: "مكتمل", completion: 100 },
  { id: 2, topic: "-", task: "-", status: "مكتمل", completion: 100 },
  { id: 3, topic: "-", task: "-", status: "مكتمل", completion: 100 },
  { id: 4, topic: "-", task: "-", status: "مكتمل", completion: 100 },
  { id: 5, topic: "-", task: "-", status: "مكتمل", completion: 100 },
  { id: 6, topic: "-", task: "-", status: "مكتمل", completion: 100 },
  { id: 7, topic: "-", task: "-", status: "مكتمل", completion: 100 },
];

export const challengesData: ChallengeData[] = [
  { id: 1, challenge: "-", update: "-", recommendation: "-" },
  { id: 2, challenge: "-", update: "-", recommendation: "-" },
  { id: 3, challenge: "-", update: "-", recommendation: "-" },
];

export const initialFireExtinguishers: FireExtinguisherData = {
  active: 0,
  inactive: 0,
  notes: "",
};

export const initialHazardNotes: HazardNoteData = {
  closed: 0,
  notClosed: 0,
  notes: "",
};

