import React, { useState, useMemo } from "react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import {
  initialServices,
  contracts,
  maintenanceSites,
  logisticsData,
  securityData,
  tasksData,
  challengesData,
  initialFireExtinguishers,
  initialHazardNotes,
} from "../data";
import { ServiceData, ContractData, MaintenanceSite, LogisticsData, SecurityData, TaskData, ChallengeData, FireExtinguisherData, HazardNoteData } from "../types";
// @ts-ignore
import {
  Edit2,
  Printer,
  Save,
  CheckCircle,
  Shield,
  Truck,
  Home,
  Wrench,
  ShieldCheck,
  ClipboardCheck,
  Banknote,
  Trash2,
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  FileBarChart,
  ChartNoAxesCombined,
  Target,
  ClipboardList,
  Layers,
  ChartPie,
  ListChecks,
  FileCheck,
  FireExtinguisher,
  Settings,
  ShieldAlert,
  Lightbulb,
  BadgeCheck,
  Building2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { ServicesDashboardView } from "./ServicesDashboardView";
import { ApprovedReportsArchive } from "./ApprovedReportsArchive";
import { ReportWorkflowToolbar } from "./ReportWorkflowToolbar";
import { getReportWorkflowStatus } from "../lib/reportsArchive";
import { triggerPrintReport, exportReportToPDF, exportReportToExcelXlsx } from "../lib/exportUtils";
import headerCorporateBuildingsBg from "../assets/images/header_corporate_buildings_bg_1794427524153.jpg";
import maleMaintenanceEngineerImg from "../assets/images/male_maintenance_engineer_1794426722185.jpg";
import performanceCampusBuildings from "../assets/images/performance_campus_buildings_1794428009832.jpg";
import logisticsOperationsImg from "../assets/images/logistics_operations_bg_1794420296712.jpg";
import securityCctvImg from "../assets/images/security_cctv_camera_1794421481408.jpg";
import officialApprovalStampImg from "../assets/images/official_approval_stamp_1794421481291.jpg";

function getServiceIconColor(id: string): string {
  switch (id) {
    case "s1": return "text-[#2563EB]";
    case "s2": return "text-[#10B981]";
    case "s3": return "text-[#F59E0B]";
    case "s4": return "text-[#F59E0B]";
    case "s5": return "text-[#06B6D4]";
    case "s6": return "text-[#8B5CF6]";
    case "s7": return "text-[#EF4444]";
    case "s8": return "text-[#10B981]";
    case "s9": return "text-[#059669]";
    case "s10": return "text-[#173B65]";
    case "s11": return "text-[#D4A447]";
    default: return "text-[#2563EB]";
  }
}

const defaultMaintenanceServices = { fromFacilities: 0, fromOthers: 0, costPettyCash: "-", costPurchaseOrder: "-" };
const defaultApprovals = { preparation: { role: "ضابط أول المرافق والأصول", name: "معاذ المصعبي", date: "", signature: "" }, review: { role: "رئيس قسم إدارة المرافق", name: "فيصل سويد السليماني", date: "", signature: "" } };
function useMonthlyState<T>(key: string, defaultValue: T, yearMonth: string) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`${key}-${yearMonth}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return defaultValue;
  });
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`${key}-${yearMonth}`);
      if (stored) {
        setState(JSON.parse(stored));
      } else {
        setState(defaultValue);
      }
    } catch (e) {
      setState(defaultValue);
    }
  }, [yearMonth, key]);
  const isFirstRender = React.useRef(true);
  const prevYearMonth = React.useRef(yearMonth);
  React.useEffect(() => {
    localStorage.setItem(`${key}-${yearMonth}`, JSON.stringify(state));
  }, [state, yearMonth, key]);
  return [state, setState] as const;
}
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"report" | "services" | "approved">("report");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const yearMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;
  const [currentMonthStatus, setCurrentMonthStatus] = useState(() => getReportWorkflowStatus(yearMonth).status);
  React.useEffect(() => {
    setCurrentMonthStatus(getReportWorkflowStatus(yearMonth).status);
  }, [yearMonth]);
  const [servicesRaw, setServices] = useMonthlyState<ServiceData[]>("services", initialServices, yearMonth);
  React.useEffect(() => {
    const existingIds = new Set(servicesRaw.map(s => s.id));
    const missing = initialServices.filter(is => !existingIds.has(is.id));
    if (missing.length > 0) {
      setServices(prev => {
        const pIds = new Set(prev.map(s => s.id));
        const toAdd = initialServices.filter(is => !pIds.has(is.id));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }
  }, [servicesRaw, setServices]);
  const services = React.useMemo(() => {
    return servicesRaw.map(s => {
      const orig = initialServices.find(is => is.id === s.id);
      return { ...s, icon: orig ? orig.icon : ClipboardCheck };
    });
  }, [servicesRaw]);
  const monthsList = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const yearsList = Array.from({ length: 2050 - 2023 + 1 }, (_, i) => 2023 + i);
  const [editModes, setEditModes] = useState({
    services: false,
    contracts: false,
    fireHazards: false,
    maintenance: false,
    logistics: false,
    security: false,
    tasks: false,
    challenges: false,
    approvals: false
  });
  const [showToast, setShowToast] = useState(false);
  React.useEffect(() => {
    let timeout: any;
    const handleSave = () => {
      setShowToast(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowToast(false), 2000);
    };
    window.addEventListener("data-saved", handleSave);
    return () => {
      window.removeEventListener("data-saved", handleSave);
      clearTimeout(timeout);
    };
  }, []);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handlePrint = () => {
    triggerPrintReport();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("dashboard-content");
    if (!element) return;
    const filename = `Facilities_Monthly_Report_${selectedYear}_${selectedMonth.toString().padStart(2, "0")}`;
    setIsExportingPDF(true);
    await exportReportToPDF(element, filename, (loading) => setIsExportingPDF(loading));
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    const data = {
      ...getReportSnapshotData(),
      year: selectedYear,
      month: selectedMonth,
      monthName: monthsList[selectedMonth - 1],
      isApproved: currentMonthStatus === "approved",
      statusLabel: currentMonthStatus === "approved" ? "معتمد" : "نشط",
    };
    await exportReportToExcelXlsx(data);
    setIsExportingExcel(false);
  };

  const toggleEdit = (section: keyof typeof editModes) => {
    if (currentMonthStatus === "approved") {
      alert("التقرير لشهر " + monthsList[selectedMonth - 1] + " " + selectedYear + " معتمد رسمياً ومقفل للقراءة فقط.\nلإجراء تعديل، يرجى تقديم 'طلب تصحيح معتمد' من شريط مسار الاعتماد بالأعلى.");
      return;
    }
    setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [contractsState, setContractsState] = useMonthlyState<ContractData[]>("contracts", contracts, yearMonth);
  const [fireExtinguishers, setFireExtinguishers] = useMonthlyState<FireExtinguisherData>("fireExtinguishers", initialFireExtinguishers, yearMonth);
  const [hazardNotes, setHazardNotes] = useMonthlyState<HazardNoteData>("hazardNotes", initialHazardNotes, yearMonth);
  const [maintenanceSitesState, setMaintenanceSitesState] = useMonthlyState<MaintenanceSite[]>("maintenanceSites", maintenanceSites, yearMonth);
  const [maintenanceServices, setMaintenanceServices] = useMonthlyState("maintenanceServices", defaultMaintenanceServices, yearMonth);
  const [logisticsState, setLogisticsState] = useMonthlyState<LogisticsData[]>("logistics", logisticsData, yearMonth);
  const [securityState, setSecurityState] = useMonthlyState<SecurityData[]>("security", securityData, yearMonth);
  const [tasksState, setTasksState] = useMonthlyState<TaskData[]>("tasks", tasksData, yearMonth);
  const [challengesState, setChallengesState] = useMonthlyState<ChallengeData[]>("challenges", challengesData, yearMonth);
  const [approvalsState, setApprovalsState] = useMonthlyState("approvals", defaultApprovals, yearMonth);

  // Math Calculations
  const totalReceived = useMemo(() => services.reduce((acc, s) => acc + s.received, 0), [services]);
  const totalExecuted = useMemo(() => services.reduce((acc, s) => acc + s.executed, 0), [services]);
  const overallCompletion = totalReceived === 0 ? 0 : (totalExecuted / totalReceived) * 100;
  
  const sortedServices = useMemo(() => [...services].sort((a, b) => b.received - a.received), [services]);
  const topService = sortedServices.length > 0 ? sortedServices[0] : null;

  // Logistics computations
  const logisticsDataRow = logisticsState.find(r => r.id === 1) || logisticsState[0];
  const repCount = Number(logisticsDataRow.rep) || 0;
  const emiratesPostCount = Number(logisticsDataRow.emiratesPost) || 0;
  const aramexCount = Number(logisticsDataRow.aramex) || 0;
  const distributionCount = Number(logisticsDataRow.distribution) || 0;
  const otherCount = Number(logisticsDataRow.other) || 0;
  const logisticsTotal = repCount + emiratesPostCount + aramexCount + distributionCount + otherCount;
  
  const calcLogisticsPercent = (val: number) => logisticsTotal > 0 ? ((val / logisticsTotal) * 100).toFixed(1) + "%" : "0.0%";

  const computedLogisticsState = [
    {
      ...logisticsDataRow,
      total: logisticsTotal
    },
    {
      id: 2,
      label: "النسبة المئوية",
      isPercentage: true,
      total: "-",
      rep: calcLogisticsPercent(repCount),
      emiratesPost: calcLogisticsPercent(emiratesPostCount),
      aramex: calcLogisticsPercent(aramexCount),
      distribution: calcLogisticsPercent(distributionCount),
      other: calcLogisticsPercent(otherCount),
    }
  ];

  const handleServiceChange = (id: string, field: "name" | "received" | "executed", value: string | number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (field === "name") {
             return { ...s, name: value as string };
          }
          const numValue = typeof value === "number" ? value : parseInt(value as string) || 0;
          return { ...s, [field]: numValue >= 0 ? numValue : 0 };
        }
        return s;
      })
    );
  };

  const addService = () => {
    const newId = `s${Date.now()}`;
    setServices((prev) => [
      ...prev,
      {
        id: newId,
        name: "خدمة جديدة",
        icon: ClipboardCheck,
        received: 0,
        executed: 0,
      },
    ]);
    setEditModes(prev => ({ ...prev, services: true }));
  };

  const updateContract = (index: number, field: "active" | "inactive" | "notes", value: number | string) => {
    setContractsState((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const addMaintenanceSite = () => {
    const newId = maintenanceSitesState.length > 0 ? Math.max(...maintenanceSitesState.map((s) => s.id)) + 1 : 1;
    setMaintenanceSitesState((prev) => [
      ...prev,
      { id: newId, name: "موقع جديد", general: "-", furniture: "-", decor: "-", fireAlarm: "-", waterLeak: "-", doors: "-", lighting: "-", flooring: "-", ac: "-", outdoorSigns: "-", electrical: "-", elevators: "-" }
    ]);
  };
  const deleteMaintenanceSite = (id: number) => {
    setMaintenanceSitesState((prev) => prev.filter((s) => s.id !== id));
  };

  const updateMaintenanceSite = (id: number, field: keyof MaintenanceSite, value: string) => {
    setMaintenanceSitesState((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const updateLogistics = (id: number, field: keyof LogisticsData, value: string | number) => {
    setLogisticsState((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const updateSecurity = (id: number, field: keyof SecurityData, value: string) => {
    setSecurityState((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const updateTask = (id: number, field: keyof TaskData, value: string | number) => {
    setTasksState((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const addTask = () => {
    const newId = tasksState.length > 0 ? Math.max(...tasksState.map((t) => t.id)) + 1 : 1;
    setTasksState((prev) => [
      ...prev,
      { id: newId, topic: "موضوع جديد", task: "مهمة جديدة", status: "مستمرة", completion: 0 }
    ]);
  };

  const deleteTask = (id: number) => {
    setTasksState((prev) => prev.filter((t) => t.id !== id));
  };

  const updateChallenge = (id: number, field: keyof ChallengeData, value: string) => {
    setChallengesState((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addChallenge = () => {
    const newId = challengesState.length > 0 ? Math.max(...challengesState.map((c) => c.id)) + 1 : 1;
    setChallengesState((prev) => [
      ...prev,
      { id: newId, challenge: "تحدي جديد", update: "تحديث", recommendation: "توصية جديدة" }
    ]);
  };

  const deleteChallenge = (id: number) => {
    setChallengesState((prev) => prev.filter((c) => c.id !== id));
  };

  const getReportSnapshotData = () => {
    return {
      summary: {
        totalReceived,
        totalExecuted,
        overallCompletion,
        topServiceName: topService?.name || "",
        topServiceReceived: topService?.received || 0,
        totalServicesCount: services.length,
      },
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        received: s.received,
        executed: s.executed
      })),
      contracts: contractsState,
      fireExtinguishers,
      hazardNotes,
      maintenanceSites: maintenanceSitesState,
      maintenanceServices,
      logistics: computedLogisticsState,
      security: securityState,
      tasks: tasksState,
      challenges: challengesState,
      approvedBy: {
        name: approvalsState.review.name || "فيصل سويد السليماني",
        role: approvalsState.review.role || "رئيس قسم إدارة المرافق",
        signature: approvalsState.review.signature || ""
      },
      preparedBy: {
        name: approvalsState.preparation.name || "معاذ المصعبي",
        role: approvalsState.preparation.role || "ضابط أول المرافق والأصول",
        date: approvalsState.preparation.date || "",
        signature: approvalsState.preparation.signature || ""
      }
    };
  };

  return (
    <div id="dashboard-content" className="min-h-screen bg-[#E9F0F8] text-slate-800 font-sans pb-20" dir="rtl">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-[#1E56B8] border-b-[4px] border-b-[#142A45] shadow-[0_10px_28px_rgba(20,42,69,0.16)] flex flex-col lg:flex-row justify-between items-stretch lg:items-end px-5 sm:px-7 pt-4 pb-4 mb-6 min-h-[168px] bg-[#EAF3FF]">
          {/* Pixel-Precision Corporate Header Background: Left Glass Buildings Complex + Sweeping Blue/Navy/Gold Arc + Right Ice-Blue Surface (Excluded from Print & PDF) */}
          <div className="absolute inset-0 pointer-events-none z-0 print:hidden" data-html2canvas-ignore="true">
            {/* Left Side: Bright High-Clarity Corporate Glass Buildings Complex with Palm Trees & Green Lawn */}
            <div className="absolute inset-y-0 left-0 w-[62%] overflow-hidden">
              <img
                src={headerCorporateBuildingsBg}
                alt=""
                className="w-full h-full object-cover contrast-[1.05] saturate-[1.08]"
                style={{ objectPosition: "48% 40%" }}
              />
              {/* Subtle bottom vignette to keep bottom-left controls crisp while leaving buildings and sky 100% bright */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(30, 86, 184, 0.04) 0%, transparent 55%, rgba(20, 42, 69, 0.18) 100%)",
                }}
              />
            </div>

            {/* Sweeping Multi-Layered Corporate S-Curve Transition (Gold, Dark Navy, Royal Blue, Sky Blue, and Right Pale-Blue Surface) */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 220"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="headerRightSurfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E5F1FF" />
                  <stop offset="52%" stopColor="#F5FAFF" />
                  <stop offset="100%" stopColor="#D2E6FF" />
                </linearGradient>
                <linearGradient id="headerGoldCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F3C65F" />
                  <stop offset="50%" stopColor="#D4A447" />
                  <stop offset="100%" stopColor="#B8862D" />
                </linearGradient>
                <linearGradient id="headerNavyCurveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#142A45" />
                  <stop offset="55%" stopColor="#173B65" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
                <linearGradient id="headerRoyalCurveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1D4ED8" />
                  <stop offset="55%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
              </defs>

              {/* Layer 1: Gold Outer Rim Bordering the Building Photo */}
              <path
                d="M652,0 C600,38 564,128 492,220 L1200,220 L1200,0 Z"
                fill="url(#headerGoldCurveGrad)"
              />

              {/* Layer 2: Deep Navy & Corporate Dark Blue Sweeping Band */}
              <path
                d="M666,0 C614,40 576,130 508,220 L1200,220 L1200,0 Z"
                fill="url(#headerNavyCurveGrad)"
              />

              {/* Layer 3: Royal Blue to Sky Blue Sweeping Band */}
              <path
                d="M726,0 C650,36 604,132 544,220 L1200,220 L1200,0 Z"
                fill="url(#headerRoyalCurveGrad)"
              />

              {/* Layer 4: Soft Sky-Blue Inner Highlight Band */}
              <path
                d="M795,0 C684,32 628,134 574,220 L1200,220 L1200,0 Z"
                fill="#93C5FD"
                fillOpacity="0.45"
              />

              {/* Layer 5: Right Side Pale Ice-Blue Surface Behind Title & Navigation Tabs */}
              <path
                d="M825,0 C700,30 638,136 586,220 L1200,220 L1200,0 Z"
                fill="url(#headerRightSurfaceGrad)"
              />
            </svg>
          </div>

          {/* Right Section: Subtitle, Report Emblem + Main Title, and Navigation Tabs */}
          <div className="relative z-10 flex flex-col items-start justify-between w-full lg:w-[54%]">
            {/* Top-Right Subtitle */}
            <div className="w-full flex items-center justify-start gap-2 mb-1.5 pr-1">
              <Building2 className="w-4 h-4 text-[#142A45]" />
              <span className="text-[#142A45] text-sm sm:text-[15px] font-extrabold tracking-wide">
                نظام إدارة المرافق
              </span>
            </div>

            {/* Main Title + Royal Blue Report Clipboard Emblem */}
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#142A45] flex items-center gap-3 leading-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
              {/* Custom Royal-Blue Report Emblem Matching Reference Image */}
              <span className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-[#1D4ED8] to-[#1E3A8A] border-2 border-white shadow-[0_4px_12px_rgba(29,78,216,0.35)] flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  {/* Clipboard Body */}
                  <rect x="6" y="6" width="18" height="22" rx="3" fill="white" />
                  {/* Clipboard Top Clip */}
                  <path d="M11 5C11 3.89543 11.8954 3 13 3H17C18.1046 3 19 3.89543 19 5V7H11V5Z" fill="#93C5FD" />
                  <rect x="12" y="4.5" width="6" height="2.5" rx="1" fill="#1E3A8A" />
                  {/* Bar Chart Inside Clipboard */}
                  <rect x="10" y="18" width="2.5" height="6" rx="0.8" fill="#1E3A8A" />
                  <rect x="13.8" y="14" width="2.5" height="10" rx="0.8" fill="#2563EB" />
                  <rect x="17.6" y="11" width="2.5" height="13" rx="0.8" fill="#1E3A8A" />
                </svg>
                {/* Corner Checkmark Badge */}
                <span className="absolute -bottom-1 -left-1.5 w-6 h-6 rounded-full bg-[#1D4ED8] border-2 border-white flex items-center justify-center shadow-xs">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
              <span>
                {activeTab === "report"
                  ? "التقرير الشهري لقسم إدارة المرافق"
                  : activeTab === "services"
                  ? "لوحة تحكم الخدمات"
                  : "أرشيف التقارير المعتمدة"}
              </span>
            </h1>

            {/* Bottom-Right Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-4 print:hidden">
              <button
                onClick={() => setActiveTab("report")}
                className={`px-4 sm:px-5 py-2 text-sm font-extrabold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "report"
                    ? "bg-[#142A45] text-white border border-[#D4A447] border-b-2 border-b-[#D4A447] shadow-[0_4px_10px_rgba(20,42,69,0.25)]"
                    : "bg-white text-[#142A45] border border-[#BFDBFE] hover:bg-[#F8FAFC] shadow-[0_2px_6px_rgba(20,42,69,0.08)]"
                }`}
              >
                <FileBarChart className={`w-4 h-4 ${activeTab === "report" ? "text-[#D4A447]" : "text-[#2563EB]"}`} />
                <span>التقرير الشهري</span>
              </button>

              <button
                onClick={() => setActiveTab("approved")}
                className={`px-4 sm:px-5 py-2 text-sm font-extrabold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "approved"
                    ? "bg-[#142A45] text-white border border-[#D4A447] border-b-2 border-b-[#D4A447] shadow-[0_4px_10px_rgba(20,42,69,0.25)]"
                    : "bg-white text-[#142A45] border border-[#BFDBFE] hover:bg-[#F8FAFC] shadow-[0_2px_6px_rgba(20,42,69,0.08)]"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>التقارير المعتمدة</span>
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 sm:px-5 py-2 text-sm font-extrabold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "services"
                    ? "bg-[#142A45] text-white border border-[#D4A447] border-b-2 border-b-[#D4A447] shadow-[0_4px_10px_rgba(20,42,69,0.25)]"
                    : "bg-white text-[#142A45] border border-[#BFDBFE] hover:bg-[#F8FAFC] shadow-[0_2px_6px_rgba(20,42,69,0.08)]"
                }`}
              >
                <Layers className="w-4 h-4 text-[#D4A447]" />
                <span>جميع الخدمات</span>
              </button>
            </div>
          </div>

          {/* Left Section: Action Capsules & Month/Year Selectors Over Architectural Scene */}
          <div className="relative z-10 text-left flex flex-col items-end justify-end mt-4 lg:mt-0">
            {/* Row 1: Action Buttons Styled Like Reference Capsules (Navy, Teal, Emerald) */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5 print:hidden" data-html2canvas-ignore="true">
              <button
                onClick={handlePrint}
                className="bg-[#142A45]/95 hover:bg-[#173B65] text-white border border-white/75 px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-[0_3px_10px_rgba(20,42,69,0.3)] backdrop-blur-xs cursor-pointer"
                title="طباعة التقرير الشهري A4"
              >
                <Printer className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>طباعة</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="bg-[#0E7490]/95 hover:bg-[#0891B2] disabled:opacity-50 text-white border border-white/75 px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-[0_3px_10px_rgba(14,116,144,0.3)] backdrop-blur-xs cursor-pointer"
                title="تصدير ملف PDF عالي الدقة مقاس A4"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>{isExportingPDF ? "جاري إنشاء PDF..." : "تصدير PDF"}</span>
              </button>
              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="bg-[#10B981]/95 hover:bg-[#059669] disabled:opacity-50 text-white border border-white/75 px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-[0_3px_10px_rgba(16,185,129,0.3)] backdrop-blur-xs cursor-pointer"
                title="تصدير ملف Excel منسق (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                <span>{isExportingExcel ? "جاري التصدير..." : "تصدير Excel"}</span>
              </button>
            </div>

            {/* Row 2: Month & Year Selectors Styled Like Reference Capsules */}
            <div className="flex items-center gap-2.5 print:hidden">
              {/* Month Capsule with Right Calendar Icon */}
              <div className="relative flex items-center bg-[#142A45]/95 border border-[#D4A447]/80 rounded-xl px-3 py-1.5 shadow-[0_4px_12px_rgba(20,42,69,0.35)] backdrop-blur-xs">
                <Calendar className="w-4 h-4 text-white ml-2 pointer-events-none shrink-0" />
                <select
                  aria-label="الشهر"
                  className="bg-transparent text-white text-sm font-extrabold pr-0.5 pl-1 cursor-pointer focus:outline-none"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                >
                  {monthsList.map((m, i) => (
                    <option key={i} value={i + 1} className="bg-[#142A45] text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Capsule with Left Chevron Arrow */}
              <div className="relative flex items-center bg-[#142A45]/95 border border-[#D4A447]/80 rounded-xl px-3 py-1.5 shadow-[0_4px_12px_rgba(20,42,69,0.35)] backdrop-blur-xs">
                <select
                  aria-label="السنة"
                  className="appearance-none bg-transparent text-white text-sm font-extrabold pr-1 pl-5 cursor-pointer focus:outline-none"
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                >
                  {yearsList.map(y => (
                    <option key={y} value={y} className="bg-[#142A45] text-white">
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white absolute left-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="hidden print:block bg-[#142A45] text-white px-4 py-1 text-sm font-bold mb-2">
              {monthsList[selectedMonth - 1]} {selectedYear}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {activeTab === "approved" ? (
          <ApprovedReportsArchive 
            onBackToCurrentReport={() => setActiveTab("report")}
            onOpenReportMonth={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
              setActiveTab("report");
            }}
          />
        ) : activeTab === "services" ? (
          <ServicesDashboardView 
            services={services}
            contracts={contractsState}
            maintenanceSites={maintenanceSitesState}
            maintenanceServices={maintenanceServices}
            logistics={logisticsState}
            security={securityState}
            tasks={tasksState}
            challenges={challengesState}
          />
        ) : (
          <>
            <ReportWorkflowToolbar
              yearMonth={yearMonth}
              year={selectedYear}
              month={selectedMonth}
              monthName={monthsList[selectedMonth - 1]}
              onGoToArchive={() => setActiveTab("approved")}
              getReportSnapshotData={getReportSnapshotData}
              onStatusChange={(status) => setCurrentMonthStatus(status)}
            />
        {/* Executive Summary */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle title="الملخص التنفيذي" subtitle="Executive Summary" icon={<ChartNoAxesCombined className="w-6 h-6 text-[#2563EB]" />} iconBg="bg-white border-[#93C5FD]" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-4">
            <SummaryCard
              title="نسبة الإنجاز الكلية"
              subtitle="Overall Completion"
              value={`${overallCompletion.toFixed(1)}%`}
              icon={<Target className="w-7 h-7 text-[#10B981]" />}
              borderColor="border-[#A7F3D0] border-r-4 border-r-[#10B981]"
              bgGradient="bg-gradient-to-br from-[#ECFDF5] via-[#F2FDF9] to-[#D1FAE5]/85"
              iconBadge="bg-white border-[#A7F3D0] ring-4 ring-[#10B981]/15 shadow-xs"
              valueColor="text-[#065F46]"
              barColor="bg-gradient-to-l from-[#059669] to-[#10B981]"
              trackColor="bg-[#10B981]/20"
              fillWidth={`${overallCompletion}%`}
            />
            <SummaryCard
              title="إجمالي الخدمات"
              subtitle="Total Services"
              value={services.length}
              icon={<Layers className="w-7 h-7 text-[#2563EB]" />}
              borderColor="border-[#BFDBFE] border-r-4 border-r-[#2563EB]"
              bgGradient="bg-gradient-to-br from-[#EFF6FF] via-[#F5F9FF] to-[#DBEAFE]/85"
              iconBadge="bg-white border-[#BFDBFE] ring-4 ring-[#2563EB]/15 shadow-xs"
              valueColor="text-[#142A45]"
              barColor="bg-gradient-to-l from-[#1D4ED8] to-[#38BDF8]"
              trackColor="bg-[#2563EB]/20"
              fillWidth="100%"
            />
            <SummaryCard
              title="أعلى خدمة طلباً"
              subtitle="Top Service Demand"
              value={topService?.received || 0}
              serviceNameBadge={topService?.name}
              icon={<Users className="w-7 h-7 text-[#D4A447]" />}
              borderColor="border-[#FDE68A] border-r-4 border-r-[#D4A447]"
              bgGradient="bg-gradient-to-br from-[#FFFBEB] via-[#FEF9E7] to-[#FDE68A]/75"
              iconBadge="bg-white border-[#FDE68A] ring-4 ring-[#D4A447]/15 shadow-xs"
              valueColor="text-[#142A45]"
              barColor="bg-gradient-to-l from-[#D97706] to-[#F59E0B]"
              trackColor="bg-[#D4A447]/25"
              fillWidth="100%"
            />
            <SummaryCard
              title="إجمالي الطلبات"
              subtitle="Total Requests"
              value={totalReceived}
              icon={<ClipboardList className="w-7 h-7 text-[#2563EB]" />}
              borderColor="border-[#CBD5E1] border-r-4 border-r-[#173B65]"
              bgGradient="bg-gradient-to-br from-[#F0F6FF] via-[#F8FAFC] to-[#E2E8F0]/85"
              iconBadge="bg-white border-[#BFDBFE] ring-4 ring-[#2563EB]/15 shadow-xs"
              valueColor="text-[#142A45]"
              barColor="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#2563EB]"
              trackColor="bg-[#173B65]/20"
              fillWidth="100%"
            />
          </div>
        </section>

        {/* Performance Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#BFDBFE]/90 shadow-sm flex flex-col overflow-hidden">
            <div className="bg-gradient-to-l from-[#CFE2FA] via-[#E1EEFD] to-[#EFF6FF] text-[#142A45] border-b border-[#BFDBFE] px-4 py-3 font-black text-base flex justify-between items-center">
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center shadow-2xs">
                  <ClipboardList className="w-5 h-5 text-[#2563EB]" />
                </span>
                <span>الطلبات حسب الخدمة</span>
              </span>
              <span className="text-[#173B65]/70 text-xs tracking-widest uppercase font-bold">Requests by Service</span>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="text-right py-2 font-bold">الخدمة</th>
                    <th className="text-center py-2 font-bold">التوزيع النسبي</th>
                    <th className="text-center py-2 font-bold">العدد</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100/80 last:border-0 hover:bg-blue-50/30">
                      <td className="py-2.5 flex items-center gap-2">
                        <s.icon className={cn("w-4 h-4 shrink-0", getServiceIconColor(s.id))} />
                        <span className="font-bold text-slate-800">{s.name}</span>
                      </td>
                      <td className="py-2.5 w-1/2 px-4">
                        <div className="h-2.5 bg-slate-100 w-full relative rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalReceived > 0 ? (s.received / totalReceived) * 100 : 0}%` }}
                            className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-[#1D4ED8] via-[#2563EB] to-[#38BDF8] rounded-full"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-black text-[#142A45]">{s.received}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#EEF5FF] border-t border-[#BFDBFE] text-[#142A45] font-black">
                    <td colSpan={2} className="py-2.5 px-4">الإجمالي · Total</td>
                    <td className="py-2.5 text-center">{totalReceived}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#BFDBFE] shadow-[0_6px_22px_rgba(20,42,69,0.07)] flex flex-col overflow-hidden relative">
            {/* Performance Distribution Header Matching Visual Reference */}
            <div className="relative overflow-hidden bg-gradient-to-l from-[#D4E6FC] via-[#E4F0FE] to-[#F0F7FF] text-[#142A45] border-b border-[#BFDBFE]/90 px-5 py-3.5 flex justify-between items-center">
              {/* Subtle Diagonal Light-Blue Wave in Header Background */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 600 80"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0,0 L285,0 C255,28 230,55 200,80 L0,80 Z" fill="#CFE4FD" fillOpacity="0.45" />
                <path d="M0,0 L245,0 C215,28 190,55 160,80 L0,80 Z" fill="#DCEBFE" fillOpacity="0.55" />
              </svg>

              {/* Right Side: Rounded Blue PieChart Icon Badge + Arabic Title & English Subtitle */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-white border border-[#BFDBFE] flex items-center justify-center shadow-[0_3px_10px_rgba(37,99,235,0.14)] shrink-0">
                  <ChartPie className="w-6 h-6 text-[#2563EB]" />
                </span>
                <div className="flex flex-col text-right">
                  <span className="font-black text-lg sm:text-xl text-[#142A45] leading-tight">توزيع الأداء</span>
                  <span className="text-[#173B65]/85 text-[10px] sm:text-[11px] tracking-[0.14em] uppercase font-bold mt-0.5">
                    PERFORMANCE DISTRIBUTION
                  </span>
                </div>
              </div>

              {/* Left Side: Institutional Facilities Management Emblem */}
              <div className="relative z-10 flex items-center gap-2.5 text-right">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-xs sm:text-sm font-extrabold text-[#142A45]">إدارة المرافق</span>
                  <span className="text-[10px] font-semibold text-[#173B65]/80">Facilities Management</span>
                </div>
                <span className="h-7 w-px bg-[#142A45]/25" aria-hidden="true" />
                <Building2 className="w-6 h-6 text-[#142A45] shrink-0" />
              </div>
            </div>

            {/* Card Body: Upper White Chart & Legend Zone + Lower Modern Corporate Campus Scene */}
            <div className="flex-1 flex flex-col justify-between bg-white relative">
              {/* Upper Zone: Donut Chart & 3 Performance Indicators on Clean White Surface */}
              <div className="relative z-10 pt-5 pb-2 px-6 flex items-center justify-center">
                <CustomDonutChart
                  percentage={overallCompletion}
                  totalExecuted={totalExecuted}
                  totalPending={Math.max(0, totalReceived - totalExecuted)}
                />
              </div>

              {/* Lower Zone: Clear Modern Corporate Glass Buildings & Green Campus (Seamless Blend from White) */}
              <div
                className="relative w-full h-44 sm:h-48 mt-auto overflow-hidden pointer-events-none select-none print:hidden"
                data-html2canvas-ignore="true"
              >
                <img
                  src={performanceCampusBuildings}
                  alt=""
                  className="w-full h-full object-cover contrast-[1.04] saturate-[1.06]"
                  style={{ objectPosition: "50% 38%" }}
                />
                {/* Smooth Top Gradient Transition from Pure White Chart Area into the Buildings Scene */}
                <div
                  className="absolute top-0 inset-x-0 h-10"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.78) 45%, rgba(255, 255, 255, 0) 100%)",
                  }}
                />
                {/* Bottom-Right Architectural Monument Sign Matching Reference Image */}
                <div className="absolute bottom-3 right-5 bg-gradient-to-l from-[#1E293B]/95 to-[#334155]/95 border border-white/20 rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2 backdrop-blur-xs">
                  <div className="flex flex-col text-right leading-tight">
                    <span className="text-[11px] font-extrabold text-white">إدارة المرافق</span>
                    <span className="text-[8px] font-medium text-slate-200 tracking-wide">Facilities Management</span>
                  </div>
                  <span className="h-5 w-px bg-white/25" />
                  <Building2 className="w-4 h-4 text-white shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Summary Table */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
           <SectionTitle
             title="ملخص الخدمات"
             subtitle="Services Summary"
             icon={<Layers className="w-6 h-6 text-[#2563EB]" />}
             iconBg="bg-white border-[#93C5FD]"
             isEditing={editModes.services}
             onToggleEdit={() => toggleEdit("services")}
             onAdd={addService}
             addLabel="إضافة خدمة"
           />

           <div className="bg-white rounded-xl border border-[#BFDBFE]/80 shadow-xs overflow-x-auto">
             <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-l from-[#D4E6FC] via-[#E6F0FD] to-[#D4E6FC] border-b-2 border-[#93C5FD] text-[#142A45]">
                    <th className="py-3 px-4 text-right font-black">#</th>
                    <th className="py-3 px-4 text-right font-black">الخدمة</th>
                    <th className="py-3 px-4 text-center font-black">المستلمة</th>
                    <th className="py-3 px-4 text-center font-black">المنفذة</th>
                    <th className="py-3 px-4 text-center font-black w-36">مؤشر الإنجاز</th>
                    <th className="py-3 px-4 text-center font-black">النسبة</th>
                    <th className="py-3 px-4 text-center font-black">المستوى</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((s, idx) => {
                    const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                    const level = ratio >= 95 ? "مرتفع" : ratio >= 85 ? "متوسط" : "منخفض";
                    const levelColor = ratio >= 95 ? "text-[#10B981]" : ratio >= 85 ? "text-[#F59E0B]" : "text-[#EF4444]";
                    const bgClass = ratio < 85 ? "bg-rose-50/25" : idx % 2 === 1 ? "bg-[#F8FBFF]" : "bg-white";
                    
                    return (
                      <tr key={s.id} className={cn("hover:bg-blue-50/40 transition-colors", bgClass)}>
                        <td className="py-3 px-4 text-slate-600 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                              <s.icon className={cn("w-4 h-4", getServiceIconColor(s.id))} />
                            </span>
                            {editModes.services ? (
                              <input
                                type="text"
                                value={s.name}
                                onChange={(e) => handleServiceChange(s.id, "name", e.target.value)}
                                className="w-full border border-slate-300 p-1 bg-white font-bold"
                              />
                            ) : (
                              <span className="text-[#142A45]">{s.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-[#142A45]">
                          {editModes.services ? (
                            <input type="number" value={s.received} onChange={(e) => handleServiceChange(s.id, "received", parseInt(e.target.value) || 0)} className="w-16 border border-slate-300 text-center p-1 bg-white" />
                          ) : (
                            s.received
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-[#142A45]">
                           {editModes.services ? (
                            <input type="number" value={s.executed} onChange={(e) => handleServiceChange(s.id, "executed", parseInt(e.target.value) || 0)} className="w-16 border border-slate-300 text-center p-1 bg-white" />
                          ) : (
                            s.executed
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="h-2.5 bg-slate-200/80 w-full relative rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(ratio, 100)}%` }}
                              className={cn("absolute top-0 bottom-0 right-0 rounded-full", ratio >= 95 ? "bg-gradient-to-l from-[#059669] to-[#10B981]" : ratio >= 85 ? "bg-gradient-to-l from-[#D97706] to-[#F59E0B]" : "bg-gradient-to-l from-[#DC2626] to-[#EF4444]")}
                            />
                          </div>
                        </td>
                        <td className={cn("py-3 px-4 text-center font-black", levelColor)}>{ratio.toFixed(1)}%</td>
                        <td className={cn("py-3 px-4 text-center font-extrabold", levelColor)}>
                          {ratio >= 95 ? "▲ " : ratio >= 85 ? "▲ " : "▼ "}
                          {level}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white font-black">
                    <td colSpan={2} className="py-3.5 px-4 text-center">الإجمالي · Total</td>
                    <td className="py-3.5 px-4 text-center">{totalReceived}</td>
                    <td className="py-3.5 px-4 text-center">{totalExecuted}</td>
                    <td className="py-3.5 px-4 text-center">—</td>
                    <td className="py-3.5 px-4 text-center font-black">{overallCompletion.toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-center">—</td>
                  </tr>
                </tbody>
             </table>
           </div>
        </section>

        {/* Contracts & Licenses */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle title="العقود والرخص" subtitle="Contracts & Licenses" icon={<FileCheck className="w-6 h-6 text-[#2563EB]" />} iconBg="bg-white border-[#93C5FD]" isEditing={editModes.contracts} onToggleEdit={() => toggleEdit('contracts')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
             <ContractBlock title="العقود الإيجارية" subtitle="Rental Contracts" data={contractsState[0]} borderColor="border-[#10B981]" textColor="text-[#059669]" icon={<Home className="w-5 h-5 text-[#38BDF8]" />} isEditing={editModes.contracts} onChange={(f, v) => updateContract(0, f, v)} />
             <ContractBlock title="الرخص التجارية" subtitle="Commercial Licenses" data={contractsState[1]} borderColor="border-[#2563EB]" textColor="text-[#059669]" icon={<ClipboardCheck className="w-5 h-5 text-[#38BDF8]" />} isEditing={editModes.contracts} onChange={(f, v) => updateContract(1, f, v)} />
             <ContractBlock title="عقود الخدمات" subtitle="Service Contracts" data={contractsState[2]} borderColor="border-[#142A45]" textColor="text-[#059669]" icon={<Layers className="w-5 h-5 text-[#38BDF8]" />} isEditing={editModes.contracts} onChange={(f, v) => updateContract(2, f, v)} />
          </div>
        </section>

        {/* Fire Extinguishers and Hazard Notes */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle
            title="الطفايات وملاحظات المخاطر"
            subtitle="Fire Extinguishers and Hazard Notes"
            icon={<FireExtinguisher className="w-6 h-6 text-[#EF4444]" />}
            iconBg="bg-white border-rose-200"
            isEditing={editModes.fireHazards}
            onToggleEdit={() => toggleEdit('fireHazards')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* بطاقة عدد الطفايات */}
            <div className="bg-white rounded-xl border border-amber-200/90 shadow-xs flex flex-col overflow-hidden">
              {/* Header Bar */}
              <div className="bg-gradient-to-l from-[#B48225] via-[#C99738] to-[#D4A447] text-white py-3 px-4 flex items-center justify-center gap-2">
                <FireExtinguisher className="w-5 h-5 text-white" />
                <span className="font-black text-base sm:text-lg">عدد الطفايات</span>
              </div>
              {/* Subtitle Bar */}
              <div className="bg-amber-50/40 py-1.5 text-center border-b border-amber-100">
                <span className="text-slate-500 text-xs font-semibold tracking-wide">fire extinguishers</span>
              </div>
              {/* Columns: Active & Inactive */}
              <div className="grid grid-cols-2 gap-3 p-3 flex-1 bg-white">
                {/* Active Column */}
                <div className="flex flex-col rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] overflow-hidden">
                  <div className="bg-[#D1FAE5] py-2 px-3 text-center border-b border-[#A7F3D0] flex items-center justify-center gap-2 text-[#047857] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                    <span>Active  ·  فعّالة</span>
                  </div>
                  <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={fireExtinguishers.active}
                        onChange={(e) => setFireExtinguishers(prev => ({ ...prev, active: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#047857] bg-white"
                      />
                    ) : (
                      <span className="text-4xl font-black text-[#047857] tracking-tight">{fireExtinguishers.active}</span>
                    )}
                    <span className="text-slate-600 text-xs font-bold text-center mt-2">عدد الطفايات الفعّالة</span>
                  </div>
                </div>

                {/* Inactive Column */}
                <div className="flex flex-col rounded-xl bg-[#FEF2F2] border border-[#FECACA] overflow-hidden">
                  <div className="bg-[#FEE2E2] py-2 px-3 text-center border-b border-[#FECACA] flex items-center justify-center gap-2 text-[#B91C1C] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
                    <span>Inactive  ·  غير فعّالة</span>
                  </div>
                  <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={fireExtinguishers.inactive}
                        onChange={(e) => setFireExtinguishers(prev => ({ ...prev, inactive: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#B91C1C] bg-white"
                      />
                    ) : (
                      <span className="text-4xl font-black text-[#B91C1C] tracking-tight">{fireExtinguishers.inactive}</span>
                    )}
                    <span className="text-slate-600 text-xs font-bold text-center mt-2">عدد الطفايات غير الفعّالة</span>
                  </div>
                </div>
              </div>

              {/* Notes Footer */}
              <div className="bg-[#F8FAFC] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
                <span className="text-slate-900 font-black text-sm">الملاحظات</span>
                {editModes.fireHazards ? (
                  <input
                    type="text"
                    placeholder="أدخل الملاحظات هنا..."
                    value={fireExtinguishers.notes}
                    onChange={(e) => setFireExtinguishers(prev => ({ ...prev, notes: e.target.value }))}
                    className="border border-slate-300 px-2 py-1 text-xs bg-white text-slate-800 rounded w-2/3"
                  />
                ) : (
                  <span className="text-slate-600 text-xs font-bold">{fireExtinguishers.notes}</span>
                )}
              </div>
            </div>

            {/* بطاقة عدد ملاحظات المخاطر */}
            <div className="bg-white rounded-xl border border-rose-200/90 shadow-xs flex flex-col overflow-hidden">
              {/* Header Bar */}
              <div className="bg-gradient-to-l from-[#991B1B] via-[#B91C1C] to-[#DC2626] text-white py-3 px-4 flex items-center justify-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="font-black text-base sm:text-lg">عدد ملاحظات المخاطر</span>
              </div>
              {/* Subtitle Bar */}
              <div className="bg-rose-50/40 py-1.5 text-center border-b border-rose-100">
                <span className="text-slate-500 text-xs font-semibold tracking-wide">risk observations</span>
              </div>
              {/* Columns: Closed & Not closed */}
              <div className="grid grid-cols-2 gap-3 p-3 flex-1 bg-white">
                {/* Closed Column */}
                <div className="flex flex-col rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] overflow-hidden">
                  <div className="bg-[#D1FAE5] py-2 px-3 text-center border-b border-[#A7F3D0] flex items-center justify-center gap-2 text-[#047857] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                    <span>Closed  ·  مغلقة</span>
                  </div>
                  <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={hazardNotes.closed}
                        onChange={(e) => setHazardNotes(prev => ({ ...prev, closed: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#047857] bg-white"
                      />
                    ) : (
                      <span className="text-4xl font-black text-[#047857] tracking-tight">{hazardNotes.closed}</span>
                    )}
                    <span className="text-slate-600 text-xs font-bold text-center mt-2">عدد المخاطر المغلقة</span>
                  </div>
                </div>

                {/* Not Closed Column */}
                <div className="flex flex-col rounded-xl bg-[#FEF2F2] border border-[#FECACA] overflow-hidden">
                  <div className="bg-[#FEE2E2] py-2 px-3 text-center border-b border-[#FECACA] flex items-center justify-center gap-2 text-[#B91C1C] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
                    <span>Not closed  ·  غير مغلقة</span>
                  </div>
                  <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={hazardNotes.notClosed}
                        onChange={(e) => setHazardNotes(prev => ({ ...prev, notClosed: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#B91C1C] bg-white"
                      />
                    ) : (
                      <span className="text-4xl font-black text-[#B91C1C] tracking-tight">{hazardNotes.notClosed}</span>
                    )}
                    <span className="text-slate-600 text-xs font-bold text-center mt-2">عدد المخاطر الغير مغلقة</span>
                  </div>
                </div>
              </div>

              {/* Notes Footer */}
              <div className="bg-[#F8FAFC] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
                <span className="text-slate-900 font-black text-sm">الملاحظات</span>
                {editModes.fireHazards ? (
                  <input
                    type="text"
                    placeholder="أدخل الملاحظات هنا..."
                    value={hazardNotes.notes}
                    onChange={(e) => setHazardNotes(prev => ({ ...prev, notes: e.target.value }))}
                    className="border border-slate-300 px-2 py-1 text-xs bg-white text-slate-800 rounded w-2/3"
                  />
                ) : (
                  <span className="text-slate-600 text-xs font-bold">{hazardNotes.notes}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Maintenance Details */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle title="تفاصيل الصيانة" subtitle="Maintenance Details" icon={<Wrench className="w-6 h-6 text-[#2563EB]" />} iconBg="bg-white border-[#93C5FD]" isEditing={editModes.maintenance} onToggleEdit={() => toggleEdit("maintenance")} onAdd={addMaintenanceSite} addLabel="إضافة موقع / صيانة" />
          <div className="relative bg-white rounded-xl border border-[#BFDBFE]/80 shadow-xs overflow-hidden mt-4">
             <table className="relative z-10 w-full text-xs text-center table-auto">
                <thead>
                  <tr className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white">
                    <th className="py-3 px-1 font-bold whitespace-nowrap">م</th>
                    <th className="py-3 px-2 font-bold text-right whitespace-nowrap">المقرات</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">أعطال عامة</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">أثاث</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">أعمال ديكور</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">إنذار حريق</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">تسريب ماء</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">عطل أبواب</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">عطل إنارة</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">عطل أرضيات</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">عطل تكييف</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">عطل لوحات خارجية</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">عطل كهرباء</th>
                    <th className="py-3 px-1 font-bold whitespace-nowrap">عطل مصاعد</th>
                    {editModes.maintenance ? <th className="py-3 px-1 font-bold whitespace-nowrap w-8"></th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {maintenanceSitesState.map((site, idx) => (
                    <tr key={site.id} className={cn("hover:bg-blue-50/40", idx % 2 === 1 ? "bg-[#F8FBFF]" : "bg-white")}>
                      <td className="py-3 px-1 font-bold">{site.id}</td>
                      <td className="py-3 px-2 text-right font-bold text-[#142A45] whitespace-nowrap"><EditableCell isEditing={editModes.maintenance} value={site.name} onChange={(v) => updateMaintenanceSite(site.id, 'name', v)} className="whitespace-nowrap !min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.general} onChange={(v) => updateMaintenanceSite(site.id, 'general', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.furniture} onChange={(v) => updateMaintenanceSite(site.id, 'furniture', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.decor} onChange={(v) => updateMaintenanceSite(site.id, 'decor', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.fireAlarm} onChange={(v) => updateMaintenanceSite(site.id, 'fireAlarm', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.waterLeak} onChange={(v) => updateMaintenanceSite(site.id, 'waterLeak', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.doors} onChange={(v) => updateMaintenanceSite(site.id, 'doors', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.lighting} onChange={(v) => updateMaintenanceSite(site.id, 'lighting', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.flooring} onChange={(v) => updateMaintenanceSite(site.id, 'flooring', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.ac} onChange={(v) => updateMaintenanceSite(site.id, 'ac', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.outdoorSigns} onChange={(v) => updateMaintenanceSite(site.id, 'outdoorSigns', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.electrical} onChange={(v) => updateMaintenanceSite(site.id, 'electrical', v)} className="!min-w-0" /></td>
                      <td className="py-3 px-1"><EditableCell isEditing={editModes.maintenance} value={site.elevators} onChange={(v) => updateMaintenanceSite(site.id, 'elevators', v)} className="!min-w-0" /></td>
                       {editModes.maintenance ? (
                         <td className="py-3 px-1 text-center">
                           <button onClick={() => deleteMaintenanceSite(site.id)} className="text-rose-500 hover:text-rose-700 p-1">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </td>
                       ) : null}

                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6 items-stretch">
             <div className="lg:col-span-5 relative overflow-hidden bg-white rounded-xl border border-[#BFDBFE]/90 shadow-xs flex flex-col">
                <div className="relative z-10 bg-gradient-to-l from-[#CFE2FA] via-[#E1EEFD] to-[#EFF6FF] text-[#142A45] border-b border-[#BFDBFE] px-4 py-2.5 font-black text-sm flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white border border-amber-200 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-[#D4A447]" />
                    </span>
                    <span>التكلفة المالية</span>
                  </span>
                  <span className="text-[#173B65]/70 text-xs tracking-widest uppercase">Financial Cost</span>
                </div>
                <table className="relative z-10 w-full text-sm flex-1">
                  <thead className="bg-[#142A45] text-white">
                    <tr><th className="py-2 text-right px-4 font-bold w-12">م</th><th className="py-2 text-right px-4 font-bold">الوصف</th><th className="py-2 text-center px-4 font-bold w-32">المبلغ</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">1</td><td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2"><Banknote className="w-4 h-4 text-[#10B981]"/> التكلفة / النثرية</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell isEditing={editModes.maintenance} value={maintenanceServices.costPettyCash} onChange={(v) => setMaintenanceServices(p => ({ ...p, costPettyCash: String(v) }))} /></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">2</td><td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-[#2563EB]"/> التكلفة / أمر شراء</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell isEditing={editModes.maintenance} value={maintenanceServices.costPurchaseOrder} onChange={(v) => setMaintenanceServices(p => ({ ...p, costPurchaseOrder: String(v) }))} /></td></tr>
                    <tr className="bg-[#EEF5FF] text-slate-900 font-bold border-t border-[#BFDBFE]"><td colSpan={3} className="py-2.5 px-4 text-transparent select-none">-</td></tr>
                  </tbody>
                </table>
             </div>
             
             <div className="lg:col-span-5 relative overflow-hidden bg-white rounded-xl border border-[#BFDBFE]/90 shadow-xs flex flex-col">
                <div className="relative z-10 bg-gradient-to-l from-[#CFE2FA] via-[#E1EEFD] to-[#EFF6FF] text-[#142A45] border-b border-[#BFDBFE] px-4 py-2.5 font-black text-sm flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white border border-blue-200 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-[#2563EB]" />
                    </span>
                    <span>خدمات الصيانة</span>
                  </span>
                  <span className="text-[#173B65]/70 text-xs tracking-widest uppercase">Maintenance Services</span>
                </div>
                <table className="relative z-10 w-full text-sm flex-1">
                  <thead className="bg-[#142A45] text-white">
                    <tr><th className="py-2 text-right px-4 font-bold">م</th><th className="py-2 text-right px-4 font-bold">الوصف</th><th className="py-2 text-center px-4 font-bold">عدد الأعطال</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">1</td><td className="py-3 px-4 font-bold text-slate-800">عدد طلبات الصيانة الواردة من قسم المرافق</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell type="number" isEditing={editModes.maintenance} value={maintenanceServices.fromFacilities} onChange={(v) => setMaintenanceServices(p => ({ ...p, fromFacilities: Number(v) }))} /></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">2</td><td className="py-3 px-4 font-bold text-slate-800">عدد طلبات الصيانة الواردة من الإدارات الأخرى</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell type="number" isEditing={editModes.maintenance} value={maintenanceServices.fromOthers} onChange={(v) => setMaintenanceServices(p => ({ ...p, fromOthers: Number(v) }))} /></td></tr>
                    <tr className="bg-[#EEF5FF] text-[#142A45] font-black border-t border-[#BFDBFE]"><td colSpan={2} className="py-2.5 px-4">الإجمالي · Total</td><td className="py-2.5 text-center px-4">{maintenanceServices.fromFacilities + maintenanceServices.fromOthers}</td></tr>
                  </tbody>
                </table>
             </div>

             {/* Dedicated Male Maintenance Technician Visual Frame (No overlap with tables) */}
             <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[#93C5FD] shadow-xs relative min-h-[170px] print:hidden" data-html2canvas-ignore="true">
               <img
                 src={maleMaintenanceEngineerImg}
                 alt="فني صيانة المرافق"
                 className="w-full h-full object-cover object-[35%_20%]"
               />
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#142A45]/90 via-[#142A45]/50 to-transparent p-2.5 text-right">
                 <span className="text-white text-xs font-extrabold block">الصيانة الفنية</span>
                 <span className="text-[#38BDF8] text-[10px] font-bold">أعمال الفحص والتشغيل</span>
               </div>
             </div>
          </div>
        </section>


        {/* Logistics */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle title="الدعم اللوجستي" subtitle="Logistics" icon={<Truck className="w-6 h-6 text-[#10B981]" />} iconBg="bg-white border-emerald-200" isEditing={editModes.logistics} onToggleEdit={() => toggleEdit("logistics")} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-stretch">
            <div className="lg:col-span-9 relative bg-white rounded-xl border border-[#BFDBFE]/80 shadow-xs overflow-hidden flex flex-col justify-center">
              <table className="relative z-10 w-full text-sm text-center">
                 <thead>
                    <tr className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white">
                      <th className="py-3 px-4 font-bold text-right">م</th>
                      <th className="py-3 px-4 font-bold text-right">البيان</th>
                      <th className="py-3 px-4 font-bold">الإجمالي</th>
                      <th className="py-3 px-4 font-bold">المندوب</th>
                      <th className="py-3 px-4 font-bold">بريد الإمارات</th>
                      <th className="py-3 px-4 font-bold">أرامكس</th>
                      <th className="py-3 px-4 font-bold">توزيع</th>
                      <th className="py-3 px-4 font-bold">أخرى</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {computedLogisticsState.map((row) => {
                      const isPercentageRow = row.id === 2;
                      return (
                      <tr key={row.id} className={isPercentageRow ? "bg-[#F4F9FF]" : "bg-white"}>
                         <td className="py-3.5 px-4 text-right text-slate-500 font-bold">{row.id}</td>
                         <td className="py-3.5 px-4 text-right font-bold text-[#142A45] flex items-center gap-2">
                           {isPercentageRow ? <ChartPie className="w-4 h-4 text-[#10B981]" /> : <Truck className="w-4 h-4 text-[#2563EB]" />}
                           <span>{row.label}</span>
                         </td>
                         <td className="py-3.5 px-4 font-black text-[#142A45]">{row.total}</td>
                         <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.rep as string} onChange={(v) => updateLogistics(row.id, 'rep', v)} /></td>
                         <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.emiratesPost as string} onChange={(v) => updateLogistics(row.id, 'emiratesPost', v)} /></td>
                         <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.aramex as string} onChange={(v) => updateLogistics(row.id, 'aramex', v)} /></td>
                         <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.distribution as string} onChange={(v) => updateLogistics(row.id, 'distribution', v)} /></td>
                         <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.other as string} onChange={(v) => updateLogistics(row.id, 'other', v)} /></td>
                      </tr>
                      );
                    })}
                  </tbody>
              </table>
            </div>
            {/* Dedicated Logistics Fleet Visual Frame */}
            <div className="lg:col-span-3 rounded-xl overflow-hidden border border-[#93C5FD] shadow-xs relative min-h-[135px] print:hidden" data-html2canvas-ignore="true">
              <img
                src={logisticsOperationsImg}
                alt="أسطول الدعم اللوجستي"
                className="w-full h-full object-cover object-[75%_42%]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#142A45]/90 via-[#142A45]/45 to-transparent p-2.5 text-right">
                <span className="text-white text-xs font-extrabold block">العمليات اللوجستية</span>
                <span className="text-emerald-300 text-[10px] font-bold">أسطول التوزيع والبريد</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Reception */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle title="خدمات الأمن والاستقبال" subtitle="Security & Reception" icon={<ShieldCheck className="w-6 h-6 text-[#8B5CF6]" />} iconBg="bg-white border-purple-200" isEditing={editModes.security} onToggleEdit={() => toggleEdit("security")} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-stretch">
            <div className="lg:col-span-9 relative bg-white rounded-xl border border-[#BFDBFE]/80 shadow-xs overflow-x-auto flex flex-col justify-center">
               <table className="relative z-10 w-full text-sm text-center">
                 <thead>
                    <tr className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white">
                      <th className="py-3 px-4 font-bold text-right">م</th>
                      <th className="py-3 px-4 font-bold text-right">البيان</th>
                      <th className="py-3 px-4 font-bold">تفعيل البطاقات</th>
                      <th className="py-3 px-4 font-bold">عدد الزوار</th>
                      <th className="py-3 px-4 font-bold">زوار الموردين</th>
                      <th className="py-3 px-4 font-bold">حجز القاعات</th>
                      <th className="py-3 px-4 font-bold">حالات الإخلاء</th>
                      <th className="py-3 px-4 font-bold">تقارير أمنية</th>
                      <th className="py-3 px-4 font-bold text-rose-300">حالات طارئة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {securityState.map((row, idx) => (
                      <tr key={row.id} className={idx === 1 ? "bg-[#F4F9FF]" : "bg-white"}>
                         <td className="py-3.5 px-4 text-right text-slate-500 font-bold">{row.id}</td>
                         <td className="py-3.5 px-4 text-right font-bold text-[#142A45] flex items-center gap-2">
                           {row.id === 1 ? <Shield className="w-4 h-4 text-[#8B5CF6]" /> : <CheckCircle className="w-4 h-4 text-[#10B981]" />}
                           {row.label}
                         </td>
                         <td className="py-3.5 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.cards as string} onChange={(v) => updateSecurity(row.id, 'cards', v)} /></td>
                         <td className="py-3.5 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.visitors as string} onChange={(v) => updateSecurity(row.id, 'visitors', v)} /></td>
                         <td className="py-3.5 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.supplierVisitors as string} onChange={(v) => updateSecurity(row.id, 'supplierVisitors', v)} /></td>
                         <td className="py-3.5 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.meetingRooms as string} onChange={(v) => updateSecurity(row.id, 'meetingRooms', v)} /></td>
                         <td className="py-3.5 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.evacuation as string} onChange={(v) => updateSecurity(row.id, 'evacuation', v)} /></td>
                         <td className="py-3.5 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.securityReports as string} onChange={(v) => updateSecurity(row.id, 'securityReports', v)} /></td>
                         <td className="py-3.5 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.emergencies as string} onChange={(v) => updateSecurity(row.id, 'emergencies', v)} /></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            {/* Dedicated Security CCTV & Building Visual Frame */}
            <div className="lg:col-span-3 rounded-xl overflow-hidden border border-[#93C5FD] shadow-xs relative min-h-[135px] print:hidden" data-html2canvas-ignore="true">
              <img
                src={securityCctvImg}
                alt="أنظمة الأمن والمراقبة"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#142A45]/90 via-[#142A45]/45 to-transparent p-2.5 text-right">
                <span className="text-white text-xs font-extrabold block">الأمن والاستقبال</span>
                <span className="text-purple-200 text-[10px] font-bold">أنظمة المراقبة والتصاريح</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tasks & Challenges */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle
            title="المهام الأخرى"
            subtitle="Other Tasks"
            icon={<CheckCircle className="w-6 h-6 text-[#10B981]" />}
            iconBg="bg-white border-emerald-200"
            isEditing={editModes.tasks}
            onToggleEdit={() => toggleEdit('tasks')}
            onAdd={addTask}
            addLabel="إضافة مهمة"
          />
          <div className="bg-white rounded-xl border border-[#BFDBFE]/80 shadow-xs overflow-hidden mt-4">
            <table className="w-full text-sm">
               <thead>
                  <tr className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white">
                    <th className="py-3 px-4 font-bold text-right">#</th>
                    <th className="py-3 px-4 font-bold text-right">الموضوع</th>
                    <th className="py-3 px-4 font-bold text-right w-1/3">المهمة</th>
                    <th className="py-3 px-4 font-bold text-center">الحالة</th>
                    <th className="py-3 px-4 font-bold text-center">نسبة الإنجاز</th>
                    <th className="py-3 px-4 font-bold text-center">المؤشر</th>
                    {editModes.tasks && <th className="py-3 px-4 font-bold text-center">إجراء</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasksState.map((task, idx) => (
                    <tr key={task.id} className={cn("hover:bg-blue-50/40", idx % 2 === 1 ? "bg-[#F8FBFF]" : "bg-white")}>
                       <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>
                       <td className="py-3 px-4 font-bold text-[#142A45] align-top"><EditableCell isEditing={editModes.tasks} value={task.topic} onChange={(v) => updateTask(task.id, 'topic', v)} multiline className="text-right" /></td>
                       <td className="py-3 px-4 text-slate-600 align-top"><EditableCell isEditing={editModes.tasks} value={task.task} onChange={(v) => updateTask(task.id, 'task', v)} multiline className="text-right" /></td>
                       <td className="py-3 px-4 text-center align-top">
                         {editModes.tasks ? (
                           <select 
                             value={task.status} 
                             onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                             className="border border-slate-300 p-1 text-center bg-white font-bold text-slate-900 w-full"
                           >
                             <option value="مكتمل">مكتمل</option>
                             <option value="مستمرة">مستمرة</option>
                             <option value="متأخرة">متأخرة</option>
                           </select>
                         ) : (
                           <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border", 
                              task.status === 'مكتمل' ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                              task.status === 'متأخرة' ? "text-rose-700 bg-rose-50 border-rose-200" :
                              "text-amber-700 bg-amber-50 border-amber-200"
                           )}
                            >
                             {task.status === 'مكتمل' ? (
                               <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                             ) : task.status === 'متأخرة' ? (
                               <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                             ) : (
                               <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                             )}
                             {task.status}
                           </span>
                         )}
                       </td>
                       <td className="py-3 px-4">
                          <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden relative">
                             <div className="h-full bg-gradient-to-l from-[#059669] to-[#10B981] rounded-full absolute top-0 right-0 transition-all duration-500" style={{ width: `${task.completion}%` }}></div>
                          </div>
                       </td>
                       <td className="py-3 px-4 text-center text-[#10B981] font-black"><EditableCell type="number" isEditing={editModes.tasks} value={task.completion} onChange={(v) => updateTask(task.id, 'completion', Number(v))} className="max-w-[60px] mx-auto" />{editModes.tasks ? '' : '%'}</td>
                       {editModes.tasks && (
                         <td className="py-3 px-4 text-center">
                           <button onClick={() => deleteTask(task.id)} className="text-rose-500 hover:text-rose-700 p-1">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </td>
                       )}
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </section>
        
        {/* Challenges & Recommendations */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
          <SectionTitle
            title="التحديات والتوصيات"
            subtitle="Challenges & Recommendations"
            icon={<Lightbulb className="w-6 h-6 text-[#F59E0B]" />}
            iconBg="bg-white border-amber-200"
            isEditing={editModes.challenges}
            onToggleEdit={() => toggleEdit('challenges')}
            onAdd={addChallenge}
            addLabel="إضافة تحدي"
          />
          <div className="bg-white rounded-xl border border-[#BFDBFE]/80 shadow-xs overflow-hidden mt-4">
            <table className="w-full text-sm">
               <thead>
                  <tr className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white">
                    <th className="py-3 px-4 font-bold text-right">#</th>
                    <th className="py-3 px-4 font-bold text-right w-1/3">
                      <span className="inline-flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#D4A447]" />
                        <span>التحديات والعوائق</span>
                      </span>
                    </th>
                    <th className="py-3 px-4 font-bold text-right w-1/3">
                      <span className="inline-flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 text-[#38BDF8]" />
                        <span>التحديث</span>
                      </span>
                    </th>
                    <th className="py-3 px-4 font-bold text-right w-1/3">
                      <span className="inline-flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-[#10B981]" />
                        <span>التوصية</span>
                      </span>
                    </th>
                    {editModes.challenges && <th className="py-3 px-4 font-bold text-center">إجراء</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 text-center font-bold">
                  {challengesState.map((chal, idx) => (
                    <tr key={chal.id} className={idx % 2 === 1 ? "bg-[#F8FBFF]" : "bg-white"}>
                       <td className="py-4 px-4 text-right">{idx + 1}</td>
                       <td className="py-4 px-4 text-right align-top"><EditableCell isEditing={editModes.challenges} value={chal.challenge} onChange={(v) => updateChallenge(chal.id, 'challenge', v)} multiline className="text-right" /></td>
                       <td className="py-4 px-4 text-right align-top"><EditableCell isEditing={editModes.challenges} value={chal.update} onChange={(v) => updateChallenge(chal.id, 'update', v)} multiline className="text-right" /></td>
                       <td className="py-4 px-4 text-right align-top"><EditableCell isEditing={editModes.challenges} value={chal.recommendation} onChange={(v) => updateChallenge(chal.id, 'recommendation', v)} multiline className="text-right" /></td>
                       {editModes.challenges && (
                         <td className="py-3 px-4 text-center">
                           <button onClick={() => deleteChallenge(chal.id)} className="text-rose-500 hover:text-rose-700 p-1">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </td>
                       )}
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </section>

        {/* Approval Sign-off */}
        <section className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm pb-8">
           <SectionTitle title="الاعتماد" subtitle="Approval & Sign-off" icon={<BadgeCheck className="w-6 h-6 text-[#EF4444]" />} iconBg="bg-white border-rose-200" isEditing={editModes.approvals} onToggleEdit={() => toggleEdit("approvals")} />
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 text-sm items-stretch">
             <div className="lg:col-span-5 bg-gradient-to-b from-[#EFF6FF] to-white rounded-xl border border-[#BFDBFE] p-5 shadow-xs relative overflow-hidden">
               <div className="relative z-10 flex justify-between items-center bg-[#DCEBFC] rounded-lg px-3.5 py-2.5 mb-4 border border-[#93C5FD]/60">
                 <span className="font-black text-[#142A45] text-base">الإعداد <span className="text-[#173B65]/70 font-bold uppercase tracking-widest text-[10px] mr-2">Preparation</span></span>
                 <span className="w-8 h-8 rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center">
                   <Users className="w-4 h-4 text-[#2563EB]" />
                 </span>
               </div>
               <div className="relative z-10 space-y-3.5">
                 <p className="font-black text-[#173B65] mb-4 text-center text-base"><EditableCell isEditing={editModes.approvals} value={approvalsState.preparation.role} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, role: v as string}}))} className="text-center" /></p>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-600">الاسم:</span>
                   <span className="font-black text-[#142A45] border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.preparation.name} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, name: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-600">التاريخ:</span>
                   <span className="border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.preparation.date} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, date: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-600">التوقيع:</span>
                    <span className="border-b border-slate-200 flex-1 pb-1 min-h-[40px] flex items-center">
                     <ImageUploadCell isEditing={editModes.approvals} value={approvalsState.preparation.signature} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, signature: v as string}}))} />
                   </span>
                 </div>
               </div>
             </div>
             
             <div className="lg:col-span-4 bg-gradient-to-b from-[#EFF6FF] to-white rounded-xl border border-[#BFDBFE] p-5 shadow-xs relative overflow-hidden">
               <div className="relative z-10 flex justify-between items-center bg-[#DCEBFC] rounded-lg px-3.5 py-2.5 mb-4 border border-[#93C5FD]/60">
                 <span className="font-black text-[#142A45] text-base">المراجعة والاعتماد <span className="text-[#173B65]/70 font-bold uppercase tracking-widest text-[10px] mr-2">Review & Approval</span></span>
                 <span className="w-8 h-8 rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center">
                   <CheckCircle className="w-4 h-4 text-[#2563EB]" />
                 </span>
               </div>
               <div className="relative z-10 space-y-3.5">
                 <p className="font-black text-[#173B65] mb-4 text-center text-base"><EditableCell isEditing={editModes.approvals} value={approvalsState.review.role} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, role: v as string}}))} className="text-center" /></p>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-600">الاسم:</span>
                   <span className="font-black text-[#142A45] border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.review.name} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, name: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-600">التاريخ:</span>
                   <span className="border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.review.date} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, date: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-600">التوقيع:</span>
                   <span className="border-b border-slate-200 flex-1 pb-1 min-h-[40px] flex items-center">
                     <ImageUploadCell isEditing={editModes.approvals} value={approvalsState.review.signature} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, signature: v as string}}))} />
                   </span>
                 </div>
               </div>
             </div>

             {/* Official Approval Stamp Visual Card (Matching Reference Image Bottom-Left) */}
             <div className="lg:col-span-3 rounded-xl overflow-hidden border border-[#BFDBFE] shadow-xs relative min-h-[190px] print:hidden" data-html2canvas-ignore="true">
               <img
                 src={officialApprovalStampImg}
                 alt="الاعتماد الرسمي"
                 className="w-full h-full object-cover object-center"
               />
               <div className="absolute bottom-3 left-3 w-11 h-11 rounded-full bg-white/95 border-2 border-[#10B981] flex items-center justify-center shadow-md">
                 <CheckCircle className="w-7 h-7 text-[#10B981]" />
               </div>
             </div>
           </div>
           
           <div className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#142A45] text-white rounded-xl text-center py-4 px-6 mt-6 font-bold text-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#38BDF8]" />
                <span className="text-slate-100">هذا التقرير معتمد ومراجع وفقاً للسياسات والإجراءات المعمول بها في قسم إدارة المرافق</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#D4A447] font-black">قسم إدارة المرافق</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-200 uppercase tracking-widest"> التقرير الشهري لإدارة المرافق · Facilities MGT</span>
              </div>
           </div>
        </section>

        {/* Toast Notification */}
        <div
          className={`fixed bottom-6 right-6 md:right-auto md:left-6 z-50 flex items-center gap-2 bg-[#142A45] text-white px-4 py-3 rounded shadow-lg transition-all duration-300 print:hidden ${showToast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}
        >
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">تم حفظ التغييرات بنجاح</span>
        </div>
          </>
        )}
      </main>
    </div>
  );
}

// ----------------- SUB COMPONENTS -----------------

function SectionTitle({ title, subtitle, icon, iconBg, isEditing, onToggleEdit, onAdd, addLabel }: { title: string; subtitle: string; icon?: React.ReactNode; iconBg?: string; isEditing?: boolean; onToggleEdit?: () => void; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex justify-between items-center bg-gradient-to-l from-[#CFE2FA] via-[#E2EEFD] to-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5 mb-4 shadow-2xs">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-black text-[#142A45] flex items-center gap-2.5">
          {icon && (
            <span className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shadow-2xs shrink-0", iconBg || "bg-white border-[#93C5FD]")}>
              {icon}
            </span>
          )}
          <span>{title}</span>
        </h3>
        <span className="text-xs uppercase tracking-widest font-bold text-[#173B65]/65 hidden sm:inline">{subtitle}</span>
      </div>
      <div className="flex items-center gap-2">
        {isEditing && onAdd && (
          <button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors">
            + {addLabel || "إضافة"}
          </button>
        )}
        {onToggleEdit && (
          <button
            onClick={onToggleEdit}
            className="flex items-center gap-2 bg-[#142A45] hover:bg-[#173B65] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-xs"
          >
            {isEditing ? <Save className="w-3.5 h-3.5 text-[#38BDF8]" /> : <Edit2 className="w-3.5 h-3.5 text-[#D4A447]" />}
            {isEditing ? "حفظ التعديلات" : "تعديل البيانات"}
          </button>
        )}
      </div>
    </div>
  );
}


function SummaryCard({
  title,
  subtitle,
  value,
  serviceNameBadge,
  icon,
  borderColor,
  bgGradient,
  iconBadge,
  valueColor,
  barColor,
  trackColor,
  fillWidth,
}: {
  title: string;
  subtitle: string;
  value: React.ReactNode;
  serviceNameBadge?: string;
  icon: React.ReactNode;
  borderColor: string;
  bgGradient?: string;
  iconBadge?: string;
  valueColor?: string;
  barColor?: string;
  trackColor?: string;
  fillWidth: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-white border p-4 shadow-sm flex flex-col justify-between min-h-[140px]", borderColor, bgGradient)}>
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[#142A45] text-sm font-black">{title}</span>
          <span className="text-slate-500 text-[10px] tracking-wider uppercase font-semibold mt-0.5">{subtitle}</span>
        </div>
        <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center shrink-0", iconBadge || "bg-white border-slate-200")}>
           {icon}
        </div>
      </div>
      <div className="relative z-10 mt-2 flex items-baseline justify-between gap-2">
        <span className={cn("text-4xl font-black tracking-tight", valueColor || "text-[#142A45]")}>{value}</span>
        {serviceNameBadge && (
          <span className="text-xs font-black text-[#92400E] bg-amber-100/80 border border-amber-300/70 px-2 py-0.5 rounded-md truncate">{serviceNameBadge}</span>
        )}
      </div>
      <div className={cn("relative z-10 w-full h-2 mt-3 rounded-full overflow-hidden", trackColor || "bg-slate-100")}>
        <div className={cn("h-full rounded-full", barColor || borderColor.replace('border-', 'bg-').replace('border-r', 'bg'))} style={{ width: fillWidth }}></div>
      </div>
    </div>
  );
}

function CustomDonutChart({ percentage, totalExecuted = 0, totalPending = 0 }: { percentage: number; totalExecuted?: number; totalPending?: number }) {
  const radius = 88;
  const strokeWidth = 26;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedPct = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 w-full">
      {/* Right Side (in RTL): 3 Performance Status Indicators Matching Reference */}
      <div className="flex flex-col gap-4 text-right min-w-[165px]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-[4px] bg-[#10B981] shadow-2xs shrink-0"></div>
            <span className="text-base font-black text-[#142A45]">منجز</span>
          </div>
          <span className="text-base font-black text-[#142A45] tabular-nums">({totalExecuted})</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-[4px] bg-[#F59E0B] shadow-2xs shrink-0"></div>
            <span className="text-base font-black text-[#142A45]">قيد التنفيذ</span>
          </div>
          <span className="text-base font-black text-[#142A45] tabular-nums">({totalPending})</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-[4px] bg-[#EF4444] shadow-2xs shrink-0"></div>
            <span className="text-base font-black text-[#142A45]">متأخر</span>
          </div>
          <span className="text-base font-black text-[#142A45] tabular-nums">(0)</span>
        </div>
      </div>

      {/* Center Subtle Vertical Divider Line */}
      <div className="hidden sm:block h-28 w-px bg-[#CBD5E1]/80 shrink-0" aria-hidden="true" />

      {/* Left Side (in RTL): Professional Emerald & Orange Donut Chart */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-[0_2px_6px_rgba(16,185,129,0.15)]">
          {/* Background / Pending Slice (#F59E0B) */}
          <circle
            stroke={totalPending > 0 ? "#F59E0B" : "#E2E8F0"}
            fill="#FFFFFF"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Completed Slice (#10B981) */}
          <motion.circle
            stroke="#10B981"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="butt"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-black text-[#142A45] tracking-tight leading-none"
          >
            {percentage.toFixed(0)}%
          </motion.span>
          <span className="text-xs sm:text-sm font-extrabold text-[#334155] mt-1">نسبة الإنجاز</span>
        </div>
      </div>
    </div>
  );
}

function ContractBlock({ title, subtitle, data, borderColor, textColor, icon, isEditing, onChange }: { title: string; subtitle: string; data: ContractData; borderColor: string; textColor: string; icon: React.ReactNode; isEditing?: boolean; onChange?: (field: "active" | "inactive" | "notes", val: any) => void }) {
  if (!data) return null;
  return (
    <div className={cn("bg-white rounded-xl flex flex-col shadow-xs border border-[#BFDBFE] overflow-hidden")}>
      {/* Corporate Navy-Blue Header Bar (Matching Visual Reference) */}
      <div className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E40AF] text-white py-2.5 px-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-white text-sm font-black">{title}</span>
          <span className="text-blue-200/80 text-[10px] tracking-widest uppercase">{subtitle}</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      {/* Active & Inactive Tinted Metric Boxes */}
      <div className="p-3 grid grid-cols-2 gap-3 flex-1 bg-white">
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span className="text-xs font-black text-[#047857]">فعّالة</span>
          </div>
          {isEditing && onChange ? (
            <input type="number" value={data.active} onChange={(e) => onChange("active", parseInt(e.target.value) || 0)} className="w-full border border-slate-300 p-1 text-center text-xl font-black bg-white mt-1 text-[#047857]" />
          ) : (
            <span className="text-3xl font-black text-[#047857]">{data.active}</span>
          )}
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
            <span className="text-xs font-black text-[#B91C1C]">غير فعّالة</span>
          </div>
          {isEditing && onChange ? (
            <input type="number" value={data.inactive} onChange={(e) => onChange("inactive", parseInt(e.target.value) || 0)} className="w-full border border-slate-300 p-1 text-center text-xl font-black bg-white mt-1 text-[#B91C1C]" />
          ) : (
            <span className="text-3xl font-black text-[#B91C1C]">{data.inactive}</span>
          )}
        </div>
      </div>

      {/* Notes Footer */}
      <div className="bg-[#F8FAFC] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
        <span className="text-slate-900 font-black text-sm">الملاحظات</span>
        {isEditing && onChange ? (
          <input
            type="text"
            placeholder="أدخل الملاحظات هنا..."
            value={data.notes || ""}
            onChange={(e) => onChange("notes", e.target.value)}
            className="border border-slate-300 px-2 py-1 text-xs bg-white text-slate-800 rounded w-2/3"
          />
        ) : (
          <span className="text-slate-600 text-xs font-bold">{data.notes}</span>
        )}
      </div>
    </div>
  );
}

function ImageUploadCell({ isEditing, value, onChange }: { isEditing: boolean, value: string, onChange: (val: string) => void }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full relative min-h-[32px] flex items-center justify-center">
      {value ? (
        <div className="relative group flex items-center justify-center w-full">
          <img src={value} alt="Signature" className="max-h-16 object-contain pointer-events-none" />
          {isEditing && (
            <button onClick={() => onChange('')} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : isEditing ? (
        <div className="w-full">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button onClick={() => fileInputRef.current?.click()} className="text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded w-full flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-3 h-3" />
            إرفاق توقيع
          </button>
        </div>
      ) : null}
    </div>
  );
}
function EditableCell({ isEditing, value, onChange, type = "text", className = "", multiline = false }: { isEditing: boolean, value: string | number, onChange: (val: string) => void, type?: string, className?: string, multiline?: boolean }) {
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full min-w-[120px] min-h-[60px] border border-slate-300 p-2 bg-white font-bold text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right leading-relaxed", className)}
        />
      );
    }
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("w-full min-w-[40px] border border-slate-300 p-1 text-center bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500", className)}
      />
    );
  }
  return (
    <span className={cn(multiline ? "whitespace-pre-wrap break-words block text-right leading-relaxed" : "", className)}>{value}</span>
  );
}
