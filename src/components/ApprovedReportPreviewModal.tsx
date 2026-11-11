import React, { useRef, useState } from "react";
import { ApprovedReportSnapshot } from "../types";
import {
  Printer,
  Download,
  FileSpreadsheet,
  X,
  ShieldCheck,
  CheckCircle,
  Home,
  ClipboardCheck,
  Wrench,
  Truck,
  Sparkles,
  Lock,
  History,
  FileText
} from "lucide-react";
import { triggerPrintReport, exportReportToPDF, exportReportToExcelXlsx } from "../lib/exportUtils";

interface Props {
  report: ApprovedReportSnapshot;
  onClose: () => void;
  onOpenAuditTrail?: () => void;
}

export function ApprovedReportPreviewModal({ report, onClose, onOpenAuditTrail }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handlePrint = () => {
    triggerPrintReport();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    const filename = `Facilities_Report_${report.year}_${report.month.toString().padStart(2, "0")}_Approved.pdf`;
    setIsExportingPDF(true);
    await exportReportToPDF(printRef.current, filename, (loading) => setIsExportingPDF(loading));
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    await exportReportToExcelXlsx(report);
    setIsExportingExcel(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Action Toolbar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg border border-emerald-500/30 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider">تقرير معتمد | APPROVED</span>
            </div>
            <div>
              <h2 className="font-black text-lg text-white">معاينة التقرير الشهري المعتمد</h2>
              <p className="text-xs text-slate-400">
                {report.id} · شهر {report.monthName} {report.year} {report.version > 1 ? `(الإصدار ${report.version})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700 shadow-sm"
              title="طباعة التقرير"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>طباعة</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              title="تصدير ملف PDF"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPDF ? "جاري التصدير..." : "تصدير PDF"}</span>
            </button>
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              title="تصدير ملف Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingExcel ? "جاري التصدير..." : "تصدير Excel"}</span>
            </button>
            {onOpenAuditTrail && (
              <button
                onClick={onOpenAuditTrail}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-bold rounded-lg transition-colors border border-indigo-700/50 shadow-sm"
                title="سجل التدقيق والاعتماد"
              >
                <History className="w-4 h-4 text-indigo-400" />
                <span>سجل الاعتماد</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mr-2"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 space-y-8" dir="rtl" ref={printRef}>
          {/* Official Header Banner */}
          <div className="bg-white border-2 border-slate-900 p-6 rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-xs font-black tracking-widest uppercase text-slate-400">قسم إدارة المرافق والأصول</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">التقرير الشهري المعتمد</h1>
                <p className="text-sm font-bold text-slate-600 mt-1">
                  تقرير أداء الخدمات والأعمال لشهر <span className="text-emerald-700 font-black">{report.monthName}</span> لعام <span className="text-slate-900 font-black">{report.year}</span>
                </p>
              </div>

              {/* Official Stamp & Badge */}
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-600 px-4 py-2 rounded-xl text-emerald-800 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <div>
                    <span className="block font-black text-sm">معتمد رسمياً · APPROVED</span>
                    <span className="block text-[11px] font-bold text-emerald-700">الرقم المرجعي: {report.id}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-bold">
                  تاريخ الاعتماد: <span className="text-slate-800 font-bold">{report.approvedAt}</span>
                </div>
              </div>
            </div>

            {/* Approver Meta bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block mb-0.5">المعتمد بواسطة:</span>
                <span className="text-slate-800 font-black text-sm">{report.approvedBy.name}</span>
                <span className="text-slate-500 block text-[11px]">{report.approvedBy.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">معد التقرير:</span>
                <span className="text-slate-800 font-black text-sm">{report.preparedBy.name}</span>
                <span className="text-slate-500 block text-[11px]">{report.preparedBy.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">حالة التقرير:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  نسخة نهائية مقفلة ومؤرشفة
                </span>
                <span className="text-slate-500 block text-[11px]">الإصدار رقم {report.version}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary KPIs */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-900"></span>
              الملخص التنفيذي · Executive Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border-r-4 border-emerald-500 border border-slate-200 p-4 shadow-sm">
                <span className="block text-slate-500 text-xs font-bold">نسبة الإنجاز الكلية</span>
                <span className="block text-2xl font-black text-emerald-600 mt-1">{report.summary.overallCompletion.toFixed(1)}%</span>
              </div>
              <div className="bg-white border-r-4 border-blue-500 border border-slate-200 p-4 shadow-sm">
                <span className="block text-slate-500 text-xs font-bold">إجمالي الخدمات</span>
                <span className="block text-2xl font-black text-blue-600 mt-1">{report.summary.totalServicesCount}</span>
              </div>
              <div className="bg-white border-r-4 border-amber-500 border border-slate-200 p-4 shadow-sm">
                <span className="block text-slate-500 text-xs font-bold">أعلى خدمة طلباً</span>
                <span className="block text-2xl font-black text-amber-600 mt-1">{report.summary.topServiceReceived || 0}</span>
                <span className="block text-xs font-bold text-slate-400 truncate">{report.summary.topServiceName || "-"}</span>
              </div>
              <div className="bg-white border-r-4 border-slate-900 border border-slate-200 p-4 shadow-sm">
                <span className="block text-slate-500 text-xs font-bold">إجمالي الطلبات المستلمة</span>
                <span className="block text-2xl font-black text-slate-900 mt-1">{report.summary.totalReceived}</span>
                <span className="block text-xs font-bold text-slate-400">المنفذ: {report.summary.totalExecuted}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Services Summary Table */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-900"></span>
              ملخص الخدمات ومؤشرات الأداء · Services Performance
            </h3>
            <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="py-2.5 px-3 text-right">#</th>
                    <th className="py-2.5 px-3 text-right">الخدمة</th>
                    <th className="py-2.5 px-3 text-center">المستلمة</th>
                    <th className="py-2.5 px-3 text-center">المنفذة</th>
                    <th className="py-2.5 px-3 text-center w-28">مؤشر الإنجاز</th>
                    <th className="py-2.5 px-3 text-center">النسبة</th>
                    <th className="py-2.5 px-3 text-center">المستوى</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {report.services.map((s, idx) => {
                    const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                    const level = ratio >= 95 ? "مرتفع" : ratio >= 85 ? "متوسط" : "منخفض";
                    const levelColor = ratio >= 95 ? "text-emerald-700 bg-emerald-50" : ratio >= 85 ? "text-amber-700 bg-amber-50" : "text-rose-700 bg-rose-50";
                    return (
                      <tr key={s.id || idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 text-slate-800 font-black">{s.name}</td>
                        <td className="py-2 px-3 text-center text-slate-900">{s.received}</td>
                        <td className="py-2 px-3 text-center text-slate-900">{s.executed}</td>
                        <td className="py-2 px-3 text-center">
                          <div className="h-1.5 bg-slate-100 w-full relative overflow-hidden rounded">
                            <div className="h-full bg-slate-900 absolute top-0 right-0" style={{ width: `${ratio}%` }}></div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-900">{ratio.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${levelColor}`}>{level}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Contracts & Licenses */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-900"></span>
              العقود والرخص · Contracts & Licenses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {report.contracts?.map((c, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-4 shadow-sm border-r-4 border-slate-800">
                  <span className="block font-bold text-sm text-slate-900 mb-2">{c.type}</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-emerald-50 p-2 rounded">
                      <span className="text-[11px] font-bold text-emerald-700 block">فعّالة</span>
                      <span className="text-xl font-black text-emerald-800">{c.active}</span>
                    </div>
                    <div className="bg-slate-100 p-2 rounded">
                      <span className="text-[11px] font-bold text-slate-600 block">غير فعّالة</span>
                      <span className="text-xl font-black text-slate-700">{c.inactive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Fire Extinguishers & Risk Observations */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-900"></span>
              الطفايات وملاحظات المخاطر · Fire Extinguishers & Hazard Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Extinguishers */}
              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-[#C9A961] text-white py-2 px-4 flex items-center justify-center gap-2 font-bold text-sm">
                  <Home className="w-4 h-4 text-white" />
                  <span>عدد الطفايات · fire extinguishers</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 p-4 text-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 block mb-1">فعّالة · Active</span>
                    <span className="text-3xl font-black text-emerald-700">{report.fireExtinguishers?.active ?? 0}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">عدد الطفايات الفعّالة</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-700 block mb-1">غير فعّالة · Inactive</span>
                    <span className="text-3xl font-black text-rose-700">{report.fireExtinguishers?.inactive ?? 0}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">عدد الطفايات غير الفعّالة</span>
                  </div>
                </div>
                {report.fireExtinguishers?.notes && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 flex justify-between">
                    <span className="text-slate-900">الملاحظات:</span>
                    <span>{report.fireExtinguishers.notes}</span>
                  </div>
                )}
              </div>

              {/* Card 2: Risk Observations */}
              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-[#0E7490] text-white py-2 px-4 flex items-center justify-center gap-2 font-bold text-sm">
                  <FileText className="w-4 h-4 text-white" />
                  <span>عدد ملاحظات المخاطر · risk observations</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 p-4 text-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 block mb-1">مغلقة · Closed</span>
                    <span className="text-3xl font-black text-emerald-700">{report.hazardNotes?.closed ?? 0}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">عدد المخاطر المغلقة</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-700 block mb-1">غير مغلقة · Not closed</span>
                    <span className="text-3xl font-black text-rose-700">{report.hazardNotes?.notClosed ?? 0}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">عدد المخاطر غير المغلقة</span>
                  </div>
                </div>
                {report.hazardNotes?.notes && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 flex justify-between">
                    <span className="text-slate-900">الملاحظات:</span>
                    <span>{report.hazardNotes.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Maintenance Breakdown */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-900"></span>
              تفاصيل الصيانة بالمقرات · Maintenance Details
            </h3>
            <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold whitespace-nowrap">
                    <th className="py-2.5 px-2 text-right">المقر</th>
                    <th className="py-2.5 px-2">أعطال عامة</th>
                    <th className="py-2.5 px-2">أثاث</th>
                    <th className="py-2.5 px-2">ديكور</th>
                    <th className="py-2.5 px-2">إنذار حريق</th>
                    <th className="py-2.5 px-2">تسريب ماء</th>
                    <th className="py-2.5 px-2">أبواب</th>
                    <th className="py-2.5 px-2">إنارة</th>
                    <th className="py-2.5 px-2">أرضيات</th>
                    <th className="py-2.5 px-2">تكييف</th>
                    <th className="py-2.5 px-2">لوحات</th>
                    <th className="py-2.5 px-2">كهرباء</th>
                    <th className="py-2.5 px-2">مصاعد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {report.maintenanceSites?.map((site, idx) => (
                    <tr key={site.id || idx} className="hover:bg-slate-50">
                      <td className="py-2 px-2 text-right font-black text-slate-900">{site.name}</td>
                      <td className="py-2 px-2">{site.general}</td>
                      <td className="py-2 px-2">{site.furniture}</td>
                      <td className="py-2 px-2">{site.decor}</td>
                      <td className="py-2 px-2">{site.fireAlarm}</td>
                      <td className="py-2 px-2">{site.waterLeak}</td>
                      <td className="py-2 px-2">{site.doors}</td>
                      <td className="py-2 px-2">{site.lighting}</td>
                      <td className="py-2 px-2">{site.flooring}</td>
                      <td className="py-2 px-2">{site.ac}</td>
                      <td className="py-2 px-2">{site.outdoorSigns}</td>
                      <td className="py-2 px-2">{site.electrical}</td>
                      <td className="py-2 px-2">{site.elevators}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Logistics & Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-slate-900"></span>
                الدعم اللوجستي · Logistics
              </h3>
              <div className="bg-white border border-slate-200 shadow-sm p-4 text-xs font-bold space-y-2">
                {report.logistics?.map((l, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0">
                    <span className="text-slate-600">{l.label}</span>
                    <span className="font-black text-slate-900">{l.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-slate-900"></span>
                الأمن والاستقبال · Security
              </h3>
              <div className="bg-white border border-slate-200 shadow-sm p-4 text-xs font-bold space-y-2">
                {report.security?.map((s, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0">
                    <span className="text-slate-600">{s.label}</span>
                    <span className="font-black text-slate-900">
                      بطاقات: {s.cards} | زوار: {s.visitors}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 7: Tasks & Challenges */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-900"></span>
              المهام الأخرى والتحديات · Tasks & Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 shadow-sm p-4">
                <span className="text-xs font-black text-slate-900 block mb-3">المهام الأخرى:</span>
                <div className="space-y-2">
                  {report.tasks?.map((t, idx) => (
                    <div key={idx} className="text-xs border-b border-slate-100 pb-2 last:border-0">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-900">{t.topic}</span>
                        <span className="text-emerald-700">{t.completion}%</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{t.task}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 shadow-sm p-4">
                <span className="text-xs font-black text-slate-900 block mb-3">التحديات والتوصيات:</span>
                <div className="space-y-2">
                  {report.challenges?.map((c, idx) => (
                    <div key={idx} className="text-xs border-b border-slate-100 pb-2 last:border-0">
                      <span className="font-bold text-slate-900 block">{c.challenge}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">التوصية: {c.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Signatures & Formal Endorsement */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-3 mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-900"></span>
              الاعتماد والتواقيع الرسمية · Approval Signatures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-bold">
              {/* Preparation */}
              <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/50">
                <span className="text-slate-400 block mb-1">جهة الإعداد:</span>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">{report.preparedBy.name}</p>
                  <p className="text-slate-600">{report.preparedBy.role}</p>
                  <p className="text-slate-400 text-[11px]">التاريخ: {report.preparedBy.date || report.approvedAt}</p>
                </div>
                {report.preparedBy.signature && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <img src={report.preparedBy.signature} alt="توقيع الإعداد" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>

              {/* Review & Approval */}
              <div className="border-2 border-emerald-500 p-4 rounded-lg bg-emerald-50/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-800 font-bold">جهة المراجعة والاعتماد:</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-black">معتمد</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">{report.approvedBy.name}</p>
                  <p className="text-slate-600">{report.approvedBy.role}</p>
                  <p className="text-slate-400 text-[11px]">التاريخ: {report.approvedAt}</p>
                </div>
                {report.approvedBy.signature && (
                  <div className="mt-3 pt-3 border-t border-emerald-100">
                    <img src={report.approvedBy.signature} alt="توقيع الاعتماد" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500 font-bold">
              هذه النسخة معتمدة ومؤرشفة رسمياً ومحمية من التعديل المباشر وفق لوائح وسياسات إدارة المرافق.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
