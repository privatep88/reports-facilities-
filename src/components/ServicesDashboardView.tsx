import React, { useMemo } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  CheckCircle,
  ClipboardCheck,
  Clock,
  TrendingUp,
  Truck,
  Wrench,
  ShieldCheck,
  Banknote,
  Calendar,
  FireExtinguisher,
  ListChecks,
} from "lucide-react";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#14b8a6",
];

interface Props {
  year?: number;
  month?: number;
  monthName?: string;
  services: ServiceData[];
  contracts: ContractData[];
  fireExtinguishers?: FireExtinguisherData;
  hazardNotes?: HazardNoteData;
  maintenanceSites: MaintenanceSite[];
  maintenanceServices: {
    fromFacilities: number;
    fromOthers: number;
    costPettyCash: string;
    costPurchaseOrder: string;
  };
  logistics: LogisticsData[];
  security: SecurityData[];
  tasks: TaskData[];
  challenges: ChallengeData[];
}

export function ServicesDashboardView({
  year,
  monthName,
  services,
  contracts,
  fireExtinguishers,
  hazardNotes,
  maintenanceSites,
  maintenanceServices,
  logistics,
  security,
}: Props) {
  // Services computations for the selected month
  const totalReceived = useMemo(() => services.reduce((acc, s) => acc + (Number(s.received) || 0), 0), [services]);
  const totalExecuted = useMemo(() => services.reduce((acc, s) => acc + (Number(s.executed) || 0), 0), [services]);
  const totalPending = Math.max(0, totalReceived - totalExecuted);
  const overallCompletion = totalReceived === 0 ? 0 : (totalExecuted / totalReceived) * 100;

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => b.received - a.received || b.executed - a.executed),
    [services]
  );

  const pieData = useMemo(
    () => [
      { name: "منفذة", value: totalExecuted },
      { name: "قيد التنفيذ / معلقة", value: totalPending },
    ],
    [totalExecuted, totalPending]
  );

  // Contracts for the selected month
  const activeContracts = useMemo(() => contracts.reduce((acc, c) => acc + (Number(c.active) || 0), 0), [contracts]);
  const inactiveContracts = useMemo(() => contracts.reduce((acc, c) => acc + (Number(c.inactive) || 0), 0), [contracts]);
  const contractsPie = useMemo(
    () => [
      { name: "فعال", value: activeContracts },
      { name: "غير فعال", value: inactiveContracts },
    ],
    [activeContracts, inactiveContracts]
  );

  // Maintenance Sites Chart Data for the selected month
  const maintenanceChartData = useMemo(() => {
    return maintenanceSites.map(s => {
      let sum = 0;
      sum += Number(s.general) || 0;
      sum += Number(s.furniture) || 0;
      sum += Number(s.decor) || 0;
      sum += Number(s.fireAlarm) || 0;
      sum += Number(s.waterLeak) || 0;
      sum += Number(s.doors) || 0;
      sum += Number(s.lighting) || 0;
      sum += Number(s.flooring) || 0;
      sum += Number(s.ac) || 0;
      sum += Number(s.outdoorSigns) || 0;
      sum += Number(s.electrical) || 0;
      sum += Number(s.elevators) || 0;
      return { name: s.name, total: sum };
    });
  }, [maintenanceSites]);

  // Logistics & Security mapping for the selected month
  const logisticsChartData = useMemo(() => {
    const row = logistics.find(l => l.id === 1) || logistics[0];
    return [
      { name: "المندوب", total: Number(row?.rep) || 0 },
      { name: "بريد الإمارات", total: Number(row?.emiratesPost) || 0 },
      { name: "أرامكس", total: Number(row?.aramex) || 0 },
      { name: "التوزيع الداخلي", total: Number(row?.distribution) || 0 },
      { name: "أخرى", total: Number(row?.other) || 0 },
    ];
  }, [logistics]);

  const securityChartData = useMemo(
    () =>
      security.map(s => {
        let sum = 0;
        sum += Number(s.cards) || 0;
        sum += Number(s.visitors) || 0;
        sum += Number(s.supplierVisitors) || 0;
        sum += Number(s.meetingRooms) || 0;
        sum += Number(s.evacuation) || 0;
        sum += Number(s.securityReports) || 0;
        sum += Number(s.emergencies) || 0;
        return { name: s.label, total: sum };
      }),
    [security]
  );

  const totalMaintenanceServicesCount =
    (Number(maintenanceServices?.fromFacilities) || 0) + (Number(maintenanceServices?.fromOthers) || 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Monthly Context Banner */}
      <div className="bg-gradient-to-l from-[#142A45] via-[#173B65] to-[#1E3A8A] text-white rounded-2xl px-6 py-4 shadow-md border border-[#38BDF8]/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-[#D4A447]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              التحليلات وملخص جميع الخدمات — {monthName ? `شهر ${monthName} ${year || ""}` : "الشهر الحالي"}
            </h2>
            <p className="text-xs text-[#DCEBFE] font-bold mt-0.5">
              ترتبط جميع المؤشرات والرسوم البيانية أدناه تلقائياً ببيانات الشهر والسنة المحددين في التقرير
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs sm:text-sm font-black">
          <span className="text-[#93C5FD]">الفترة النشطة:</span>
          <span className="text-[#F5C96B]">
            {monthName} {year}
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-t-4 border-slate-900 shadow-sm p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">إجمالي الطلبات</p>
              <h3 className="text-4xl font-black text-slate-900 tabular-nums">{totalReceived}</h3>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">
              <ClipboardCheck className="w-8 h-8 text-slate-700" />
            </div>
          </div>
        </div>
        <div className="bg-white border-t-4 border-emerald-500 shadow-sm p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">الطلبات المنفذة</p>
              <h3 className="text-4xl font-black text-emerald-600 tabular-nums">{totalExecuted}</h3>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border-t-4 border-fuchsia-500 shadow-sm p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">الطلبات قيد التنفيذ</p>
              <h3 className="text-4xl font-black text-fuchsia-600 tabular-nums">{totalPending}</h3>
            </div>
            <div className="bg-fuchsia-50 p-3 rounded-full">
              <Clock className="w-8 h-8 text-fuchsia-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border-t-4 border-blue-500 shadow-sm p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">نسبة الإنجاز</p>
              <h3 className="text-4xl font-black text-blue-600 tabular-nums">{overallCompletion.toFixed(1)}%</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Complete Monthly Services Table */}
      <div className="bg-white border border-[#BFDBFE] shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-l from-[#DCEBFE] via-[#EAF3FF] to-[#F5F9FF] border-b border-[#BFDBFE] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
              <ListChecks className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#142A45]">
                بيانات جميع الخدمات التشغيلية ({monthName} {year})
              </h3>
              <span className="text-[11px] font-bold text-slate-600">
                مرتبة تنازلياً حسب حجم النشاط الفعلي للشهر المحدد
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-[#142A45] bg-white border border-[#93C5FD] px-3 py-1 rounded-lg">
            إجمالي الخدمات: {services.length}
          </span>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#EFF6FF] text-[#142A45] border-y border-[#93C5FD]">
                <th className="py-2.5 px-3 text-center font-black w-14">الترتيب</th>
                <th className="py-2.5 px-3 text-right font-black">الخدمة التشغيلية</th>
                <th className="py-2.5 px-3 text-center font-black">المستهدف (الوارد)</th>
                <th className="py-2.5 px-3 text-center font-black">المتحقق (المنفذ)</th>
                <th className="py-2.5 px-3 text-center font-black">المتبقي</th>
                <th className="py-2.5 px-3 text-center font-black">نسبة الإنجاز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {sortedServices.map((s, idx) => {
                const ratio = s.received === 0 ? 0 : (s.executed / s.received) * 100;
                const pending = Math.max(0, s.received - s.executed);
                return (
                  <tr key={s.id} className={idx % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"}>
                    <td className="py-2 px-3 text-center font-black text-[#142A45] tabular-nums">{idx + 1}</td>
                    <td className="py-2 px-3 font-extrabold text-[#142A45]">{s.name}</td>
                    <td className="py-2 px-3 text-center font-black text-[#142A45] tabular-nums">{s.received}</td>
                    <td className="py-2 px-3 text-center font-black text-emerald-700 tabular-nums">{s.executed}</td>
                    <td className="py-2 px-3 text-center font-black text-amber-700 tabular-nums">{pending}</td>
                    <td className="py-2 px-3 text-center font-black text-[#1D4ED8] tabular-nums">
                      {ratio.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#142A45] text-white font-black">
                <td colSpan={2} className="py-2.5 px-3 text-right">
                  الإجمالي الكلي لشهر {monthName} {year}
                </td>
                <td className="py-2.5 px-3 text-center tabular-nums">{totalReceived}</td>
                <td className="py-2.5 px-3 text-center tabular-nums">{totalExecuted}</td>
                <td className="py-2.5 px-3 text-center tabular-nums">{totalPending}</td>
                <td className="py-2.5 px-3 text-center tabular-nums">{overallCompletion.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Services Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
          <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-2">
            مقارنة الطلبات الواردة والمنفذة حسب الخدمة ({monthName} {year})
          </h3>
          <div className="h-[400px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={services} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: "bold" }}
                />
                <YAxis tick={{ fill: "#64748b", fontWeight: "bold" }} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px", fontWeight: "bold" }} />
                <Bar dataKey="received" name="الوارد" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="received" position="top" fill="#64748b" fontSize={11} fontWeight="bold" />
                </Bar>
                <Bar dataKey="executed" name="المنفذ" fill="#10b981" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="executed" position="top" fill="#64748b" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
            <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-2">
              حالة الطلبات الإجمالية
            </h3>
            <div className="h-[250px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ value }) => `${value}`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#f43f5e"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: "bold" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-slate-900 text-white p-6 shadow-sm rounded-xl">
            <h3 className="text-lg font-black text-white mb-4 border-b border-slate-700 pb-2">
              أعلى 5 خدمات طلباً ({monthName} {year})
            </h3>
            <div className="space-y-4">
              {sortedServices.slice(0, 5).map((service, index) => (
                <div key={service.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-bold text-sm text-slate-200">{service.name}</span>
                  </div>
                  <span className="font-black text-emerald-400 px-2 tabular-nums">{service.received}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fire Extinguishers, Hazards & Maintenance Costs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-t-4 border-rose-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <div className="bg-rose-100 p-2 rounded-lg">
              <FireExtinguisher className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">ملخص الطفايات وملاحظات المخاطر ({monthName} {year})</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <span className="block text-emerald-700 text-xs font-bold">طفايات صالحة</span>
              <span className="block text-2xl font-black text-emerald-800 tabular-nums">
                {fireExtinguishers?.active ?? 0}
              </span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <span className="block text-rose-700 text-xs font-bold">طفايات غير صالحة</span>
              <span className="block text-2xl font-black text-rose-800 tabular-nums">
                {fireExtinguishers?.inactive ?? 0}
              </span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <span className="block text-blue-700 text-xs font-bold">ملاحظات مخاطر مغلقة</span>
              <span className="block text-2xl font-black text-blue-800 tabular-nums">
                {hazardNotes?.closed ?? 0}
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <span className="block text-amber-700 text-xs font-bold">ملاحظات مخاطر غير مغلقة</span>
              <span className="block text-2xl font-black text-amber-800 tabular-nums">
                {hazardNotes?.notClosed ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border-t-4 border-amber-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Banknote className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">خدمات الصيانة والتكلفة المالية ({monthName} {year})</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <span className="block text-slate-600 text-xs font-bold">أعمال صيانة (من المرافق)</span>
              <span className="block text-2xl font-black text-slate-900 tabular-nums">
                {maintenanceServices?.fromFacilities ?? 0}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <span className="block text-slate-600 text-xs font-bold">أعمال صيانة (من إدارات أخرى)</span>
              <span className="block text-2xl font-black text-slate-900 tabular-nums">
                {maintenanceServices?.fromOthers ?? 0} ({totalMaintenanceServicesCount} إجمالي)
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <span className="block text-amber-800 text-xs font-bold">تكلفة النثرية Petty Cash</span>
              <span className="block text-xl font-black text-amber-900 tabular-nums">
                {maintenanceServices?.costPettyCash || "-"}
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
              <span className="block text-indigo-800 text-xs font-bold">تكلفة أمر الشراء P.O</span>
              <span className="block text-xl font-black text-indigo-900 tabular-nums">
                {maintenanceServices?.costPurchaseOrder || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contracts Chart */}
        <div className="bg-white border-t-4 border-indigo-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Banknote className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">ملخص العقود والرخص ({monthName} {year})</h3>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-indigo-50 rounded-xl p-4 text-center">
              <span className="block text-indigo-600 text-sm font-bold">العقود الفعالة</span>
              <span className="block text-3xl font-black text-indigo-700 tabular-nums">{activeContracts}</span>
            </div>
            <div className="flex-1 bg-rose-50 rounded-xl p-4 text-center">
              <span className="block text-rose-600 text-sm font-bold">العقود المنتهية</span>
              <span className="block text-3xl font-black text-rose-700 tabular-nums">{inactiveContracts}</span>
            </div>
          </div>
          <div className="h-[250px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractsPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ value }) => `${value}`}
                >
                  {contractsPie.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "#e11d48"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: "bold" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Overall */}
        <div className="bg-white border-t-4 border-orange-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Wrench className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">إجمالي طلبات الصيانة بالمقرات ({monthName} {year})</h3>
          </div>
          <div className="h-[350px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: "#64748b", fontWeight: "bold" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: "bold" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                />
                <Bar dataKey="total" name="إجمالي الطلبات" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20}>
                  <LabelList dataKey="total" position="right" fill="#64748b" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logistics Chart */}
        <div className="bg-white border-t-4 border-sky-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <div className="bg-sky-100 p-2 rounded-lg">
              <Truck className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">ملخص الدعم اللوجستي ({monthName} {year})</h3>
          </div>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logisticsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: "bold" }}
                />
                <YAxis tick={{ fill: "#64748b", fontWeight: "bold" }} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                />
                <Bar dataKey="total" name="الإجمالي" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" fill="#64748b" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Chart */}
        <div className="bg-white border-t-4 border-purple-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">ملخص خدمات الأمن والاستقبال ({monthName} {year})</h3>
          </div>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={securityChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="total"
                  label={({ name, percent, value }) => (percent && percent > 0.05 ? `${name}: ${value}` : "")}
                  labelLine={false}
                >
                  {securityChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
