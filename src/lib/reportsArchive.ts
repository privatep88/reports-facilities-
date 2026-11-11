import { ApprovedReportSnapshot, ReportAuditEntry, ReportStatus } from "../types";

const ARCHIVE_STORAGE_KEY = "fm_approved_reports_archive_v1";
const WORKFLOW_PREFIX = "fm_workflow_status_";
const AUDIT_PREFIX = "fm_report_audit_";

// Format unique Report ID, e.g. FM-2027-01 or FM-2027-01-V2
export function generateReportId(year: number, month: number, version: number = 1): string {
  const monthStr = month.toString().padStart(2, "0");
  return version > 1 ? `FM-${year}-${monthStr}-V${version}` : `FM-${year}-${monthStr}`;
}

// Retrieve all approved reports from persistent storage
export function getApprovedReports(): ApprovedReportSnapshot[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) return [];
    const list: ApprovedReportSnapshot[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Error reading approved reports archive:", err);
    return [];
  }
}

// Save approved reports array to persistent storage
export function saveApprovedReports(reports: ApprovedReportSnapshot[]): boolean {
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(reports));
    // Trigger window event so all components react immediately
    window.dispatchEvent(new CustomEvent("approved-reports-updated", { detail: reports }));
    return true;
  } catch (err) {
    console.error("Error saving approved reports archive:", err);
    return false;
  }
}

// Get workflow status for a specific month/year
export function getReportWorkflowStatus(yearMonth: string): { status: ReportStatus; version: number; audit: ReportAuditEntry[] } {
  try {
    const raw = localStorage.getItem(`${WORKFLOW_PREFIX}${yearMonth}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        status: parsed.status || "draft",
        version: parsed.version || 1,
        audit: parsed.audit || []
      };
    }
  } catch (e) {}

  // Check if already in approved archive
  const approvedList = getApprovedReports();
  const existing = approvedList.find(r => r.yearMonth === yearMonth && !r.isSuperseded);
  if (existing) {
    return {
      status: existing.status,
      version: existing.version,
      audit: existing.auditTrail || []
    };
  }

  return { status: "draft", version: 1, audit: [] };
}

// Update workflow status for a month
export function updateReportWorkflowStatus(
  yearMonth: string,
  status: ReportStatus,
  actionEntry: Omit<ReportAuditEntry, "id" | "timestamp">,
  version: number = 1
): boolean {
  try {
    const current = getReportWorkflowStatus(yearMonth);
    const newEntry: ReportAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }),
      ...actionEntry
    };
    const updatedAudit = [...(current.audit || []), newEntry];
    const data = {
      status,
      version,
      updatedAt: new Date().toISOString(),
      audit: updatedAudit
    };
    localStorage.setItem(`${WORKFLOW_PREFIX}${yearMonth}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("report-status-changed", { detail: { yearMonth, status, version } }));
    return true;
  } catch (err) {
    console.error("Failed to update report workflow status:", err);
    return false;
  }
}

// Save a newly approved report snapshot to archive
export function archiveApprovedReport(snapshot: ApprovedReportSnapshot): boolean {
  try {
    const all = getApprovedReports();
    // If a report already exists for this exact ID, replace it; if previous version exists, mark superseded
    const filtered = all.filter(r => r.id !== snapshot.id);
    const updated = [snapshot, ...filtered];
    
    // Also ensure workflow status is set to approved
    updateReportWorkflowStatus(
      snapshot.yearMonth,
      "approved",
      {
        action: "approve",
        actionLabel: "اعتماد التقرير والأرشفة الرسمية",
        performedBy: snapshot.approvedBy.name || "معتمد التقرير",
        role: snapshot.approvedBy.role,
        notes: `تم اعتماد تقرير شهر ${snapshot.monthName} ${snapshot.year} بنجاح وحفظه في الأرشيف الرسمي.`
      },
      snapshot.version
    );

    return saveApprovedReports(updated);
  } catch (err) {
    console.error("Failed to archive approved report:", err);
    return false;
  }
}

// Request correction for an approved report
export function requestReportCorrection(
  reportId: string,
  reason: string,
  requestedBy: string
): { success: boolean; newVersion?: number; message?: string } {
  try {
    const all = getApprovedReports();
    const target = all.find(r => r.id === reportId);
    if (!target) {
      return { success: false, message: "التقرير غير موجود بالأرشيف" };
    }

    const nextVersion = (target.version || 1) + 1;
    // Mark old as superseded
    target.isSuperseded = true;
    target.supersededBy = generateReportId(target.year, target.month, nextVersion);

    // Add audit entry to old
    target.auditTrail.push({
      id: `audit-${Date.now()}`,
      action: "request_correction",
      actionLabel: "طلب تصحيح تقرير معتمد",
      performedBy: requestedBy,
      timestamp: new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" }),
      notes: `سبب التصحيح: ${reason}`
    });

    // Update in storage
    saveApprovedReports(all);

    // Update workflow status for this month back to "in_review" / "draft" for new version
    updateReportWorkflowStatus(
      target.yearMonth,
      "in_review",
      {
        action: "request_correction",
        actionLabel: `بدء تصحيح معتمد (الإصدار ${nextVersion})`,
        performedBy: requestedBy,
        notes: `فتح التقرير للتعديل بناءً على طلب التصحيح: ${reason}`
      },
      nextVersion
    );

    return { success: true, newVersion: nextVersion };
  } catch (err) {
    console.error("Error creating correction request:", err);
    return { success: false, message: "حدث خطأ أثناء طلب التصحيح" };
  }
}

import { exportReportToExcelXlsx } from "./exportUtils";

// Export Approved Report to formatted Excel (.xlsx) workbook with full pixel-close styling and formulas
export async function exportReportToExcel(report: ApprovedReportSnapshot): Promise<boolean> {
  const filename = `Facilities_Report_${report.year}_${report.month.toString().padStart(2, "0")}_Approved.xlsx`;
  return await exportReportToExcelXlsx(report, filename);
}
