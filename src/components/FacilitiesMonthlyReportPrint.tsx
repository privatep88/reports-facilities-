import React, { useState, useRef, useMemo } from "react";
import { MonthlyReportExportData, exportA4PagesToPDF, triggerPrintReport } from "../lib/exportUtils";
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

/** Official Vector SAAED Logo for A4 Print Header */
function PrintSaaedLogo() {
  return (
    <div className="inline-flex items-center gap-2 select-none" dir="ltr">
      <svg className="w-9 h-9 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="printSaaedGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5C96B" />
            <stop offset="50%" stopColor="#D4A447" />
            <stop offset="100%" stopColor="#9E711B" />
          </linearGradient>
        </defs>
        <g transform="translate(24,24) rotate(45)">
          <rect x="-13" y="-13" width="11" height="11" rx="2" fill="url(#printSaaedGold)" />
          <rect x="2" y="-13" width="11" height="11" rx="2" fill="url(#printSaaedGold)" />
          <rect x="-13" y="2" width="11" height="11" rx="2" fill="url(#printSaaedGold)" />
          <rect x="2" y="2" width="11" height="11" rx="2" fill="url(#printSaaedGold)" fillOpacity="0.85" />
        </g>
      </svg>
      <div className="flex flex-col leading-none text-left">
        <span className="font-black text-lg text-white tracking-tight">ساعد</span>
        <span className="font-black text-[11px] text-[#F5C96B] tracking-[0.14em] uppercase mt-0.5">SAAED</span>
      </div>
    </div>
  );
}

/** Official Corporate Header for A4 Pages */
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
    <header className="mb-3 shrink-0">
      <div className="bg-[#142A45] text-white rounded-lg border border-[#1E3A8A] border-b-[3px] border-b-[#D4A447] px-4 py-2.5 flex items-center justify-between">
        {/* Right Side: Department & Report Title */}
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D4A447]" />
            <span className="text-[11px] font-bold text-[#93C5FD]">
              قسم إدارة المرافق · Facilities Management Department
            </span>
          </div>
          <h1 className={compact ? "text-base font-black text-white mt-0.5" : "text-lg font-black text-white mt-0.5"}>
            التقرير الشهري لقسم إدارة المرافق
          </h1>
          <span className="text-[11px] font-bold text-[#F5C96B]">{pageTitle}</span>
        </div>

        {/* Center Meta Badges */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="bg-white/10 border border-white/20 rounded px-2.5 py-1 text-center">
            <span className="block text-[9px] text-[#93C5FD] font-bold">الفترة</span>
            <span className="font-black text-white">
              {data.monthName} {data.year}
            </span>
          </div>
          <div className="bg-white/10 border border-white/20 rounded px-2.5 py-1 text-center">
            <span className="block text-[9px] text-[#93C5FD] font-bold">رقم التقرير</span>
            <span className="font-black text-white" dir="ltr">
              {reportId}
            </span>
          </div>
          <div className="bg-white/10 border border-white/20 rounded px-2.5 py-1 text-center">
            <span className="block text-[9px] text-[#93C5FD] font-bold">الحالة</span>
            <span className={data.isApproved ? "font-black text-emerald-300" : "font-black text-[#F5C96B]"}>
              {data.statusLabel || (data.isApproved ? "معتمد رسمياً" : "مسودة / نشط")}
            </span>
          </div>
        </div>

        {/* Left Side: Authentic SAAED Logo */}
        <PrintSaaedLogo />
      </div>
    </header>
  );
}

/** Official Corporate Footer for A4 Pages */
function OfficialPageFooter({
  monthName,
  year,
  pageNumber,
  totalPages,
}: {
  monthName: string;
  year: number;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <footer className="mt-auto pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] font-bold text-slate-600 shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#142A45]" />
        <span className="font-black text-[#142A45]">قسم إدارة المرافق</span>
        <span className="text-slate-400">|</span>
        <span>التقرير الشهري – {monthName} {year}</span>
      </div>
      <div className="text-slate-500">هذا التقرير رسمي ومعد للاستخدام المؤسسي الداخلي</div>
      <div className="bg-[#F1F5F9] border border-slate-300 text-[#142A45] font-black px-2.5 py-0.5 rounded">
        صفحة {pageNumber} من {totalPages}
      </div>
    </footer>
  );
}

/** Section Heading Bar for Print Report */
function PrintSectionHeading({
  numberLabel,
  title,
  subtitle,
}: {
  numberLabel: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white rounded-md px-3 py-1.5 mb-2 flex items-center justify-between border-r-4 border-r-[#D4A447]">
      <div className="flex items-center gap-2">
        <span className="bg-[#D4A447] text-[#142A45] font-black text-[10px] px-1.5 py-0.5 rounded">
          {numberLabel}
        </span>
        <h2 className="text-xs sm:text-[13px] font-black text-white">{title}</h2>
      </div>
      <span className="text-[10px] font-bold text-[#DCEBFE] uppercase tracking-wider">{subtitle}</span>
    </div>
  );
}

/**
 * Standalone A4 Print & PDF Report Component
 * Uses exact ISO A4 Portrait geometry (210mm x 297mm, 15mm top/bottom, 12mm left/right margins)
 */
export function FacilitiesMonthlyReportPrint({
  data,
  activePageFilter,
}: PrintReportProps & { activePageFilter?: number | null }) {
  const reportId = data.id || `FM-${data.year}-${data.month.toString().padStart(2, "0")}`;
  const totalReceived = Number(data.summary.totalReceived) || 0;
  const totalExecuted = Number(data.summary.totalExecuted) || 0;
  const totalPending = Math.max(0, totalReceived - totalExecuted);
  const overallCompletion = totalReceived === 0 ? 0 : (totalExecuted / totalReceived) * 100;

  // Sort operational services descending by actual volume
  const sortedServices = useMemo(
    () => [...data.services].sort((a, b) => b.received - a.received || b.executed - a.executed),
    [data.services]
  );

  // Donut Chart geometry
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const completedArc = (Math.min(100, Math.max(0, overallCompletion)) / 100) * circumference;

  const totalPages = 3;

  // Common A4 page style (210mm x 297mm, padding 14mm top/bottom, 12mm left/right)
  const a4PageStyle: React.CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    height: "297mm",
    padding: "13mm 12mm",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    pageBreakAfter: "always",
    breakAfter: "page",
  };

  return (
    <div
      id="facilities-print-report-root"
      dir="rtl"
      className="font-sans text-slate-900 flex flex-col items-center gap-6 print:gap-0"
    >
      {/* =====================================================================
          PAGE 1: الملخص التنفيذي ومؤشرات الأداء التشغيلية
         ===================================================================== */}
      {(!activePageFilter || activePageFilter === 1) && (
        <div className="a4-report-page shadow-xl print:shadow-none border border-slate-300 print:border-0" style={a4PageStyle}>
          <div className="flex-1 flex flex-col">
            <OfficialPageHeader
              data={data}
              reportId={reportId}
              pageTitle="الملخص التنفيذي ومؤشرات الأداء التشغيلية · Executive Summary & Operational KPIs"
            />

            {/* 1. Executive KPI Summary Cards */}
            <section className="mb-3">
              <PrintSectionHeading
                numberLabel="أولاً"
                title="مؤشرات الأداء التنفيذية الرئيسية"
                subtitle="Executive KPI Summary"
              />
              <div className="grid grid-cols-4 gap-2.5">
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] border-t-4 border-t-[#4338CA] rounded-lg p-2.5 text-center">
                  <span className="block text-[10px] font-extrabold text-slate-600">إجمالي الطلبات</span>
                  <span className="block text-2xl font-black text-[#1E1B4B] tabular-nums my-0.5">{totalReceived}</span>
                  <span className="block text-[9px] font-bold text-slate-500">Total Requests</span>
                </div>
                <div className="bg-[#FFFBEB] border border-[#FDE68A] border-t-4 border-t-[#D97706] rounded-lg p-2.5 text-center">
                  <span className="block text-[10px] font-extrabold text-[#92400E]">الطلبات المنجزة</span>
                  <span className="block text-2xl font-black text-[#78350F] tabular-nums my-0.5">{totalExecuted}</span>
                  <span className="block text-[9px] font-bold text-[#92400E]">Completed Requests</span>
                </div>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] border-t-4 border-t-[#2563EB] rounded-lg p-2.5 text-center">
                  <span className="block text-[10px] font-extrabold text-[#1E40AF]">الطلبات قيد التنفيذ</span>
                  <span className="block text-2xl font-black text-[#1E3A8A] tabular-nums my-0.5">{totalPending}</span>
                  <span className="block text-[9px] font-bold text-[#1E40AF]">In Progress ({data.services.length} خدمة)</span>
                </div>
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] border-t-4 border-t-[#059669] rounded-lg p-2.5 text-center">
                  <span className="block text-[10px] font-extrabold text-[#065F46]">نسبة الإنجاز الكلية</span>
                  <span className="block text-2xl font-black text-[#047857] tabular-nums my-0.5">
                    {overallCompletion.toFixed(1)}%
                  </span>
                  <span className="block text-[9px] font-bold text-[#065F46]">Overall Completion</span>
                </div>
              </div>
            </section>

            {/* 2. Overall Department Performance + Top Services Analysis */}
            <section className="mb-3">
              <PrintSectionHeading
                numberLabel="ثانياً"
                title="الأداء العام للقسم وتحليل أداء الخدمات التشغيلية"
                subtitle="Overall Performance & Operational Analysis"
              />
              <div className="grid grid-cols-12 gap-3 items-stretch">
                {/* Right 5 Cols: Donut Chart & Department Summary */}
                <div className="col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
                  <div className="text-xs font-black text-[#142A45] border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
                    <span>توزيع الأداء العام للقسم</span>
                    <span className="text-[10px] text-[#2563EB]">Overall Status</span>
                  </div>
                  <div className="flex items-center justify-around gap-2 my-auto">
                    <div className="relative w-26 h-26 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#E2E8F0" strokeWidth="11" />
                        {totalPending > 0 && (
                          <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="#F59E0B"
                            strokeWidth="11"
                            strokeDasharray={`${circumference} ${circumference}`}
                          />
                        )}
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke="#10B981"
                          strokeWidth="11"
                          strokeDasharray={`${completedArc} ${circumference}`}
                          strokeLinecap="butt"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-black text-[#142A45] leading-none">
                          {overallCompletion.toFixed(0)}%
                        </span>
                        <span className="text-[9px] font-extrabold text-slate-600 mt-0.5">نسبة الإنجاز</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-[11px] flex-1">
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" />
                          <span className="font-bold text-slate-700">المنجز</span>
                        </div>
                        <span className="font-black text-[#047857] tabular-nums">{totalExecuted}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" />
                          <span className="font-bold text-slate-700">قيد التنفيذ</span>
                        </div>
                        <span className="font-black text-[#B45309] tabular-nums">{totalPending}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]" />
                          <span className="font-bold text-slate-700">متأخر</span>
                        </div>
                        <span className="font-black text-[#B91C1C] tabular-nums">0</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-600">التقييم العام للأداء:</span>
                    <span className="font-black text-[#047857] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {totalReceived === 0
                        ? "بانتظار إدخال البيانات (0%)"
                        : overallCompletion >= 95
                        ? "أداء ممتاز ومطابق للمستهدف"
                        : overallCompletion >= 85
                        ? "أداء جيد ضمن المستهدف"
                        : "يتطلب متابعة"}
                    </span>
                  </div>
                </div>

                {/* Left 7 Cols: Ranked Services Analysis Table */}
                <div className="col-span-7 bg-[#F8FAFC] border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between">
                  <div className="text-xs font-black text-[#142A45] border-b border-slate-200 pb-1.5 mb-1.5 flex items-center justify-between">
                    <span>تحليل أداء الخدمات التشغيلية (مرتبة تنازلياً حسب النشاط)</span>
                    <span className="text-[10px] text-slate-500">Top Services Analysis</span>
                  </div>
                  <table className="w-full text-[10.5px] border-collapse">
                    <thead>
                      <tr className="bg-[#E2E8F0] text-[#142A45] border-y border-slate-300">
                        <th className="py-1 px-2 text-center font-black w-12">الترتيب</th>
                        <th className="py-1 px-2 text-right font-black">الخدمة التشغيلية</th>
                        <th className="py-1 px-2 text-left font-black w-44">نسبة الإنجاز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedServices.slice(0, 6).map((s, idx) => {
                        const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                        return (
                          <tr key={s.id} className={idx % 2 === 1 ? "bg-white" : "bg-[#F8FAFC]"}>
                            <td className="py-1 px-2 text-center font-black text-[#142A45] tabular-nums">{idx + 1}</td>
                            <td className="py-1 px-2 font-bold text-[#142A45]">{s.name}</td>
                            <td className="py-1 px-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden relative">
                                  <div
                                    className="absolute inset-y-0 right-0 rounded-full bg-[#10B981]"
                                    style={{ width: `${Math.min(100, ratio)}%` }}
                                  />
                                </div>
                                <span className="w-10 text-left font-black text-[#142A45] tabular-nums">
                                  {ratio.toFixed(1)}%
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
            </section>

            {/* 3. Full Operational KPIs Table */}
            <section className="mb-1">
              <PrintSectionHeading
                numberLabel="ثالثاً"
                title="جدول مؤشرات الأداء التشغيلية وملخص جميع الخدمات"
                subtitle="Operational Performance Indicators"
              />
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-10">م</th>
                    <th className="py-1.5 px-3 text-right font-black border border-slate-400">المؤشر / الخدمة التشغيلية</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">المستهدف</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">المتحقق</th>
                    <th className="py-1.5 px-3 text-center font-black border border-slate-400 w-44">نسبة الإنجاز</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">حالة الأداء</th>
                  </tr>
                </thead>
                <tbody>
                  {data.services.map((s, idx) => {
                    const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                    const isExcellent = ratio >= 95;
                    const isGood = ratio >= 85 && ratio < 95;
                    const statusText = s.received === 0 ? "0.0%" : isExcellent ? "ممتاز" : isGood ? "جيد" : "متأخر";

                    return (
                      <tr key={s.id} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                        <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3 font-extrabold text-[#142A45] border border-slate-300">{s.name}</td>
                        <td className="py-1.5 px-2 text-center font-black text-slate-800 border border-slate-300 tabular-nums">
                          {s.received}
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-emerald-700 border border-slate-300 tabular-nums">
                          {s.executed}
                        </td>
                        <td className="py-1.5 px-3 border border-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden relative">
                              <div
                                className={
                                  isExcellent
                                    ? "absolute inset-y-0 right-0 rounded-full bg-[#10B981]"
                                    : isGood
                                    ? "absolute inset-y-0 right-0 rounded-full bg-[#F59E0B]"
                                    : "absolute inset-y-0 right-0 rounded-full bg-[#EF4444]"
                                }
                                style={{ width: `${Math.min(100, ratio)}%` }}
                              />
                            </div>
                            <span className="w-11 text-left font-black text-[#142A45] tabular-nums">
                              {ratio.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-center border border-slate-300">
                          <span
                            className={
                              s.received === 0
                                ? "inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600"
                                : isExcellent
                                ? "inline-block px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : isGood
                                ? "inline-block px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200"
                                : "inline-block px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200"
                            }
                          >
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#142A45] text-white font-black">
                    <td colSpan={2} className="py-1.5 px-3 text-right border border-[#142A45]">
                      الإجمالي العام · Total Summary
                    </td>
                    <td className="py-1.5 px-2 text-center border border-[#142A45] tabular-nums">{totalReceived}</td>
                    <td className="py-1.5 px-2 text-center border border-[#142A45] tabular-nums">{totalExecuted}</td>
                    <td className="py-1.5 px-3 text-center border border-[#142A45] tabular-nums">
                      {overallCompletion.toFixed(1)}%
                    </td>
                    <td className="py-1.5 px-2 text-center border border-[#142A45] text-[#F5C96B]">معتمد</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <OfficialPageFooter monthName={data.monthName} year={data.year} pageNumber={1} totalPages={totalPages} />
        </div>
      )}

      {/* =====================================================================
          PAGE 2: العقود والرخص، الطفايات والمخاطر، تفاصيل الصيانة، والتكلفة المالية
         ===================================================================== */}
      {(!activePageFilter || activePageFilter === 2) && (
        <div className="a4-report-page shadow-xl print:shadow-none border border-slate-300 print:border-0" style={a4PageStyle}>
          <div className="flex-1 flex flex-col">
            <OfficialPageHeader
              data={data}
              reportId={reportId}
              pageTitle="العقود، السلامة، وتفاصيل الصيانة والتكلفة المالية · Contracts, Safety & Maintenance"
              compact
            />

            {/* 4. Contracts & Licenses */}
            <section className="mb-3.5">
              <PrintSectionHeading
                numberLabel="رابعاً"
                title="العقود والرخص التجارية والخدمية"
                subtitle="Contracts & Commercial Licenses"
              />
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-10">م</th>
                    <th className="py-1.5 px-3 text-right font-black border border-slate-400">نوع العقد / الرخصة</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-28">الفعالة (سارية)</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-28">غير الفعالة (منتهية)</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">الإجمالي</th>
                    <th className="py-1.5 px-3 text-right font-black border border-slate-400">الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contracts.map((c, idx) => {
                    const active = Number(c.active) || 0;
                    const inactive = Number(c.inactive) || 0;
                    return (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                        <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3 font-extrabold text-[#142A45] border border-slate-300">{c.type}</td>
                        <td className="py-1.5 px-2 text-center font-black text-emerald-700 border border-slate-300 tabular-nums">
                          {active}
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-rose-700 border border-slate-300 tabular-nums">
                          {inactive}
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                          {active + inactive}
                        </td>
                        <td className="py-1.5 px-3 text-right font-bold text-slate-700 border border-slate-300">
                          {(c as any).notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {/* 5. Fire Extinguishers & Risk Observations */}
            <section className="mb-3.5">
              <PrintSectionHeading
                numberLabel="خامساً"
                title="الطفايات وملاحظات المخاطر والسلامة المهنية"
                subtitle="Fire Extinguishers & Risk Observations"
              />
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1.5 px-3 text-right font-black border border-slate-400 w-44">البند</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400">الحالة الأولى</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-20">العدد</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400">الحالة الثانية</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-20">العدد</th>
                    <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-20">الإجمالي</th>
                    <th className="py-1.5 px-3 text-right font-black border border-slate-400">الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="py-1.5 px-3 font-extrabold text-[#142A45] border border-slate-300">
                      طفايات الحريق (Fire Extinguishers)
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-emerald-800 border border-slate-300">
                      نشطة / صالحة
                    </td>
                    <td className="py-1.5 px-2 text-center font-black text-emerald-700 border border-slate-300 tabular-nums">
                      {data.fireExtinguishers?.active ?? 0}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-rose-800 border border-slate-300">
                      غير نشطة
                    </td>
                    <td className="py-1.5 px-2 text-center font-black text-rose-700 border border-slate-300 tabular-nums">
                      {data.fireExtinguishers?.inactive ?? 0}
                    </td>
                    <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                      {(Number(data.fireExtinguishers?.active) || 0) + (Number(data.fireExtinguishers?.inactive) || 0)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-700 border border-slate-300">
                      {data.fireExtinguishers?.notes || "-"}
                    </td>
                  </tr>
                  <tr className="bg-[#F8FAFC]">
                    <td className="py-1.5 px-3 font-extrabold text-[#142A45] border border-slate-300">
                      ملاحظات المخاطر (Hazard Notes)
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-emerald-800 border border-slate-300">
                      مغلقة (تمت المعالجة)
                    </td>
                    <td className="py-1.5 px-2 text-center font-black text-emerald-700 border border-slate-300 tabular-nums">
                      {data.hazardNotes?.closed ?? 0}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-rose-800 border border-slate-300">
                      غير مغلقة
                    </td>
                    <td className="py-1.5 px-2 text-center font-black text-rose-700 border border-slate-300 tabular-nums">
                      {data.hazardNotes?.notClosed ?? 0}
                    </td>
                    <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                      {(Number(data.hazardNotes?.closed) || 0) + (Number(data.hazardNotes?.notClosed) || 0)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-700 border border-slate-300">
                      {data.hazardNotes?.notes || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 6. Maintenance Sites Breakdown Table */}
            <section className="mb-3.5">
              <PrintSectionHeading
                numberLabel="سادساً"
                title="تفاصيل الصيانة بالمقرات والمواقع"
                subtitle="Facilities & Sites Maintenance Breakdown"
              />
              <table className="w-full text-[10px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1.5 px-1 text-center font-black border border-slate-400 w-7">م</th>
                    <th className="py-1.5 px-2 text-right font-black border border-slate-400 whitespace-nowrap">المقر</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">أعطال عامة</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">أثاث</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">ديكور</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">إنذار حريق</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">تسريب ماء</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">أبواب</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">إنارة</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">أرضيات</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">تكييف</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">لوحات</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">كهرباء</th>
                    <th className="py-1.5 px-1 text-center font-bold border border-slate-400">مصاعد</th>
                  </tr>
                </thead>
                <tbody>
                  {data.maintenanceSites.map((site, idx) => (
                    <tr key={site.id} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                      <td className="py-1.5 px-1 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2 font-extrabold text-[#142A45] border border-slate-300 whitespace-nowrap">
                        {site.name}
                      </td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.general}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.furniture}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.decor}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.fireAlarm}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.waterLeak}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.doors}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.lighting}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.flooring}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.ac}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.outdoorSigns}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.electrical}</td>
                      <td className="py-1.5 px-1 text-center font-bold border border-slate-300">{site.elevators}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 7. Maintenance Services & Financial Costs */}
            <section className="mb-1">
              <PrintSectionHeading
                numberLabel="سابعاً"
                title="خدمات الصيانة والتكلفة المالية"
                subtitle="Maintenance Services & Financial Costs"
              />
              <div className="grid grid-cols-2 gap-4">
                <table className="w-full text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#142A45] text-white">
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-10">م</th>
                      <th className="py-1.5 px-3 text-right font-black border border-slate-400">بيان خدمات الصيانة</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-24">عدد الأعمال</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="py-1.5 px-2 text-center font-black border border-slate-300">1</td>
                      <td className="py-1.5 px-3 font-bold text-[#142A45] border border-slate-300">
                        أعمال صيانة من إدارة المرافق
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {data.maintenanceServices?.fromFacilities ?? 0}
                      </td>
                    </tr>
                    <tr className="bg-[#F8FAFC]">
                      <td className="py-1.5 px-2 text-center font-black border border-slate-300">2</td>
                      <td className="py-1.5 px-3 font-bold text-[#142A45] border border-slate-300">
                        أعمال صيانة من إدارات أخرى
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {data.maintenanceServices?.fromOthers ?? 0}
                      </td>
                    </tr>
                    <tr className="bg-[#E2E8F0] font-black text-[#142A45]">
                      <td colSpan={2} className="py-1.5 px-3 text-right border border-slate-300">
                        الإجمالي الكلي لأعمال الصيانة
                      </td>
                      <td className="py-1.5 px-2 text-center border border-slate-300 tabular-nums">
                        {(Number(data.maintenanceServices?.fromFacilities) || 0) +
                          (Number(data.maintenanceServices?.fromOthers) || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#142A45] text-white">
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-10">م</th>
                      <th className="py-1.5 px-3 text-right font-black border border-slate-400">بيان التكاليف المالية</th>
                      <th className="py-1.5 px-2 text-center font-black border border-slate-400 w-28">المبلغ / القيمة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="py-1.5 px-2 text-center font-black border border-slate-300">1</td>
                      <td className="py-1.5 px-3 font-bold text-[#142A45] border border-slate-300">
                        تكلفة النثرية (Petty Cash)
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {data.maintenanceServices?.costPettyCash || "-"}
                      </td>
                    </tr>
                    <tr className="bg-[#F8FAFC]">
                      <td className="py-1.5 px-2 text-center font-black border border-slate-300">2</td>
                      <td className="py-1.5 px-3 font-bold text-[#142A45] border border-slate-300">
                        تكلفة أمر الشراء (Purchase Order)
                      </td>
                      <td className="py-1.5 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {data.maintenanceServices?.costPurchaseOrder || "-"}
                      </td>
                    </tr>
                    <tr className="bg-[#E2E8F0] font-black text-[#142A45]">
                      <td colSpan={2} className="py-1.5 px-3 text-right border border-slate-300">
                        إجمالي التكاليف المالية المعتمدة
                      </td>
                      <td className="py-1.5 px-2 text-center border border-slate-300 tabular-nums">
                        {(parseFloat(String(data.maintenanceServices?.costPettyCash)) || 0) +
                          (parseFloat(String(data.maintenanceServices?.costPurchaseOrder)) || 0) >
                        0
                          ? (
                              (parseFloat(String(data.maintenanceServices?.costPettyCash)) || 0) +
                              (parseFloat(String(data.maintenanceServices?.costPurchaseOrder)) || 0)
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <OfficialPageFooter monthName={data.monthName} year={data.year} pageNumber={2} totalPages={totalPages} />
        </div>
      )}

      {/* =====================================================================
          PAGE 3: الدعم اللوجستي، الأمن والاستقبال، المهام، التحديات، والاعتماد الرسمي
         ===================================================================== */}
      {(!activePageFilter || activePageFilter === 3) && (
        <div className="a4-report-page shadow-xl print:shadow-none border border-slate-300 print:border-0" style={a4PageStyle}>
          <div className="flex-1 flex flex-col">
            <OfficialPageHeader
              data={data}
              reportId={reportId}
              pageTitle="اللوجستيات، الأمن، المهام، التحديات والاعتماد الرسمي · Logistics, Security & Endorsement"
              compact
            />

            {/* 8. Logistics Support */}
            <section className="mb-2.5">
              <PrintSectionHeading
                numberLabel="ثامناً"
                title="الدعم اللوجستي"
                subtitle="Logistics Support Operations"
              />
              <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1 px-2 text-center font-black border border-slate-400 w-8">م</th>
                    <th className="py-1 px-2.5 text-right font-black border border-slate-400">البيان</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">المجموع الكلي</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">المندوب</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">بريد الإمارات</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">أرامكس</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">التوزيع الداخلي</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">أخرى</th>
                  </tr>
                </thead>
                <tbody>
                  {data.logistics.map((row, idx) => (
                    <tr key={row.id} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                      <td className="py-1 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-2.5 font-extrabold text-[#142A45] border border-slate-300">{row.label}</td>
                      <td className="py-1 px-2 text-center font-black text-[#1D4ED8] border border-slate-300 tabular-nums">
                        {row.total}
                      </td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300 tabular-nums">{row.rep}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300 tabular-nums">
                        {row.emiratesPost}
                      </td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300 tabular-nums">
                        {row.aramex}
                      </td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300 tabular-nums">
                        {row.distribution}
                      </td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300 tabular-nums">{row.other}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 9. Security & Reception Services */}
            <section className="mb-2.5">
              <PrintSectionHeading
                numberLabel="تاسعاً"
                title="خدمات الأمن والاستقبال"
                subtitle="Security & Reception Services"
              />
              <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1 px-2 text-center font-black border border-slate-400 w-8">م</th>
                    <th className="py-1 px-2.5 text-right font-black border border-slate-400">البيان</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">تفعيل البطاقات</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">الزوار</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">زوار الموردين</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">حجوزات القاعات</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">الإخلاء</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">تقارير أمنية</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400">حالات طارئة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.security.map((row, idx) => (
                    <tr key={row.id} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                      <td className="py-1 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-2.5 font-extrabold text-[#142A45] border border-slate-300">{row.label}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.cards}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.visitors}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.supplierVisitors}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.meetingRooms}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.evacuation}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.securityReports}</td>
                      <td className="py-1 px-2 text-center font-bold border border-slate-300">{row.emergencies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 10. Other Operational Tasks */}
            <section className="mb-2.5">
              <PrintSectionHeading
                numberLabel="عاشراً"
                title="المهام التشغيليـة الأخرى"
                subtitle="Other Operational Tasks"
              />
              <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1 px-2 text-center font-black border border-slate-400 w-8">م</th>
                    <th className="py-1 px-2.5 text-right font-black border border-slate-400 w-44">الموضوع</th>
                    <th className="py-1 px-2.5 text-right font-black border border-slate-400">المهمة / الوصف</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400 w-24">الحالة</th>
                    <th className="py-1 px-2 text-center font-black border border-slate-400 w-28">نسبة الإنجاز</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tasks.map((t, idx) => (
                    <tr key={t.id} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                      <td className="py-1 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-2.5 font-extrabold text-[#142A45] border border-slate-300">{t.topic}</td>
                      <td className="py-1 px-2.5 font-bold text-slate-700 border border-slate-300">{t.task}</td>
                      <td className="py-1 px-2 text-center font-black text-emerald-700 border border-slate-300">
                        {t.status}
                      </td>
                      <td className="py-1 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {t.completion}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 11. Challenges & Recommendations */}
            <section className="mb-2.5">
              <PrintSectionHeading
                numberLabel="حادي عشر"
                title="التحديات والتوصيات"
                subtitle="Challenges & Recommendations"
              />
              <table className="w-full text-[10.5px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#142A45] text-white">
                    <th className="py-1 px-2 text-center font-black border border-slate-400 w-8">م</th>
                    <th className="py-1 px-2.5 text-right font-black border border-slate-400">التحديات والمخاطر</th>
                    <th className="py-1 px-2.5 text-right font-black border border-slate-400">المستجدات والتحديثات</th>
                    <th className="py-1 px-2.5 text-right font-black border border-slate-400">التوصيات والمعالجة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.challenges.map((c, idx) => (
                    <tr key={c.id} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                      <td className="py-1 px-2 text-center font-black text-[#142A45] border border-slate-300 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-2.5 font-bold text-[#142A45] border border-slate-300">{c.challenge}</td>
                      <td className="py-1 px-2.5 font-bold text-slate-700 border border-slate-300">{c.update}</td>
                      <td className="py-1 px-2.5 font-bold text-emerald-800 border border-slate-300">
                        {c.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 12. Official Endorsement & Sign-Off */}
            <section className="mt-auto">
              <PrintSectionHeading
                numberLabel="ثاني عشر"
                title="الاعتماد والتوقيع الرسمي"
                subtitle="Official Endorsement & Sign-Off"
              />
              <div className="grid grid-cols-2 gap-4">
                {/* Preparation Box */}
                <div className="bg-[#F8FAFC] border border-[#93C5FD] rounded-lg p-3 flex flex-col justify-between">
                  <div className="bg-[#DCEBFE] border border-[#93C5FD] rounded px-3 py-1 mb-2 flex items-center justify-between">
                    <span className="font-black text-xs text-[#142A45]">الإعداد · Preparation</span>
                    <span className="text-[10px] font-bold text-[#1E3A8A]">قسم إدارة المرافق</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-600">الاسم:</span>
                      <span className="font-black text-[#142A45]">{data.preparedBy?.name || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-600">المسمى الوظيفي:</span>
                      <span className="font-bold text-[#173B65]">{data.preparedBy?.role || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-600">التاريخ:</span>
                      <span className="font-bold text-slate-800">{data.preparedBy?.date || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 min-h-[34px]">
                      <span className="font-bold text-slate-600">التوقيع:</span>
                      {data.preparedBy?.signature ? (
                        <img
                          src={data.preparedBy.signature}
                          alt="توقيع الإعداد"
                          className="max-h-8 object-contain"
                        />
                      ) : (
                        <span className="text-slate-400 font-bold">______________________</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review & Approval Box */}
                <div className="bg-[#F8FAFC] border border-[#93C5FD] rounded-lg p-3 flex flex-col justify-between">
                  <div className="bg-[#DCEBFE] border border-[#93C5FD] rounded px-3 py-1 mb-2 flex items-center justify-between">
                    <span className="font-black text-xs text-[#142A45]">المراجعة والاعتماد · Review & Approval</span>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                      {data.isApproved ? "معتمد رسمياً" : "قيد الاعتماد"}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-600">الاسم:</span>
                      <span className="font-black text-[#142A45]">{data.approvedBy?.name || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-600">المسمى الوظيفي:</span>
                      <span className="font-bold text-[#173B65]">{data.approvedBy?.role || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-bold text-slate-600">التاريخ:</span>
                      <span className="font-bold text-slate-800">{data.approvedAt || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 min-h-[34px]">
                      <span className="font-bold text-slate-600">التوقيع:</span>
                      {data.approvedBy?.signature ? (
                        <img
                          src={data.approvedBy.signature}
                          alt="توقيع الاعتماد"
                          className="max-h-8 object-contain"
                        />
                      ) : (
                        <span className="text-slate-400 font-bold">______________________</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <OfficialPageFooter monthName={data.monthName} year={data.year} pageNumber={3} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}

/**
 * Interactive Official A4 Report Preview & PDF Export Modal
 */
export function FacilitiesReportPrintPreviewModal({
  isOpen,
  onClose,
  data,
}: PrintPreviewModalProps) {
  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);
  const totalPages = 3;

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!printContainerRef.current) return;
    setIsExporting(true);
    // Ensure all pages are rendered in the hidden/full container before exporting
    const prevMode = viewMode;
    if (prevMode !== "all") {
      setViewMode("all");
      await new Promise(r => setTimeout(r, 150));
    }
    const filename = `Facilities_Monthly_Report_${data.year}_${data.month.toString().padStart(2, "0")}.pdf`;
    await exportA4PagesToPDF(printContainerRef.current, filename, loading => setIsExporting(loading));
    if (prevMode !== "all") {
      setViewMode(prevMode);
    }
  };

  const handleNativePrint = async () => {
    if (viewMode !== "all") {
      setViewMode("all");
      await new Promise(r => setTimeout(r, 150));
    }
    triggerPrintReport();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col overflow-hidden print:static print:bg-white print:p-0"
      dir="rtl"
    >
      {/* Top Control Bar (Hidden in native browser print) */}
      <div className="bg-[#142A45] text-white border-b-2 border-[#D4A447] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D4A447] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#F5C96B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white">
                معاينة التقرير الرسمي للطباعة والتصدير (A4 Portrait)
              </h2>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>جاهز للطباعة</span>
              </span>
            </div>
            <p className="text-[11px] text-[#93C5FD] font-bold">
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
            title="الصفحة السابقة"
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
            className="bg-white hover:bg-slate-100 text-[#142A45] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#142A45]" />
            <span>طباعة A4</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="bg-gradient-to-b from-[#E5B85B] via-[#D4A447] to-[#B8862D] hover:from-[#F0C76E] hover:to-[#C99738] disabled:opacity-50 text-[#142A45] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#142A45]" />
            <span>{isExporting ? "جاري إنشاء ملف PDF..." : "تصدير PDF معتمد"}</span>
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

      {/* Scrollable A4 Sheets Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-800/90 print:p-0 print:bg-white print:overflow-visible">
        <div ref={printContainerRef} className="print:w-full">
          <FacilitiesMonthlyReportPrint
            data={data}
            activePageFilter={viewMode === "single" ? currentPage : null}
          />
        </div>
      </div>
    </div>
  );
}
