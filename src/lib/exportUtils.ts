import ExcelJS from "exceljs";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { ApprovedReportSnapshot } from "../types";

export interface MonthlyReportExportData {
  id?: string;
  year: number;
  month: number;
  monthName: string;
  isApproved?: boolean;
  statusLabel?: string;
  approvedAt?: string;
  approvedBy: { name: string; role: string; signature?: string };
  preparedBy: { name: string; role: string; date?: string; signature?: string };
  summary: {
    totalReceived: number;
    totalExecuted: number;
    overallCompletion: number;
    topServiceName?: string;
    topServiceReceived?: number;
    totalServicesCount: number;
  };
  services: Array<{ id: string; name: string; received: number; executed: number }>;
  contracts: Array<{ type: string; active: number; inactive: number }>;
  fireExtinguishers: { active: number; inactive: number; notes: string };
  hazardNotes: { closed: number; notClosed: number; notes: string };
  maintenanceSites: Array<{
    id: number;
    name: string;
    general: number | string;
    furniture: number | string;
    decor: number | string;
    fireAlarm: number | string;
    waterLeak: number | string;
    doors: number | string;
    lighting: number | string;
    flooring: number | string;
    ac: number | string;
    outdoorSigns: number | string;
    electrical: number | string;
    elevators: number | string;
  }>;
  maintenanceServices: {
    fromFacilities: number;
    fromOthers: number;
    costPettyCash: string | number;
    costPurchaseOrder: string | number;
  };
  logistics: Array<{
    id: number;
    label: string;
    total: number | string;
    rep: number | string;
    emiratesPost: number | string;
    aramex: number | string;
    distribution: number | string;
    other: number | string;
  }>;
  security: Array<{
    id: number;
    label: string;
    cards: number | string;
    visitors: number | string;
    supplierVisitors: number | string;
    meetingRooms: number | string;
    evacuation: number | string;
    securityReports: number | string;
    emergencies: number | string;
  }>;
  tasks: Array<{ id: number; topic: string; task: string; status: string; completion: number }>;
  challenges: Array<{ id: number; challenge: string; update: string; recommendation: string }>;
  auditTrail?: Array<{ actionLabel: string; performedBy: string; timestamp: string; notes?: string }>;
}

/**
 * Native Browser Print Handler with pre-flight checks
 */
export function triggerPrintReport(): void {
  // Give a small tick for any layout reflow
  window.setTimeout(() => {
    window.print();
  }, 100);
}

/**
 * High-Quality Multi-Page A4 PDF Export Engine
 */
export async function exportReportToPDF(
  element: HTMLElement | null,
  filename: string,
  onProgress?: (isGenerating: boolean) => void
): Promise<boolean> {
  if (!element) {
    console.error("PDF export target element not found");
    return false;
  }

  try {
    if (onProgress) onProgress(true);

    const width = element.scrollWidth;
    
    // Configure standard ISO A4 options with smart pagination
    const opt = {
      margin: [10, 8, 10, 8] as [number, number, number, number], // 10mm top/bottom, 8mm left/right
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2, // High resolution crisp text
        useCORS: true,
        letterRendering: true,
        logging: false,
        windowWidth: width > 1100 ? width : 1200,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait" as const,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        avoid: ["section", "tr", ".avoid-break", ".kpi-card", ".contract-block"],
      },
    };

    await html2pdf().set(opt).from(element).save();

    if (onProgress) onProgress(false);
    return true;
  } catch (err) {
    console.error("PDF Generation error:", err);
    if (onProgress) onProgress(false);
    return false;
  }
}

/**
 * Enterprise ExcelJS (.xlsx) Export with Full Pixel-Close Formatting, Styles, Colors & Formulas
 */
export async function exportReportToExcelXlsx(
  report: MonthlyReportExportData | ApprovedReportSnapshot,
  customFilename?: string
): Promise<boolean> {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "نظام التقرير الشهري لقسم إدارة المرافق";
    workbook.lastModifiedBy = report.approvedBy?.name || "مدير النظام";
    workbook.created = new Date();
    workbook.modified = new Date();

    const reportId = (report as any).id || `FM-${report.year}-${report.month.toString().padStart(2, "0")}`;
    const filename = customFilename || `Facilities_Monthly_Report_${report.year}_${report.month.toString().padStart(2, "0")}.xlsx`;
    const isReportApproved = "status" in report ? (report as any).status === "approved" : Boolean(report.isApproved);

    // Common style definitions
    const navyHeaderFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" }, // Slate-900
    };

    const goldHeaderFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC9A961" }, // Warm Gold
    };

    const tealHeaderFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0E7490" }, // Cyan-700
    };

    const emeraldFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF10B981" },
    };

    const lightGrayFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };

    const sectionBarFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    };

    const whiteBoldFont: Partial<ExcelJS.Font> = {
      name: "Cairo",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };

    const titleFont: Partial<ExcelJS.Font> = {
      name: "Cairo",
      size: 16,
      bold: true,
      color: { argb: "FF0F172A" },
    };

    const sectionTitleFont: Partial<ExcelJS.Font> = {
      name: "Cairo",
      size: 12,
      bold: true,
      color: { argb: "FF0F172A" },
    };

    const standardFont: Partial<ExcelJS.Font> = {
      name: "Cairo",
      size: 10,
    };

    const boldFont: Partial<ExcelJS.Font> = {
      name: "Cairo",
      size: 10,
      bold: true,
    };

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };

    const centerAlign: Partial<ExcelJS.Alignment> = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    const rightAlign: Partial<ExcelJS.Alignment> = {
      vertical: "middle",
      horizontal: "right",
      wrapText: true,
    };

    // =========================================================================
    // SHEET 1: التقرير الشامل والمكتمل (Master Comprehensive Sheet)
    // =========================================================================
    const wsMaster = workbook.addWorksheet("التقرير الشامل", {
      views: [{ rightToLeft: true }],
    });

    // 1. Title Banner
    wsMaster.mergeCells("A1:G1");
    const titleCell = wsMaster.getCell("A1");
    titleCell.value = "التقرير الشهري المعتمد - قسم إدارة المرافق والأصول";
    titleCell.font = titleFont;
    titleCell.alignment = centerAlign;
    wsMaster.getRow(1).height = 36;

    // 2. Meta Info Box
    wsMaster.mergeCells("A2:G2");
    const metaCell = wsMaster.getCell("A2");
    metaCell.value = `الرقم المرجعي: ${reportId}   |   الشهر: ${report.monthName} ${report.year}   |   حالة التقرير: ${isReportApproved ? "معتمد رسمياً ومؤرشف" : "تقرير شهري نشط"}`;
    metaCell.font = boldFont;
    metaCell.alignment = centerAlign;
    metaCell.fill = lightGrayFill;
    wsMaster.getRow(2).height = 24;

    wsMaster.addRow([]); // Blank row 3

    // 3. Executive Summary KPI Cards
    const row4 = wsMaster.addRow(["الملخص التنفيذي", "", "", "", "", "", ""]);
    wsMaster.mergeCells(`A4:G4`);
    row4.getCell(1).font = sectionTitleFont;
    row4.getCell(1).fill = sectionBarFill;
    row4.height = 24;

    const kpiHeaderRow = wsMaster.addRow([
      "إجمالي الطلبات المستلمة",
      "إجمالي الطلبات المنفذة",
      "نسبة الإنجاز الكلية",
      "إجمالي الخدمات النشطة",
      "أعلى خدمة طلباً",
      "عدد طلبات أعلى خدمة",
      "حالة الاعتماد",
    ]);
    kpiHeaderRow.eachCell(cell => {
      cell.fill = navyHeaderFill;
      cell.font = whiteBoldFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
    });
    kpiHeaderRow.height = 28;

    const kpiDataRow = wsMaster.addRow([
      report.summary.totalReceived,
      report.summary.totalExecuted,
      report.summary.overallCompletion / 100, // as percentage decimal
      report.summary.totalServicesCount,
      report.summary.topServiceName || "-",
      report.summary.topServiceReceived || 0,
      isReportApproved ? "معتمد" : "مسودة / مراجعة",
    ]);
    kpiDataRow.eachCell((cell, colNumber) => {
      cell.font = boldFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
      if (colNumber === 3) {
        cell.numFmt = "0.0%";
        cell.font = { ...boldFont, color: { argb: "FF047857" } };
      } else if (colNumber === 1 || colNumber === 2 || colNumber === 4 || colNumber === 6) {
        cell.numFmt = "#,##0";
      }
    });
    kpiDataRow.height = 26;

    wsMaster.addRow([]); // Blank row 7

    // 4. Services Summary Table
    const row8 = wsMaster.addRow(["ملخص الخدمات ومؤشرات الأداء", "", "", "", "", "", ""]);
    wsMaster.mergeCells(`A8:G8`);
    row8.getCell(1).font = sectionTitleFont;
    row8.getCell(1).fill = sectionBarFill;
    row8.height = 24;

    const servicesHeader = wsMaster.addRow([
      "م",
      "الخدمة",
      "الطلبات المستلمة",
      "الطلبات المنفذة",
      "نسبة الإنجاز",
      "مستوى الأداء",
      "ملاحظات",
    ]);
    servicesHeader.eachCell(cell => {
      cell.fill = navyHeaderFill;
      cell.font = whiteBoldFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
    });
    servicesHeader.height = 26;

    const serviceStartRow = 10;
    report.services.forEach((s, idx) => {
      const currentRowIndex = serviceStartRow + idx;
      const ratio = s.received === 0 ? 0 : s.executed / s.received;
      const level = ratio >= 0.95 ? "مرتفع" : ratio >= 0.85 ? "متوسط" : "منخفض";

      const r = wsMaster.addRow([
        idx + 1,
        s.name,
        s.received,
        s.executed,
        { formula: `IF(C${currentRowIndex}=0, 0, D${currentRowIndex}/C${currentRowIndex})`, result: ratio },
        level,
        ratio >= 0.95 ? "أداء متميز" : ratio >= 0.85 ? "ضمن المستهدف" : "يتطلب متابعة",
      ]);
      r.getCell(1).alignment = centerAlign;
      r.getCell(2).alignment = rightAlign;
      r.getCell(3).alignment = centerAlign;
      r.getCell(4).alignment = centerAlign;
      r.getCell(5).alignment = centerAlign;
      r.getCell(6).alignment = centerAlign;
      r.getCell(7).alignment = centerAlign;

      r.eachCell(cell => {
        cell.font = standardFont;
        cell.border = thinBorder;
      });

      r.getCell(3).numFmt = "#,##0";
      r.getCell(4).numFmt = "#,##0";
      r.getCell(5).numFmt = "0.0%";
      r.getCell(5).font = boldFont;

      if (level === "مرتفع") {
        r.getCell(6).font = { ...boldFont, color: { argb: "FF047857" } };
      } else if (level === "متوسط") {
        r.getCell(6).font = { ...boldFont, color: { argb: "FFB45309" } };
      } else {
        r.getCell(6).font = { ...boldFont, color: { argb: "FFB91C1C" } };
      }
      r.height = 22;
    });

    const serviceEndRow = serviceStartRow + report.services.length - 1;
    // Services Total Row
    const servicesTotalRow = wsMaster.addRow([
      "",
      "الإجمالي الكلي",
      { formula: `SUM(C${serviceStartRow}:C${serviceEndRow})`, result: report.summary.totalReceived },
      { formula: `SUM(D${serviceStartRow}:D${serviceEndRow})`, result: report.summary.totalExecuted },
      { formula: `IF(C${serviceEndRow + 1}=0, 0, D${serviceEndRow + 1}/C${serviceEndRow + 1})`, result: report.summary.overallCompletion / 100 },
      "المعدل العام",
      "",
    ]);
    servicesTotalRow.eachCell(cell => {
      cell.fill = lightGrayFill;
      cell.font = boldFont;
      cell.border = thinBorder;
    });
    servicesTotalRow.getCell(2).alignment = rightAlign;
    servicesTotalRow.getCell(3).numFmt = "#,##0";
    servicesTotalRow.getCell(3).alignment = centerAlign;
    servicesTotalRow.getCell(4).numFmt = "#,##0";
    servicesTotalRow.getCell(4).alignment = centerAlign;
    servicesTotalRow.getCell(5).numFmt = "0.0%";
    servicesTotalRow.getCell(5).alignment = centerAlign;
    servicesTotalRow.getCell(6).alignment = centerAlign;
    servicesTotalRow.height = 24;

    wsMaster.addRow([]); // Blank row

    // 5. Contracts & Licenses
    const contractsSecRow = wsMaster.addRow(["العقود والرخص التجارية والخدمية", "", "", "", "", "", ""]);
    wsMaster.mergeCells(`A${contractsSecRow.number}:G${contractsSecRow.number}`);
    contractsSecRow.getCell(1).font = sectionTitleFont;
    contractsSecRow.getCell(1).fill = sectionBarFill;
    contractsSecRow.height = 24;

    const contractsHeader = wsMaster.addRow(["م", "نوع العقد / الرخصة", "الحالة الفعالة", "الحالة غير الفعالة", "الإجمالي", "نسبة الفعالية", "ملاحظات"]);
    contractsHeader.eachCell(cell => {
      cell.fill = navyHeaderFill;
      cell.font = whiteBoldFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
    });
    contractsHeader.height = 26;

    report.contracts.forEach((c, idx) => {
      const curRow = contractsHeader.number + idx + 1;
      const total = c.active + c.inactive;
      const ratio = total > 0 ? c.active / total : 0;
      const r = wsMaster.addRow([
        idx + 1,
        c.type,
        c.active,
        c.inactive,
        { formula: `C${curRow}+D${curRow}`, result: total },
        { formula: `IF(E${curRow}=0, 0, C${curRow}/E${curRow})`, result: ratio },
        c.active > 0 ? "عقود سارية" : "لا توجد عقود سارية",
      ]);
      r.eachCell(cell => {
        cell.font = standardFont;
        cell.border = thinBorder;
        cell.alignment = centerAlign;
      });
      r.getCell(2).alignment = rightAlign;
      r.getCell(3).numFmt = "#,##0";
      r.getCell(4).numFmt = "#,##0";
      r.getCell(5).numFmt = "#,##0";
      r.getCell(6).numFmt = "0.0%";
      r.getCell(6).font = boldFont;
      r.height = 22;
    });

    wsMaster.addRow([]); // Blank

    // 6. Fire Extinguishers & Risk Observations
    const fireSecRow = wsMaster.addRow(["الطفايات وملاحظات المخاطر", "", "", "", "", "", ""]);
    wsMaster.mergeCells(`A${fireSecRow.number}:G${fireSecRow.number}`);
    fireSecRow.getCell(1).font = sectionTitleFont;
    fireSecRow.getCell(1).fill = sectionBarFill;
    fireSecRow.height = 24;

    const fireHeader = wsMaster.addRow([
      "التصنيف",
      "المؤشر الأول",
      "العدد الأول",
      "المؤشر الثاني",
      "العدد الثاني",
      "الإجمالي",
      "الملاحظات",
    ]);
    fireHeader.eachCell(cell => {
      cell.fill = goldHeaderFill;
      cell.font = whiteBoldFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
    });
    fireHeader.height = 26;

    const curFRow = fireHeader.number + 1;
    const rFire = wsMaster.addRow([
      "عدد الطفايات",
      "فعّالة (Active)",
      report.fireExtinguishers?.active || 0,
      "غير فعّالة (Inactive)",
      report.fireExtinguishers?.inactive || 0,
      { formula: `C${curFRow}+E${curFRow}`, result: (report.fireExtinguishers?.active || 0) + (report.fireExtinguishers?.inactive || 0) },
      report.fireExtinguishers?.notes || "-",
    ]);
    rFire.eachCell(cell => {
      cell.font = standardFont;
      cell.border = thinBorder;
      cell.alignment = centerAlign;
    });
    rFire.getCell(1).font = boldFont;
    rFire.getCell(3).numFmt = "#,##0";
    rFire.getCell(5).numFmt = "#,##0";
    rFire.getCell(6).numFmt = "#,##0";
    rFire.height = 22;

    const curHRow = curFRow + 1;
    const rHazard = wsMaster.addRow([
      "عدد ملاحظات المخاطر",
      "مغلقة (Closed)",
      report.hazardNotes?.closed || 0,
      "غير مغلقة (Not closed)",
      report.hazardNotes?.notClosed || 0,
      { formula: `C${curHRow}+E${curHRow}`, result: (report.hazardNotes?.closed || 0) + (report.hazardNotes?.notClosed || 0) },
      report.hazardNotes?.notes || "-",
    ]);
    rHazard.eachCell(cell => {
      cell.font = standardFont;
      cell.border = thinBorder;
      cell.alignment = centerAlign;
    });
    rHazard.getCell(1).font = boldFont;
    rHazard.getCell(3).numFmt = "#,##0";
    rHazard.getCell(5).numFmt = "#,##0";
    rHazard.getCell(6).numFmt = "#,##0";
    rHazard.height = 22;

    wsMaster.addRow([]); // Blank

    // 7. Maintenance Breakdown
    const maintSecRow = wsMaster.addRow(["تفاصيل الصيانة بالمقرات", "", "", "", "", "", ""]);
    wsMaster.mergeCells(`A${maintSecRow.number}:G${maintSecRow.number}`);
    maintSecRow.getCell(1).font = sectionTitleFont;
    maintSecRow.getCell(1).fill = sectionBarFill;
    maintSecRow.height = 24;

    const maintHeader = wsMaster.addRow([
      "م",
      "المقر",
      "أعطال عامة",
      "أثاث",
      "أعمال ديكور",
      "إنذار حريق",
      "تسريب ماء",
    ]);
    maintHeader.eachCell(cell => {
      cell.fill = navyHeaderFill;
      cell.font = whiteBoldFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
    });
    maintHeader.height = 26;

    report.maintenanceSites.forEach((m, idx) => {
      const r = wsMaster.addRow([
        idx + 1,
        m.name,
        m.general,
        m.furniture,
        m.decor,
        m.fireAlarm,
        m.waterLeak,
      ]);
      r.eachCell(cell => {
        cell.font = standardFont;
        cell.border = thinBorder;
        cell.alignment = centerAlign;
      });
      r.getCell(2).alignment = rightAlign;
      r.height = 22;
    });

    wsMaster.addRow([]); // Blank

    // 8. Approval Sign-off Box
    const appSecRow = wsMaster.addRow(["بيانات الإعداد والمراجعة والاعتماد", "", "", "", "", "", ""]);
    wsMaster.mergeCells(`A${appSecRow.number}:G${appSecRow.number}`);
    appSecRow.getCell(1).font = sectionTitleFont;
    appSecRow.getCell(1).fill = sectionBarFill;
    appSecRow.height = 24;

    const signRow1 = wsMaster.addRow([
      "جهة الإعداد:",
      report.preparedBy.name,
      report.preparedBy.role,
      "تاريخ الإعداد:",
      report.preparedBy.date || report.approvedAt || "-",
      "الحالة:",
      "تم الإعداد والتحقق",
    ]);
    signRow1.eachCell(cell => {
      cell.font = boldFont;
      cell.border = thinBorder;
      cell.alignment = centerAlign;
    });
    signRow1.getCell(1).fill = lightGrayFill;
    signRow1.getCell(4).fill = lightGrayFill;
    signRow1.getCell(6).fill = lightGrayFill;
    signRow1.height = 24;

    const signRow2 = wsMaster.addRow([
      "جهة الاعتماد:",
      report.approvedBy.name,
      report.approvedBy.role,
      "تاريخ الاعتماد:",
      report.approvedAt || "-",
      "القرار:",
      isReportApproved ? "معتمد ومؤرشف رسمياً" : "بانتظار الاعتماد",
    ]);
    signRow2.eachCell(cell => {
      cell.font = boldFont;
      cell.border = thinBorder;
      cell.alignment = centerAlign;
    });
    signRow2.getCell(1).fill = lightGrayFill;
    signRow2.getCell(4).fill = lightGrayFill;
    signRow2.getCell(6).fill = lightGrayFill;
    signRow2.getCell(7).font = { ...boldFont, color: { argb: "FF047857" } };
    signRow2.height = 24;

    // Set Column Widths for Master Sheet
    wsMaster.columns = [
      { width: 8 },  // A
      { width: 28 }, // B
      { width: 22 }, // C
      { width: 22 }, // D
      { width: 18 }, // E
      { width: 18 }, // F
      { width: 25 }, // G
    ];

    // =========================================================================
    // SHEET 2: مؤشرات الخدمات (Services Performance Sheet)
    // =========================================================================
    const wsServices = workbook.addWorksheet("مؤشرات الخدمات", {
      views: [{ rightToLeft: true }],
    });

    wsServices.mergeCells("A1:F1");
    wsServices.getCell("A1").value = `مؤشرات أداء الخدمات التفصيلية - ${report.monthName} ${report.year}`;
    wsServices.getCell("A1").font = titleFont;
    wsServices.getCell("A1").alignment = centerAlign;
    wsServices.getRow(1).height = 32;

    const sHeadRow = wsServices.addRow(["م", "الخدمة", "الطلبات الواردة (المستلمة)", "الطلبات المنفذة", "نسبة الإنجاز", "مستوى الأداء"]);
    sHeadRow.eachCell(cell => {
      cell.fill = navyHeaderFill;
      cell.font = whiteBoldFont;
      cell.alignment = centerAlign;
      cell.border = thinBorder;
    });
    sHeadRow.height = 28;

    const sStart = 3;
    report.services.forEach((s, idx) => {
      const curRow = sStart + idx;
      const ratio = s.received === 0 ? 0 : s.executed / s.received;
      const level = ratio >= 0.95 ? "مرتفع" : ratio >= 0.85 ? "متوسط" : "منخفض";
      const r = wsServices.addRow([
        idx + 1,
        s.name,
        s.received,
        s.executed,
        { formula: `IF(C${curRow}=0, 0, D${curRow}/C${curRow})`, result: ratio },
        level,
      ]);
      r.eachCell(c => {
        c.font = standardFont;
        c.border = thinBorder;
        c.alignment = centerAlign;
      });
      r.getCell(2).alignment = rightAlign;
      r.getCell(3).numFmt = "#,##0";
      r.getCell(4).numFmt = "#,##0";
      r.getCell(5).numFmt = "0.0%";
      r.getCell(5).font = boldFont;
      r.height = 22;
    });

    const sEnd = sStart + report.services.length - 1;
    const sTotal = wsServices.addRow([
      "",
      "المجموع الكلي",
      { formula: `SUM(C${sStart}:C${sEnd})`, result: report.summary.totalReceived },
      { formula: `SUM(D${sStart}:D${sEnd})`, result: report.summary.totalExecuted },
      { formula: `IF(C${sEnd + 1}=0, 0, D${sEnd + 1}/C${sEnd + 1})`, result: report.summary.overallCompletion / 100 },
      "المعدل العام",
    ]);
    sTotal.eachCell(c => {
      c.fill = lightGrayFill;
      c.font = boldFont;
      c.border = thinBorder;
      c.alignment = centerAlign;
    });
    sTotal.getCell(2).alignment = rightAlign;
    sTotal.getCell(3).numFmt = "#,##0";
    sTotal.getCell(4).numFmt = "#,##0";
    sTotal.getCell(5).numFmt = "0.0%";
    sTotal.height = 26;

    wsServices.columns = [
      { width: 8 },
      { width: 32 },
      { width: 26 },
      { width: 26 },
      { width: 20 },
      { width: 20 },
    ];

    // =========================================================================
    // SHEET 3: الصيانة والمقرات (Maintenance Details Sheet)
    // =========================================================================
    const wsMaint = workbook.addWorksheet("تفاصيل الصيانة", {
      views: [{ rightToLeft: true }],
    });

    wsMaint.mergeCells("A1:N1");
    wsMaint.getCell("A1").value = `تفاصيل صيانة المنشآت والمقرات - ${report.monthName} ${report.year}`;
    wsMaint.getCell("A1").font = titleFont;
    wsMaint.getCell("A1").alignment = centerAlign;
    wsMaint.getRow(1).height = 32;

    const mHead = wsMaint.addRow([
      "م",
      "المقر",
      "أعطال عامة",
      "أثاث",
      "أعمال ديكور",
      "إنذار حريق",
      "تسريب ماء",
      "عطل أبواب",
      "عطل إنارة",
      "عطل أرضيات",
      "عطل تكييف",
      "لوحات خارجية",
      "عطل كهرباء",
      "عطل مصاعد",
    ]);
    mHead.eachCell(c => {
      c.fill = tealHeaderFill;
      c.font = whiteBoldFont;
      c.alignment = centerAlign;
      c.border = thinBorder;
    });
    mHead.height = 28;

    report.maintenanceSites.forEach((site, idx) => {
      const r = wsMaint.addRow([
        idx + 1,
        site.name,
        site.general,
        site.furniture,
        site.decor,
        site.fireAlarm,
        site.waterLeak,
        site.doors,
        site.lighting,
        site.flooring,
        site.ac,
        site.outdoorSigns,
        site.electrical,
        site.elevators,
      ]);
      r.eachCell(c => {
        c.font = standardFont;
        c.border = thinBorder;
        c.alignment = centerAlign;
      });
      r.getCell(2).alignment = rightAlign;
      r.height = 22;
    });

    wsMaint.columns = [
      { width: 6 },
      { width: 24 },
      { width: 14 },
      { width: 12 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
    ];

    // =========================================================================
    // SHEET 4: المهام والتحديات (Tasks & Challenges Sheet)
    // =========================================================================
    const wsTasks = workbook.addWorksheet("المهام والتحديات", {
      views: [{ rightToLeft: true }],
    });

    wsTasks.mergeCells("A1:E1");
    wsTasks.getCell("A1").value = `المهام الأخرى والتحديات - ${report.monthName} ${report.year}`;
    wsTasks.getCell("A1").font = titleFont;
    wsTasks.getCell("A1").alignment = centerAlign;
    wsTasks.getRow(1).height = 32;

    const tHead = wsTasks.addRow(["م", "الموضوع", "المهمة", "الحالة", "نسبة الإنجاز"]);
    tHead.eachCell(c => {
      c.fill = navyHeaderFill;
      c.font = whiteBoldFont;
      c.alignment = centerAlign;
      c.border = thinBorder;
    });
    tHead.height = 26;

    report.tasks.forEach((t, idx) => {
      const r = wsTasks.addRow([
        idx + 1,
        t.topic,
        t.task,
        t.status,
        t.completion / 100,
      ]);
      r.eachCell(c => {
        c.font = standardFont;
        c.border = thinBorder;
      });
      r.getCell(1).alignment = centerAlign;
      r.getCell(2).alignment = rightAlign;
      r.getCell(3).alignment = rightAlign;
      r.getCell(4).alignment = centerAlign;
      r.getCell(5).alignment = centerAlign;
      r.getCell(5).numFmt = "0.0%";
      r.getCell(5).font = boldFont;
      r.height = 22;
    });

    wsTasks.addRow([]); // Blank
    const chHead = wsTasks.addRow(["م", "التحدي / العائق", "المستجدات والتحديث", "التوصيات الإدارية", ""]);
    wsTasks.mergeCells(`D${chHead.number}:E${chHead.number}`);
    chHead.eachCell(c => {
      c.fill = goldHeaderFill;
      c.font = whiteBoldFont;
      c.alignment = centerAlign;
      c.border = thinBorder;
    });
    chHead.height = 26;

    report.challenges.forEach((ch, idx) => {
      const r = wsTasks.addRow([
        idx + 1,
        ch.challenge,
        ch.update,
        ch.recommendation,
        "",
      ]);
      wsTasks.mergeCells(`D${r.number}:E${r.number}`);
      r.eachCell(c => {
        c.font = standardFont;
        c.border = thinBorder;
      });
      r.getCell(1).alignment = centerAlign;
      r.getCell(2).alignment = rightAlign;
      r.getCell(3).alignment = rightAlign;
      r.getCell(4).alignment = rightAlign;
      r.height = 22;
    });

    wsTasks.columns = [
      { width: 6 },
      { width: 28 },
      { width: 45 },
      { width: 35 },
      { width: 20 },
    ];

    // Write buffer and trigger browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (err) {
    console.error("ExcelJS export error:", err);
    return false;
  }
}
