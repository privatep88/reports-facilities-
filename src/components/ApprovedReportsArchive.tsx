import React, { useState, useEffect, useMemo } from "react";
import { ApprovedReportSnapshot, ReportAuditEntry } from "../types";
import {
  getApprovedReports,
  exportReportToExcel,
  requestReportCorrection
} from "../lib/reportsArchive";
import { ApprovedReportPreviewModal } from "./ApprovedReportPreviewModal";
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Eye,
  Printer,
  Download,
  FileSpreadsheet,
  History,
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  LayoutGrid,
  List,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  ArrowUpDown
} from "lucide-react";

interface Props {
  onBackToCurrentReport?: () => void;
  onOpenReportMonth?: (year: number, month: number) => void;
}

export function ApprovedReportsArchive({ onBackToCurrentReport, onOpenReportMonth }: Props) {
  const [reports, setReports] = useState<ApprovedReportSnapshot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "completion_desc" | "completion_asc">("date_desc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selected report for Preview Modal
  const [previewReport, setPreviewReport] = useState<ApprovedReportSnapshot | null>(null);

  // Selected report for Audit Trail Modal
  const [auditReport, setAuditReport] = useState<ApprovedReportSnapshot | null>(null);

  // Correction Request Modal
  const [correctionTarget, setCorrectionTarget] = useState<ApprovedReportSnapshot | null>(null);
  const [correctionReason, setCorrectionReason] = useState("");
  const [applicantName, setApplicantName] = useState("فيصل سويد السليماني");

  const monthsList = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const currentYear = new Date().getFullYear();

  // Load reports from archive and listen to changes
  const loadArchive = () => {
    const list = getApprovedReports();
    setReports(list);
  };

  useEffect(() => {
    loadArchive();
    const handleUpdate = () => loadArchive();
    window.addEventListener("approved-reports-updated", handleUpdate);
    return () => window.removeEventListener("approved-reports-updated", handleUpdate);
  }, []);

  // Compute Available Years from data + defaults
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>([currentYear, currentYear - 1, currentYear + 1]);
    reports.forEach(r => yearSet.add(r.year));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [reports, currentYear]);

  // Filtered & Sorted Reports
  const filteredReports = useMemo(() => {
    return reports
      .filter(r => {
        // Year filter
        if (selectedYearFilter !== "ALL" && r.year !== Number(selectedYearFilter)) {
          return false;
        }
        // Month filter
        if (selectedMonthFilter !== "ALL" && r.month !== Number(selectedMonthFilter)) {
          return false;
        }
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = r.id.toLowerCase().includes(q);
          const matchMonth = (r.monthName || "").toLowerCase().includes(q);
          const matchYear = r.year.toString().includes(q);
          const matchApprover = (r.approvedBy?.name || "").toLowerCase().includes(q);
          const matchPreparer = (r.preparedBy?.name || "").toLowerCase().includes(q);
          if (!matchId && !matchMonth && !matchYear && !matchApprover && !matchPreparer) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") {
          return b.id.localeCompare(a.id);
        } else if (sortBy === "date_asc") {
          return a.id.localeCompare(b.id);
        } else if (sortBy === "completion_desc") {
          return (b.summary?.overallCompletion || 0) - (a.summary?.overallCompletion || 0);
        } else {
          return (a.summary?.overallCompletion || 0) - (b.summary?.overallCompletion || 0);
        }
      });
  }, [reports, searchQuery, selectedYearFilter, selectedMonthFilter, sortBy]);

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const totalApproved = reports.length;
    const currentYearReports = reports.filter(r => r.year === currentYear);
    const countCurrentYear = currentYearReports.length;

    // Latest approved report
    const latest = reports.length > 0 ? reports[0] : null;

    // Average completion of current year
    const avgYearCompletion =
      countCurrentYear > 0
        ? currentYearReports.reduce((acc, r) => acc + (r.summary?.overallCompletion || 0), 0) / countCurrentYear
        : reports.length > 0
        ? reports.reduce((acc, r) => acc + (r.summary?.overallCompletion || 0), 0) / reports.length
        : 0;

    // Check localStorage workflow statuses to count pending reports
    let pendingCount = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("fm_workflow_status_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (data.status === "in_review") {
              pendingCount++;
            }
          }
        }
      }
    } catch (e) {}

    return {
      totalApproved,
      countCurrentYear,
      latest,
      avgYearCompletion,
      pendingCount
    };
  }, [reports, currentYear]);

  // Submit correction request
  const handleConfirmCorrection = () => {
    if (!correctionTarget || !correctionReason.trim()) return;
    requestReportCorrection(correctionTarget.id, correctionReason, applicantName);
    setCorrectionTarget(null);
    setCorrectionReason("");
    loadArchive();
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir="rtl">
      {/* Hero Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-black">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>الأرشيف المؤسسي المعتمد · OFFICIAL ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              أرشيف التقارير الشهرية المعتمدة
            </h1>
            <p className="text-sm font-bold text-slate-300 max-w-2xl">
              قسم إدارة المرافق والأصول · مركز الأرشفة والتوثيق الرسمي للتقارير المعتمدة لجميع الأشهر والسنوات، مع الحفظ الدائم وإمكانيات الاسترجاع والطباعة والتصدير.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onBackToCurrentReport && (
              <button
                onClick={onBackToCurrentReport}
                className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>العودة للتقرير الحالي</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Approved */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">إجمالي التقارير المعتمدة</span>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-900">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.totalApproved}</div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 mt-2 block">سجلات معتمدة ومحفوظة</span>
        </div>

        {/* KPI 2: Current Year Reports */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-blue-500 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">تقارير سنة {currentYear}</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-blue-700">{stats.countCurrentYear}</div>
          </div>
          <span className="text-[11px] font-bold text-blue-600 mt-2 block">من أصل 12 شهراً</span>
        </div>

        {/* KPI 3: Latest Report */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-emerald-500 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">آخر تقرير معتمد</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-700 truncate">
              {stats.latest ? `${stats.latest.monthName} ${stats.latest.year}` : "لا يوجد بعد"}
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400 mt-2 block truncate">
            {stats.latest ? stats.latest.id : "بانتظار أول اعتماد"}
          </span>
        </div>

        {/* KPI 4: Annual Completion Average */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-indigo-500 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">متوسط الإنجاز السنوي</span>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-indigo-700">
              {stats.avgYearCompletion > 0 ? `${stats.avgYearCompletion.toFixed(1)}%` : "-"}
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 mt-2 block">محسوب من التقارير المعتمدة</span>
        </div>

        {/* KPI 5: Pending Approval */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-amber-500 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">بانتظار الاعتماد</span>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-700">{stats.pendingCount}</div>
          </div>
          <span className="text-[11px] font-bold text-amber-600 mt-2 block">تقارير قيد المراجعة</span>
        </div>
      </div>

      {/* Advanced Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث برقم التقرير، الشهر، السنة، أو اسم المعتمد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Year Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
              >
                <option value="ALL">جميع السنوات</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <span className="text-xs font-bold text-slate-500">الشهر:</span>
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
              >
                <option value="ALL">جميع الأشهر</option>
                {monthsList.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
              >
                <option value="date_desc">الأحدث تاريخاً</option>
                <option value="date_asc">الأقدم تاريخاً</option>
                <option value="completion_desc">أعلى نسبة إنجاز</option>
                <option value="completion_asc">أقل نسبة إنجاز</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                title="عرض كجدول"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                title="عرض كبطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-bold flex justify-between items-center pt-2 border-t border-slate-100">
          <span>
            عرض <span className="font-black text-slate-900">{filteredReports.length}</span> من أصل <span className="font-black text-slate-900">{reports.length}</span> تقرير معتمد
          </span>
          {(searchQuery || selectedYearFilter !== "ALL" || selectedMonthFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedYearFilter("ALL");
                setSelectedMonthFilter("ALL");
              }}
              className="text-indigo-600 hover:underline font-bold text-xs"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* Reports Display: Table or Cards */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">لا توجد تقارير معتمدة مطابقة للبحث</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              عند اعتماد التقارير الشهرية بعد مراجعتها وتوقيعها، ستظهر هنا تلقائياً في الأرشيف الرسمي كنسخ نهائية ومؤرشفة.
            </p>
          </div>
          {onBackToCurrentReport && (
            <button
              onClick={onBackToCurrentReport}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              الانتقال لإعداد تقرير الشهر الحالي
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-right">
                  <th className="py-3 px-4">رقم التقرير</th>
                  <th className="py-3 px-4">الشهر</th>
                  <th className="py-3 px-4">السنة</th>
                  <th className="py-3 px-4 text-center">إجمالي الطلبات</th>
                  <th className="py-3 px-4 text-center">نسبة الإنجاز</th>
                  <th className="py-3 px-4">تاريخ الاعتماد</th>
                  <th className="py-3 px-4">المعتمد بواسطة</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className={`hover:bg-slate-50 transition-colors ${report.isSuperseded ? "opacity-60 bg-slate-50/50" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-black text-slate-900">{report.id}</span>
                        {report.version > 1 && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            V{report.version}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-black">{report.monthName}</td>
                    <td className="py-3 px-4 text-slate-600">{report.year}</td>
                    <td className="py-3 px-4 text-center text-slate-900 font-black">
                      {report.summary?.totalReceived || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-black text-emerald-700">
                          {report.summary?.overallCompletion?.toFixed(1) || 0}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${report.summary?.overallCompletion || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium text-[11px] whitespace-nowrap">
                      {report.approvedAt}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-bold block">{report.approvedBy?.name}</span>
                      <span className="text-slate-400 text-[10px] block">{report.approvedBy?.role}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {report.isSuperseded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-600 font-bold">
                          مستبدل بإصدار أحدث
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black border border-emerald-300 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          معتمد · APPROVED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewReport(report)}
                          className="p-1.5 text-slate-700 hover:text-white hover:bg-slate-900 rounded transition-colors"
                          title="عرض ومعاينة التقرير كاملاً"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportReportToExcel(report)}
                          className="p-1.5 text-teal-700 hover:text-white hover:bg-teal-700 rounded transition-colors"
                          title="تصدير ملف Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAuditReport(report)}
                          className="p-1.5 text-indigo-700 hover:text-white hover:bg-indigo-700 rounded transition-colors"
                          title="عرض سجل الاعتماد"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {!report.isSuperseded && (
                          <button
                            onClick={() => setCorrectionTarget(report)}
                            className="p-1.5 text-amber-700 hover:text-white hover:bg-amber-600 rounded transition-colors"
                            title="طلب تصحيح معتمد"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                report.isSuperseded ? "border-slate-200 opacity-70" : "border-slate-300"
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      قسم إدارة المرافق
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {report.monthName} {report.year}
                    </h3>
                    <span className="text-xs font-bold text-slate-500">{report.id}</span>
                  </div>

                  {report.isSuperseded ? (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
                      أرشيف تاريخي
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-black border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      معتمد
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 my-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block">إجمالي الطلبات</span>
                    <span className="text-xl font-black text-slate-900">{report.summary?.totalReceived || 0}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block">نسبة الإنجاز</span>
                    <span className="text-xl font-black text-emerald-700">
                      {report.summary?.overallCompletion?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 font-bold space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">المعتمد:</span>
                    <span className="text-slate-800">{report.approvedBy?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">تاريخ الاعتماد:</span>
                    <span className="text-slate-700">{report.approvedAt}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewReport(report)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>معاينة التقرير</span>
                </button>
                <button
                  onClick={() => exportReportToExcel(report)}
                  className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-colors"
                  title="تصدير Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAuditReport(report)}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                  title="سجل الاعتماد"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewReport && (
        <ApprovedReportPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          onOpenAuditTrail={() => {
            setAuditReport(previewReport);
          }}
        />
      )}

      {/* Audit Trail Modal */}
      {auditReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">سجل الاعتماد والعمليات المؤسسية</h3>
                  <span className="text-xs text-slate-400">{auditReport.id}</span>
                </div>
              </div>
              <button
                onClick={() => setAuditReport(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 p-1">
              {auditReport.auditTrail && auditReport.auditTrail.length > 0 ? (
                auditReport.auditTrail.map((entry, idx) => (
                  <div key={entry.id || idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-900 font-black">{entry.actionLabel}</span>
                      <span className="text-slate-400 text-[11px]">{entry.timestamp}</span>
                    </div>
                    <div className="text-slate-600 font-medium">
                      بواسطة: <span className="font-bold text-slate-800">{entry.performedBy}</span> {entry.role ? `(${entry.role})` : ""}
                    </div>
                    {entry.notes && <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">{entry.notes}</p>}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-bold">
                  لا توجد عمليات مسجلة للتقرير.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setAuditReport(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correction Request Modal */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">طلب تصحيح تقرير معتمد</h3>
                <span className="text-xs text-slate-400">{correctionTarget.id}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-bold bg-amber-50 p-3 rounded-lg border border-amber-200">
              سيتم الاحتفاظ بالنسخة المعتمدة الحالية كنسخة أرشيفية تاريخية، وفتح إصدار جديد ({`الإصدار ${correctionTarget.version + 1}`}) لإجراء التعديلات المطلوبة وإعادة اعتماده.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">سبب طلب التصحيح:</label>
              <textarea
                rows={3}
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="وضح أسباب ومبررات التعديل..."
                className="w-full border border-slate-300 p-2 text-sm rounded-lg font-bold text-slate-800 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">مقدم الطلب:</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full border border-slate-300 p-2 text-sm rounded-lg font-bold text-slate-800 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCorrectionTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmCorrection}
                disabled={!correctionReason.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>تأكيد طلب التصحيح</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
