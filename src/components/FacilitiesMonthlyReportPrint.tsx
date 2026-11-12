import React, { useState, useRef, useMemo } from "react";
import {
  MonthlyReportExportData,
  exportA4PagesToPDF,
  triggerPrintReport,
  verifyReportDomCompleteness,
} from "../lib/exportUtils";
import {
  Printer,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
  FileText,
  CheckCircle,
  Layers,
  Eye,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface PrintReportProps {
  data: MonthlyReportExportData;
}

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MonthlyReportExportData;
  autoDownloadOnOpen?: boolean;
}

// ============================================================================
// 1. CENTRALIZED AUTOMATIC ARABIC SECTION NUMBERING ENGINE
// ============================================================================
const ARABIC_ORDINALS = [
  "أولًا",
  "ثانيًا",
  "ثالثًا",
  "رابعًا",
  "خامسًا",
  "سادسًا",
  "سابعًا",
  "ثامنًا",
  "تاسعًا",
  "عاشرًا",
  "الحادي عشر",
  "الثاني عشر",
  "الثالث عشر",
  "الرابع عشر",
  "الخامس عشر",
];

export type OfficialSectionKey =
  | "overall_performance"
  | "services_analysis"
  | "kpi_table"
  | "contracts"
  | "safety_hazards"
  | "maintenance_sites"
  | "maintenance_costs"
  | "logistics"
  | "security"
  | "other_tasks"
  | "challenges"
  | "official_approval";

const ORDERED_SECTION_KEYS: OfficialSectionKey[] = [
  "overall_performance",
  "services_analysis",
  "kpi_table",
  "contracts",
  "safety_hazards",
  "maintenance_sites",
  "maintenance_costs",
  "logistics",
  "security",
  "other_tasks",
  "challenges",
  "official_approval",
];

export function getSectionOrdinalInfo(key: OfficialSectionKey): {
  sectionNumber: number;
  ordinalLabel: string;
} {
  const index = ORDERED_SECTION_KEYS.indexOf(key);
  const sectionNumber = index >= 0 ? index + 1 : 1;
  const ordinalLabel = ARABIC_ORDINALS[sectionNumber - 1] || `القسم (${sectionNumber})`;
  return { sectionNumber, ordinalLabel };
}

/** Helper to chunk arrays for multi-page table pagination without dropping any rows */
function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (items.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

/** Determines the accurate measurement unit for each operational service */
function getServiceUnitLabel(serviceId: string, serviceName: string): string {
  if (serviceId === "s2" || serviceName.includes("النثرية") || serviceName.includes("Petty")) {
    return "دفعة / معاملة مالية";
  }
  if (serviceId === "s6" || serviceName.includes("الأصول")) {
    return "حركة أصل";
  }
  if (serviceId === "s10" || serviceName.includes("حكومية")) {
    return "معاملة حكومية";
  }
  if (serviceId === "s11" || serviceName.includes("تصريح")) {
    return "تصريح أمني";
  }
  return "طلب تشغيلي";
}

/** Official Vector SAAED Logo for A4 Print Header */
function PrintSaaedLogo() {
  return (
    <div className="inline-flex items-center gap-2 select-none" dir="ltr">
      <svg
        width="36"
        height="36"
        style={{ width: "36px", height: "36px", minWidth: "36px" }}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="printSaaedGoldMaster" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5C96B" />
            <stop offset="50%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#9E711B" />
          </linearGradient>
        </defs>
        <g transform="translate(24,24) rotate(45)">
          <rect x="-13" y="-13" width="11" height="11" rx="2" fill="url(#printSaaedGoldMaster)" />
          <rect x="2" y="-13" width="11" height="11" rx="2" fill="url(#printSaaedGoldMaster)" />
          <rect x="-13" y="2" width="11" height="11" rx="2" fill="url(#printSaaedGoldMaster)" />
          <rect x="2" y="2" width="11" height="11" rx="2" fill="url(#printSaaedGoldMaster)" fillOpacity="0.85" />
        </g>
      </svg>
      <div className="flex flex-col leading-none text-left">
        <span className="font-black text-lg text-white tracking-tight">ساعد</span>
        <span className="font-black text-[11px] text-[#D4A843] tracking-[0.14em] uppercase mt-0.5">SAAED</span>
      </div>
    </div>
  );
}

/** Official Corporate Header for Every A4 Page */
function OfficialPageHeader({
  data,
  reportId,
  pageTitle,
  compact = false,
}: {
  data: MonthlyReportExportData;
  reportId: string;
  pageTitle: string;
  compact?: boolean;
}) {
  return (
    <header className="mb-2.5 shrink-0">
      <div className="bg-[#142D4E] text-white rounded-lg border border-[#1E3A8A] border-b-[3px] border-b-[#D4A843] px-4 py-2 flex items-center justify-between">
        {/* Right Side: Department & Report Title */}
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D4A843]" />
            <span className="text-[10px] font-bold text-[#93C5FD]">
              قسم إدارة المرافق · Facilities Management Department
            </span>
          </div>
          <h1 className={compact ? "text-[15px] font-black text-white mt-0.5" : "text-base font-black text-white mt-0.5"}>
            التقرير الشهري لقسم إدارة المرافق
          </h1>
          <span className="text-[10.5px] font-bold text-[#F5C96B]">{pageTitle}</span>
        </div>

        {/* Center Meta Badges */}
        <div className="flex items-center gap-2 text-[10.5px]">
          <div className="bg-white/10 border border-white/20 rounded px-2.5 py-1 text-center">
            <span className="block text-[8.5px] text-[#93C5FD] font-bold">الشهر والسنة</span>
            <span className="font-black text-white">
              {data.monthName} {data.year}
            </span>
          </div>
          <div className="bg-white/10 border border-white/20 rounded px-2.5 py-1 text-center">
            <span className="block text-[8.5px] text-[#93C5FD] font-bold">رقم التقرير</span>
            <span className="font-black text-white tabular-nums" dir="ltr">
              {reportId}
            </span>
          </div>
          <div className="bg-white/10 border border-white/20 rounded px-2.5 py-1 text-center">
            <span className="block text-[8.5px] text-[#93C5FD] font-bold">حالة الاعتماد</span>
            <span className={data.isApproved ? "font-black text-[#10B981]" : "font-black text-[#D4A843]"}>
              {data.statusLabel || (data.isApproved ? "معتمد رسمياً" : "نسخة نشطة")}
            </span>
          </div>
        </div>

        {/* Left Side: Authentic SAAED Logo */}
        <PrintSaaedLogo />
      </div>
    </header>
  );
}

/** Official Corporate Footer for Every A4 Page */
function OfficialPageFooter({
  monthName,
  year,
  reportId,
  pageNumber,
  totalPages,
}: {
  monthName: string;
  year: number;
  reportId: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <footer className="mt-auto pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] font-bold text-slate-600 shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#142D4E]" />
        <span className="font-black text-[#142D4E]">قسم إدارة المرافق</span>
        <span className="text-slate-400">|</span>
        <span>
          التقرير التنفيذي الشهري – {monthName} {year}
        </span>
      </div>
      <div className="text-slate-500 tabular-nums" dir="ltr">
        Ref: {reportId} · ISO A4 Executive Edition
      </div>
      <div className="bg-[#F1F5F9] border border-slate-300 text-[#142D4E] font-black px-2.5 py-0.5 rounded tabular-nums">
        صفحة {pageNumber} من {totalPages}
      </div>
    </footer>
  );
}

/** Centralized Section Heading Bar with Automatic Arabic Ordinal & Continuation Support */
function PrintSectionHeading({
  sectionKey,
  title,
  subtitle,
  isContinuation = false,
  partLabel,
}: {
  sectionKey: OfficialSectionKey;
  title: string;
  subtitle: string;
  isContinuation?: boolean;
  partLabel?: string;
}) {
  const { sectionNumber, ordinalLabel } = getSectionOrdinalInfo(sectionKey);
  const badgeText = isContinuation ? `تابع ${ordinalLabel}` : ordinalLabel;
  const displayTitle = isContinuation
    ? `تابع: ${title}${partLabel ? ` (${partLabel})` : ""}`
    : `${title}${partLabel ? ` — ${partLabel}` : ""}`;

  return (
    <div
      data-section-number={sectionNumber}
      data-section-key={sectionKey}
      data-section-continuation={isContinuation ? "true" : "false"}
      className="bg-[#142D4E] text-white rounded-md px-3 py-1.5 mb-2 flex items-center justify-between border-r-4 border-r-[#D4A843]"
    >
      <div className="flex items-center gap-2">
        <span className="bg-[#D4A843] text-[#142D4E] font-black text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
          {badgeText}
        </span>
        <h2 className="text-xs font-black text-white">{displayTitle}</h2>
      </div>
      <span className="text-[9.5px] font-bold text-[#DCEBFE] uppercase tracking-wider">{subtitle}</span>
    </div>
  );
}

/**
 * Re-engineered Vector Donut Chart for Overall Department Performance
 * Guaranteed fixed bounding box (120px x 120px), centered, never clipped at 100% completion.
 */
function ExecutiveOverallDonutChart({
  overallCompletion,
  totalReceived,
  totalExecuted,
  totalPending,
  servicesCount,
}: {
  overallCompletion: number;
  totalReceived: number;
  totalExecuted: number;
  totalPending: number;
  servicesCount: number;
}) {
  const clampedPct = Math.min(100, Math.max(0, overallCompletion));
  // SVG viewBox 120x120, center (60, 60), radius 45, strokeWidth 12 -> outer edge at 51 (9px safe margin on all 4 sides)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const completedDash = (clampedPct / 100) * circumference;

  const statusText =
    totalReceived === 0
      ? "بانتظار إدخال بيانات الفترة (0.0%)"
      : clampedPct >= 95
      ? "أداء تشغيلي ممتاز ومطابق للمستهدفات المعتمدة"
      : clampedPct >= 85
      ? "أداء تشغيلي جيد ضمن النطاق المستهدف"
      : "يتطلب متابعة ومعالجة للطلبات قيد التنفيذ";

  const statusBadgeClass =
    totalReceived === 0
      ? "bg-slate-100 text-slate-700 border-slate-300"
      : clampedPct >= 95
      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
      : clampedPct >= 85
      ? "bg-amber-50 text-amber-800 border-amber-300"
      : "bg-rose-50 text-rose-800 border-rose-300";

  return (
    <div className="bg-[#F8FAFC] border border-slate-300 rounded-lg p-3">
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Right 5 Columns: Centered Vector SVG Donut + Title & Status */}
        <div className="col-span-5 flex items-center gap-3 border-l border-slate-200 pl-3">
          <div
            className="relative flex items-center justify-center shrink-0"
            style={{ width: "112px", height: "112px", minWidth: "112px", minHeight: "112px" }}
          >
            <svg
              width="112"
              height="112"
              viewBox="0 0 120 120"
              style={{ width: "112px", height: "112px", display: "block" }}
            >
              {/* Base Track Circle */}
              <circle cx="60" cy="60" r={radius} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="12" />
              {/* In-Progress Arc (Amber/Gold) when pending requests exist */}
              {totalPending > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#D4A843"
                  strokeWidth="12"
                  transform="rotate(-90 60 60)"
                />
              )}
              {/* Completed Arc (Corporate Emerald #10B981) */}
              {clampedPct > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${completedDash} ${circumference}`}
                  strokeLinecap={clampedPct >= 99.9 ? "butt" : "round"}
                  transform="rotate(-90 60 60)"
                />
              )}
              {/* Inner Decorative Ring */}
              <circle cx="60" cy="60" r="34" fill="transparent" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[17px] font-black text-[#142D4E] tabular-nums leading-none">
                {clampedPct.toFixed(1)}%
              </span>
              <span className="text-[8.5px] font-extrabold text-[#2563EB] mt-1">الأداء العام</span>
            </div>
          </div>

          <div className="flex flex-col text-right flex-1 min-w-0">
            <span className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider">
              Overall Performance
            </span>
            <h3 className="text-xs font-black text-[#142D4E] mt-0.5">الأداء العام للقسم</h3>
            <p className="text-[10px] font-bold text-slate-600 mt-1 leading-snug">
              نسبة إنجاز إجمالي الطلبات والعمليات التشغيلية المستلمة خلال الشهر.
            </p>
            <div className={`mt-1.5 inline-block border rounded px-2 py-0.5 text-[9.5px] font-black ${statusBadgeClass}`}>
              {statusText}
            </div>
          </div>
        </div>

        {/* Left 7 Columns: 4 Structured Breakdown Boxes */}
        <div className="col-span-7 grid grid-cols-4 gap-2">
          <div className="bg-white border border-slate-200 border-r-4 border-r-[#142D4E] rounded p-2 text-center">
            <span className="block text-[9.5px] font-bold text-slate-600">إجمالي المستلم</span>
            <span className="block text-lg font-black text-[#142D4E] tabular-nums my-0.5">{totalReceived}</span>
            <span className="block text-[8.5px] font-bold text-slate-400">القيمة الكلية</span>
          </div>
          <div className="bg-white border border-slate-200 border-r-4 border-r-[#10B981] rounded p-2 text-center">
            <span className="block text-[9.5px] font-bold text-emerald-800">المنجز الفعلي</span>
            <span className="block text-lg font-black text-[#10B981] tabular-nums my-0.5">{totalExecuted}</span>
            <span className="block text-[8.5px] font-bold text-emerald-700">مكتمل بنجاح</span>
          </div>
          <div className="bg-white border border-slate-200 border-r-4 border-r-[#D4A843] rounded p-2 text-center">
            <span className="block text-[9.5px] font-bold text-amber-800">قيد التنفيذ</span>
            <span className="block text-lg font-black text-[#D97706] tabular-nums my-0.5">{totalPending}</span>
            <span className="block text-[8.5px] font-bold text-amber-700">قيد المعالجة</span>
          </div>
          <div className="bg-white border border-slate-200 border-r-4 border-r-[#2563EB] rounded p-2 text-center">
            <span className="block text-[9.5px] font-bold text-blue-900">الخدمات المشمولة</span>
            <span className="block text-lg font-black text-[#2563EB] tabular-nums my-0.5">{servicesCount}</span>
            <span className="block text-[8.5px] font-bold text-blue-700">خدمة تشغيلية</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Full Operational Services Analysis Table (Sorted Descending by Actual Volume — Zero Slicing)
 */
function ServicesAnalysisTable({
  rows,
  startIndex,
  totalReceived,
  totalExecuted,
  overallCompletion,
  showTotalRow,
}: {
  rows: Array<{ id: string; name: string; received: number; executed: number }>;
  startIndex: number;
  totalReceived: number;
  totalExecuted: number;
  overallCompletion: number;
  showTotalRow: boolean;
}) {
  return (
    <table className="w-full text-[10.5px] border-collapse border border-slate-300">
      <thead>
        <tr className="bg-[#142D4E] text-white">
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-10">الترتيب</th>
          <th className="py-1.5 px-2.5 text-right font-black border border-slate-400">اسم الخدمة التشغيلية</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-20">حجم الخدمة الفعلي</th>
          <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-28">الوحدة المستخدمة</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-16">المستهدف</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-16">المتحقق</th>
          <th className="py-1.5 px-2.5 text-center font-black border border-slate-400 w-40">نسبة الإنجاز</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-20">حالة الأداء</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s, idx) => {
          const rank = startIndex + idx + 1;
          const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
          const isExcellent = s.received > 0 && ratio >= 95;
          const isGood = s.received > 0 && ratio >= 85 && ratio < 95;
          const statusLabel = s.received === 0 ? "بدون حركة (0)" : isExcellent ? "ممتاز" : isGood ? "جيد" : "متأخر";

          return (
            <tr
              key={s.id}
              data-service-analysis-row="true"
              className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}
            >
              <td className="py-1 px-1.5 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                {rank}
              </td>
              <td className="py-1 px-2.5 font-extrabold text-[#142D4E] border border-slate-300">{s.name}</td>
              <td className="py-1 px-1.5 text-center font-black text-[#2563EB] border border-slate-300 tabular-nums">
                {s.received}
              </td>
              <td className="py-1 px-2 text-center font-bold text-slate-600 border border-slate-300">
                {getServiceUnitLabel(s.id, s.name)}
              </td>
              <td className="py-1 px-1.5 text-center font-black text-slate-800 border border-slate-300 tabular-nums">
                {s.received}
              </td>
              <td className="py-1 px-1.5 text-center font-black text-[#10B981] border border-slate-300 tabular-nums">
                {s.executed}
              </td>
              <td className="py-1 px-2.5 border border-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className={
                        s.received === 0
                          ? "absolute inset-y-0 right-0 rounded-full bg-slate-400"
                          : isExcellent
                          ? "absolute inset-y-0 right-0 rounded-full bg-[#10B981]"
                          : isGood
                          ? "absolute inset-y-0 right-0 rounded-full bg-[#F59E0B]"
                          : "absolute inset-y-0 right-0 rounded-full bg-[#EF4444]"
                      }
                      style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                    />
                  </div>
                  <span className="w-11 text-left font-black text-[#142D4E] tabular-nums">{ratio.toFixed(1)}%</span>
                </div>
              </td>
              <td className="py-1 px-1.5 text-center border border-slate-300">
                <span
                  className={
                    s.received === 0
                      ? "inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600"
                      : isExcellent
                      ? "inline-block px-1.5 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : isGood
                      ? "inline-block px-1.5 py-0.5 rounded text-[9.5px] font-black bg-amber-50 text-amber-800 border border-amber-200"
                      : "inline-block px-1.5 py-0.5 rounded text-[9.5px] font-black bg-rose-50 text-rose-800 border border-rose-200"
                  }
                >
                  {statusLabel}
                </span>
              </td>
            </tr>
          );
        })}
        {showTotalRow && (
          <tr className="bg-[#142D4E] text-white font-black">
            <td colSpan={2} className="py-1.5 px-2.5 text-right border border-[#142D4E]">
              إجمالي حجم النشاط التشغيلي المسجل ({rows.length > 0 ? "جميع الخدمات" : "0"})
            </td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] tabular-nums text-[#F5C96B]">
              {totalReceived}
            </td>
            <td className="py-1.5 px-2 text-center border border-[#142D4E] text-[9.5px] text-[#DCEBFE]">
              حسب وحدة كل خدمة
            </td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] tabular-nums">{totalReceived}</td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] tabular-nums text-[#10B981]">
              {totalExecuted}
            </td>
            <td className="py-1.5 px-2.5 text-center border border-[#142D4E] tabular-nums">
              {overallCompletion.toFixed(1)}%
            </td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] text-[#D4A843]">مكتمل</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

/**
 * Full Operational KPIs Table (Preserves Approved Service Order — Zero Missing Rows)
 */
function OperationalKpisTable({
  rows,
  startIndex,
  totalReceived,
  totalExecuted,
  totalPending,
  overallCompletion,
  showTotalRow,
}: {
  rows: Array<{ id: string; name: string; received: number; executed: number }>;
  startIndex: number;
  totalReceived: number;
  totalExecuted: number;
  totalPending: number;
  overallCompletion: number;
  showTotalRow: boolean;
}) {
  return (
    <table className="w-full text-[10.5px] border-collapse border border-slate-300">
      <thead>
        <tr className="bg-[#142D4E] text-white">
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-9">م</th>
          <th className="py-1.5 px-2.5 text-right font-black border border-slate-400">المؤشر التشغيلي / الخدمة</th>
          <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-28">وحدة القياس</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-20">المستهدف</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-20">المتحقق</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-20">قيد التنفيذ</th>
          <th className="py-1.5 px-2.5 text-center font-black border border-slate-400 w-40">نسبة الإنجاز</th>
          <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-22">حالة المؤشر</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s, idx) => {
          const rowNumber = startIndex + idx + 1;
          const pending = Math.max(0, s.received - s.executed);
          const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
          const isExcellent = s.received > 0 && ratio >= 95;
          const isGood = s.received > 0 && ratio >= 85 && ratio < 95;
          const statusText = s.received === 0 ? "0.0%" : isExcellent ? "ممتاز" : isGood ? "جيد" : "متأخر";

          return (
            <tr key={s.id} data-kpi-row="true" className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
              <td className="py-1 px-1.5 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                {rowNumber}
              </td>
              <td className="py-1 px-2.5 font-extrabold text-[#142D4E] border border-slate-300">{s.name}</td>
              <td className="py-1 px-2 text-center font-bold text-slate-600 border border-slate-300">
                {getServiceUnitLabel(s.id, s.name)}
              </td>
              <td className="py-1 px-1.5 text-center font-black text-slate-800 border border-slate-300 tabular-nums">
                {s.received}
              </td>
              <td className="py-1 px-1.5 text-center font-black text-[#10B981] border border-slate-300 tabular-nums">
                {s.executed}
              </td>
              <td className="py-1 px-1.5 text-center font-black text-[#D97706] border border-slate-300 tabular-nums">
                {pending}
              </td>
              <td className="py-1 px-2.5 border border-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className={
                        s.received === 0
                          ? "absolute inset-y-0 right-0 rounded-full bg-slate-400"
                          : isExcellent
                          ? "absolute inset-y-0 right-0 rounded-full bg-[#10B981]"
                          : isGood
                          ? "absolute inset-y-0 right-0 rounded-full bg-[#F59E0B]"
                          : "absolute inset-y-0 right-0 rounded-full bg-[#EF4444]"
                      }
                      style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                    />
                  </div>
                  <span className="w-11 text-left font-black text-[#142D4E] tabular-nums">{ratio.toFixed(1)}%</span>
                </div>
              </td>
              <td className="py-1 px-1.5 text-center border border-slate-300">
                <span
                  className={
                    s.received === 0
                      ? "inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600"
                      : isExcellent
                      ? "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : isGood
                      ? "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-amber-50 text-amber-800 border border-amber-200"
                      : "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-rose-50 text-rose-800 border border-rose-200"
                  }
                >
                  {statusText}
                </span>
              </td>
            </tr>
          );
        })}
        {showTotalRow && (
          <tr className="bg-[#142D4E] text-white font-black">
            <td colSpan={3} className="py-1.5 px-2.5 text-right border border-[#142D4E]">
              الإجمالي العام لمؤشرات الأداء التشغيلية · Grand Total
            </td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] tabular-nums">{totalReceived}</td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] tabular-nums text-[#10B981]">
              {totalExecuted}
            </td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] tabular-nums text-[#F5C96B]">
              {totalPending}
            </td>
            <td className="py-1.5 px-2.5 text-center border border-[#142D4E] tabular-nums">
              {overallCompletion.toFixed(1)}%
            </td>
            <td className="py-1.5 px-1.5 text-center border border-[#142D4E] text-[#D4A843]">معتمد</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

/**
 * Re-engineered Complex Maintenance Sites Breakdown Table
 * Splits the 12 maintenance categories into 2 high-legibility 6-category column groups,
 * repeating Site Name in RTL in each group so every column is wide, clear, and 100% readable.
 */
function MaintenanceSitesSplitTables({
  sites,
  startIndex,
}: {
  sites: MonthlyReportExportData["maintenanceSites"];
  startIndex: number;
}) {
  const sumSiteNumericIssues = (site: MonthlyReportExportData["maintenanceSites"][number]) => {
    const fields: Array<keyof typeof site> = [
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
    let sum = 0;
    let hasNumeric = false;
    for (const f of fields) {
      const n = Number(site[f]);
      if (!isNaN(n) && String(site[f]).trim() !== "" && String(site[f]).trim() !== "-") {
        sum += n;
        hasNumeric = true;
      }
    }
    return hasNumeric ? sum : "-";
  };

  return (
    <div className="space-y-2.5">
      {/* Group A: First 6 Maintenance Categories */}
      <div>
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#142D4E] px-2.5 py-1 rounded-t text-[10px] font-black flex items-center justify-between">
          <span>الجدول (6-أ): أعمال الصيانة العامة والأثاث والديكور والسلامة والمياه والأبواب (6 تصنيفات)</span>
          <span className="text-[#2563EB]">Part 1: General, Furniture, Decor, Fire Safety, Plumbing & Doors</span>
        </div>
        <table className="w-full text-[10.5px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-[#142D4E] text-white">
              <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-9">م</th>
              <th className="py-1.5 px-2.5 text-right font-black border border-slate-400 w-40">المقر / الموقع</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">أعطال عامة</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">أثاث</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">أعمال ديكور</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">إنذار حريق</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">تسريب ماء</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">عطل أبواب</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site, idx) => (
              <tr
                key={`maint-a-${site.id}-${idx}`}
                data-maint-group-a-row="true"
                className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}
              >
                <td className="py-1 px-1.5 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                  {startIndex + idx + 1}
                </td>
                <td className="py-1 px-2.5 text-right font-extrabold text-[#142D4E] border border-slate-300">
                  {site.name}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.general}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.furniture}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.decor}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.fireAlarm}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.waterLeak}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.doors}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Group B: Second 6 Maintenance Categories + Site Total */}
      <div>
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#142D4E] px-2.5 py-1 rounded-t text-[10px] font-black flex items-center justify-between">
          <span>الجدول (6-ب): أعمال الإنارة والأرضيات والتكييف واللوحات والكهرباء والمصاعد (6 تصنيفات)</span>
          <span className="text-[#2563EB]">Part 2: Lighting, Flooring, HVAC, Signage, Electrical & Elevators</span>
        </div>
        <table className="w-full text-[10.5px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-[#142D4E] text-white">
              <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-9">م</th>
              <th className="py-1.5 px-2.5 text-right font-black border border-slate-400 w-40">المقر / الموقع</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">عطل إنارة</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">عطل أرضيات</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">عطل تكييف</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">لوحات خارجية</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">عطل كهرباء</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400">عطل مصاعد</th>
              <th className="py-1.5 px-2 text-center font-black border border-slate-400 bg-[#1E3A8A]">
                مجموع المقر
              </th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site, idx) => (
              <tr
                key={`maint-b-${site.id}-${idx}`}
                data-maint-group-b-row="true"
                className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}
              >
                <td className="py-1 px-1.5 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                  {startIndex + idx + 1}
                </td>
                <td className="py-1 px-2.5 text-right font-extrabold text-[#142D4E] border border-slate-300">
                  {site.name}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.lighting}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.flooring}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.ac}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.outdoorSigns}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.electrical}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                  {site.elevators}
                </td>
                <td className="py-1 px-2 text-center font-black text-[#142D4E] bg-slate-100 border border-slate-300 tabular-nums">
                  {sumSiteNumericIssues(site)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Master A4 Print & PDF Report Component with Dynamic Smart Pagination
 * Guarantees zero missing rows, zero clipped tables, automatic Arabic section numbering,
 * and 100% data integrity across all 12 official sections.
 */
export function FacilitiesMonthlyReportPrint({
  data,
  activePageFilter,
  onTotalPagesComputed,
}: PrintReportProps & {
  activePageFilter?: number | null;
  onTotalPagesComputed?: (count: number) => void;
}) {
  const reportId = data.id || `FM-${data.year}-${data.month.toString().padStart(2, "0")}`;
  const totalReceived = useMemo(
    () => data.services.reduce((acc, s) => acc + (Number(s.received) || 0), 0),
    [data.services]
  );
  const totalExecuted = useMemo(
    () => data.services.reduce((acc, s) => acc + (Number(s.executed) || 0), 0),
    [data.services]
  );
  const totalPending = Math.max(0, totalReceived - totalExecuted);
  const overallCompletion = totalReceived === 0 ? 0 : (totalExecuted / totalReceived) * 100;

  // Sort operational services descending by actual activity volume (received, then executed)
  const sortedServices = useMemo(
    () => [...data.services].sort((a, b) => b.received - a.received || b.executed - a.executed),
    [data.services]
  );

  // Dynamic pagination chunks so large datasets automatically flow to continuation pages with repeated headers
  const analysisChunks = useMemo(() => chunkArray(sortedServices, 12), [sortedServices]);
  const kpiChunks = useMemo(() => chunkArray(data.services, 12), [data.services]);
  const maintChunks = useMemo(() => chunkArray(data.maintenanceSites, 7), [data.maintenanceSites]);

  // Common A4 Portrait page style (210mm x 297mm, 12mm top/bottom, 12mm left/right margins)
  const a4PageStyle: React.CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    height: "297mm",
    padding: "11mm 12mm",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    pageBreakAfter: "always",
    breakAfter: "page",
  };

  // Build ordered list of A4 Page descriptors dynamically
  const pageDescriptors = useMemo(() => {
    const pages: Array<{ title: string; compactHeader?: boolean; content: React.ReactNode }> = [];

    // -------------------------------------------------------------------------
    // PAGE 1: Executive Summary, Overall Department Performance & Services Analysis (Chunk 1)
    // -------------------------------------------------------------------------
    pages.push({
      title: "الملخص التنفيذي، الأداء العام للقسم، وتحليل الخدمات التشغيلية · Executive Summary",
      compactHeader: false,
      content: (
        <>
          {/* Section 1 (أولًا): Executive KPI Summary & Overall Department Performance */}
          <section className="mb-2.5">
            <PrintSectionHeading
              sectionKey="overall_performance"
              title="مؤشرات الأداء التنفيذية والأداء العام للقسم"
              subtitle="Executive KPIs & Overall Department Performance"
            />
            {/* 4 Executive Summary Cards */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] border-t-4 border-t-[#142D4E] rounded-lg p-2 text-center">
                <span className="block text-[9.5px] font-extrabold text-slate-600">إجمالي الطلبات المستلمة</span>
                <span className="block text-xl font-black text-[#142D4E] tabular-nums my-0.5">{totalReceived}</span>
                <span className="block text-[8.5px] font-bold text-slate-500">Total Received Requests</span>
              </div>
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] border-t-4 border-t-[#10B981] rounded-lg p-2 text-center">
                <span className="block text-[9.5px] font-extrabold text-[#065F46]">إجمالي الطلبات المنجزة</span>
                <span className="block text-xl font-black text-[#047857] tabular-nums my-0.5">{totalExecuted}</span>
                <span className="block text-[8.5px] font-bold text-[#065F46]">Completed Requests</span>
              </div>
              <div className="bg-[#FFFBEB] border border-[#FDE68A] border-t-4 border-t-[#D4A843] rounded-lg p-2 text-center">
                <span className="block text-[9.5px] font-extrabold text-[#92400E]">الطلبات قيد التنفيذ</span>
                <span className="block text-xl font-black text-[#B45309] tabular-nums my-0.5">{totalPending}</span>
                <span className="block text-[8.5px] font-bold text-[#92400E]">
                  In Progress ({data.services.length} خدمة)
                </span>
              </div>
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] border-t-4 border-t-[#2563EB] rounded-lg p-2 text-center">
                <span className="block text-[9.5px] font-extrabold text-[#1E40AF]">نسبة الإنجاز الكلية</span>
                <span className="block text-xl font-black text-[#1D4ED8] tabular-nums my-0.5">
                  {overallCompletion.toFixed(1)}%
                </span>
                <span className="block text-[8.5px] font-bold text-[#1E40AF]">Overall Completion Rate</span>
              </div>
            </div>

            {/* Re-engineered Full-Width Overall Department Performance Card with Bounded Vector Donut */}
            <ExecutiveOverallDonutChart
              overallCompletion={overallCompletion}
              totalReceived={totalReceived}
              totalExecuted={totalExecuted}
              totalPending={totalPending}
              servicesCount={data.services.length}
            />
          </section>

          {/* Section 2 (ثانيًا): Complete Operational Services Performance Analysis */}
          <section className="mb-1">
            <PrintSectionHeading
              sectionKey="services_analysis"
              title="تحليل أداء الخدمات التشغيلية (مرتبة تنازليًا حسب حجم النشاط الفعلي)"
              subtitle="Operational Services Performance Analysis"
            />
            <ServicesAnalysisTable
              rows={analysisChunks[0]}
              startIndex={0}
              totalReceived={totalReceived}
              totalExecuted={totalExecuted}
              overallCompletion={overallCompletion}
              showTotalRow={analysisChunks.length === 1}
            />
          </section>
        </>
      ),
    });

    // If Services Analysis has overflow chunks (>12 services), render continuation page(s)
    for (let c = 1; c < analysisChunks.length; c++) {
      const startIndex = c * 12;
      const isLastChunk = c === analysisChunks.length - 1;
      pages.push({
        title: "تابع تحليل أداء الخدمات التشغيلية · Services Performance Analysis (Cont.)",
        compactHeader: true,
        content: (
          <section className="mb-2">
            <PrintSectionHeading
              sectionKey="services_analysis"
              title="تحليل أداء الخدمات التشغيلية"
              subtitle="Operational Services Performance Analysis (Continued)"
              isContinuation
            />
            <ServicesAnalysisTable
              rows={analysisChunks[c]}
              startIndex={startIndex}
              totalReceived={totalReceived}
              totalExecuted={totalExecuted}
              overallCompletion={overallCompletion}
              showTotalRow={isLastChunk}
            />
          </section>
        ),
      });
    }

    // -------------------------------------------------------------------------
    // PAGE 2: Full Operational KPIs Table + Contracts & Licenses + Safety & Hazards
    // -------------------------------------------------------------------------
    const totalContractsActive = data.contracts.reduce((acc, c) => acc + (Number(c.active) || 0), 0);
    const totalContractsInactive = data.contracts.reduce((acc, c) => acc + (Number(c.inactive) || 0), 0);

    pages.push({
      title: "جدول مؤشرات الأداء التشغيلية، العقود والرخص، والسلامة المهنية · KPIs, Contracts & Safety",
      compactHeader: true,
      content: (
        <>
          {/* Section 3 (ثالثًا): Full Operational KPIs Table */}
          <section className="mb-2.5">
            <PrintSectionHeading
              sectionKey="kpi_table"
              title="جدول مؤشرات الأداء التشغيلية الكامل"
              subtitle="Full Operational Performance Indicators (KPIs)"
            />
            <OperationalKpisTable
              rows={kpiChunks[0]}
              startIndex={0}
              totalReceived={totalReceived}
              totalExecuted={totalExecuted}
              totalPending={totalPending}
              overallCompletion={overallCompletion}
              showTotalRow={kpiChunks.length === 1}
            />
          </section>

          {/* If KPI table fits in 1 chunk, include Section 4 (Contracts) & Section 5 (Safety) on the same page */}
          {kpiChunks.length === 1 && (
            <>
              {/* Section 4 (رابعًا): Contracts & Commercial Licenses */}
              <section className="mb-2.5">
                <PrintSectionHeading
                  sectionKey="contracts"
                  title="العقود والرخص التجارية والخدمية"
                  subtitle="Contracts & Commercial Licenses"
                />
                <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#142D4E] text-white">
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-9">م</th>
                      <th className="py-1.5 px-3 text-right font-black border border-slate-400">نوع العقد / الرخصة</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">
                        الفعّالة (سارية)
                      </th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">
                        غير الفعّالة (منتهية)
                      </th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-20">الإجمالي</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">حالة السريان</th>
                      <th className="py-1.5 px-3 text-right font-black border border-slate-400">الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contracts.map((c, idx) => {
                      const active = Number(c.active) || 0;
                      const inactive = Number(c.inactive) || 0;
                      const sum = active + inactive;
                      return (
                        <tr key={idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                          <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-3 font-extrabold text-[#142D4E] border border-slate-300">{c.type}</td>
                          <td className="py-1 px-2 text-center font-black text-[#10B981] border border-slate-300 tabular-nums">
                            {active}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#EF4444] border border-slate-300 tabular-nums">
                            {inactive}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                            {sum}
                          </td>
                          <td className="py-1 px-2 text-center border border-slate-300">
                            <span
                              className={
                                sum === 0
                                  ? "inline-block px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600"
                                  : inactive === 0
                                  ? "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-amber-50 text-amber-800 border border-amber-200"
                              }
                            >
                              {sum === 0 ? "0 مسجل" : inactive === 0 ? "سارية بالكامل" : "تتطلب تجديد"}
                            </span>
                          </td>
                          <td className="py-1 px-3 text-right font-bold text-slate-700 border border-slate-300">
                            {(c as any).notes || "-"}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#E2E8F0] font-black text-[#142D4E]">
                      <td colSpan={2} className="py-1 px-3 text-right border border-slate-300">
                        إجمالي العقود والرخص المسجلة
                      </td>
                      <td className="py-1 px-2 text-center text-[#047857] border border-slate-300 tabular-nums">
                        {totalContractsActive}
                      </td>
                      <td className="py-1 px-2 text-center text-[#B91C1C] border border-slate-300 tabular-nums">
                        {totalContractsInactive}
                      </td>
                      <td className="py-1 px-2 text-center border border-slate-300 tabular-nums">
                        {totalContractsActive + totalContractsInactive}
                      </td>
                      <td colSpan={2} className="py-1 px-3 text-right text-[9.5px] text-slate-600 border border-slate-300">
                        وحدة القياس: عقد / رخصة رسمية
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* Section 5 (خامسًا): Fire Extinguishers & Risk Observations */}
              <section className="mb-1">
                <PrintSectionHeading
                  sectionKey="safety_hazards"
                  title="الطفايات وملاحظات المخاطر والسلامة المهنية"
                  subtitle="Fire Extinguishers & Risk Observations"
                />
                <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#142D4E] text-white">
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-9">م</th>
                      <th className="py-1.5 px-3 text-right font-black border border-slate-400 w-44">بند السلامة المهنية</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400">الحالة الأولى</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-18">العدد</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400">الحالة الثانية</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-18">العدد</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-18">الإجمالي</th>
                      <th className="py-1.5 px-3 text-right font-black border border-slate-400">الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="py-1.5 px-2 text-center font-black text-[#142D4E] border border-slate-300">1</td>
                      <td className="py-1.5 px-3 font-extrabold text-[#142D4E] border border-slate-300">
                        عدد الطفايات (Fire Extinguishers)
                      </td>
                      <td className="py-1.5 px-2 text-center border border-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          فعّالة (Active)
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#10B981] border border-slate-300 tabular-nums">
                        {data.fireExtinguishers?.active ?? 0}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-rose-50 text-rose-800 border border-rose-200">
                          غير فعّالة (Inactive)
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#EF4444] border border-slate-300 tabular-nums">
                        {data.fireExtinguishers?.inactive ?? 0}
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                        {(Number(data.fireExtinguishers?.active) || 0) +
                          (Number(data.fireExtinguishers?.inactive) || 0)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-700 border border-slate-300">
                        {data.fireExtinguishers?.notes || "-"}
                      </td>
                    </tr>
                    <tr className="bg-[#F8FAFC]">
                      <td className="py-1.5 px-2 text-center font-black text-[#142D4E] border border-slate-300">2</td>
                      <td className="py-1.5 px-3 font-extrabold text-[#142D4E] border border-slate-300">
                        ملاحظات المخاطر (Risk Observations)
                      </td>
                      <td className="py-1.5 px-2 text-center border border-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          مغلقة (Closed)
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#10B981] border border-slate-300 tabular-nums">
                        {data.hazardNotes?.closed ?? 0}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                          غير مغلقة (Not Closed)
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#D97706] border border-slate-300 tabular-nums">
                        {data.hazardNotes?.notClosed ?? 0}
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                        {(Number(data.hazardNotes?.closed) || 0) + (Number(data.hazardNotes?.notClosed) || 0)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-700 border border-slate-300">
                        {data.hazardNotes?.notes || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </>
          )}
        </>
      ),
    });

    // If KPI table had overflow chunks (>12 rows), render continuation pages + Contracts & Safety
    if (kpiChunks.length > 1) {
      for (let k = 1; k < kpiChunks.length; k++) {
        const isLastKpiChunk = k === kpiChunks.length - 1;
        pages.push({
          title: "تابع جدول مؤشرات الأداء التشغيلية، العقود، والسلامة · KPIs (Cont.), Contracts & Safety",
          compactHeader: true,
          content: (
            <>
              <section className="mb-2.5">
                <PrintSectionHeading
                  sectionKey="kpi_table"
                  title="جدول مؤشرات الأداء التشغيلية الكامل"
                  subtitle="Operational Performance Indicators (Continued)"
                  isContinuation
                />
                <OperationalKpisTable
                  rows={kpiChunks[k]}
                  startIndex={k * 12}
                  totalReceived={totalReceived}
                  totalExecuted={totalExecuted}
                  totalPending={totalPending}
                  overallCompletion={overallCompletion}
                  showTotalRow={isLastKpiChunk}
                />
              </section>
              {isLastKpiChunk && (
                <>
                  <section className="mb-2.5">
                    <PrintSectionHeading
                      sectionKey="contracts"
                      title="العقود والرخص التجارية والخدمية"
                      subtitle="Contracts & Commercial Licenses"
                    />
                    <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-[#142D4E] text-white">
                          <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-9">م</th>
                          <th className="py-1.5 px-3 text-right font-black border border-slate-400">نوع العقد / الرخصة</th>
                          <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">الفعّالة</th>
                          <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">غير الفعّالة</th>
                          <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-20">الإجمالي</th>
                          <th className="py-1.5 px-3 text-right font-black border border-slate-400">الملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.contracts.map((c, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                            <td className="py-1 px-2 text-center font-black border border-slate-300">{idx + 1}</td>
                            <td className="py-1 px-3 font-extrabold border border-slate-300">{c.type}</td>
                            <td className="py-1 px-2 text-center font-black text-[#10B981] border border-slate-300">
                              {c.active}
                            </td>
                            <td className="py-1 px-2 text-center font-black text-[#EF4444] border border-slate-300">
                              {c.inactive}
                            </td>
                            <td className="py-1 px-2 text-center font-black border border-slate-300">
                              {(Number(c.active) || 0) + (Number(c.inactive) || 0)}
                            </td>
                            <td className="py-1 px-3 text-right font-bold border border-slate-300">
                              {(c as any).notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>

                  <section className="mb-1">
                    <PrintSectionHeading
                      sectionKey="safety_hazards"
                      title="الطفايات وملاحظات المخاطر والسلامة المهنية"
                      subtitle="Fire Extinguishers & Risk Observations"
                    />
                    <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-[#142D4E] text-white">
                          <th className="py-1.5 px-3 text-right font-black border border-slate-400">البند</th>
                          <th className="py-1.5 px-2 text-center font-black border border-slate-400">فعّالة / مغلقة</th>
                          <th className="py-1.5 px-2 text-center font-black border border-slate-400">غير فعّالة / غير مغلقة</th>
                          <th className="py-1.5 px-2 text-center font-black border border-slate-400">الإجمالي</th>
                          <th className="py-1.5 px-3 text-right font-black border border-slate-400">الملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="py-1 px-3 font-extrabold border border-slate-300">طفايات الحريق</td>
                          <td className="py-1 px-2 text-center font-black text-[#10B981] border border-slate-300">
                            {data.fireExtinguishers?.active ?? 0}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#EF4444] border border-slate-300">
                            {data.fireExtinguishers?.inactive ?? 0}
                          </td>
                          <td className="py-1 px-2 text-center font-black border border-slate-300">
                            {(Number(data.fireExtinguishers?.active) || 0) +
                              (Number(data.fireExtinguishers?.inactive) || 0)}
                          </td>
                          <td className="py-1 px-3 font-bold border border-slate-300">
                            {data.fireExtinguishers?.notes || "-"}
                          </td>
                        </tr>
                        <tr className="bg-[#F8FAFC]">
                          <td className="py-1 px-3 font-extrabold border border-slate-300">ملاحظات المخاطر</td>
                          <td className="py-1 px-2 text-center font-black text-[#10B981] border border-slate-300">
                            {data.hazardNotes?.closed ?? 0}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#D97706] border border-slate-300">
                            {data.hazardNotes?.notClosed ?? 0}
                          </td>
                          <td className="py-1 px-2 text-center font-black border border-slate-300">
                            {(Number(data.hazardNotes?.closed) || 0) + (Number(data.hazardNotes?.notClosed) || 0)}
                          </td>
                          <td className="py-1 px-3 font-bold border border-slate-300">
                            {data.hazardNotes?.notes || "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </>
              )}
            </>
          ),
        });
      }
    }

    // -------------------------------------------------------------------------
    // PAGE 3: Maintenance Sites Breakdown (Split Tables 6-A & 6-B) + Maintenance Costs + Logistics
    // -------------------------------------------------------------------------
    const maintFromFacilities = Number(data.maintenanceServices?.fromFacilities) || 0;
    const maintFromOthers = Number(data.maintenanceServices?.fromOthers) || 0;
    const totalMaintWorks = maintFromFacilities + maintFromOthers;

    const pettyCashNum = parseFloat(String(data.maintenanceServices?.costPettyCash).replace(/,/g, "")) || 0;
    const poCostNum = parseFloat(String(data.maintenanceServices?.costPurchaseOrder).replace(/,/g, "")) || 0;
    const totalFinancialCost = pettyCashNum + poCostNum;

    pages.push({
      title: "تفاصيل الصيانة بالمقرات، التكاليف المالية، والدعم اللوجستي · Maintenance, Costs & Logistics",
      compactHeader: true,
      content: (
        <>
          {/* Section 6 (سادسًا): Facilities & Sites Maintenance Breakdown */}
          <section className="mb-2.5">
            <PrintSectionHeading
              sectionKey="maintenance_sites"
              title="تفاصيل الصيانة بالمقرات والمواقع"
              subtitle="Facilities & Sites Maintenance Breakdown (12 Categories)"
            />
            <MaintenanceSitesSplitTables sites={maintChunks[0]} startIndex={0} />
          </section>

          {maintChunks.length === 1 && (
            <>
              {/* Section 7 (سابعًا): Maintenance Services Volume & Financial Costs (Visually Separated) */}
              <section className="mb-2.5">
                <PrintSectionHeading
                  sectionKey="maintenance_costs"
                  title="خدمات الصيانة والتكلفة المالية"
                  subtitle="Maintenance Works Volume & Approved Financial Costs"
                />
                <div className="grid grid-cols-2 gap-3">
                  {/* Block A: Maintenance Works Volume */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-[#EFF6FF] border-b border-slate-300 px-2.5 py-1 flex items-center justify-between text-[10px] font-black text-[#142D4E]">
                      <span>أ. حجم أعمال الصيانة المنفذة</span>
                      <span className="text-[#2563EB]">الوحدة: عمل صيانة</span>
                    </div>
                    <table className="w-full text-[10.5px] border-collapse">
                      <thead>
                        <tr className="bg-[#142D4E] text-white">
                          <th className="py-1 px-2 text-center font-black border border-slate-400 w-8">م</th>
                          <th className="py-1 px-2.5 text-right font-black border border-slate-400">بيان أعمال الصيانة</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400 w-24">عدد الأعمال</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="py-1 px-2 text-center font-black border border-slate-300">1</td>
                          <td className="py-1 px-2.5 font-bold text-[#142D4E] border border-slate-300">
                            أعمال صيانة مباني إدارة المرافق
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                            {maintFromFacilities}
                          </td>
                        </tr>
                        <tr className="bg-[#F8FAFC]">
                          <td className="py-1 px-2 text-center font-black border border-slate-300">2</td>
                          <td className="py-1 px-2.5 font-bold text-[#142D4E] border border-slate-300">
                            أعمال الصيانة من إدارات أخرى
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                            {maintFromOthers}
                          </td>
                        </tr>
                        <tr className="bg-[#142D4E] text-white font-black">
                          <td colSpan={2} className="py-1.5 px-2.5 text-right border border-[#142D4E]">
                            إجمالي حجم أعمال الصيانة (عمل)
                          </td>
                          <td className="py-1.5 px-2 text-center border border-[#142D4E] text-[#F5C96B] tabular-nums">
                            {totalMaintWorks}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Block B: Approved Financial Costs */}
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-[#FFFBEB] border-b border-slate-300 px-2.5 py-1 flex items-center justify-between text-[10px] font-black text-[#142D4E]">
                      <span>ب. التكاليف المالية المعتمدة للصيانة</span>
                      <span className="text-[#B45309]">الوحدة: درهم إماراتي (AED)</span>
                    </div>
                    <table className="w-full text-[10.5px] border-collapse">
                      <thead>
                        <tr className="bg-[#142D4E] text-white">
                          <th className="py-1 px-2 text-center font-black border border-slate-400 w-8">م</th>
                          <th className="py-1 px-2.5 text-right font-black border border-slate-400">بند التكلفة المالية</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400 w-28">القيمة المالية</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="py-1 px-2 text-center font-black border border-slate-300">1</td>
                          <td className="py-1 px-2.5 font-bold text-[#142D4E] border border-slate-300">
                            تكلفة النثرية (Petty Cash)
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                            {data.maintenanceServices?.costPettyCash || "-"}
                          </td>
                        </tr>
                        <tr className="bg-[#F8FAFC]">
                          <td className="py-1 px-2 text-center font-black border border-slate-300">2</td>
                          <td className="py-1 px-2.5 font-bold text-[#142D4E] border border-slate-300">
                            تكلفة أوامر الشراء (Purchase Order)
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                            {data.maintenanceServices?.costPurchaseOrder || "-"}
                          </td>
                        </tr>
                        <tr className="bg-[#142D4E] text-white font-black">
                          <td colSpan={2} className="py-1.5 px-2.5 text-right border border-[#142D4E]">
                            الإجمالي المالي المعتمد (AED)
                          </td>
                          <td className="py-1.5 px-2 text-center border border-[#142D4E] text-[#10B981] tabular-nums">
                            {totalFinancialCost > 0 ? `${totalFinancialCost.toLocaleString()} د.إ` : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Section 8 (ثامنًا): Logistics Support Operations */}
              <section className="mb-1">
                <PrintSectionHeading
                  sectionKey="logistics"
                  title="الدعم اللوجستي"
                  subtitle="Logistics Support Channels & Distribution"
                />
                <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#142D4E] text-white">
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-9">م</th>
                      <th className="py-1.5 px-2.5 text-right font-black border border-slate-400">بيان المؤشر اللوجستي</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">وحدة القياس</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 bg-[#1E3A8A]">
                        المجموع الكلي
                      </th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400">المندوب</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400">بريد الإمارات</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400">أرامكس</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400">التوزيع الداخلي</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400">أخرى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.logistics.map((row, idx) => {
                      const isPctRow = row.label.includes("النسبة") || (row as any).isPercentage;
                      return (
                        <tr key={row.id || idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                          <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2.5 font-extrabold text-[#142D4E] border border-slate-300">
                            {row.label}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-600 border border-slate-300">
                            {isPctRow ? "نسبة مئوية (%)" : "طلب لوجستي"}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-[#2563EB] bg-blue-50/40 border border-slate-300 tabular-nums">
                            {isPctRow && row.total === "-" ? "100% (موزعة)" : row.total}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                            {row.rep}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                            {row.emiratesPost}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                            {row.aramex}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                            {row.distribution}
                          </td>
                          <td className="py-1 px-2 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                            {row.other}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </>
      ),
    });

    // If Maintenance Sites had overflow chunks (>7 sites), render continuation page(s) + Costs & Logistics
    if (maintChunks.length > 1) {
      for (let m = 1; m < maintChunks.length; m++) {
        const isLastMaintChunk = m === maintChunks.length - 1;
        pages.push({
          title: "تابع تفاصيل الصيانة بالمقرات، التكاليف، والدعم اللوجستي · Maintenance (Cont.)",
          compactHeader: true,
          content: (
            <>
              <section className="mb-2.5">
                <PrintSectionHeading
                  sectionKey="maintenance_sites"
                  title="تفاصيل الصيانة بالمقرات والمواقع"
                  subtitle="Facilities & Sites Maintenance Breakdown (Continued)"
                  isContinuation
                />
                <MaintenanceSitesSplitTables sites={maintChunks[m]} startIndex={m * 7} />
              </section>
              {isLastMaintChunk && (
                <>
                  <section className="mb-2.5">
                    <PrintSectionHeading
                      sectionKey="maintenance_costs"
                      title="خدمات الصيانة والتكلفة المالية"
                      subtitle="Maintenance Works Volume & Approved Financial Costs"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-[#142D4E] text-white">
                            <th className="py-1 px-2.5 text-right font-black border border-slate-400">
                              أ. حجم أعمال الصيانة (عمل)
                            </th>
                            <th className="py-1 px-2 text-center font-black border border-slate-400 w-24">العدد</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="py-1 px-2.5 font-bold border border-slate-300">صيانة مباني إدارة المرافق</td>
                            <td className="py-1 px-2 text-center font-black border border-slate-300">
                              {maintFromFacilities}
                            </td>
                          </tr>
                          <tr className="bg-[#F8FAFC]">
                            <td className="py-1 px-2.5 font-bold border border-slate-300">صيانة من إدارات أخرى</td>
                            <td className="py-1 px-2 text-center font-black border border-slate-300">{maintFromOthers}</td>
                          </tr>
                          <tr className="bg-[#142D4E] text-white font-black">
                            <td className="py-1 px-2.5 border border-[#142D4E]">الإجمالي (عمل صيانة)</td>
                            <td className="py-1 px-2 text-center border border-[#142D4E] text-[#F5C96B]">
                              {totalMaintWorks}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-[#142D4E] text-white">
                            <th className="py-1 px-2.5 text-right font-black border border-slate-400">
                              ب. التكاليف المالية (AED)
                            </th>
                            <th className="py-1 px-2 text-center font-black border border-slate-400 w-28">القيمة</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="py-1 px-2.5 font-bold border border-slate-300">تكلفة النثرية</td>
                            <td className="py-1 px-2 text-center font-black border border-slate-300">
                              {data.maintenanceServices?.costPettyCash || "-"}
                            </td>
                          </tr>
                          <tr className="bg-[#F8FAFC]">
                            <td className="py-1 px-2.5 font-bold border border-slate-300">تكلفة أوامر الشراء</td>
                            <td className="py-1 px-2 text-center font-black border border-slate-300">
                              {data.maintenanceServices?.costPurchaseOrder || "-"}
                            </td>
                          </tr>
                          <tr className="bg-[#142D4E] text-white font-black">
                            <td className="py-1 px-2.5 border border-[#142D4E]">الإجمالي المالي المعتمد</td>
                            <td className="py-1 px-2 text-center border border-[#142D4E] text-[#10B981]">
                              {totalFinancialCost > 0 ? `${totalFinancialCost.toLocaleString()} د.إ` : "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="mb-1">
                    <PrintSectionHeading
                      sectionKey="logistics"
                      title="الدعم اللوجستي"
                      subtitle="Logistics Support Channels"
                    />
                    <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-[#142D4E] text-white">
                          <th className="py-1 px-2 text-right font-black border border-slate-400">البيان</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400">المجموع</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400">المندوب</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400">بريد الإمارات</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400">أرامكس</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400">التوزيع الداخلي</th>
                          <th className="py-1 px-2 text-center font-black border border-slate-400">أخرى</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.logistics.map((row, idx) => (
                          <tr key={row.id || idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                            <td className="py-1 px-2 font-extrabold border border-slate-300">{row.label}</td>
                            <td className="py-1 px-2 text-center font-black text-[#2563EB] border border-slate-300">
                              {row.total}
                            </td>
                            <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.rep}</td>
                            <td className="py-1 px-2 text-center font-bold border border-slate-300">
                              {row.emiratesPost}
                            </td>
                            <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.aramex}</td>
                            <td className="py-1 px-2 text-center font-bold border border-slate-300">
                              {row.distribution}
                            </td>
                            <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.other}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </>
              )}
            </>
          ),
        });
      }
    }

    // -------------------------------------------------------------------------
    // PAGE 4: Security & Reception + Other Tasks + Challenges & Recommendations + Official Approval
    // -------------------------------------------------------------------------
    pages.push({
      title: "الأمن والاستقبال، المهام الأخرى، التحديات والتوصيات، والاعتماد الرسمي · Security, Tasks & Endorsement",
      compactHeader: true,
      content: (
        <>
          {/* Section 9 (تاسعًا): Security & Reception Services */}
          <section className="mb-2.5">
            <PrintSectionHeading
              sectionKey="security"
              title="خدمات الأمن والاستقبال"
              subtitle="Security & Reception Services"
            />
            <table className="w-full text-[10.5px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-[#142D4E] text-white">
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400 w-8">م</th>
                  <th className="py-1.5 px-2.5 text-right font-black border border-slate-400 w-32">البيان (وحدة: معاملة)</th>
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400">تفعيل البطاقات</th>
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400">الزوار</th>
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400">زوار الموردين</th>
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400">حجوزات القاعات</th>
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400">تمارين الإخلاء</th>
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400">تقارير أمنية</th>
                  <th className="py-1.5 px-1.5 text-center font-black border border-slate-400">حالات طارئة</th>
                </tr>
              </thead>
              <tbody>
                {data.security.map((row, idx) => (
                  <tr key={row.id || idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                    <td className="py-1 px-1.5 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-1 px-2.5 font-extrabold text-[#142D4E] border border-slate-300">{row.label}</td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                      {row.cards}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                      {row.visitors}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                      {row.supplierVisitors}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                      {row.meetingRooms}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                      {row.evacuation}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                      {row.securityReports}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-800 border border-slate-300 tabular-nums">
                      {row.emergencies}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 10 (عاشرًا): Other Operational Tasks */}
          <section className="mb-2.5">
            <PrintSectionHeading
              sectionKey="other_tasks"
              title="المهام التشغيلية الأخرى"
              subtitle="Other Operational Tasks"
            />
            <table className="w-full text-[10.5px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-[#142D4E] text-white">
                  <th className="py-1 px-1.5 text-center font-black border border-slate-400 w-8">م</th>
                  <th className="py-1 px-2.5 text-right font-black border border-slate-400 w-44">الموضوع</th>
                  <th className="py-1 px-2.5 text-right font-black border border-slate-400">الوصف / المهمة</th>
                  <th className="py-1 px-2 text-center font-black border border-slate-400 w-24">الحالة المسجلة</th>
                  <th className="py-1 px-2 text-center font-black border border-slate-400 w-28">نسبة الإنجاز المعتمدة</th>
                </tr>
              </thead>
              <tbody>
                {data.tasks.map((t, idx) => {
                  const isUnassignedRow =
                    (t.topic === "-" || t.topic.trim() === "") &&
                    (t.task === "-" || t.task.trim() === "") &&
                    Number(t.completion) === 0;
                  return (
                    <tr key={t.id || idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                      <td className="py-1 px-1.5 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-2.5 font-extrabold text-[#142D4E] border border-slate-300 break-words">
                        {t.topic}
                      </td>
                      <td className="py-1 px-2.5 font-bold text-slate-700 border border-slate-300 break-words">
                        {t.task}
                      </td>
                      <td className="py-1 px-2 text-center border border-slate-300">
                        <span
                          className={
                            t.status === "مكتمل"
                              ? "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : t.status === "متأخرة"
                              ? "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-rose-50 text-rose-800 border border-rose-200"
                              : "inline-block px-2 py-0.5 rounded text-[9.5px] font-black bg-amber-50 text-amber-800 border border-amber-200"
                          }
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                        {t.completion}%{isUnassignedRow ? " (بند غير مفعل)" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Section 11 (الحادي عشر): Challenges & Recommendations */}
          <section className="mb-2.5">
            <PrintSectionHeading
              sectionKey="challenges"
              title="التحديات والتوصيات"
              subtitle="Executive Challenges & Recommendations"
            />
            <table className="w-full text-[10.5px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-[#142D4E] text-white">
                  <th className="py-1 px-1.5 text-center font-black border border-slate-400 w-10">رقم البند</th>
                  <th className="py-1 px-2.5 text-right font-black border border-slate-400 w-1/3">
                    التحدي أو الملاحظة
                  </th>
                  <th className="py-1 px-2.5 text-right font-black border border-slate-400 w-1/3">المستجدات</th>
                  <th className="py-1 px-2.5 text-right font-black border border-slate-400">
                    التوصية أو المعالجة المعتمدة
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.challenges.map((c, idx) => (
                  <tr key={c.id || idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                    <td className="py-1.5 px-1.5 text-center font-black text-[#142D4E] border border-slate-300 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2.5 font-extrabold text-[#142D4E] border border-slate-300 break-words leading-relaxed">
                      {c.challenge}
                    </td>
                    <td className="py-1.5 px-2.5 font-bold text-slate-700 border border-slate-300 break-words leading-relaxed">
                      {c.update}
                    </td>
                    <td className="py-1.5 px-2.5 font-bold text-[#065F46] border border-slate-300 break-words leading-relaxed">
                      {c.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section 12 (الثاني عشر): Official Endorsement & Sign-Off */}
          <section className="mt-auto">
            <PrintSectionHeading
              sectionKey="official_approval"
              title="الاعتماد والتوقيع الرسمي"
              subtitle="Official Endorsement & Sign-Off"
            />
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {/* Card 1: Report Preparation */}
              <div className="bg-[#F8FAFC] border-2 border-[#142D4E]/20 rounded-lg p-3 flex flex-col justify-between">
                <div className="bg-[#142D4E] text-white rounded px-3 py-1.5 mb-2 flex items-center justify-between border-r-4 border-r-[#D4A843]">
                  <span className="font-black text-xs">إعداد التقرير · Report Preparation</span>
                  <span className="text-[9.5px] font-bold text-[#DCEBFE]">قسم إدارة المرافق</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">الاسم:</span>
                    <span className="font-black text-[#142D4E]">{data.preparedBy?.name || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">المسمى الوظيفي:</span>
                    <span className="font-bold text-[#1E3A8A]">{data.preparedBy?.role || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">تاريخ الإعداد:</span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {data.preparedBy?.date || data.approvedAt || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">حالة الإعداد:</span>
                    <span className="font-black text-[#047857]">تم الإعداد والمراجعة الفنية</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 min-h-[38px]">
                    <span className="font-bold text-slate-600">التوقيع الرسمي:</span>
                    {data.preparedBy?.signature ? (
                      <img
                        src={data.preparedBy.signature}
                        alt="توقيع الإعداد"
                        className="max-h-9 object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-bold">______________________</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Review & Official Approval */}
              <div className="bg-[#F8FAFC] border-2 border-[#142D4E]/20 rounded-lg p-3 flex flex-col justify-between">
                <div className="bg-[#142D4E] text-white rounded px-3 py-1.5 mb-2 flex items-center justify-between border-r-4 border-r-[#10B981]">
                  <span className="font-black text-xs">المراجعة والاعتماد · Review & Approval</span>
                  <span
                    className={
                      data.isApproved
                        ? "text-[9.5px] font-black text-emerald-950 bg-[#10B981] px-2 py-0.5 rounded"
                        : "text-[9.5px] font-black text-[#142D4E] bg-[#D4A843] px-2 py-0.5 rounded"
                    }
                  >
                    {data.isApproved ? "معتمد رسمياً · APPROVED" : "قيد الاعتماد"}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">الاسم:</span>
                    <span className="font-black text-[#142D4E]">{data.approvedBy?.name || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">المسمى الوظيفي:</span>
                    <span className="font-bold text-[#1E3A8A]">{data.approvedBy?.role || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">تاريخ الاعتماد:</span>
                    <span className="font-bold text-slate-800 tabular-nums">{data.approvedAt || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-600">حالة الاعتماد:</span>
                    <span className={data.isApproved ? "font-black text-[#047857]" : "font-black text-[#B45309]"}>
                      {data.statusLabel || (data.isApproved ? "معتمد ومؤرشف رسمياً" : "بانتظار الاعتماد")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 min-h-[38px]">
                    <span className="font-bold text-slate-600">التوقيع الرسمي:</span>
                    {data.approvedBy?.signature ? (
                      <img
                        src={data.approvedBy.signature}
                        alt="توقيع الاعتماد"
                        className="max-h-9 object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 font-bold">______________________</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ),
    });

    return pages;
  }, [
    data,
    totalReceived,
    totalExecuted,
    totalPending,
    overallCompletion,
    analysisChunks,
    kpiChunks,
    maintChunks,
  ]);

  const totalPages = pageDescriptors.length;

  React.useEffect(() => {
    if (onTotalPagesComputed) {
      onTotalPagesComputed(totalPages);
    }
  }, [totalPages, onTotalPagesComputed]);

  return (
    <div
      id="facilities-print-report-root"
      dir="rtl"
      data-expected-kpi-count={data.services.length}
      data-expected-maint-count={data.maintenanceSites.length}
      data-total-pages={totalPages}
      className="font-sans text-slate-900 flex flex-col items-center gap-6 print:gap-0"
    >
      {pageDescriptors.map((page, index) => {
        const pageNumber = index + 1;
        if (activePageFilter && activePageFilter !== pageNumber) {
          return null;
        }
        return (
          <div
            key={`a4-page-${pageNumber}`}
            data-page-number={pageNumber}
            className="a4-report-page shadow-xl print:shadow-none border border-slate-300 print:border-0"
            style={a4PageStyle}
          >
            <div className="flex-1 flex flex-col">
              <OfficialPageHeader
                data={data}
                reportId={reportId}
                pageTitle={page.title}
                compact={page.compactHeader}
              />
              {page.content}
            </div>
            <OfficialPageFooter
              monthName={data.monthName}
              year={data.year}
              reportId={reportId}
              pageNumber={pageNumber}
              totalPages={totalPages}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interactive Official A4 Report Preview & PDF Export Modal with Live Quality Gate Badge
 */
export function FacilitiesReportPrintPreviewModal({
  isOpen,
  onClose,
  data,
}: PrintPreviewModalProps) {
  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);
  const [isExporting, setIsExporting] = useState(false);
  const [qualityError, setQualityError] = useState<string | null>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!printContainerRef.current) return;
    setQualityError(null);
    setIsExporting(true);

    // Ensure all pages are mounted in DOM before running quality gate and PDF export
    const prevMode = viewMode;
    if (prevMode !== "all") {
      setViewMode("all");
      await new Promise(r => setTimeout(r, 180));
    }

    const check = verifyReportDomCompleteness(printContainerRef.current);
    if (!check.passed) {
      setQualityError(check.errors.join(" | "));
      setIsExporting(false);
      return;
    }

    const filename = `Facilities_Report_${data.year}_${data.month.toString().padStart(2, "0")}_Executive_A4.pdf`;
    await exportA4PagesToPDF(printContainerRef.current, filename, loading => setIsExporting(loading));

    if (prevMode !== "all") {
      setViewMode(prevMode);
    }
  };

  const handleNativePrint = async () => {
    if (viewMode !== "all") {
      setViewMode("all");
      await new Promise(r => setTimeout(r, 180));
    }
    triggerPrintReport();
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col overflow-hidden print:static print:bg-white print:p-0"
      dir="rtl"
    >
      {/* Top Control Bar (Hidden in native browser print) */}
      <div className="bg-[#142D4E] text-white border-b-2 border-[#D4A843] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D4A843] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#F5C96B]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white">
                معاينة التقرير التنفيذي الرسمي للطباعة والتصدير (A4 Master Edition)
              </h2>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  بوابة الجودة: مكتمل ({data.services.length}/{data.services.length} مؤشر · 12/12 قسم)
                </span>
              </span>
            </div>
            <p className="text-[11px] text-[#93C5FD] font-bold mt-0.5">
              التقرير الشهري لقسم إدارة المرافق — {data.monthName} {data.year} · إجمالي الصفحات: {totalPages} صفحات A4
            </p>
          </div>
        </div>

        {/* Center Page Navigation Controls */}
        <div className="flex items-center gap-2 bg-[#0B1E38] border border-white/15 rounded-xl px-3 py-1.5">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "all" ? "single" : "all")}
            className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#DCEBFE] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {viewMode === "all" ? (
              <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-[#F5C96B]" />
            )}
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
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-1">
            {pageNumbers.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setViewMode("single");
                  setCurrentPage(p);
                }}
                className={
                  viewMode === "single" && currentPage === p
                    ? "w-6 h-6 rounded-md bg-[#D4A843] text-[#142D4E] font-black text-xs cursor-pointer"
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
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Left Action Buttons: Print, Download PDF, Close */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNativePrint}
            className="bg-white hover:bg-slate-100 text-[#142D4E] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#142D4E]" />
            <span>طباعة A4</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="bg-gradient-to-b from-[#E5B85B] via-[#D4A843] to-[#B8862D] hover:from-[#F0C76E] hover:to-[#C99738] disabled:opacity-50 text-[#142D4E] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#142D4E]" />
            <span>{isExporting ? "جاري التحقق وإنشاء PDF..." : "تصدير PDF معتمد"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>
        </div>
      </div>

      {/* Quality Gate Alert Banner (if any check ever fails) */}
      {qualityError && (
        <div className="bg-rose-600 text-white px-6 py-2 text-xs font-black flex items-center gap-2 print:hidden">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>تنبيه بوابة الجودة: {qualityError}</span>
        </div>
      )}

      {/* Scrollable A4 Sheets Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-800/90 print:p-0 print:bg-white print:overflow-visible">
        <div ref={printContainerRef} className="print:w-full">
          <FacilitiesMonthlyReportPrint
            data={data}
            activePageFilter={viewMode === "single" ? currentPage : null}
            onTotalPagesComputed={count => setTotalPages(count)}
          />
        </div>
      </div>
    </div>
  );
}
