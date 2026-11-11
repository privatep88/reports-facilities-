cat << 'INNER_EOF' > src/components/ServicesDashboardView.tsx
import React, { useMemo } from "react";
import { ServiceData, ContractData, MaintenanceSite, LogisticsData, SecurityData, TaskData, ChallengeData } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, ClipboardCheck, Clock, TrendingUp, Shield, Truck, Home, Wrench, ShieldCheck, Banknote } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#14b8a6"];

interface Props {
  services: ServiceData[];
  contracts: ContractData[];
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

export function ServicesDashboardView({ services, contracts, maintenanceSites, maintenanceServices, logistics, security, tasks, challenges }: Props) {
  // Services
  const totalReceived = useMemo(() => services.reduce((acc, s) => acc + s.received, 0), [services]);
  const totalExecuted = useMemo(() => services.reduce((acc, s) => acc + s.executed, 0), [services]);
  const totalPending = totalReceived - totalExecuted;
  const overallCompletion = totalReceived === 0 ? 0 : (totalExecuted / totalReceived) * 100;
  
  const sortedServices = useMemo(() => [...services].sort((a, b) => b.received - a.received), [services]);

  const pieData = useMemo(() => [
    { name: "منفذة", value: totalExecuted },
    { name: "قيد التنفيذ / ملغاة", value: totalPending }
  ], [totalExecuted, totalPending]);

  // Contracts
  const activeContracts = useMemo(() => contracts.reduce((acc, c) => acc + c.active, 0), [contracts]);
  const inactiveContracts = useMemo(() => contracts.reduce((acc, c) => acc + c.inactive, 0), [contracts]);
  const contractsPie = [
    { name: "فعال", value: activeContracts },
    { name: "غير فعال", value: inactiveContracts }
  ];

  // Maintenance Sites Chart Data
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

  // Logistics & Security mapping
  const logisticsChartData = useMemo(() => logistics.map(l => ({ name: l.label, total: Number(l.total) || 0 })), [logistics]);
  const securityChartData = useMemo(() => security.map(s => {
    let sum = 0;
    sum += Number(s.cards) || 0;
    sum += Number(s.visitors) || 0;
    sum += Number(s.supplierVisitors) || 0;
    sum += Number(s.meetingRooms) || 0;
    sum += Number(s.evacuation) || 0;
    sum += Number(s.securityReports) || 0;
    sum += Number(s.emergencies) || 0;
    return { name: s.label, total: sum };
  }), [security]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-t-4 border-slate-900 shadow-sm p-6 relative overflow-hidden group">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">إجمالي الطلبات</p>
               <h3 className="text-4xl font-black text-slate-900">{totalReceived}</h3>
             </div>
             <div className="bg-slate-100 p-3 rounded-full">
               <ClipboardCheck className="w-8 h-8 text-slate-700" />
             </div>
           </div>
        </div>
        <div className="bg-white border-t-4 border-emerald-500 shadow-sm p-6 relative overflow-hidden group">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">الطلبات المنفذة</p>
               <h3 className="text-4xl font-black text-emerald-600">{totalExecuted}</h3>
             </div>
             <div className="bg-emerald-50 p-3 rounded-full">
               <CheckCircle className="w-8 h-8 text-emerald-500" />
             </div>
           </div>
        </div>
        <div className="bg-white border-t-4 border-fuchsia-500 shadow-sm p-6 relative overflow-hidden group">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">الطلبات المعلقة</p>
               <h3 className="text-4xl font-black text-fuchsia-600">{totalPending}</h3>
             </div>
             <div className="bg-fuchsia-50 p-3 rounded-full">
               <Clock className="w-8 h-8 text-fuchsia-500" />
             </div>
           </div>
        </div>
        <div className="bg-white border-t-4 border-blue-500 shadow-sm p-6 relative overflow-hidden group">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">نسبة الإنجاز</p>
               <h3 className="text-4xl font-black text-blue-600">{overallCompletion.toFixed(1)}%</h3>
             </div>
             <div className="bg-blue-50 p-3 rounded-full">
               <TrendingUp className="w-8 h-8 text-blue-500" />
             </div>
           </div>
        </div>
      </div>

      {/* Main Services Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
          <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-2">مقارنة الطلبات الواردة والمنفذة حسب الخدمة</h3>
          <div className="h-[400px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={services} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', textAlign: 'right' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                <Bar dataKey="received" name="الوارد" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="executed" name="المنفذ" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
            <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-2">حالة الطلبات الإجمالية</h3>
            <div className="h-[250px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#f43f5e"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-slate-900 text-white p-6 shadow-sm rounded-xl">
            <h3 className="text-lg font-black text-white mb-4 border-b border-slate-700 pb-2">أعلى 5 خدمات طلباً</h3>
            <div className="space-y-4">
              {sortedServices.slice(0, 5).map((service, index) => (
                <div key={service.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                    <span className="font-bold text-sm">{service.name}</span>
                  </div>
                  <span className="font-black text-emerald-400">{service.received}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contracts Chart */}
        <div className="bg-white border-t-4 border-indigo-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <Banknote className="w-6 h-6 text-indigo-500" />
            <h3 className="text-lg font-black text-slate-900">ملخص العقود والرخص</h3>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-indigo-50 rounded p-4 text-center">
              <span className="block text-indigo-500 text-sm font-bold">العقود الفعالة</span>
              <span className="block text-2xl font-black text-indigo-700">{activeContracts}</span>
            </div>
            <div className="flex-1 bg-rose-50 rounded p-4 text-center">
              <span className="block text-rose-500 text-sm font-bold">العقود المنتهية</span>
              <span className="block text-2xl font-black text-rose-700">{inactiveContracts}</span>
            </div>
          </div>
          <div className="h-[250px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={contractsPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {contractsPie.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "#e11d48"} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Overall */}
        <div className="bg-white border-t-4 border-orange-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <Wrench className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-black text-slate-900">إجمالي طلبات الصيانة بالمنشآت</h3>
          </div>
          <div className="h-[350px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', textAlign: 'right' }} />
                <Bar dataKey="total" name="إجمالي الطلبات" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logistics Chart */}
        <div className="bg-white border-t-4 border-sky-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <Truck className="w-6 h-6 text-sky-500" />
            <h3 className="text-lg font-black text-slate-900">ملخص الدعم اللوجستي</h3>
          </div>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logisticsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold', textAlign: 'right' }} />
                <Bar dataKey="total" name="الإجمالي" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Chart */}
        <div className="bg-white border-t-4 border-purple-500 shadow-sm p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-black text-slate-900">ملخص خدمات الأمن والاستقبال</h3>
          </div>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={securityChartData} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="total" label={({ name, percent }) => percent > 0.05 ? `${name}` : ''} labelLine={false}>
                  {securityChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
INNER_EOF
sh patch_view.sh