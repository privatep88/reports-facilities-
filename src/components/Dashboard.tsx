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
import { Edit2, Printer, Save, CheckCircle, Shield, Truck, Home, Wrench, ShieldCheck, ClipboardCheck, Banknote, Trash2, Upload, Download, FileText, FileSpreadsheet } from "lucide-react";
import { ServicesDashboardView } from "./ServicesDashboardView";
import { ApprovedReportsArchive } from "./ApprovedReportsArchive";
import { ReportWorkflowToolbar } from "./ReportWorkflowToolbar";
import { getReportWorkflowStatus } from "../lib/reportsArchive";
import { triggerPrintReport, exportReportToPDF, exportReportToExcelXlsx } from "../lib/exportUtils";
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

  const updateContract = (index: number, field: "active" | "inactive", value: number) => {
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
    <div id="dashboard-content" className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20" dir="rtl">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="border-b-4 border-slate-900 flex justify-between items-end pb-4 mb-6">
          <div className="flex flex-col">
            <span className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-1">إدارة الخدمات العامة</span>
            <h1 className="text-4xl font-black text-slate-900">
              {activeTab === "report" ? "التقرير الشهري لقسم إدارة المرافق" : activeTab === "services" ? "لوحة تحكم الخدمات" : "أرشيف التقارير المعتمدة"}
            </h1>
            <div className="flex flex-wrap gap-3 mt-4 print:hidden">
               <button onClick={() => setActiveTab("report")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "report" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>التقرير الشهري</button>
               <button onClick={() => setActiveTab("approved")} className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === "approved" ? "bg-emerald-700 text-white shadow-sm" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>
                 <ShieldCheck className="w-4 h-4 text-emerald-400" />
                 <span>التقارير المعتمدة</span>
               </button>
               <button onClick={() => setActiveTab("services")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "services" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>جميع الخدمات</button>
            </div>
          </div>
          <div className="text-left flex flex-col items-end">
            <div className="flex flex-wrap items-center gap-2 mb-2 print:hidden" data-html2canvas-ignore="true">
              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="طباعة التقرير الشهري A4"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span>طباعة</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="تصدير ملف PDF عالي الدقة مقاس A4"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPDF ? "جاري إنشاء PDF..." : "تصدير PDF"}</span>
              </button>
              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="تصدير ملف Excel منسق (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isExportingExcel ? "جاري التصدير..." : "تصدير Excel"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2 print:hidden">
              <select className="bg-slate-900 text-white px-2 py-1 text-sm font-bold rounded cursor-pointer" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {monthsList.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select className="bg-slate-900 text-white px-2 py-1 text-sm font-bold rounded cursor-pointer" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="hidden print:block bg-slate-900 text-white px-4 py-1 text-sm font-bold mb-2">
               {monthsList[selectedMonth - 1]} {selectedYear}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
        <section>
          <SectionTitle title="الملخص التنفيذي" subtitle="Executive Summary" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <SummaryCard title="نسبة الإنجاز الكلية" subtitle="Overall Completion" value={`${overallCompletion.toFixed(1)}%`} icon={<CheckCircle className="w-6 h-6 text-emerald-500" />} borderColor="border-emerald-500" fillWidth={`${overallCompletion}%`} />
            <SummaryCard title="إجمالي الخدمات" subtitle="Total Services" value={services.length} icon={<ClipboardCheck className="w-6 h-6 text-blue-500" />} borderColor="border-blue-500" fillWidth="100%" />
            <SummaryCard title="أعلى خدمة طلباً" subtitle="Top Service Demand" value={topService?.received || 0} icon={<span className="text-2xl text-amber-500">🏆</span>} borderColor="border-amber-500" fillWidth="100%" />
            <SummaryCard title="إجمالي الطلبات" subtitle="Total Requests" value={totalReceived} icon={<ShieldCheck className="w-6 h-6 text-slate-900" />} borderColor="border-slate-900" fillWidth="100%" />
          </div>
        </section>

        {/* Performance Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="bg-slate-900 text-white px-4 py-3 font-bold text-sm flex justify-between">
              <span>الطلبات حسب الخدمة</span>
              <span className="text-slate-400 text-xs tracking-widest uppercase">Requests by Service</span>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="text-right py-2 font-bold">الخدمة</th>
                    <th className="text-center py-2 font-bold">التوزيع النسبي</th>
                    <th className="text-center py-2 font-bold">العدد</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 flex items-center gap-2">
                        <s.icon className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-700">{s.name}</span>
                      </td>
                      <td className="py-3 w-1/2 px-4">
                        <div className="h-2 bg-slate-100 w-full relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalReceived > 0 ? (s.received / totalReceived) * 100 : 0}%` }}
                            className="absolute top-0 bottom-0 right-0 bg-slate-900"
                          />
                        </div>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-900">{s.received}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 border-t border-slate-200 text-slate-900 font-bold">
                    <td colSpan={2} className="py-3 px-4">الإجمالي · Total</td>
                    <td className="py-3 text-center">{totalReceived}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
            <div className="bg-slate-900 text-white px-4 py-3 font-bold text-sm flex justify-between">
              <span>توزيع الأداء</span>
              <span className="text-slate-400 text-xs tracking-widest uppercase">Performance Distribution</span>
            </div>
            <div className="p-4 flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
               <CustomDonutChart percentage={overallCompletion} />
            </div>
          </div>
        </section>

        {/* Services Summary Table */}
        <section>
           <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4">
             <div className="flex items-center gap-4">
               <h3 className="text-lg font-black text-slate-900">ملخص الخدمات</h3>
               <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Services Summary</span>
             </div>

             <div className="flex items-center gap-2">
               {editModes.services && (
                 <button onClick={addService} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-sm transition-colors">
                   + إضافة خدمة
                 </button>
               )}
               <button
                 onClick={() => toggleEdit("services")}
                 className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 font-bold text-xs transition-colors shadow-sm"
               >
                 {editModes.services ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                 {editModes.services ? "حفظ التعديلات" : "تعديل البيانات"}
               </button>
             </div>
           </div>

           <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
             <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-900 text-slate-900">
                    <th className="py-3 px-4 text-right font-bold">#</th>
                    <th className="py-3 px-4 text-right font-bold">الخدمة</th>
                    <th className="py-3 px-4 text-center font-bold">المستلمة</th>
                    <th className="py-3 px-4 text-center font-bold">المنفذة</th>
                    <th className="py-3 px-4 text-center font-bold w-32">مؤشر الإنجاز</th>
                    <th className="py-3 px-4 text-center font-bold">النسبة</th>
                    <th className="py-3 px-4 text-center font-bold">المستوى</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((s, idx) => {
                    const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                    const level = ratio >= 95 ? "مرتفع" : ratio >= 85 ? "متوسط" : "منخفض";
                    const levelColor = ratio >= 95 ? "text-emerald-600" : ratio >= 85 ? "text-amber-500" : "text-rose-500";
                    const bgClass = ratio < 85 ? "bg-rose-50/30" : "";
                    
                    return (
                      <tr key={s.id} className={cn("hover:bg-slate-50 transition-colors", bgClass)}>
                        <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold">
                          <div className="flex items-center gap-2">
                            <s.icon className="w-4 h-4 text-slate-400" />
                            {editModes.services ? (
                              <input
                                type="text"
                                value={s.name}
                                onChange={(e) => handleServiceChange(s.id, "name", e.target.value)}
                                className="w-full border border-slate-300 p-1 bg-white font-bold"
                              />
                            ) : (
                              <span>{s.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {editModes.services ? (
                            <input type="number" value={s.received} onChange={(e) => handleServiceChange(s.id, "received", parseInt(e.target.value) || 0)} className="w-16 border border-slate-300 text-center p-1 bg-white" />
                          ) : (
                            s.received
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                           {editModes.services ? (
                            <input type="number" value={s.executed} onChange={(e) => handleServiceChange(s.id, "executed", parseInt(e.target.value) || 0)} className="w-16 border border-slate-300 text-center p-1 bg-white" />
                          ) : (
                            s.executed
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="h-2 bg-slate-100 w-full relative overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(ratio, 100)}%` }}
                              className={cn("absolute top-0 bottom-0 right-0", ratio >= 95 ? "bg-emerald-500" : ratio >= 85 ? "bg-amber-500" : "bg-rose-500")}
                            />
                          </div>
                        </td>
                        <td className={cn("py-3 px-4 text-center font-black", levelColor)}>{ratio.toFixed(1)}%</td>
                        <td className={cn("py-3 px-4 text-center font-bold", levelColor)}>
                          {ratio >= 95 ? "▲ " : ratio >= 85 ? "● " : "▼ "}
                          {level}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={2} className="py-4 px-4 text-center">الإجمالي · Total</td>
                    <td className="py-4 px-4 text-center">{totalReceived}</td>
                    <td className="py-4 px-4 text-center">{totalExecuted}</td>
                    <td className="py-4 px-4 text-center">—</td>
                    <td className="py-4 px-4 text-center font-black">{overallCompletion.toFixed(1)}%</td>
                    <td className="py-4 px-4 text-center">—</td>
                  </tr>
                </tbody>
             </table>
           </div>
        </section>

        {/* Contracts & Licenses */}
        <section>
          <SectionTitle title="العقود والرخص" subtitle="Contracts & Licenses" isEditing={editModes.contracts} onToggleEdit={() => toggleEdit('contracts')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
             <ContractBlock title="العقود الإيجارية" subtitle="Rental Contracts" data={contractsState[0]} borderColor="border-emerald-500" textColor="text-emerald-600" icon={<Home className="w-5 h-5 opacity-70" />} isEditing={editModes.contracts} onChange={(f, v) => updateContract(0, f, v)} />
             <ContractBlock title="الرخص التجارية" subtitle="Commercial Licenses" data={contractsState[1]} borderColor="border-blue-500" textColor="text-blue-600" icon={<ClipboardCheck className="w-5 h-5 opacity-70" />} isEditing={editModes.contracts} onChange={(f, v) => updateContract(1, f, v)} />
             <ContractBlock title="عقود الخدمات" subtitle="Service Contracts" data={contractsState[2]} borderColor="border-slate-900" textColor="text-slate-900" icon={<Shield className="w-5 h-5 opacity-70" />} isEditing={editModes.contracts} onChange={(f, v) => updateContract(2, f, v)} />
          </div>
        </section>

        {/* Fire Extinguishers and Hazard Notes */}
        <section>
          <SectionTitle
            title="الطفايات وملاحظات المخاطر"
            subtitle="Fire Extinguishers and Hazard Notes"
            isEditing={editModes.fireHazards}
            onToggleEdit={() => toggleEdit('fireHazards')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* بطاقة عدد الطفايات */}
            <div className="bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {/* Header Bar */}
              <div className="bg-[#C9A961] text-white py-3 px-4 flex items-center justify-center gap-2">
                <Home className="w-5 h-5 text-white" />
                <span className="font-bold text-base sm:text-lg">عدد الطفايات</span>
              </div>
              {/* Subtitle Bar */}
              <div className="bg-white py-2 text-center border-b border-slate-100">
                <span className="text-slate-500 text-xs sm:text-sm font-semibold tracking-wide">fire extinguishers</span>
              </div>
              {/* Columns: Active & Inactive */}
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 flex-1">
                {/* Active Column */}
                <div className="flex flex-col">
                  <div className="bg-[#D1FAE5] py-2 px-3 text-center border-b border-emerald-100 flex items-center justify-center gap-2 text-[#047857] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                    <span>Active  ·  فعّالة</span>
                  </div>
                  <div className="py-6 sm:py-8 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={fireExtinguishers.active}
                        onChange={(e) => setFireExtinguishers(prev => ({ ...prev, active: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#047857] bg-white"
                      />
                    ) : (
                      <span className="text-4xl sm:text-5xl font-black text-[#047857] tracking-tight">{fireExtinguishers.active}</span>
                    )}
                    <span className="text-slate-600 text-xs sm:text-sm font-bold text-center mt-3">عدد الطفايات الفعّالة</span>
                  </div>
                </div>

                {/* Inactive Column */}
                <div className="flex flex-col">
                  <div className="bg-[#FEE2E2] py-2 px-3 text-center border-b border-rose-100 flex items-center justify-center gap-2 text-[#B91C1C] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
                    <span>Inactive  ·  غير فعّالة</span>
                  </div>
                  <div className="py-6 sm:py-8 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={fireExtinguishers.inactive}
                        onChange={(e) => setFireExtinguishers(prev => ({ ...prev, inactive: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#B91C1C] bg-white"
                      />
                    ) : (
                      <span className="text-4xl sm:text-5xl font-black text-[#B91C1C] tracking-tight">{fireExtinguishers.inactive}</span>
                    )}
                    <span className="text-slate-600 text-xs sm:text-sm font-bold text-center mt-3">عدد الطفايات غير الفعّالة</span>
                  </div>
                </div>
              </div>

              {/* Notes Footer */}
              <div className="bg-[#F3F4F6] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
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
            <div className="bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {/* Header Bar */}
              <div className="bg-[#0E7490] text-white py-3 px-4 flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <span className="font-bold text-base sm:text-lg">عدد ملاحظات المخاطر</span>
              </div>
              {/* Subtitle Bar */}
              <div className="bg-white py-2 text-center border-b border-slate-100">
                <span className="text-slate-500 text-xs sm:text-sm font-semibold tracking-wide">risk observations</span>
              </div>
              {/* Columns: Closed & Not closed */}
              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 flex-1">
                {/* Closed Column */}
                <div className="flex flex-col">
                  <div className="bg-[#D1FAE5] py-2 px-3 text-center border-b border-emerald-100 flex items-center justify-center gap-2 text-[#047857] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#047857]"></span>
                    <span>Closed  ·  مغلقة</span>
                  </div>
                  <div className="py-6 sm:py-8 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={hazardNotes.closed}
                        onChange={(e) => setHazardNotes(prev => ({ ...prev, closed: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#047857] bg-white"
                      />
                    ) : (
                      <span className="text-4xl sm:text-5xl font-black text-[#047857] tracking-tight">{hazardNotes.closed}</span>
                    )}
                    <span className="text-slate-600 text-xs sm:text-sm font-bold text-center mt-3">عدد المخاطر المغلقة</span>
                  </div>
                </div>

                {/* Not Closed Column */}
                <div className="flex flex-col">
                  <div className="bg-[#FEE2E2] py-2 px-3 text-center border-b border-rose-100 flex items-center justify-center gap-2 text-[#B91C1C] font-bold text-xs sm:text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
                    <span>Not closed  ·  غير مغلقة</span>
                  </div>
                  <div className="py-6 sm:py-8 px-4 flex flex-col items-center justify-center flex-1">
                    {editModes.fireHazards ? (
                      <input
                        type="number"
                        value={hazardNotes.notClosed}
                        onChange={(e) => setHazardNotes(prev => ({ ...prev, notClosed: parseInt(e.target.value) || 0 }))}
                        className="w-24 border border-slate-300 p-1 text-center text-3xl font-black text-[#B91C1C] bg-white"
                      />
                    ) : (
                      <span className="text-4xl sm:text-5xl font-black text-[#B91C1C] tracking-tight">{hazardNotes.notClosed}</span>
                    )}
                    <span className="text-slate-600 text-xs sm:text-sm font-bold text-center mt-3">عدد المخاطر الغير مغلقة</span>
                  </div>
                </div>
              </div>

              {/* Notes Footer */}
              <div className="bg-[#F3F4F6] border-t border-slate-200 py-2.5 px-4 flex items-center justify-between">
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
        <section>
          <SectionTitle title="تفاصيل الصيانة" subtitle="Maintenance Details" isEditing={editModes.maintenance} onToggleEdit={() => toggleEdit("maintenance")} onAdd={addMaintenanceSite} addLabel="إضافة موقع / صيانة" />
          <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto mt-4">
             <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-3 px-2 font-bold">م</th>
                    <th className="py-3 px-2 font-bold text-right">المقرات</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">أعطال عامة</th>
                    <th className="py-3 px-2 font-bold">أثاث</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">أعمال ديكور</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">إنذار حريق</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">تسريب ماء</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل أبواب</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل إنارة</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل أرضيات</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل تكييف</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل لوحات خارجية</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل كهرباء</th>
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل مصاعد</th>
                    {editModes.maintenance ? <th className="py-3 px-2 font-bold whitespace-nowrap w-10"></th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {maintenanceSitesState.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2 font-bold">{site.id}</td>
                      <td className="py-3 px-2 text-right font-bold text-slate-800"><EditableCell isEditing={editModes.maintenance} value={site.name} onChange={(v) => updateMaintenanceSite(site.id, 'name', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.general} onChange={(v) => updateMaintenanceSite(site.id, 'general', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.furniture} onChange={(v) => updateMaintenanceSite(site.id, 'furniture', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.decor} onChange={(v) => updateMaintenanceSite(site.id, 'decor', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.fireAlarm} onChange={(v) => updateMaintenanceSite(site.id, 'fireAlarm', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.waterLeak} onChange={(v) => updateMaintenanceSite(site.id, 'waterLeak', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.doors} onChange={(v) => updateMaintenanceSite(site.id, 'doors', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.lighting} onChange={(v) => updateMaintenanceSite(site.id, 'lighting', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.flooring} onChange={(v) => updateMaintenanceSite(site.id, 'flooring', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.ac} onChange={(v) => updateMaintenanceSite(site.id, 'ac', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.outdoorSigns} onChange={(v) => updateMaintenanceSite(site.id, 'outdoorSigns', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.electrical} onChange={(v) => updateMaintenanceSite(site.id, 'electrical', v)} /></td>
                      <td className="py-3 px-2"><EditableCell isEditing={editModes.maintenance} value={site.elevators} onChange={(v) => updateMaintenanceSite(site.id, 'elevators', v)} /></td>
                       {editModes.maintenance ? (
                         <td className="py-3 px-2 text-center">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
             <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
                <div className="bg-slate-900 text-white px-4 py-3 font-bold text-sm flex justify-between">
                  <span>التكلفة المالية</span>
                  <span className="text-slate-400 text-xs tracking-widest uppercase">Financial Cost</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr><th className="py-2 text-right px-4 font-bold w-12">م</th><th className="py-2 text-right px-4 font-bold">الوصف</th><th className="py-2 text-center px-4 font-bold w-32">المبلغ</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">1</td><td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-500"/> التكلفة / النثرية</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell isEditing={editModes.maintenance} value={maintenanceServices.costPettyCash} onChange={(v) => setMaintenanceServices(p => ({ ...p, costPettyCash: String(v) }))} /></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">2</td><td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-blue-500"/> التكلفة / أمر شراء</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell isEditing={editModes.maintenance} value={maintenanceServices.costPurchaseOrder} onChange={(v) => setMaintenanceServices(p => ({ ...p, costPurchaseOrder: String(v) }))} /></td></tr>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200"><td colSpan={3} className="py-3 px-4 text-transparent select-none">-</td></tr>
                  </tbody>
                </table>
             </div>
             
             <div className="bg-white border border-slate-200 shadow-sm flex flex-col">
                <div className="bg-slate-900 text-white px-4 py-3 font-bold text-sm flex justify-between">
                  <span>خدمات الصيانة</span>
                  <span className="text-slate-400 text-xs tracking-widest uppercase">Maintenance Services</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr><th className="py-2 text-right px-4 font-bold">م</th><th className="py-2 text-right px-4 font-bold">الوصف</th><th className="py-2 text-center px-4 font-bold">عدد الأعطال</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">1</td><td className="py-3 px-4 font-bold text-slate-800">عدد طلبات الصيانة الواردة من قسم المرافق</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell type="number" isEditing={editModes.maintenance} value={maintenanceServices.fromFacilities} onChange={(v) => setMaintenanceServices(p => ({ ...p, fromFacilities: Number(v) }))} /></td></tr>
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">2</td><td className="py-3 px-4 font-bold text-slate-800">عدد طلبات الصيانة الواردة من الإدارات الأخرى</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell type="number" isEditing={editModes.maintenance} value={maintenanceServices.fromOthers} onChange={(v) => setMaintenanceServices(p => ({ ...p, fromOthers: Number(v) }))} /></td></tr>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200"><td colSpan={2} className="py-3 px-4">الإجمالي · Total</td><td className="py-3 text-center px-4">{maintenanceServices.fromFacilities + maintenanceServices.fromOthers}</td></tr>
                  </tbody>
                </table>
             </div>

          </div>
        </section>


        {/* Logistics */}
        <section>
          <SectionTitle title="الدعم اللوجستي" subtitle="Logistics" isEditing={editModes.logistics} onToggleEdit={() => toggleEdit("logistics")} />
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden mt-4">
            <table className="w-full text-sm text-center">
               <thead>
                  <tr className="bg-slate-900 text-white border-b-2 border-slate-900">
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
                    <tr key={row.id}>
                       <td className="py-3 px-4 text-right text-slate-500 font-bold">{row.id}</td>
                       <td className="py-3 px-4 text-right font-bold text-slate-800">{row.label}</td>
                       <td className="py-3 px-4 font-black">{row.total}</td>
                       <td className={cn("py-3 px-4 font-bold", row.isPercentage && "text-emerald-600")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.rep as string} onChange={(v) => updateLogistics(row.id, 'rep', v)} /></td>
                       <td className={cn("py-3 px-4 font-bold", row.isPercentage && "text-emerald-600")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.emiratesPost as string} onChange={(v) => updateLogistics(row.id, 'emiratesPost', v)} /></td>
                       <td className={cn("py-3 px-4 font-bold", row.isPercentage && "text-emerald-600")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.aramex as string} onChange={(v) => updateLogistics(row.id, 'aramex', v)} /></td>
                       <td className={cn("py-3 px-4 font-bold", row.isPercentage && "text-emerald-600")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.distribution as string} onChange={(v) => updateLogistics(row.id, 'distribution', v)} /></td>
                       <td className={cn("py-3 px-4 font-bold", row.isPercentage && "text-emerald-600")}><EditableCell type={isPercentageRow ? "text" : "number"} isEditing={editModes.logistics && !isPercentageRow} value={row.other as string} onChange={(v) => updateLogistics(row.id, 'other', v)} /></td>
                    </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        </section>

        {/* Security & Reception */}
        <section>
          <SectionTitle title="خدمات الأمن والاستقبال" subtitle="Security & Reception" isEditing={editModes.security} onToggleEdit={() => toggleEdit("security")} />
          <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto mt-4">
             <table className="w-full text-sm text-center">
               <thead>
                  <tr className="bg-slate-900 text-white border-b-2 border-slate-900">
                    <th className="py-3 px-4 font-bold text-right">م</th>
                    <th className="py-3 px-4 font-bold text-right">البيان</th>
                    <th className="py-3 px-4 font-bold">تفعيل البطاقات</th>
                    <th className="py-3 px-4 font-bold">عدد الزوار</th>
                    <th className="py-3 px-4 font-bold">زوار الموردين</th>
                    <th className="py-3 px-4 font-bold">حجز القاعات</th>
                    <th className="py-3 px-4 font-bold">حالات الإخلاء</th>
                    <th className="py-3 px-4 font-bold">تقارير أمنية</th>
                    <th className="py-3 px-4 font-bold text-rose-400">حالات طارئة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {securityState.map((row) => (
                    <tr key={row.id}>
                       <td className="py-3 px-4 text-right text-slate-500 font-bold">{row.id}</td>
                       <td className="py-3 px-4 text-right font-bold text-slate-800 flex items-center gap-2">
                         {row.id === 1 ? <Shield className="w-4 h-4 text-slate-400" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                         {row.label}
                       </td>
                       <td className="py-3 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.cards as string} onChange={(v) => updateSecurity(row.id, 'cards', v)} /></td>
                       <td className="py-3 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.visitors as string} onChange={(v) => updateSecurity(row.id, 'visitors', v)} /></td>
                       <td className="py-3 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.supplierVisitors as string} onChange={(v) => updateSecurity(row.id, 'supplierVisitors', v)} /></td>
                       <td className="py-3 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.meetingRooms as string} onChange={(v) => updateSecurity(row.id, 'meetingRooms', v)} /></td>
                       <td className="py-3 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.evacuation as string} onChange={(v) => updateSecurity(row.id, 'evacuation', v)} /></td>
                       <td className="py-3 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.securityReports as string} onChange={(v) => updateSecurity(row.id, 'securityReports', v)} /></td>
                       <td className="py-3 px-4 font-bold"><EditableCell isEditing={editModes.security} value={row.emergencies as string} onChange={(v) => updateSecurity(row.id, 'emergencies', v)} /></td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </section>

        {/* Tasks & Challenges */}
        <section>
          <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4 mt-8">
             <div className="flex items-center gap-4">
               <h3 className="text-lg font-black text-slate-900">المهام الأخرى</h3>
               <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Other Tasks</span>
             </div>
             <div className="flex items-center gap-2">
               {editModes.tasks && (
                 <button onClick={addTask} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-sm transition-colors">
                   + إضافة مهمة
                 </button>
               )}
               <button
                 onClick={() => toggleEdit('tasks')}
                 className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 font-bold text-xs transition-colors shadow-sm"
               >
                 {editModes.tasks ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                 {editModes.tasks ? "حفظ التعديلات" : "تعديل البيانات"}
               </button>
             </div>
           </div>
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden mt-4">
            <table className="w-full text-sm">
               <thead>
                  <tr className="bg-slate-900 text-white">
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
                    <tr key={task.id} className="hover:bg-slate-50">
                       <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>
                       <td className="py-3 px-4 font-bold text-slate-800 align-top"><EditableCell isEditing={editModes.tasks} value={task.topic} onChange={(v) => updateTask(task.id, 'topic', v)} multiline className="text-right" /></td>
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
                           <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border", 
                              task.status === 'مكتمل' ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                              task.status === 'متأخرة' ? "text-rose-700 bg-rose-50 border-rose-200" :
                              "text-blue-700 bg-blue-50 border-blue-200"
                           )}
                            >
                             <span className={cn("w-1.5 h-1.5", 
                               task.status === 'مكتمل' ? "bg-emerald-500" :
                               task.status === 'متأخرة' ? "bg-rose-500" :
                               "bg-blue-500"
                             )}
                              ></span>
                             {task.status}
                           </span>
                         )}
                       </td>
                       <td className="py-3 px-4">
                          <div className="h-2 w-full bg-slate-100 overflow-hidden relative">
                             <div className="h-full bg-emerald-500 absolute top-0 right-0 transition-all duration-500" style={{ width: `${task.completion}%` }}></div>
                          </div>
                       </td>
                       <td className="py-3 px-4 text-center text-emerald-600 font-black"><EditableCell type="number" isEditing={editModes.tasks} value={task.completion} onChange={(v) => updateTask(task.id, 'completion', Number(v))} className="max-w-[60px] mx-auto" />{editModes.tasks ? '' : '%'}</td>
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
        <section>
          <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4 mt-8">
             <div className="flex items-center gap-4">
               <h3 className="text-lg font-black text-slate-900">التحديات والتوصيات</h3>
               <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Challenges & Recommendations</span>
             </div>
             <div className="flex items-center gap-2">
               {editModes.challenges && (
                 <button onClick={addChallenge} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-sm transition-colors">
                   + إضافة تحدي
                 </button>
               )}
               <button
                 onClick={() => toggleEdit('challenges')}
                 className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 font-bold text-xs transition-colors shadow-sm"
               >
                 {editModes.challenges ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                 {editModes.challenges ? "حفظ التعديلات" : "تعديل البيانات"}
               </button>
             </div>
           </div>
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden mt-4">
            <table className="w-full text-sm">
               <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-3 px-4 font-bold text-right">#</th>
                    <th className="py-3 px-4 font-bold text-right w-1/3">التحديات والعوائق</th>
                    <th className="py-3 px-4 font-bold text-right w-1/3">التحديث</th>
                    <th className="py-3 px-4 font-bold text-right w-1/3">التوصية</th>
                    {editModes.challenges && <th className="py-3 px-4 font-bold text-center">إجراء</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-500 text-center font-bold">
                  {challengesState.map((chal, idx) => (
                    <tr key={chal.id}>
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
        <section className="pb-12">
           <SectionTitle title="الاعتماد" subtitle="Approval & Sign-off" isEditing={editModes.approvals} onToggleEdit={() => toggleEdit("approvals")} />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-sm">
             <div className="bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
               <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                 <span className="font-bold text-slate-900">الإعداد <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-2">Preparation</span></span>
                 <Edit2 className="w-4 h-4 text-slate-400" />
               </div>
               <div className="space-y-4">
                 <p className="font-bold text-slate-600 mb-6 text-center text-lg"><EditableCell isEditing={editModes.approvals} value={approvalsState.preparation.role} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, role: v as string}}))} className="text-center" /></p>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-500">الاسم:</span>
                   <span className="font-black text-slate-900 border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.preparation.name} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, name: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-500">التاريخ:</span>
                   <span className="border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.preparation.date} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, date: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-500">التوقيع:</span>
                    <span className="border-b border-slate-200 flex-1 pb-1 min-h-[40px] flex items-center">
                     <ImageUploadCell isEditing={editModes.approvals} value={approvalsState.preparation.signature} onChange={(v) => setApprovalsState(s => ({...s, preparation: {...s.preparation, signature: v as string}}))} />
                   </span>
                 </div>
               </div>
             </div>
             
             <div className="bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1 h-full bg-slate-900"></div>
               <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                 <span className="font-bold text-slate-900">المراجعة والاعتماد <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-2">Review & Approval</span></span>
                 <CheckCircle className="w-4 h-4 text-slate-400" />
               </div>
               <div className="space-y-4">
                 <p className="font-bold text-slate-600 mb-6 text-center text-lg"><EditableCell isEditing={editModes.approvals} value={approvalsState.review.role} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, role: v as string}}))} className="text-center" /></p>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-500">الاسم:</span>
                   <span className="font-black text-slate-900 border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.review.name} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, name: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-500">التاريخ:</span>
                   <span className="border-b border-slate-200 flex-1 pb-1">
                     <EditableCell isEditing={editModes.approvals} value={approvalsState.review.date} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, date: v as string}}))} />
                   </span>
                 </div>
                 <div className="flex gap-4 items-center">
                   <span className="font-bold w-16 text-slate-500">التوقيع:</span>
                   <span className="border-b border-slate-200 flex-1 pb-1 min-h-[40px] flex items-center">
                     <ImageUploadCell isEditing={editModes.approvals} value={approvalsState.review.signature} onChange={(v) => setApprovalsState(s => ({...s, review: {...s.review, signature: v as string}}))} />
                   </span>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="bg-slate-900 text-white text-center py-4 mt-6 font-bold text-sm shadow-sm flex flex-col md:flex-row items-center justify-center gap-4">
              <span className="text-slate-300">هذا التقرير معتمد ومراجع وفقاً للسياسات والإجراءات المعمول بها في قسم إدارة المرافق</span>
              <span className="hidden md:inline text-slate-600">|</span>
              <div className="flex items-center gap-2">
                <span>قسم إدارة المرافق</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400 uppercase tracking-widest text-xs">Facilities MGT</span>
              </div>
           </div>
        </section>

        {/* Toast Notification */}
        <div
          className={`fixed bottom-6 right-6 md:right-auto md:left-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded shadow-lg transition-all duration-300 print:hidden ${showToast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}
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

function SectionTitle({ title, subtitle, isEditing, onToggleEdit, onAdd, addLabel }: { title: string; subtitle: string; isEditing?: boolean; onToggleEdit?: () => void; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <span className="text-xs uppercase tracking-widest font-bold text-slate-400">{subtitle}</span>
      </div>
      <div className="flex items-center gap-2">
        {isEditing && onAdd && (
          <button onClick={onAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-sm transition-colors">
            + {addLabel || "إضافة"}
          </button>
        )}
        {onToggleEdit && (
          <button
            onClick={onToggleEdit}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 font-bold text-xs transition-colors shadow-sm"
          >
            {isEditing ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
            {isEditing ? "حفظ التعديلات" : "تعديل البيانات"}
          </button>
        )}
      </div>
    </div>
  );
}


function SummaryCard({ title, subtitle, value, icon, borderColor, fillWidth }: { title: string; subtitle: string; value: React.ReactNode; icon: React.ReactNode; borderColor: string; fillWidth: string }) {
  return (
    <div className={cn("bg-white border-r-4 p-4 shadow-sm flex flex-col justify-between min-h-[140px]", borderColor)}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-slate-500 text-xs font-bold">{title}</span>
        </div>
        <div className="text-slate-300">
           {icon}
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-4xl font-black text-slate-900">{value}</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 mt-3">
        <div className={cn("h-full", borderColor.replace('border-', 'bg-').replace('border-r', 'bg'))} style={{ width: fillWidth }}></div>
      </div>
    </div>
  );
}

function CustomDonutChart({ percentage }: { percentage: number }) {
  const radius = 80;
  const strokeWidth = 35;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="#10b981"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="butt"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
         <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-black text-slate-900"
         >
           {percentage.toFixed(0)}%
         </motion.span>
      </div>
      {/* Legend */}
      <div className="absolute -bottom-8 flex items-center gap-2">
         <div className="w-3 h-3 bg-emerald-500"></div>
         <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">منجز</span>
      </div>
    </div>
  );
}

function ContractBlock({ title, subtitle, data, borderColor, textColor, icon, isEditing, onChange }: { title: string; subtitle: string; data: ContractData; borderColor: string; textColor: string; icon: React.ReactNode; isEditing?: boolean; onChange?: (field: "active" | "inactive", val: number) => void }) {
  return (
    <div className={cn("bg-white flex flex-col border-r-4 shadow-sm p-4 border border-slate-200", borderColor)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-slate-900 text-sm font-bold">{title}</span>
          <span className="text-slate-400 text-[10px] tracking-widest uppercase">{subtitle}</span>
        </div>
        <div className="text-slate-300">
           {icon}
        </div>
      </div>
      <div className="grid grid-cols-2 mt-2 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
             <span className={cn("w-2 h-2", borderColor.replace('border-', 'bg-').replace('border-r', 'bg'))}></span>
             <span className={cn("text-xs font-bold", textColor)}>فعّالة</span>
          </div>
          {isEditing && onChange ? (
             <input type="number" value={data.active} onChange={(e) => onChange("active", parseInt(e.target.value) || 0)} className={cn("w-full border border-slate-300 p-1 text-xl font-black bg-white mt-1", textColor)} />
          ) : (
             <span className={cn("text-3xl font-black", textColor)}>{data.active}</span>
          )}
        </div>
        <div className="flex flex-col">
           <div className="flex items-center gap-1.5 mb-1">
             <span className="w-2 h-2 bg-slate-300"></span>
             <span className="text-xs font-bold text-slate-500">غير فعّالة</span>
          </div>
          {isEditing && onChange ? (
             <input type="number" value={data.inactive} onChange={(e) => onChange("inactive", parseInt(e.target.value) || 0)} className="w-full border border-slate-300 p-1 text-xl font-black bg-white mt-1 text-slate-500" />
          ) : (
             <span className="text-3xl font-black text-slate-500">{data.inactive}</span>
          )}
        </div>
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
