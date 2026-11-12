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
} from "../types";
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
  ChevronLeft,
  Bell,
  Award,
  User,
  MapPin,
  TrendingUp,
  Database,
} from "lucide-react";
import { ServicesDashboardView } from "./ServicesDashboardView";
import { ApprovedReportsArchive } from "./ApprovedReportsArchive";
import { ReportWorkflowToolbar } from "./ReportWorkflowToolbar";
import { getReportWorkflowStatus } from "../lib/reportsArchive";
import { triggerPrintReport, exportReportToPDF, exportReportToExcelXlsx } from "../lib/exportUtils";
import saaedHeaderUaeBuilding from "../assets/images/saaed_header_uae_building_1794458820411.jpg";
import overallPerfEngineerTablet from "../assets/images/overall_perf_engineer_tablet_1794458819773.jpg";
import achievementsHvacEngineer from "../assets/images/achievements_hvac_engineer_1794458823307.jpg";
import maleMaintenanceEngineerImg from "../assets/images/male_maintenance_engineer_1794426722185.jpg";
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
const defaultApprovals = {
  preparation: { role: "ضابط أول المرافق والأصول", name: "معاذ المصعبي", date: "", signature: "" },
  review: { role: "رئيس قسم إدارة المرافق", name: "فيصل سويد السليماني", date: "", signature: "" },
};

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
  React.useEffect(() => {
    localStorage.setItem(`${key}-${yearMonth}`, JSON.stringify(state));
  }, [state, yearMonth, key]);
  return [state, setState] as const;
}

/** Authentic SAAED (ساعد) Brand Logo Component */
function SaaedLogo({ darkText = true, size = "md" }: { darkText?: boolean; size?: "sm" | "md" }) {
  const isSmall = size === "sm";
  return (
    <div className="inline-flex items-center gap-2.5 select-none" dir="ltr">
      {/* Gold 4-Diamond Geometric Emblem */}
      <svg
        className={isSmall ? "w-8 h-8 shrink-0" : "w-11 h-11 sm:w-12 sm:h-12 shrink-0"}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="saaedGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5C96B" />
            <stop offset="50%" stopColor="#D4A447" />
            <stop offset="100%" stopColor="#9E711B" />
          </linearGradient>
        </defs>
        <g transform="translate(24,24) rotate(45)">
          <rect x="-13" y="-13" width="11" height="11" rx="2" fill="url(#saaedGoldGrad)" />
          <rect x="2" y="-13" width="11" height="11" rx="2" fill="url(#saaedGoldGrad)" />
          <rect x="-13" y="2" width="11" height="11" rx="2" fill="url(#saaedGoldGrad)" />
          <rect x="2" y="2" width="11" height="11" rx="2" fill="url(#saaedGoldGrad)" fillOpacity="0.82" />
        </g>
      </svg>
      <div className="flex flex-col leading-none text-left">
        <span
          className={cn(
            "font-black tracking-tight",
            isSmall ? "text-base" : "text-xl sm:text-2xl",
            darkText ? "text-[#142A45]" : "text-white"
          )}
        >
          ساعد
        </span>
        <span
          className={cn(
            "font-black tracking-[0.14em] uppercase mt-0.5",
            isSmall ? "text-[11px]" : "text-sm sm:text-base",
            darkText ? "text-[#142A45]" : "text-white"
          )}
        >
          SAAED
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"report" | "services" | "approved">("report");
  const [activeNavSection, setActiveNavSection] = useState<string>("home");
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
    approvals: false,
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
    await exportReportToPDF(element, filename, loading => setIsExportingPDF(loading));
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
      alert(
        "التقرير لشهر " +
          monthsList[selectedMonth - 1] +
          " " +
          selectedYear +
          " معتمد رسمياً ومقفل للقراءة فقط.\nلإجراء تعديل، يرجى تقديم 'طلب تصحيح معتمد' من شريط مسار الاعتماد بالأعلى."
      );
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
  const totalPendingRequests = Math.max(0, totalReceived - totalExecuted);
  const overallCompletion = totalReceived === 0 ? 0 : (totalExecuted / totalReceived) * 100;

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => b.received - a.received || b.executed - a.executed),
    [services]
  );
  const topService = sortedServices.length > 0 ? sortedServices[0] : null;

  // Logistics computations
  const logisticsDataRow = logisticsState.find(r => r.id === 1) || logisticsState[0];
  const repCount = Number(logisticsDataRow.rep) || 0;
  const emiratesPostCount = Number(logisticsDataRow.emiratesPost) || 0;
  const aramexCount = Number(logisticsDataRow.aramex) || 0;
  const distributionCount = Number(logisticsDataRow.distribution) || 0;
  const otherCount = Number(logisticsDataRow.other) || 0;
  const logisticsTotal = repCount + emiratesPostCount + aramexCount + distributionCount + otherCount;

  const calcLogisticsPercent = (val: number) => (logisticsTotal > 0 ? ((val / logisticsTotal) * 100).toFixed(1) + "%" : "0.0%");

  const computedLogisticsState = [
    {
      ...logisticsDataRow,
      total: logisticsTotal,
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
    },
  ];

  // Contracts summary counts
  const totalActiveContracts = useMemo(() => contractsState.reduce((acc, c) => acc + (Number(c.active) || 0), 0), [contractsState]);
  const totalInactiveContracts = useMemo(() => contractsState.reduce((acc, c) => acc + (Number(c.inactive) || 0), 0), [contractsState]);
  const totalAllContracts = totalActiveContracts + totalInactiveContracts;

  // Government services count (from s10 or s11)
  const govService = useMemo(() => services.find(s => s.id === "s10") || services[0], [services]);

  // Domain distribution percentages calculated dynamically from actual services
  const domainDistribution = useMemo(() => {
    const baseTotal = totalReceived > 0 ? totalReceived : 1;
    const findSvc = (id: string) => services.find(s => s.id === id)?.received || 0;
    const maintCount = findSvc("s1");
    const logCount = findSvc("s3");
    const hospCount = findSvc("s4") + findSvc("s7");
    const cleanCount = findSvc("s2") + findSvc("s8") + findSvc("s9");
    const govCount = findSvc("s10") + findSvc("s11");
    const othersCount = Math.max(0, totalReceived - (maintCount + logCount + hospCount + cleanCount + govCount));

    if (totalReceived === 0) {
      return [
        { label: "الصيانة", pct: 28, color: "#2563EB" },
        { label: "الدعم اللوجستي", pct: 15, color: "#10B981" },
        { label: "الضيافة والاستقبال", pct: 12, color: "#F59E0B" },
        { label: "النظافة والنفايات", pct: 10, color: "#8B5CF6" },
        { label: "الخدمات الحكومية", pct: 9, color: "#EC4899" },
        { label: "أخرى", pct: 26, color: "#06B6D4" },
      ];
    }

    return [
      { label: "الصيانة", pct: Math.round((maintCount / baseTotal) * 100), color: "#2563EB" },
      { label: "الدعم اللوجستي", pct: Math.round((logCount / baseTotal) * 100), color: "#10B981" },
      { label: "الضيافة والاستقبال", pct: Math.round((hospCount / baseTotal) * 100), color: "#F59E0B" },
      { label: "النظافة والنفايات", pct: Math.round((cleanCount / baseTotal) * 100), color: "#8B5CF6" },
      { label: "الخدمات الحكومية", pct: Math.round((govCount / baseTotal) * 100), color: "#EC4899" },
      { label: "أخرى", pct: Math.round((othersCount / baseTotal) * 100), color: "#06B6D4" },
    ];
  }, [services, totalReceived]);

  // Sites performance list derived from maintenanceSitesState
  const sitesPerformanceList = useMemo(() => {
    const issueFields: (keyof MaintenanceSite)[] = [
      "general",
      "furniture",
      "decor",
      "fireAlarm",
      "waterLeak",
      "doors",
      "lighting",
      "flooring",
      "ac",
      "outdoorSigns",
      "electrical",
      "elevators",
    ];
    return maintenanceSitesState.map((site, index) => {
      const numericIssues = issueFields.reduce((acc, f) => {
        const val = parseInt(String(site[f]), 10);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      const computedPct = numericIssues > 0 ? Math.max(85, Math.min(100, 100 - numericIssues)) : Math.max(92, 100 - index);
      return {
        id: site.id,
        name: site.name,
        pct: computedPct,
      };
    });
  }, [maintenanceSitesState]);

  const handleServiceChange = (id: string, field: "name" | "received" | "executed", value: string | number) => {
    setServices(prev =>
      prev.map(s => {
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
    setServices(prev => [
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
    setContractsState(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const addMaintenanceSite = () => {
    const newId = maintenanceSitesState.length > 0 ? Math.max(...maintenanceSitesState.map(s => s.id)) + 1 : 1;
    setMaintenanceSitesState(prev => [
      ...prev,
      {
        id: newId,
        name: "موقع جديد",
        general: "-",
        furniture: "-",
        decor: "-",
        fireAlarm: "-",
        waterLeak: "-",
        doors: "-",
        lighting: "-",
        flooring: "-",
        ac: "-",
        outdoorSigns: "-",
        electrical: "-",
        elevators: "-",
      },
    ]);
  };
  const deleteMaintenanceSite = (id: number) => {
    setMaintenanceSitesState(prev => prev.filter(s => s.id !== id));
  };

  const updateMaintenanceSite = (id: number, field: keyof MaintenanceSite, value: string) => {
    setMaintenanceSitesState(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const updateLogistics = (id: number, field: keyof LogisticsData, value: string | number) => {
    setLogisticsState(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const updateSecurity = (id: number, field: keyof SecurityData, value: string) => {
    setSecurityState(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const updateTask = (id: number, field: keyof TaskData, value: string | number) => {
    setTasksState(prev => prev.map(t => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const addTask = () => {
    const newId = tasksState.length > 0 ? Math.max(...tasksState.map(t => t.id)) + 1 : 1;
    setTasksState(prev => [...prev, { id: newId, topic: "موضوع جديد", task: "مهمة جديدة", status: "مستمرة", completion: 0 }]);
  };

  const deleteTask = (id: number) => {
    setTasksState(prev => prev.filter(t => t.id !== id));
  };

  const updateChallenge = (id: number, field: keyof ChallengeData, value: string) => {
    setChallengesState(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addChallenge = () => {
    const newId = challengesState.length > 0 ? Math.max(...challengesState.map(c => c.id)) + 1 : 1;
    setChallengesState(prev => [...prev, { id: newId, challenge: "تحدي جديد", update: "تحديث", recommendation: "توصية جديدة" }]);
  };

  const deleteChallenge = (id: number) => {
    setChallengesState(prev => prev.filter(c => c.id !== id));
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
        executed: s.executed,
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
        signature: approvalsState.review.signature || "",
      },
      preparedBy: {
        name: approvalsState.preparation.name || "معاذ المصعبي",
        role: approvalsState.preparation.role || "ضابط أول المرافق والأصول",
        date: approvalsState.preparation.date || "",
        signature: approvalsState.preparation.signature || "",
      },
    };
  };

  const navigateToSection = (tab: "report" | "services" | "approved", sectionId?: string, navKey?: string) => {
    setActiveTab(tab);
    if (navKey) setActiveNavSection(navKey);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  };

  return (
    <div id="dashboard-content" className="min-h-screen bg-[#E9F1FA] text-slate-800 font-sans pb-10" dir="rtl">
      {/* ==================== 1. MANDATORY REFERENCE HEADER ==================== */}
      <header className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(20,42,69,0.18)] border border-[#93C5FD]/90 bg-[#142A45]">
          {/* Top Panoramic Architectural Banner with SAAED Logo, UAE Flag & Corporate Title */}
          <div className="relative min-h-[165px] sm:min-h-[182px] flex flex-col justify-between overflow-hidden">
            {/* Background Scene (Excluded from Print & PDF) */}
            <div className="absolute inset-0 pointer-events-none z-0 print:hidden" data-html2canvas-ignore="true">
              {/* Left-to-Center Panoramic Building & UAE Flag Photo */}
              <div className="absolute inset-y-0 left-0 w-full lg:w-[68%] overflow-hidden">
                <img
                  src={saaedHeaderUaeBuilding}
                  alt=""
                  className="w-full h-full object-cover contrast-[1.05] saturate-[1.06]"
                  style={{ objectPosition: "52% 38%" }}
                />
                {/* Soft sky blend on far top-left so SAAED logo is 100% legible */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.22) 24%, transparent 52%)",
                  }}
                />
              </div>

              {/* Right-Side Geometric Navy, Royal Blue & Gold Diagonal/Curved Overlay */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="hdrNavyMain" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F2547" />
                    <stop offset="55%" stopColor="#142A45" />
                    <stop offset="100%" stopColor="#0B192E" />
                  </linearGradient>
                  <linearGradient id="hdrBlueBand" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                  <linearGradient id="hdrGoldRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F7D070" />
                    <stop offset="50%" stopColor="#D4A447" />
                    <stop offset="100%" stopColor="#9A6F1A" />
                  </linearGradient>
                </defs>
                {/* Outer Translucent Sky-Blue Geometric Wing */}
                <path d="M655,0 L1200,0 L1200,200 L535,200 Z" fill="#38BDF8" fillOpacity="0.22" />
                {/* Gold Diagonal Accent Ribbon */}
                <path d="M682,0 L702,0 L582,200 L562,200 Z" fill="url(#hdrGoldRibbon)" />
                {/* Royal Blue Geometric Band */}
                <path d="M700,0 L760,0 L640,200 L580,200 Z" fill="url(#hdrBlueBand)" fillOpacity="0.88" />
                {/* Main Deep Corporate Navy Right Surface */}
                <path d="M742,0 L1200,0 L1200,200 L618,200 Z" fill="url(#hdrNavyMain)" />
                {/* Subtle Gold Corner Accent Line */}
                <path d="M742,0 L746,0 L622,200 L618,200 Z" fill="#D4A447" fillOpacity="0.85" />
              </svg>
            </div>

            {/* Top Row inside Banner: Right User Profile & Notification Bell | Left SAAED Logo */}
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-3">
              {/* Top-Right User & Notification Bar */}
              <div className="flex items-center gap-3 bg-[#0B1E38]/80 border border-[#38BDF8]/30 rounded-full px-3.5 py-1.5 backdrop-blur-xs shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#38BDF8] to-[#2563EB] border border-white/80 flex items-center justify-center text-white shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-white text-xs sm:text-sm font-black">
                    {approvalsState.review.name || "فيصل سويد السليماني"}
                  </span>
                  <span className="text-[#93C5FD] text-[10px] font-bold">
                    {approvalsState.review.role || "رئيس قسم إدارة المرافق"}
                  </span>
                </div>
                <span className="h-5 w-px bg-white/20 mx-1" />
                <button
                  type="button"
                  onClick={() => navigateToSection("report", "challenges-section", "records")}
                  className="relative p-1 text-white hover:text-[#F5C96B] transition-colors cursor-pointer"
                  title="التحديات والتوصيات"
                >
                  <Bell className="w-5 h-5 fill-white/90" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-black flex items-center justify-center border border-white">
                    {challengesState.length || 3}
                  </span>
                </button>
              </div>

              {/* Top-Left Authentic SAAED Logo */}
              <div className="bg-white/85 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/80 shadow-xs">
                <SaaedLogo darkText={true} size="md" />
              </div>
            </div>

            {/* Bottom Row inside Banner: Main Arabic & English Report Title + Gold Facilities Emblem */}
            <div className="relative z-10 flex items-end justify-start px-4 sm:px-7 pb-4 pt-2">
              <div className="flex items-center gap-3.5">
                {/* Gold Facilities & Gear Emblem on the Right */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173B65] to-[#0B1E38] border-2 border-[#D4A447] shadow-[0_4px_14px_rgba(212,164,71,0.3)] flex items-center justify-center shrink-0">
                  <div className="relative flex items-center justify-center">
                    <Settings className="w-8 h-8 text-[#D4A447] animate-[spin_25s_linear_infinite]" />
                    <Building2 className="w-5 h-5 text-white absolute" />
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-white tracking-tight leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
                    {activeTab === "report"
                      ? "التقرير الشهري لقسم إدارة المرافق"
                      : activeTab === "services"
                      ? "لوحة تحكم وتحليلات الخدمات"
                      : "أرشيف التقارير الشهرية المعتمدة"}
                  </h1>
                  <span className="text-[#DCEBFE] text-xs sm:text-sm font-semibold tracking-wide mt-0.5">
                    Facilities Management Monthly Report
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Dark-Navy Navigation Bar Matching Reference Image */}
          <nav
            aria-label="التنقل الرئيسي"
            className="bg-gradient-to-l from-[#102542] via-[#142A45] to-[#0F223C] border-t border-[#38BDF8]/25 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-center gap-2 print:hidden"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigateToSection("report", undefined, "home")}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer",
                  activeTab === "report"
                    ? "bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE] text-[#142A45] shadow-sm border border-white"
                    : "text-slate-100 hover:bg-white/10"
                )}
              >
                <Home className={cn("w-4 h-4", activeTab === "report" ? "text-[#1D4ED8]" : "text-[#38BDF8]")} />
                <span>الرئيسية</span>
              </button>

              <span className="h-4 w-px bg-white/15 hidden sm:inline" />

              <button
                type="button"
                onClick={() => navigateToSection("approved", undefined, "approved")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer",
                  activeTab === "approved"
                    ? "bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE] text-[#142A45] shadow-sm border border-white"
                    : "text-slate-100 hover:bg-white/10"
                )}
              >
                <FileText className="w-4 h-4 text-[#10B981]" />
                <span>التقارير المعتمدة</span>
              </button>

              <span className="h-4 w-px bg-white/15 hidden sm:inline" />

              <button
                type="button"
                onClick={() => navigateToSection("services", undefined, "services")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer",
                  activeTab === "services"
                    ? "bg-gradient-to-b from-[#EFF6FF] to-[#DBEAFE] text-[#142A45] shadow-sm border border-white"
                    : "text-slate-100 hover:bg-white/10"
                )}
              >
                <FileBarChart className="w-4 h-4 text-[#F59E0B]" />
                <span>التحليلات وجميع الخدمات</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ==================== 2. REPORT CONTROL BAR BELOW HEADER ==================== */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4">
        <div className="bg-gradient-to-l from-[#DCEBFE] via-[#EDF4FF] to-[#DCEBFE] border border-[#BFDBFE] rounded-2xl px-4 sm:px-6 py-3 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Right: Report Title & Calendar Icon */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#93C5FD] shadow-2xs flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-[#142A45]" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-base sm:text-lg font-black text-[#142A45] leading-tight">
                التقرير الشهري لإدارة المرافق
              </span>
              <span className="text-xs font-bold text-slate-600 mt-0.5">
                ملخص الأداء التشغيلي والخدمي · {monthsList[selectedMonth - 1]} {selectedYear}
              </span>
            </div>
          </div>

          {/* Center: Month & Year Selector Boxes Matching Reference */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {/* Month Box */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#142A45]">الشهر</span>
              <div className="relative flex items-center bg-white border border-[#93C5FD] rounded-xl px-3 py-1.5 min-w-[140px] shadow-2xs">
                <Calendar className="w-4 h-4 text-[#173B65] ml-2 pointer-events-none shrink-0" />
                <select
                  aria-label="الشهر"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="appearance-none bg-transparent text-[#142A45] font-black text-sm w-full pr-1 pl-5 cursor-pointer focus:outline-none text-center"
                >
                  {monthsList.map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#173B65] absolute left-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Year Box */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#142A45]">السنة</span>
              <div className="relative flex items-center bg-white border border-[#93C5FD] rounded-xl px-3 py-1.5 min-w-[125px] shadow-2xs">
                <Calendar className="w-4 h-4 text-[#173B65] ml-2 pointer-events-none shrink-0" />
                <select
                  aria-label="السنة"
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="appearance-none bg-transparent text-[#142A45] font-black text-sm w-full pr-1 pl-5 cursor-pointer focus:outline-none text-center"
                >
                  {yearsList.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#173B65] absolute left-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Left: Print & Export Report Buttons Matching Reference */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 print:hidden" data-html2canvas-ignore="true">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] hover:from-white hover:to-[#CBD5E1] text-[#142A45] border border-[#94A3B8] px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              title="طباعة التقرير الشهري A4"
            >
              <Printer className="w-4 h-4 text-[#142A45]" />
              <span>طباعة</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="bg-gradient-to-b from-[#E5B85B] via-[#D4A447] to-[#B8862D] hover:from-[#F0C76E] hover:to-[#C99738] disabled:opacity-50 text-[#142A45] border border-[#9E711B] px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="تصدير ملف PDF عالي الدقة مقاس A4"
            >
              <Download className="w-4 h-4 text-[#142A45]" />
              <span>{isExportingPDF ? "جاري التصدير..." : "تصدير التقرير"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="bg-[#142A45] hover:bg-[#173B65] disabled:opacity-50 text-white border border-[#38BDF8]/40 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="تصدير ملف Excel منسق (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
              <span>{isExportingExcel ? "جاري التصدير..." : "Excel"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-5 space-y-6">
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
            {/* Existing Workflow & Approval Status Bar (Preserved 100%) */}
            <ReportWorkflowToolbar
              yearMonth={yearMonth}
              year={selectedYear}
              month={selectedMonth}
              monthName={monthsList[selectedMonth - 1]}
              onGoToArchive={() => setActiveTab("approved")}
              getReportSnapshotData={getReportSnapshotData}
              onStatusChange={status => setCurrentMonthStatus(status)}
            />

            {/* ==================== 3. FOUR EXECUTIVE KPI CARDS ==================== */}
            <section aria-label="بطاقات المؤشرات الرئيسية" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 (Right): Green — نسبة الإنجاز */}
              <SummaryCard
                title="نسبة الإنجاز"
                subtitle="Completion Rate"
                value={`${overallCompletion.toFixed(1)}%`}
                icon={<ChartNoAxesCombined className="w-7 h-7 text-white" />}
                circleBg="bg-gradient-to-br from-[#10B981] to-[#059669]"
                cardBg="bg-gradient-to-br from-[#ECFDF5] via-[#F2FDF9] to-[#D1FAE5]"
                borderColor="border-[#A7F3D0]"
                valueColor="text-[#047857]"
                trendColor="text-[#10B981]"
                barColor="bg-gradient-to-l from-[#059669] to-[#10B981]"
                trackColor="bg-[#10B981]/20"
                fillWidth={`${Math.min(100, overallCompletion)}%`}
              />

              {/* Card 2: Blue — الطلبات قيد التنفيذ / إجمالي الخدمات */}
              <SummaryCard
                title="الطلبات قيد التنفيذ"
                subtitle={`In Progress · (${services.length} خدمة)`}
                value={totalPendingRequests > 0 ? totalPendingRequests : services.length}
                icon={<ClipboardList className="w-7 h-7 text-white" />}
                circleBg="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]"
                cardBg="bg-gradient-to-br from-[#EFF6FF] via-[#F5F9FF] to-[#DBEAFE]"
                borderColor="border-[#BFDBFE]"
                valueColor="text-[#1E3A8A]"
                trendColor="text-[#2563EB]"
                barColor="bg-gradient-to-l from-[#1D4ED8] to-[#38BDF8]"
                trackColor="bg-[#2563EB]/20"
                fillWidth="78%"
              />

              {/* Card 3: Gold — الطلبات المنجزة / أعلى خدمة */}
              <SummaryCard
                title="الطلبات المنجزة"
                subtitle="Completed Requests"
                value={totalExecuted}
                serviceNameBadge={topService ? `الأعلى: ${topService.name} (${topService.received})` : undefined}
                icon={<Wrench className="w-7 h-7 text-white" />}
                circleBg="bg-gradient-to-br from-[#D97706] to-[#B45309]"
                cardBg="bg-gradient-to-br from-[#FFFBEB] via-[#FEF9E7] to-[#FDE68A]/75"
                borderColor="border-[#FDE68A]"
                valueColor="text-[#78350F]"
                trendColor="text-[#D97706]"
                barColor="bg-gradient-to-l from-[#B45309] to-[#F59E0B]"
                trackColor="bg-[#D97706]/20"
                fillWidth={`${Math.min(100, overallCompletion)}%`}
              />

              {/* Card 4 (Left): Purple — إجمالي الطلبات */}
              <SummaryCard
                title="إجمالي الطلبات"
                subtitle="Total Requests"
                value={totalReceived}
                icon={<ClipboardCheck className="w-7 h-7 text-white" />}
                circleBg="bg-gradient-to-br from-[#6366F1] to-[#4338CA]"
                cardBg="bg-gradient-to-br from-[#EEF2FF] via-[#F5F7FF] to-[#E0E7FF]"
                borderColor="border-[#C7D2FE]"
                valueColor="text-[#1E1B4B]"
                trendColor="text-[#6366F1]"
                barColor="bg-gradient-to-l from-[#4338CA] to-[#818CF8]"
                trackColor="bg-[#6366F1]/20"
                fillWidth="100%"
              />
            </section>

            {/* ==================== 4. OPERATIONAL SERVICES PERFORMANCE ANALYSIS + OVERALL DEPARTMENT PERFORMANCE ==================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Right Panel (7 cols): تحليل أداء الخدمات التشغيلية (Operational Services Performance Analysis) */}
              <div className="lg:col-span-7 bg-gradient-to-b from-white via-[#F8FBFF] to-[#EEF5FF] rounded-2xl border border-[#BFDBFE] shadow-[0_6px_22px_rgba(20,42,69,0.06)] flex flex-col overflow-hidden">
                <div className="bg-gradient-to-l from-[#DCEBFE] via-[#EAF3FF] to-[#F5F9FF] border-b border-[#BFDBFE] px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white border border-[#93C5FD] flex items-center justify-center shadow-2xs shrink-0">
                      <ChartNoAxesCombined className="w-5 h-5 text-[#2563EB]" />
                    </span>
                    <div className="flex flex-col text-right">
                      <span className="text-base sm:text-lg font-black text-[#142A45] leading-tight">
                        تحليل أداء الخدمات التشغيلية
                      </span>
                      <span className="text-[11px] font-bold text-[#173B65]/75">
                        Operational Services Performance Analysis
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToSection("report", "kpi-table-section", "kpis")}
                    className="w-9 h-9 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    title="الانتقال إلى جدول مؤشرات الأداء التشغيلية"
                  >
                    <Target className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-l from-[#CFE2FA]/90 via-[#DEEBFD]/90 to-[#CFE2FA]/90 text-[#142A45] border-y border-[#93C5FD]">
                        <th className="py-2.5 px-2.5 text-center font-black w-16">الترتيب</th>
                        <th className="py-2.5 px-3 text-right font-black">الخدمة التشغيلية</th>
                        <th className="py-2.5 px-3 text-left font-black w-56 sm:w-72">نسبة الإنجاز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCEBFE]">
                      {sortedServices.map((s, idx) => {
                        const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                        const isExcellent = ratio >= 95;
                        const isGood = ratio >= 80 && ratio < 95;

                        return (
                          <tr
                            key={s.id}
                            className={cn(
                              "hover:bg-[#E6F1FE]/70 transition-colors",
                              idx % 2 === 1 ? "bg-[#F2F7FE]" : "bg-white/90"
                            )}
                          >
                            {/* عمود الترتيب */}
                            <td className="py-2 px-2.5 text-center">
                              <span className="w-6 h-6 rounded-full bg-gradient-to-b from-[#E0EEFF] to-[#C7DFFB] border border-[#93C5FD] text-[#142A45] font-black text-xs inline-flex items-center justify-center shadow-2xs tabular-nums">
                                {idx + 1}
                              </span>
                            </td>

                            {/* عمود الخدمة التشغيلية */}
                            <td className="py-2 px-3 font-extrabold text-right">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0 shadow-2xs">
                                  <s.icon className={cn("w-4 h-4", getServiceIconColor(s.id))} />
                                </span>
                                <span className="text-[#142A45] font-extrabold truncate">{s.name}</span>
                              </div>
                            </td>

                            {/* عمود نسبة الإنجاز */}
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2.5 bg-slate-200/90 rounded-full overflow-hidden relative">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(ratio, 100)}%` }}
                                    transition={{ duration: 0.7 }}
                                    className={cn(
                                      "absolute inset-y-0 right-0 rounded-full",
                                      isExcellent
                                        ? "bg-gradient-to-l from-[#059669] to-[#10B981]"
                                        : isGood
                                        ? "bg-gradient-to-l from-[#D97706] to-[#F59E0B]"
                                        : "bg-gradient-to-l from-[#DC2626] to-[#EF4444]"
                                    )}
                                  />
                                </div>
                                <span className="w-12 text-left font-black text-xs sm:text-sm text-[#142A45] tabular-nums">
                                  {ratio === 100 ? "100%" : `${ratio.toFixed(1)}%`}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Left Panel (5 cols): الأداء العام للقسم (Overall Department Performance) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#BFDBFE] shadow-[0_6px_22px_rgba(20,42,69,0.06)] flex flex-col overflow-hidden relative">
                <div className="bg-gradient-to-l from-[#DCEBFE] via-[#EAF3FF] to-[#F5F9FF] border-b border-[#BFDBFE] px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#173B65] text-white flex items-center justify-center shadow-2xs shrink-0">
                      <ChartPie className="w-5 h-5 text-[#38BDF8]" />
                    </span>
                    <div className="flex flex-col text-right">
                      <span className="text-base sm:text-lg font-black text-[#142A45] leading-tight">
                        الأداء العام للقسم
                      </span>
                      <span className="text-[11px] font-bold text-[#173B65]/75">Overall Department Performance</span>
                    </div>
                  </div>
                  <span className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                    <ChartNoAxesCombined className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between bg-white relative">
                  <div className="relative z-10 pt-4 pb-1 px-4 flex items-center justify-center">
                    <CustomDonutChart
                      percentage={overallCompletion}
                      totalExecuted={totalExecuted}
                      totalPending={totalPendingRequests}
                    />
                  </div>

                  {/* Lower Photographic Scene: Glass Office Building + Male SAAED Engineer with Tablet */}
                  <div
                    className="relative w-full h-44 sm:h-48 mt-auto overflow-hidden pointer-events-none select-none print:hidden"
                    data-html2canvas-ignore="true"
                  >
                    <img
                      src={overallPerfEngineerTablet}
                      alt=""
                      className="w-full h-full object-cover contrast-[1.04]"
                      style={{ objectPosition: "50% 35%" }}
                    />
                    <div
                      className="absolute top-0 inset-x-0 h-9"
                      style={{
                        background:
                          "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ==================== 5. OPERATIONAL KPI TABLE (مؤشرات الأداء التشغيلية) ==================== */}
            <section
              id="kpi-table-section"
              className="bg-white rounded-2xl border border-[#BFDBFE] shadow-[0_6px_22px_rgba(20,42,69,0.06)] overflow-hidden"
            >
              {/* Header Bar Matching Reference */}
              <div className="bg-gradient-to-l from-[#DCEBFE] via-[#EAF3FF] to-[#F5F9FF] border-b border-[#BFDBFE] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs shrink-0">
                    <ListChecks className="w-5 h-5" />
                  </span>
                  <div className="flex flex-col text-right">
                    <h2 className="text-lg sm:text-xl font-black text-[#142A45] leading-tight">
                      مؤشرات الأداء التشغيلية
                    </h2>
                    <span className="text-[11px] font-bold text-[#173B65]/75">
                      Operational Performance Indicators
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  {editModes.services && (
                    <button
                      type="button"
                      onClick={addService}
                      className="bg-[#10B981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs transition-colors cursor-pointer"
                    >
                      + إضافة خدمة
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleEdit("services")}
                    className="bg-white hover:bg-blue-50 text-[#142A45] border border-[#93C5FD] px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    {editModes.services ? (
                      <>
                        <Save className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>حفظ التعديلات</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>تعديل البيانات</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToSection("services", undefined, "services")}
                    className="bg-[#142A45] hover:bg-[#173B65] text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-[#38BDF8]" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-l from-[#CFE2FA] via-[#DEEBFD] to-[#CFE2FA] text-[#142A45] border-y border-[#93C5FD]">
                      <th className="py-3 px-3 text-center font-black w-12">م</th>
                      <th className="py-3 px-4 text-right font-black">المؤشر</th>
                      <th className="py-3 px-4 text-center font-black">المستهدف</th>
                      <th className="py-3 px-4 text-center font-black">المتحقق</th>
                      <th className="py-3 px-4 text-center font-black w-56">نسبة الإنجاز</th>
                      <th className="py-3 px-4 text-center font-black w-32">حالة الأداء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {services.map((s, idx) => {
                      const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                      const isExcellent = ratio >= 95;
                      const isGood = ratio >= 85 && ratio < 95;
                      const statusLabel = isExcellent ? "ممتاز" : isGood ? "جيد" : "متأخر";

                      return (
                        <tr
                          key={s.id}
                          className={cn(
                            "hover:bg-blue-50/50 transition-colors",
                            idx % 2 === 1 ? "bg-[#F5F9FF]" : "bg-white"
                          )}
                        >
                          <td className="py-2.5 px-3 text-center font-black text-[#142A45] border-l border-slate-200/60">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4 font-extrabold border-l border-slate-200/60">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                                <s.icon className={cn("w-4 h-4", getServiceIconColor(s.id))} />
                              </span>
                              {editModes.services ? (
                                <input
                                  type="text"
                                  value={s.name}
                                  onChange={e => handleServiceChange(s.id, "name", e.target.value)}
                                  className="w-full border border-slate-300 px-2 py-1 rounded bg-white font-bold text-[#142A45]"
                                />
                              ) : (
                                <span className="text-[#142A45] font-extrabold">{s.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center font-black text-[#142A45] border-l border-slate-200/60 tabular-nums">
                            {editModes.services ? (
                              <input
                                type="number"
                                value={s.received}
                                onChange={e => handleServiceChange(s.id, "received", parseInt(e.target.value) || 0)}
                                className="w-20 border border-slate-300 text-center p-1 rounded bg-white font-black"
                              />
                            ) : (
                              s.received
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center font-black text-[#142A45] border-l border-slate-200/60 tabular-nums">
                            {editModes.services ? (
                              <input
                                type="number"
                                value={s.executed}
                                onChange={e => handleServiceChange(s.id, "executed", parseInt(e.target.value) || 0)}
                                className="w-20 border border-slate-300 text-center p-1 rounded bg-white font-black"
                              />
                            ) : (
                              s.executed
                            )}
                          </td>
                          <td className="py-2.5 px-4 border-l border-slate-200/60">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(ratio, 100)}%` }}
                                  className={cn(
                                    "absolute inset-y-0 right-0 rounded-full",
                                    isExcellent
                                      ? "bg-gradient-to-l from-[#059669] to-[#10B981]"
                                      : isGood
                                      ? "bg-gradient-to-l from-[#D97706] to-[#F59E0B]"
                                      : "bg-gradient-to-l from-[#DC2626] to-[#EF4444]"
                                  )}
                                />
                              </div>
                              <span className="w-12 text-left font-black text-xs sm:text-sm text-[#142A45] tabular-nums">
                                {ratio.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border w-24",
                                isExcellent
                                  ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                                  : isGood
                                  ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                                  : "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]"
                              )}
                            >
                              <CheckCircle
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0",
                                  isExcellent ? "text-[#10B981]" : isGood ? "text-[#F59E0B]" : "text-[#EF4444]"
                                )}
                              />
                              <span>{statusLabel}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total Row */}
                    <tr className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white font-black">
                      <td colSpan={2} className="py-3 px-4 text-right">
                        الإجمالي العام · Total Summary
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums">{totalReceived}</td>
                      <td className="py-3 px-4 text-center tabular-nums">{totalExecuted}</td>
                      <td className="py-3 px-4 text-center tabular-nums">{overallCompletion.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs">
                          معتمد
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ==================== 8. DETAILED EDITABLE RECORDS & TABLES (100% PRESERVED) ==================== */}
            <div id="detailed-records-section" className="space-y-6 pt-2">
              {/* Contracts & Licenses */}
              <section id="contracts-section" className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
                <SectionTitle
                  title="العقود والرخص"
                  subtitle="Contracts & Licenses"
                  icon={<FileCheck className="w-6 h-6 text-[#2563EB]" />}
                  iconBg="bg-white border-[#93C5FD]"
                  isEditing={editModes.contracts}
                  onToggleEdit={() => toggleEdit("contracts")}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <ContractBlock
                    title="العقود الإيجارية"
                    subtitle="Rental Contracts"
                    data={contractsState[0]}
                    borderColor="border-[#10B981]"
                    textColor="text-[#059669]"
                    icon={<Home className="w-5 h-5 text-[#38BDF8]" />}
                    isEditing={editModes.contracts}
                    onChange={(f, v) => updateContract(0, f, v)}
                  />
                  <ContractBlock
                    title="الرخص التجارية"
                    subtitle="Commercial Licenses"
                    data={contractsState[1]}
                    borderColor="border-[#2563EB]"
                    textColor="text-[#059669]"
                    icon={<ClipboardCheck className="w-5 h-5 text-[#38BDF8]" />}
                    isEditing={editModes.contracts}
                    onChange={(f, v) => updateContract(1, f, v)}
                  />
                  <ContractBlock
                    title="عقود الخدمات"
                    subtitle="Service Contracts"
                    data={contractsState[2]}
                    borderColor="border-[#142A45]"
                    textColor="text-[#059669]"
                    icon={<Layers className="w-5 h-5 text-[#38BDF8]" />}
                    isEditing={editModes.contracts}
                    onChange={(f, v) => updateContract(2, f, v)}
                  />
                </div>
              </section>

              {/* Fire Extinguishers and Hazard Notes */}
              <section id="fire-hazards-section" className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
                <SectionTitle
                  title="الطفايات وملاحظات المخاطر"
                  subtitle="Fire Extinguishers and Hazard Notes"
                  icon={<FireExtinguisher className="w-6 h-6 text-[#EF4444]" />}
                  iconBg="bg-white border-rose-200"
                  isEditing={editModes.fireHazards}
                  onToggleEdit={() => toggleEdit("fireHazards")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* بطاقة عدد الطفايات */}
                  <div className="bg-white rounded-xl border border-amber-200/90 shadow-xs flex flex-col overflow-hidden">
                    <div className="bg-gradient-to-l from-[#B48225] via-[#C99738] to-[#D4A447] text-white py-3 px-4 flex items-center justify-center gap-2">
                      <FireExtinguisher className="w-5 h-5 text-white" />
                      <span className="font-black text-base sm:text-lg">عدد الطفايات</span>
                    </div>
                    <div className="bg-amber-50/40 py-1.5 text-center border-b border-amber-100">
                      <span className="text-slate-500 text-xs font-semibold tracking-wide">fire extinguishers</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-3 flex-1 bg-white">
                      <div className="flex flex-col rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] overflow-hidden">
                        <div className="bg-[#D1FAE5] py-2 px-3 text-center border-b border-[#A7F3D0] flex items-center justify-center gap-2 text-[#047857] font-bold text-xs sm:text-sm">
                          <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                          <span>Active · فعّالة</span>
                        </div>
                        <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                          {editModes.fireHazards ? (
                            <input
                              type="number"
                              value={fireExtinguishers.active}
                              onChange={e =>
                                setFireExtinguishers(prev => ({ ...prev, active: parseInt(e.target.value) || 0 }))
                              }
                              className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#047857] bg-white"
                            />
                          ) : (
                            <span className="text-4xl font-black text-[#047857] tracking-tight">
                              {fireExtinguishers.active}
                            </span>
                          )}
                          <span className="text-slate-600 text-xs font-bold text-center mt-2">عدد الطفايات الفعّالة</span>
                        </div>
                      </div>

                      <div className="flex flex-col rounded-xl bg-[#FEF2F2] border border-[#FECACA] overflow-hidden">
                        <div className="bg-[#FEE2E2] py-2 px-3 text-center border-b border-[#FECACA] flex items-center justify-center gap-2 text-[#B91C1C] font-bold text-xs sm:text-sm">
                          <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
                          <span>Inactive · غير فعّالة</span>
                        </div>
                        <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                          {editModes.fireHazards ? (
                            <input
                              type="number"
                              value={fireExtinguishers.inactive}
                              onChange={e =>
                                setFireExtinguishers(prev => ({ ...prev, inactive: parseInt(e.target.value) || 0 }))
                              }
                              className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#B91C1C] bg-white"
                            />
                          ) : (
                            <span className="text-4xl font-black text-[#B91C1C] tracking-tight">
                              {fireExtinguishers.inactive}
                            </span>
                          )}
                          <span className="text-slate-600 text-xs font-bold text-center mt-2">
                            عدد الطفايات غير الفعّالة
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
                      <span className="text-slate-900 font-black text-sm">الملاحظات</span>
                      {editModes.fireHazards ? (
                        <input
                          type="text"
                          placeholder="أدخل الملاحظات هنا..."
                          value={fireExtinguishers.notes}
                          onChange={e => setFireExtinguishers(prev => ({ ...prev, notes: e.target.value }))}
                          className="border border-slate-300 px-2 py-1 text-xs bg-white text-slate-800 rounded w-2/3"
                        />
                      ) : (
                        <span className="text-slate-600 text-xs font-bold">{fireExtinguishers.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* بطاقة عدد ملاحظات المخاطر */}
                  <div className="bg-white rounded-xl border border-rose-200/90 shadow-xs flex flex-col overflow-hidden">
                    <div className="bg-gradient-to-l from-[#991B1B] via-[#B91C1C] to-[#DC2626] text-white py-3 px-4 flex items-center justify-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-white" />
                      <span className="font-black text-base sm:text-lg">عدد ملاحظات المخاطر</span>
                    </div>
                    <div className="bg-rose-50/40 py-1.5 text-center border-b border-rose-100">
                      <span className="text-slate-500 text-xs font-semibold tracking-wide">risk observations</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-3 flex-1 bg-white">
                      <div className="flex flex-col rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] overflow-hidden">
                        <div className="bg-[#D1FAE5] py-2 px-3 text-center border-b border-[#A7F3D0] flex items-center justify-center gap-2 text-[#047857] font-bold text-xs sm:text-sm">
                          <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                          <span>Closed · مغلقة</span>
                        </div>
                        <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                          {editModes.fireHazards ? (
                            <input
                              type="number"
                              value={hazardNotes.closed}
                              onChange={e =>
                                setHazardNotes(prev => ({ ...prev, closed: parseInt(e.target.value) || 0 }))
                              }
                              className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#047857] bg-white"
                            />
                          ) : (
                            <span className="text-4xl font-black text-[#047857] tracking-tight">
                              {hazardNotes.closed}
                            </span>
                          )}
                          <span className="text-slate-600 text-xs font-bold text-center mt-2">عدد المخاطر المغلقة</span>
                        </div>
                      </div>

                      <div className="flex flex-col rounded-xl bg-[#FEF2F2] border border-[#FECACA] overflow-hidden">
                        <div className="bg-[#FEE2E2] py-2 px-3 text-center border-b border-[#FECACA] flex items-center justify-center gap-2 text-[#B91C1C] font-bold text-xs sm:text-sm">
                          <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
                          <span>Not closed · غير مغلقة</span>
                        </div>
                        <div className="py-5 px-4 flex flex-col items-center justify-center flex-1">
                          {editModes.fireHazards ? (
                            <input
                              type="number"
                              value={hazardNotes.notClosed}
                              onChange={e =>
                                setHazardNotes(prev => ({ ...prev, notClosed: parseInt(e.target.value) || 0 }))
                              }
                              className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#B91C1C] bg-white"
                            />
                          ) : (
                            <span className="text-4xl font-black text-[#B91C1C] tracking-tight">
                              {hazardNotes.notClosed}
                            </span>
                          )}
                          <span className="text-slate-600 text-xs font-bold text-center mt-2">
                            عدد المخاطر الغير مغلقة
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
                      <span className="text-slate-900 font-black text-sm">الملاحظات</span>
                      {editModes.fireHazards ? (
                        <input
                          type="text"
                          placeholder="أدخل الملاحظات هنا..."
                          value={hazardNotes.notes}
                          onChange={e => setHazardNotes(prev => ({ ...prev, notes: e.target.value }))}
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
              <section
                id="maintenance-details-section"
                className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm"
              >
                <SectionTitle
                  title="تفاصيل الصيانة"
                  subtitle="Maintenance Details"
                  icon={<Wrench className="w-6 h-6 text-[#2563EB]" />}
                  iconBg="bg-white border-[#93C5FD]"
                  isEditing={editModes.maintenance}
                  onToggleEdit={() => toggleEdit("maintenance")}
                  onAdd={addMaintenanceSite}
                  addLabel="إضافة موقع / صيانة"
                />
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
                        <tr
                          key={site.id}
                          className={cn("hover:bg-blue-50/40", idx % 2 === 1 ? "bg-[#F8FBFF]" : "bg-white")}
                        >
                          <td className="py-3 px-1 font-bold">{site.id}</td>
                          <td className="py-3 px-2 text-right font-bold text-[#142A45] whitespace-nowrap">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.name}
                              onChange={v => updateMaintenanceSite(site.id, "name", v)}
                              className="whitespace-nowrap !min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.general}
                              onChange={v => updateMaintenanceSite(site.id, "general", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.furniture}
                              onChange={v => updateMaintenanceSite(site.id, "furniture", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.decor}
                              onChange={v => updateMaintenanceSite(site.id, "decor", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.fireAlarm}
                              onChange={v => updateMaintenanceSite(site.id, "fireAlarm", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.waterLeak}
                              onChange={v => updateMaintenanceSite(site.id, "waterLeak", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.doors}
                              onChange={v => updateMaintenanceSite(site.id, "doors", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.lighting}
                              onChange={v => updateMaintenanceSite(site.id, "lighting", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.flooring}
                              onChange={v => updateMaintenanceSite(site.id, "flooring", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.ac}
                              onChange={v => updateMaintenanceSite(site.id, "ac", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.outdoorSigns}
                              onChange={v => updateMaintenanceSite(site.id, "outdoorSigns", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.electrical}
                              onChange={v => updateMaintenanceSite(site.id, "electrical", v)}
                              className="!min-w-0"
                            />
                          </td>
                          <td className="py-3 px-1">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={site.elevators}
                              onChange={v => updateMaintenanceSite(site.id, "elevators", v)}
                              className="!min-w-0"
                            />
                          </td>
                          {editModes.maintenance ? (
                            <td className="py-3 px-1 text-center">
                              <button
                                onClick={() => deleteMaintenanceSite(site.id)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
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
                        <tr>
                          <th className="py-2 text-right px-4 font-bold w-12">م</th>
                          <th className="py-2 text-right px-4 font-bold">الوصف</th>
                          <th className="py-2 text-center px-4 font-bold w-32">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4 font-bold text-slate-500">1</td>
                          <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-[#10B981]" /> التكلفة / النثرية
                          </td>
                          <td className="py-3 text-center px-4 font-bold text-slate-900">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={maintenanceServices.costPettyCash}
                              onChange={v => setMaintenanceServices(p => ({ ...p, costPettyCash: String(v) }))}
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4 font-bold text-slate-500">2</td>
                          <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-[#2563EB]" /> التكلفة / أمر شراء
                          </td>
                          <td className="py-3 text-center px-4 font-bold text-slate-900">
                            <EditableCell
                              isEditing={editModes.maintenance}
                              value={maintenanceServices.costPurchaseOrder}
                              onChange={v => setMaintenanceServices(p => ({ ...p, costPurchaseOrder: String(v) }))}
                            />
                          </td>
                        </tr>
                        <tr className="bg-[#EEF5FF] text-slate-900 font-bold border-t border-[#BFDBFE]">
                          <td colSpan={3} className="py-2.5 px-4 text-transparent select-none">
                            -
                          </td>
                        </tr>
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
                        <tr>
                          <th className="py-2 text-right px-4 font-bold">م</th>
                          <th className="py-2 text-right px-4 font-bold">الوصف</th>
                          <th className="py-2 text-center px-4 font-bold">عدد الأعطال</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4 font-bold text-slate-500">1</td>
                          <td className="py-3 px-4 font-bold text-slate-800">عدد طلبات الصيانة الواردة من قسم المرافق</td>
                          <td className="py-3 text-center px-4 font-bold text-slate-900">
                            <EditableCell
                              type="number"
                              isEditing={editModes.maintenance}
                              value={maintenanceServices.fromFacilities}
                              onChange={v => setMaintenanceServices(p => ({ ...p, fromFacilities: Number(v) }))}
                            />
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-3 px-4 font-bold text-slate-500">2</td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            عدد طلبات الصيانة الواردة من الإدارات الأخرى
                          </td>
                          <td className="py-3 text-center px-4 font-bold text-slate-900">
                            <EditableCell
                              type="number"
                              isEditing={editModes.maintenance}
                              value={maintenanceServices.fromOthers}
                              onChange={v => setMaintenanceServices(p => ({ ...p, fromOthers: Number(v) }))}
                            />
                          </td>
                        </tr>
                        <tr className="bg-[#EEF5FF] text-[#142A45] font-black border-t border-[#BFDBFE]">
                          <td colSpan={2} className="py-2.5 px-4">
                            الإجمالي · Total
                          </td>
                          <td className="py-2.5 text-center px-4">
                            {maintenanceServices.fromFacilities + maintenanceServices.fromOthers}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div
                    className="lg:col-span-2 rounded-xl overflow-hidden border border-[#93C5FD] shadow-xs relative min-h-[170px] print:hidden"
                    data-html2canvas-ignore="true"
                  >
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
              <section id="logistics-section" className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
                <SectionTitle
                  title="الدعم اللوجستي"
                  subtitle="Logistics"
                  icon={<Truck className="w-6 h-6 text-[#10B981]" />}
                  iconBg="bg-white border-emerald-200"
                  isEditing={editModes.logistics}
                  onToggleEdit={() => toggleEdit("logistics")}
                />
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
                        {computedLogisticsState.map(row => {
                          const isPercentageRow = row.id === 2;
                          return (
                            <tr key={row.id} className={isPercentageRow ? "bg-[#F4F9FF]" : "bg-white"}>
                              <td className="py-3.5 px-4 text-right text-slate-500 font-bold">{row.id}</td>
                              <td className="py-3.5 px-4 text-right font-bold text-[#142A45] flex items-center gap-2">
                                {isPercentageRow ? (
                                  <ChartPie className="w-4 h-4 text-[#10B981]" />
                                ) : (
                                  <Truck className="w-4 h-4 text-[#2563EB]" />
                                )}
                                <span>{row.label}</span>
                              </td>
                              <td className="py-3.5 px-4 font-black text-[#142A45]">{row.total}</td>
                              <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}>
                                <EditableCell
                                  type={isPercentageRow ? "text" : "number"}
                                  isEditing={editModes.logistics && !isPercentageRow}
                                  value={row.rep as string}
                                  onChange={v => updateLogistics(row.id, "rep", v)}
                                />
                              </td>
                              <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}>
                                <EditableCell
                                  type={isPercentageRow ? "text" : "number"}
                                  isEditing={editModes.logistics && !isPercentageRow}
                                  value={row.emiratesPost as string}
                                  onChange={v => updateLogistics(row.id, "emiratesPost", v)}
                                />
                              </td>
                              <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}>
                                <EditableCell
                                  type={isPercentageRow ? "text" : "number"}
                                  isEditing={editModes.logistics && !isPercentageRow}
                                  value={row.aramex as string}
                                  onChange={v => updateLogistics(row.id, "aramex", v)}
                                />
                              </td>
                              <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}>
                                <EditableCell
                                  type={isPercentageRow ? "text" : "number"}
                                  isEditing={editModes.logistics && !isPercentageRow}
                                  value={row.distribution as string}
                                  onChange={v => updateLogistics(row.id, "distribution", v)}
                                />
                              </td>
                              <td className={cn("py-3.5 px-4 font-bold", row.isPercentage && "text-[#10B981]")}>
                                <EditableCell
                                  type={isPercentageRow ? "text" : "number"}
                                  isEditing={editModes.logistics && !isPercentageRow}
                                  value={row.other as string}
                                  onChange={v => updateLogistics(row.id, "other", v)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="lg:col-span-3 rounded-xl overflow-hidden border border-[#93C5FD] shadow-xs relative min-h-[135px] print:hidden"
                    data-html2canvas-ignore="true"
                  >
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
              <section id="security-section" className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
                <SectionTitle
                  title="خدمات الأمن والاستقبال"
                  subtitle="Security & Reception"
                  icon={<ShieldCheck className="w-6 h-6 text-[#8B5CF6]" />}
                  iconBg="bg-white border-purple-200"
                  isEditing={editModes.security}
                  onToggleEdit={() => toggleEdit("security")}
                />
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
                              {row.id === 1 ? (
                                <Shield className="w-4 h-4 text-[#8B5CF6]" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                              )}
                              {row.label}
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <EditableCell
                                isEditing={editModes.security}
                                value={row.cards as string}
                                onChange={v => updateSecurity(row.id, "cards", v)}
                              />
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <EditableCell
                                isEditing={editModes.security}
                                value={row.visitors as string}
                                onChange={v => updateSecurity(row.id, "visitors", v)}
                              />
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <EditableCell
                                isEditing={editModes.security}
                                value={row.supplierVisitors as string}
                                onChange={v => updateSecurity(row.id, "supplierVisitors", v)}
                              />
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <EditableCell
                                isEditing={editModes.security}
                                value={row.meetingRooms as string}
                                onChange={v => updateSecurity(row.id, "meetingRooms", v)}
                              />
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <EditableCell
                                isEditing={editModes.security}
                                value={row.evacuation as string}
                                onChange={v => updateSecurity(row.id, "evacuation", v)}
                              />
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <EditableCell
                                isEditing={editModes.security}
                                value={row.securityReports as string}
                                onChange={v => updateSecurity(row.id, "securityReports", v)}
                              />
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <EditableCell
                                isEditing={editModes.security}
                                value={row.emergencies as string}
                                onChange={v => updateSecurity(row.id, "emergencies", v)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="lg:col-span-3 rounded-xl overflow-hidden border border-[#93C5FD] shadow-xs relative min-h-[135px] print:hidden"
                    data-html2canvas-ignore="true"
                  >
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

              {/* Tasks */}
              <section id="tasks-section" className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
                <SectionTitle
                  title="المهام الأخرى"
                  subtitle="Other Tasks"
                  icon={<CheckCircle className="w-6 h-6 text-[#10B981]" />}
                  iconBg="bg-white border-emerald-200"
                  isEditing={editModes.tasks}
                  onToggleEdit={() => toggleEdit("tasks")}
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
                        <tr
                          key={task.id}
                          className={cn("hover:bg-blue-50/40", idx % 2 === 1 ? "bg-[#F8FBFF]" : "bg-white")}
                        >
                          <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-[#142A45] align-top">
                            <EditableCell
                              isEditing={editModes.tasks}
                              value={task.topic}
                              onChange={v => updateTask(task.id, "topic", v)}
                              multiline
                              className="text-right"
                            />
                          </td>
                          <td className="py-3 px-4 text-slate-600 align-top">
                            <EditableCell
                              isEditing={editModes.tasks}
                              value={task.task}
                              onChange={v => updateTask(task.id, "task", v)}
                              multiline
                              className="text-right"
                            />
                          </td>
                          <td className="py-3 px-4 text-center align-top">
                            {editModes.tasks ? (
                              <select
                                value={task.status}
                                onChange={e => updateTask(task.id, "status", e.target.value)}
                                className="border border-slate-300 p-1 text-center bg-white font-bold text-slate-900 w-full"
                              >
                                <option value="مكتمل">مكتمل</option>
                                <option value="مستمرة">مستمرة</option>
                                <option value="متأخرة">متأخرة</option>
                              </select>
                            ) : (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border",
                                  task.status === "مكتمل"
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                    : task.status === "متأخرة"
                                    ? "text-rose-700 bg-rose-50 border-rose-200"
                                    : "text-amber-700 bg-amber-50 border-amber-200"
                                )}
                              >
                                {task.status === "مكتمل" ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                                ) : task.status === "متأخرة" ? (
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
                              <div
                                className="h-full bg-gradient-to-l from-[#059669] to-[#10B981] rounded-full absolute top-0 right-0 transition-all duration-500"
                                style={{ width: `${task.completion}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-[#10B981] font-black">
                            <EditableCell
                              type="number"
                              isEditing={editModes.tasks}
                              value={task.completion}
                              onChange={v => updateTask(task.id, "completion", Number(v))}
                              className="max-w-[60px] mx-auto"
                            />
                            {editModes.tasks ? "" : "%"}
                          </td>
                          {editModes.tasks && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
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
              <section id="challenges-section" className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
                <SectionTitle
                  title="التحديات والتوصيات"
                  subtitle="Challenges & Recommendations"
                  icon={<Lightbulb className="w-6 h-6 text-[#F59E0B]" />}
                  iconBg="bg-white border-amber-200"
                  isEditing={editModes.challenges}
                  onToggleEdit={() => toggleEdit("challenges")}
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
                          <td className="py-4 px-4 text-right align-top">
                            <EditableCell
                              isEditing={editModes.challenges}
                              value={chal.challenge}
                              onChange={v => updateChallenge(chal.id, "challenge", v)}
                              multiline
                              className="text-right"
                            />
                          </td>
                          <td className="py-4 px-4 text-right align-top">
                            <EditableCell
                              isEditing={editModes.challenges}
                              value={chal.update}
                              onChange={v => updateChallenge(chal.id, "update", v)}
                              multiline
                              className="text-right"
                            />
                          </td>
                          <td className="py-4 px-4 text-right align-top">
                            <EditableCell
                              isEditing={editModes.challenges}
                              value={chal.recommendation}
                              onChange={v => updateChallenge(chal.id, "recommendation", v)}
                              multiline
                              className="text-right"
                            />
                          </td>
                          {editModes.challenges && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => deleteChallenge(chal.id)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
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
              <section id="approval-section" className="bg-white/95 rounded-2xl border border-[#BFDBFE]/90 p-5 shadow-sm">
                <SectionTitle
                  title="الاعتماد"
                  subtitle="Approval & Sign-off"
                  icon={<BadgeCheck className="w-6 h-6 text-[#EF4444]" />}
                  iconBg="bg-white border-rose-200"
                  isEditing={editModes.approvals}
                  onToggleEdit={() => toggleEdit("approvals")}
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-2 gap-5 mt-4 text-sm items-stretch">
                  <div className="lg:col-span-4 print:col-span-1 h-full flex flex-col justify-between bg-gradient-to-b from-[#EFF6FF] to-white rounded-xl border border-[#BFDBFE] p-5 shadow-xs relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center bg-[#DCEBFC] rounded-lg px-3.5 py-2.5 mb-4 border border-[#93C5FD]/60">
                      <span className="font-black text-[#142A45] text-base">
                        الإعداد{" "}
                        <span className="text-[#173B65]/70 font-bold uppercase tracking-widest text-[10px] mr-2">
                          Preparation
                        </span>
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#2563EB]" />
                      </span>
                    </div>
                    <div className="relative z-10 space-y-3.5 flex-1 flex flex-col justify-between">
                      <p className="font-black text-[#173B65] mb-2 text-center text-base">
                        <EditableCell
                          isEditing={editModes.approvals}
                          value={approvalsState.preparation.role}
                          onChange={v =>
                            setApprovalsState(s => ({ ...s, preparation: { ...s.preparation, role: v as string } }))
                          }
                          className="text-center"
                        />
                      </p>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold w-16 text-slate-600">الاسم:</span>
                        <span className="font-black text-[#142A45] border-b border-slate-200 flex-1 pb-1">
                          <EditableCell
                            isEditing={editModes.approvals}
                            value={approvalsState.preparation.name}
                            onChange={v =>
                              setApprovalsState(s => ({ ...s, preparation: { ...s.preparation, name: v as string } }))
                            }
                          />
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold w-16 text-slate-600">التاريخ:</span>
                        <span className="border-b border-slate-200 flex-1 pb-1">
                          <EditableCell
                            isEditing={editModes.approvals}
                            value={approvalsState.preparation.date}
                            onChange={v =>
                              setApprovalsState(s => ({ ...s, preparation: { ...s.preparation, date: v as string } }))
                            }
                          />
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold w-16 text-slate-600">التوقيع:</span>
                        <span className="border-b border-slate-200 flex-1 pb-1 min-h-[40px] flex items-center">
                          <ImageUploadCell
                            isEditing={editModes.approvals}
                            value={approvalsState.preparation.signature}
                            onChange={v =>
                              setApprovalsState(s => ({ ...s, preparation: { ...s.preparation, signature: v } }))
                            }
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 print:col-span-1 h-full flex flex-col justify-between bg-gradient-to-b from-[#EFF6FF] to-white rounded-xl border border-[#BFDBFE] p-5 shadow-xs relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center bg-[#DCEBFC] rounded-lg px-3.5 py-2.5 mb-4 border border-[#93C5FD]/60">
                      <span className="font-black text-[#142A45] text-base">
                        المراجعة والاعتماد{" "}
                        <span className="text-[#173B65]/70 font-bold uppercase tracking-widest text-[10px] mr-2">
                          Review & Approval
                        </span>
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-[#2563EB]" />
                      </span>
                    </div>
                    <div className="relative z-10 space-y-3.5 flex-1 flex flex-col justify-between">
                      <p className="font-black text-[#173B65] mb-2 text-center text-base">
                        <EditableCell
                          isEditing={editModes.approvals}
                          value={approvalsState.review.role}
                          onChange={v => setApprovalsState(s => ({ ...s, review: { ...s.review, role: v as string } }))}
                          className="text-center"
                        />
                      </p>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold w-16 text-slate-600">الاسم:</span>
                        <span className="font-black text-[#142A45] border-b border-slate-200 flex-1 pb-1">
                          <EditableCell
                            isEditing={editModes.approvals}
                            value={approvalsState.review.name}
                            onChange={v =>
                              setApprovalsState(s => ({ ...s, review: { ...s.review, name: v as string } }))
                            }
                          />
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold w-16 text-slate-600">التاريخ:</span>
                        <span className="border-b border-slate-200 flex-1 pb-1">
                          <EditableCell
                            isEditing={editModes.approvals}
                            value={approvalsState.review.date}
                            onChange={v =>
                              setApprovalsState(s => ({ ...s, review: { ...s.review, date: v as string } }))
                            }
                          />
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold w-16 text-slate-600">التوقيع:</span>
                        <span className="border-b border-slate-200 flex-1 pb-1 min-h-[40px] flex items-center">
                          <ImageUploadCell
                            isEditing={editModes.approvals}
                            value={approvalsState.review.signature}
                            onChange={v =>
                              setApprovalsState(s => ({ ...s, review: { ...s.review, signature: v } }))
                            }
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="lg:col-span-4 h-full rounded-xl overflow-hidden border border-[#BFDBFE] shadow-xs relative min-h-[220px] print:hidden"
                    data-html2canvas-ignore="true"
                  >
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
              </section>
            </div>

            {/* Toast Notification */}
            <div
              className={`fixed bottom-6 right-6 md:right-auto md:left-6 z-50 flex items-center gap-2 bg-[#142A45] text-white px-4 py-3 rounded shadow-lg transition-all duration-300 print:hidden ${
                showToast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
              }`}
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">تم حفظ التغييرات بنجاح</span>
            </div>
          </>
        )}
      </main>

      {/* ==================== 9. MANDATORY PANORAMIC CORPORATE FOOTER ==================== */}
      <footer className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#0B1E38] via-[#142A45] to-[#173B65] border border-[#38BDF8]/40 border-t-2 border-t-[#D4A447] shadow-lg px-5 sm:px-8 py-4 text-white">
          {/* Subtle Gold & Navy Geometric Curves in Footer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-35"
            viewBox="0 0 1200 90"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,90 L380,0 L410,0 L30,90 Z" fill="#D4A447" />
            <path d="M760,90 L980,0 L1200,0 L1200,90 Z" fill="#2563EB" fillOpacity="0.4" />
          </svg>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Right: Report Name + Month & Year */}
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <span>التقرير الشهري</span>
              <span className="text-[#D4A447]">|</span>
              <span className="text-[#DCEBFE]">
                {monthsList[selectedMonth - 1]} {selectedYear}
              </span>
            </div>

            {/* Center: Department Name Arabic & English */}
            <div className="flex flex-col items-center text-center leading-tight">
              <span className="text-sm sm:text-base font-black text-white">قسم إدارة المرافق</span>
              <span className="text-[11px] font-semibold text-[#93C5FD] tracking-wide">
                Facilities Management Department
              </span>
            </div>

            {/* Left: Authentic SAAED Logo (White Text + Gold Emblem) */}
            <SaaedLogo darkText={false} size="sm" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ----------------- SUB COMPONENTS -----------------

function SectionTitle({
  title,
  subtitle,
  icon,
  iconBg,
  isEditing,
  onToggleEdit,
  onAdd,
  addLabel,
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  iconBg?: string;
  isEditing?: boolean;
  onToggleEdit?: () => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex justify-between items-center bg-gradient-to-l from-[#CFE2FA] via-[#E2EEFD] to-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5 mb-4 shadow-2xs">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-black text-[#142A45] flex items-center gap-2.5">
          {icon && (
            <span
              className={cn(
                "w-9 h-9 rounded-lg border flex items-center justify-center shadow-2xs shrink-0",
                iconBg || "bg-white border-[#93C5FD]"
              )}
            >
              {icon}
            </span>
          )}
          <span>{title}</span>
        </h3>
        <span className="text-xs uppercase tracking-widest font-bold text-[#173B65]/65 hidden sm:inline">
          {subtitle}
        </span>
      </div>
      <div className="flex items-center gap-2 print:hidden">
        {isEditing && onAdd && (
          <button
            onClick={onAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            + {addLabel || "إضافة"}
          </button>
        )}
        {onToggleEdit && (
          <button
            onClick={onToggleEdit}
            className="flex items-center gap-2 bg-[#142A45] hover:bg-[#173B65] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-xs cursor-pointer"
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
  circleBg,
  cardBg,
  borderColor,
  valueColor,
  trendColor,
  barColor,
  trackColor,
  fillWidth,
}: {
  title: string;
  subtitle: string;
  value: React.ReactNode;
  serviceNameBadge?: string;
  icon: React.ReactNode;
  circleBg: string;
  cardBg: string;
  borderColor: string;
  valueColor?: string;
  trendColor?: string;
  barColor?: string;
  trackColor?: string;
  fillWidth: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 shadow-[0_4px_16px_rgba(20,42,69,0.06)] flex flex-col justify-between min-h-[136px]",
        borderColor,
        cardBg
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-2">
        {/* Right in RTL: Large Colored Circle Icon + Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-13 h-13 rounded-full flex items-center justify-center shadow-md border-2 border-white shrink-0",
              circleBg
            )}
          >
            {icon}
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[#142A45] text-sm sm:text-base font-black leading-tight">{title}</span>
            <span className="text-slate-600 text-[11px] font-semibold mt-0.5">{subtitle}</span>
          </div>
        </div>

        {/* Left in RTL: Upward Trend Arrow */}
        <TrendingUp className={cn("w-5 h-5 shrink-0 opacity-85", trendColor || "text-[#10B981]")} />
      </div>

      {/* Prominent Value */}
      <div className="relative z-10 mt-2 flex items-baseline justify-between gap-2 pl-1">
        {serviceNameBadge ? (
          <span className="text-[11px] font-black text-[#92400E] bg-amber-200/70 border border-amber-400/60 px-2 py-0.5 rounded-md truncate max-w-[60%]">
            {serviceNameBadge}
          </span>
        ) : (
          <span />
        )}
        <span className={cn("text-3xl sm:text-4xl font-black tracking-tight tabular-nums", valueColor || "text-[#142A45]")}>
          {value}
        </span>
      </div>

      {/* Bottom Progress Bar */}
      <div className={cn("relative z-10 w-full h-2 mt-2.5 rounded-full overflow-hidden", trackColor || "bg-slate-200")}>
        <div className={cn("h-full rounded-full", barColor)} style={{ width: fillWidth }} />
      </div>
    </div>
  );
}

function OperationalSummaryMiniCard({
  title,
  headerGradient,
  icon,
  metrics,
  onClick,
}: {
  title: string;
  headerGradient: string;
  icon: React.ReactNode;
  metrics: { label: string; value: number | string; theme: "slate" | "green" | "blue" | "red" }[];
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#BFDBFE] shadow-[0_4px_14px_rgba(20,42,69,0.06)] overflow-hidden flex flex-col cursor-pointer hover:border-[#2563EB] transition-all"
    >
      <div className={cn("bg-gradient-to-l text-white px-4 py-2.5 flex items-center justify-between", headerGradient)}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-black text-sm sm:text-base">{title}</span>
        </div>
      </div>

      <div className="p-3 grid grid-cols-4 gap-2 flex-1 bg-gradient-to-b from-[#F8FAFC] to-white">
        {metrics.map((m, idx) => {
          const boxStyle =
            m.theme === "green"
              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
              : m.theme === "blue"
              ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]"
              : m.theme === "red"
              ? "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]"
              : "bg-slate-50 border-slate-200 text-[#142A45]";
          return (
            <div
              key={idx}
              className={cn("rounded-xl border px-1.5 py-2.5 flex flex-col items-center justify-center text-center", boxStyle)}
            >
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 leading-tight mb-1">{m.label}</span>
              <span className="text-lg sm:text-xl font-black tabular-nums leading-none">{m.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DomainMultiDonut({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const radius = 78;
  const strokeWidth = 24;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const totalPct = segments.reduce((acc, s) => acc + s.pct, 0) || 100;

  let cumulativePct = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {segments.map((seg, i) => {
          const normPct = (seg.pct / totalPct) * 100;
          const strokeDasharray = `${(normPct / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((cumulativePct / 100) * circumference);
          cumulativePct += normPct;
          return (
            <circle
              key={i}
              stroke={seg.color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          );
        })}
      </svg>
      <div className="absolute w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
        <Building2 className="w-7 h-7 text-[#D97706]" />
      </div>
    </div>
  );
}

function CustomDonutChart({
  percentage,
  totalExecuted = 0,
  totalPending = 0,
}: {
  percentage: number;
  totalExecuted?: number;
  totalPending?: number;
}) {
  const radius = 76;
  const strokeWidth = 22;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedPct = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="relative z-10 flex flex-row items-center justify-between gap-4 sm:gap-6 w-full px-2">
      {/* Right Side (in RTL): 3 Performance Status Indicators */}
      <div className="flex flex-col gap-3 text-right min-w-[145px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#10B981] shrink-0" />
            <span className="text-sm font-black text-[#142A45]">المنجز</span>
          </div>
          <span className="text-sm sm:text-base font-black text-[#142A45] tabular-nums">{totalExecuted}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#F59E0B] shrink-0" />
            <span className="text-sm font-black text-[#142A45]">قيد التنفيذ</span>
          </div>
          <span className="text-sm sm:text-base font-black text-[#142A45] tabular-nums">{totalPending}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[4px] bg-[#EF4444] shrink-0" />
            <span className="text-sm font-black text-[#142A45]">متأخر</span>
          </div>
          <span className="text-sm sm:text-base font-black text-[#142A45] tabular-nums">0</span>
        </div>
      </div>

      {/* Left Side (in RTL): Professional Emerald & Orange Donut Chart */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-[0_2px_6px_rgba(16,185,129,0.15)]">
          <circle
            stroke={totalPending > 0 ? "#F59E0B" : "#E2E8F0"}
            fill="#FFFFFF"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
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
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#142A45] tracking-tight leading-none">
            {percentage.toFixed(0)}%
          </span>
          <span className="text-[11px] font-extrabold text-[#334155] mt-1">نسبة الإنجاز</span>
        </div>
      </div>
    </div>
  );
}

function ContractBlock({
  title,
  subtitle,
  data,
  borderColor,
  textColor,
  icon,
  isEditing,
  onChange,
}: {
  title: string;
  subtitle: string;
  data: ContractData;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
  isEditing?: boolean;
  onChange?: (field: "active" | "inactive" | "notes", val: any) => void;
}) {
  if (!data) return null;
  return (
    <div className={cn("bg-white rounded-xl flex flex-col shadow-xs border border-[#BFDBFE] overflow-hidden")}>
      <div className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E40AF] text-white py-2.5 px-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-white text-sm font-black">{title}</span>
          <span className="text-blue-200/80 text-[10px] tracking-widest uppercase">{subtitle}</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 flex-1 bg-white">
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span className="text-xs font-black text-[#047857]">فعّالة</span>
          </div>
          {isEditing && onChange ? (
            <input
              type="number"
              value={data.active}
              onChange={e => onChange("active", parseInt(e.target.value) || 0)}
              className="w-full border border-slate-300 p-1 text-center text-xl font-black bg-white mt-1 text-[#047857]"
            />
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
            <input
              type="number"
              value={data.inactive}
              onChange={e => onChange("inactive", parseInt(e.target.value) || 0)}
              className="w-full border border-slate-300 p-1 text-center text-xl font-black bg-white mt-1 text-[#B91C1C]"
            />
          ) : (
            <span className="text-3xl font-black text-[#B91C1C]">{data.inactive}</span>
          )}
        </div>
      </div>

      <div className="bg-[#F8FAFC] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
        <span className="text-slate-900 font-black text-sm">الملاحظات</span>
        {isEditing && onChange ? (
          <input
            type="text"
            placeholder="أدخل الملاحظات هنا..."
            value={data.notes || ""}
            onChange={e => onChange("notes", e.target.value)}
            className="border border-slate-300 px-2 py-1 text-xs bg-white text-slate-800 rounded w-2/3"
          />
        ) : (
          <span className="text-slate-600 text-xs font-bold">{data.notes}</span>
        )}
      </div>
    </div>
  );
}

function ImageUploadCell({
  isEditing,
  value,
  onChange,
}: {
  isEditing: boolean;
  value: string;
  onChange: (val: string) => void;
}) {
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
            <button
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : isEditing ? (
        <div className="w-full">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded w-full flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-3 h-3" />
            إرفاق توقيع
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EditableCell({
  isEditing,
  value,
  onChange,
  type = "text",
  className = "",
  multiline = false,
}: {
  isEditing: boolean;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  className?: string;
  multiline?: boolean;
}) {
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            "w-full min-w-[120px] min-h-[60px] border border-slate-300 p-2 bg-white font-bold text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right leading-relaxed",
            className
          )}
        />
      );
    }
    return (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          "w-full min-w-[40px] border border-slate-300 p-1 text-center bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500",
          className
        )}
      />
    );
  }
  return (
    <span className={cn(multiline ? "whitespace-pre-wrap break-words block text-right leading-relaxed" : "", className)}>
      {value}
    </span>
  );
}
