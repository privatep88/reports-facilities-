import React, { useState, useEffect } from "react";
import { ReportStatus, ReportAuditEntry, ApprovedReportSnapshot } from "../types";
import {
  getReportWorkflowStatus,
  updateReportWorkflowStatus,
  archiveApprovedReport,
  requestReportCorrection,
  generateReportId
} from "../lib/reportsArchive";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  RotateCcw,
  Lock,
  History,
  FileCheck,
  AlertCircle,
  Eye,
  FileText
} from "lucide-react";

interface Props {
  yearMonth: string;
  year: number;
  month: number;
  monthName: string;
  onGoToArchive?: () => void;
  // State from dashboard to construct snapshot on approve
  getReportSnapshotData: () => Omit<ApprovedReportSnapshot, "id" | "yearMonth" | "year" | "month" | "monthName" | "version" | "status" | "approvedAt" | "auditTrail">;
  onStatusChange?: (status: ReportStatus) => void;
}

export function ReportWorkflowToolbar({
  yearMonth,
  year,
  month,
  monthName,
  onGoToArchive,
  getReportSnapshotData,
  onStatusChange
}: Props) {
  const [workflow, setWorkflow] = useState(() => getReportWorkflowStatus(yearMonth));
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const [returnReason, setReturnReason] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [reviewerName, setReviewerName] = useState("فيصل سويد السليماني");
  const [reviewerRole, setReviewerRole] = useState("رئيس قسم إدارة المرافق");

  // Reload workflow status when yearMonth changes or custom event fires
  const refreshStatus = () => {
    const current = getReportWorkflowStatus(yearMonth);
    setWorkflow(current);
    if (onStatusChange) {
      onStatusChange(current.status);
    }
  };

  useEffect(() => {
    refreshStatus();

    const handler = (e: any) => {
      if (!e.detail || e.detail.yearMonth === yearMonth) {
        refreshStatus();
      }
    };
    window.addEventListener("report-status-changed", handler);
    window.addEventListener("approved-reports-updated", handler);
    return () => {
      window.removeEventListener("report-status-changed", handler);
      window.removeEventListener("approved-reports-updated", handler);
    };
  }, [yearMonth]);

  // Submit report for review
  const handleSubmitForReview = () => {
    updateReportWorkflowStatus(yearMonth, "in_review", {
      action: "submit_review",
      actionLabel: "إرسال التقرير للمراجعة والاعتماد",
      performedBy: "معد التقرير",
      role: "ضابط أول المرافق والأصول",
      notes: `تم الانتهاء من إعداد تقرير شهر ${monthName} ${year} وإرساله للمراجعة والاعتماد.`
    }, workflow.version);
    refreshStatus();
  };

  // Return report for edit
  const handleReturnForEdit = () => {
    if (!returnReason.trim()) return;
    updateReportWorkflowStatus(yearMonth, "draft", {
      action: "return_for_edit",
      actionLabel: "إرجاع التقرير للتعديل",
      performedBy: reviewerName,
      role: reviewerRole,
      notes: `سبب الإرجاع: ${returnReason}`
    }, workflow.version);
    setReturnReason("");
    setShowReturnModal(false);
    refreshStatus();
  };

  // Final Approval & Archiving
  const handleConfirmApproval = () => {
    const snapshotData = getReportSnapshotData();
    const reportId = generateReportId(year, month, workflow.version);
    const nowStr = new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });

    const auditTrail: ReportAuditEntry[] = [
      ...(workflow.audit || []),
      {
        id: `audit-${Date.now()}`,
        action: "approve",
        actionLabel: "اعتماد التقرير والأرشفة الرسمية",
        performedBy: reviewerName,
        role: reviewerRole,
        timestamp: nowStr,
        notes: `تم اعتماد تقرير شهر ${monthName} ${year} وحفظه في الأرشيف الرسمي.`
      }
    ];

    const snapshot: ApprovedReportSnapshot = {
      ...snapshotData,
      id: reportId,
      yearMonth,
      year,
      month,
      monthName,
      version: workflow.version,
      status: "approved",
      approvedAt: nowStr,
      approvedBy: {
        name: reviewerName,
        role: reviewerRole,
        signature: snapshotData.approvedBy?.signature || ""
      },
      auditTrail
    };

    archiveApprovedReport(snapshot);
    setShowApproveModal(false);
    refreshStatus();
  };

  // Request correction on approved report
  const handleRequestCorrection = () => {
    if (!correctionReason.trim()) return;
    const reportId = generateReportId(year, month, workflow.version);
    requestReportCorrection(reportId, correctionReason, reviewerName);
    setCorrectionReason("");
    setShowCorrectionModal(false);
    refreshStatus();
  };

  return (
    <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-sm mb-6 print:hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Status Indicator & Info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${
              workflow.status === "approved"
                ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-500"
                : workflow.status === "in_review"
                ? "bg-amber-100 text-amber-800 border-2 border-amber-500"
                : "bg-slate-100 text-slate-700 border-2 border-slate-400"
            }`}
          >
            {workflow.status === "approved" ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            ) : workflow.status === "in_review" ? (
              <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
            ) : (
              <FileText className="w-6 h-6 text-slate-600" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                مسار اعتماد التقرير · Workflow
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-black bg-slate-100 text-slate-700 border border-slate-200">
                {generateReportId(year, month, workflow.version)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-lg font-black text-slate-900">
                حالة التقرير:{" "}
                <span
                  className={
                    workflow.status === "approved"
                      ? "text-emerald-600 font-black"
                      : workflow.status === "in_review"
                      ? "text-amber-600 font-black"
                      : "text-slate-600 font-black"
                  }
                >
                  {workflow.status === "approved"
                    ? "معتمد رسمياً ومؤرشف (مقفل)"
                    : workflow.status === "in_review"
                    ? "قيد المراجعة والاعتماد"
                    : "مسودة قيد الإعداد"}
                </span>
              </h3>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Draft state: Submit for review */}
          {workflow.status === "draft" && (
            <button
              onClick={handleSubmitForReview}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>إرسال للمراجعة والاعتماد</span>
            </button>
          )}

          {/* In Review state: Approve or Return */}
          {workflow.status === "in_review" && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>اعتماد التقرير رسمياً</span>
              </button>
              <button
                onClick={() => setShowReturnModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إرجاع للتعديل</span>
              </button>
            </>
          )}

          {/* Approved state: Lock badge, correction request, and view in archive */}
          {workflow.status === "approved" && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-black shadow-sm">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>التقرير مقفل للقراءة فقط</span>
              </div>
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-lg transition-colors shadow-sm"
                title="طلب تعديل أو تصحيح التقرير المعتمد بإصدار جديد"
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>طلب تصحيح معتمد</span>
              </button>
              {onGoToArchive && (
                <button
                  onClick={onGoToArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>عرض في الأرشيف</span>
                </button>
              )}
            </>
          )}

          {/* Audit trail button */}
          <button
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
            title="سجل العمليات والاعتماد"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>سجل الاعتماد</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Approval */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">تأكيد اعتماد التقرير الشهري</h3>
                <span className="text-xs text-slate-400">قسم إدارة المرافق والأصول</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 font-medium">
              أنت على وشك اعتماد التقرير الشهري لشهر{" "}
              <span className="font-black text-slate-900">{monthName} {year}</span>. عند الاعتماد:
            </p>

            <ul className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 font-bold list-disc list-inside">
              <li>سيتم إنشاء لقطة ثابتة ونهائية لجميع مؤشرات وجداول التقرير.</li>
              <li>حفظ النسخة المعتمدة نهائياً في تبويب «التقارير المعتمدة».</li>
              <li>قفل التقرير لمنع التعديل العفوي ومطابقة أرقام المؤشرات.</li>
              <li>تسجيل اسم المعتمد وتاريخ الاعتماد رسمياً.</li>
            </ul>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">اسم الشخص المعتمد:</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full border border-slate-300 p-2 text-sm rounded-lg font-bold text-slate-800 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">المسمى الوظيفي للمعتمد:</label>
              <input
                type="text"
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                className="w-full border border-slate-300 p-2 text-sm rounded-lg font-bold text-slate-800 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>تأكيد الاعتماد والأرشفة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return for Edit Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">إرجاع التقرير للتعديل</h3>
                <span className="text-xs text-slate-400">إعادة التقرير إلى حالة المسودة</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">سبب الإرجاع وملاحظات المراجع:</label>
              <textarea
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="أدخل أسباب طلب تعديل التقرير..."
                className="w-full border border-slate-300 p-2 text-sm rounded-lg font-bold text-slate-800 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleReturnForEdit}
                disabled={!returnReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إرجاع التقرير</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Correction on Approved Report Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">طلب تصحيح تقرير معتمد</h3>
                <span className="text-xs text-slate-400">إنشاء إصدار تصحيحي جديد مع الاحتفاظ بالنسخة السابقة</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-bold bg-amber-50 p-3 rounded-lg border border-amber-200">
              وفقاً للسياسة المؤسسية: ستبقى النسخة المعتمدة الحالية محفوظة في السجل التاريخي بالأرشيف، وسيتم إنشاء إصدار جديد للتعديل وإعادة الاعتماد.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">سبب التصحيح المطلوب:</label>
              <textarea
                rows={3}
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="وضح مبررات وأسباب طلب تعديل التقرير المعتمد..."
                className="w-full border border-slate-300 p-2 text-sm rounded-lg font-bold text-slate-800 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleRequestCorrection}
                disabled={!correctionReason.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>بدء الإصدار التصحيحي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">سجل الاعتماد والعمليات</h3>
                  <span className="text-xs text-slate-400">{generateReportId(year, month, workflow.version)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 p-1">
              {workflow.audit && workflow.audit.length > 0 ? (
                workflow.audit.map((entry, idx) => (
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
                  لا توجد عمليات مسجلة حتى الآن لهذا التقرير.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
