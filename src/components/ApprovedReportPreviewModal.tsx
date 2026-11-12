import React, { useRef, useState } from "react";
import { ApprovedReportSnapshot } from "../types";
import {
  Printer,
  Download,
  FileSpreadsheet,
  X,
  ShieldCheck,
  History,
  Eye,
  Layers,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  triggerPrintReport,
  exportA4PagesToPDF,
  exportReportToExcelXlsx,
  MonthlyReportExportData,
} from "../lib/exportUtils";
import { FacilitiesMonthlyReportPrint } from "./FacilitiesMonthlyReportPrint";

interface Props {
  report: ApprovedReportSnapshot;
  onClose: () => void;
  onOpenAuditTrail?: () => void;
}

export function ApprovedReportPreviewModal({ report, onClose, onOpenAuditTrail }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  const exportData: MonthlyReportExportData = {
    ...report,
    isApproved: report.status === "approved",
    statusLabel: report.status === "approved" ? "معتمد رسمياً" : "تقرير مؤرشف",
  };

  const handlePrint = async () => {
    if (viewMode !== "all") {
      setViewMode("all");
      await new Promise(r => setTimeout(r, 150));
    }
    triggerPrintReport();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    const prevMode = viewMode;
    if (prevMode !== "all") {
      setViewMode("all");
      await new Promise(r => setTimeout(r, 150));
    }
    const filename = `Facilities_Report_${report.year}_${report.month.toString().padStart(2, "0")}_Approved.pdf`;
    setIsExportingPDF(true);
    await exportA4PagesToPDF(printRef.current, filename, loading => setIsExportingPDF(loading));
    if (prevMode !== "all") {
      setViewMode(prevMode);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    await exportReportToExcelXlsx(report);
    setIsExportingExcel(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-xs overflow-hidden print:static print:bg-white print:p-0"
      dir="rtl"
    >
      {/* Top Action Toolbar */}
      <div className="bg-[#142A45] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#D4A447] shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">تقرير معتمد | A4</span>
          </div>
          <div>
            <h2 className="font-black text-sm sm:text-base text-white">معاينة التقرير الشهري المعتمد (مقاس A4 رسمي)</h2>
            <p className="text-[11px] text-[#93C5FD] font-bold">
              {report.id} · شهر {report.monthName} {report.year} {report.version > 1 ? `(الإصدار ${report.version})` : ""}
            </p>
          </div>
        </div>

        {/* Center Page Navigation */}
        <div className="flex items-center gap-2 bg-[#0B1E38] border border-white/15 rounded-xl px-3 py-1.5">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "all" ? "single" : "all")}
            className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#DCEBFE] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {viewMode === "all" ? <Eye className="w-3.5 h-3.5 text-[#38BDF8]" /> : <Layers className="w-3.5 h-3.5 text-[#F5C96B]" />}
            <span>{viewMode === "all" ? "عرض صفحة بصفحة" : "عرض جميع الصفحات"}</span>
          </button>

          <span className="h-4 w-px bg-white/20 mx-1" />

          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => {
              setViewMode("single");
              setCurrentPage(p => Math.max(1, p - 1));
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-1">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setViewMode("single");
                  setCurrentPage(p);
                }}
                className={
                  viewMode === "single" && currentPage === p
                    ? "w-6 h-6 rounded-md bg-[#D4A447] text-[#142A45] font-black text-xs cursor-pointer"
                    : "w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                }
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => {
              setViewMode("single");
              setCurrentPage(p => Math.min(totalPages, p + 1));
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-[#142A45] text-xs font-black rounded-xl transition-colors shadow-xs cursor-pointer"
            title="طباعة التقرير A4"
          >
            <Printer className="w-4 h-4 text-[#142A45]" />
            <span>طباعة A4</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-b from-[#E5B85B] via-[#D4A447] to-[#B8862D] hover:from-[#F0C76E] hover:to-[#C99738] disabled:opacity-50 text-[#142A45] text-xs font-black rounded-xl transition-colors shadow-xs cursor-pointer"
            title="تصدير ملف PDF مقاس A4"
          >
            <Download className="w-4 h-4 text-[#142A45]" />
            <span>{isExportingPDF ? "جاري التصدير..." : "تصدير PDF معتمد"}</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-colors shadow-xs cursor-pointer"
            title="تصدير ملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? "جاري التصدير..." : "Excel"}</span>
          </button>
          {onOpenAuditTrail && (
            <button
              onClick={onOpenAuditTrail}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-black rounded-xl transition-colors border border-indigo-700/50 shadow-xs cursor-pointer"
              title="سجل التدقيق والاعتماد"
            >
              <History className="w-4 h-4 text-indigo-300" />
              <span>سجل الاعتماد</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            title="إغلاق المعاينة"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>
        </div>
      </div>

      {/* Scrollable Official A4 Report Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-800/90 print:p-0 print:bg-white print:overflow-visible">
        <div ref={printRef} className="print:w-full">
          <FacilitiesMonthlyReportPrint
            data={exportData}
            activePageFilter={viewMode === "single" ? currentPage : null}
          />
        </div>
      </div>
    </div>
  );
}
