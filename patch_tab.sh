awk '{
  if ($0 ~ /export default function Dashboard\(\) {/) {
    print $0
    print "  const [activeTab, setActiveTab] = useState<\"report\" | \"services\">(\"report\");"
  } else if ($0 ~ /            <span className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-1">إدارة الخدمات العامة<\/span>/) {
    print $0
  } else if ($0 ~ /            <h1 className="text-4xl font-black text-slate-900">التقرير الشهري لقسم إدارة المرافق<\/h1>/) {
    print "            <h1 className=\"text-4xl font-black text-slate-900\">"
    print "              {activeTab === \"report\" ? \"التقرير الشهري لقسم إدارة المرافق\" : \"لوحة تحكم الخدمات\"}"
    print "            </h1>"
    print "            <div className=\"flex gap-4 mt-4 print:hidden\">"
    print "               <button onClick={() => setActiveTab(\"report\")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === \"report\" ? \"bg-slate-900 text-white\" : \"bg-slate-200 text-slate-600 hover:bg-slate-300\"}`}>التقرير الشهري</button>"
    print "               <button onClick={() => setActiveTab(\"services\")} className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === \"services\" ? \"bg-slate-900 text-white\" : \"bg-slate-200 text-slate-600 hover:bg-slate-300\"}`}>جميع الخدمات</button>"
    print "            </div>"
  } else if ($0 ~ /      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">/) {
    print $0
    print "        {activeTab === \"services\" ? ("
    print "          <ServicesDashboardView services={services} />"
    print "        ) : ("
    print "          <>"
  } else if ($0 ~ /      <\/main>/) {
    print "          </>"
    print "        )}"
    print $0
  } else if ($0 ~ /import { Edit2, Printer, /) {
    print $0
    print "import { ServicesDashboardView } from \"./ServicesDashboardView\";"
  } else {
    print $0
  }
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
