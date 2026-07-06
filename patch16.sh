awk '{
  if ($0 ~ /<div className="bg-slate-900 text-white px-4 py-1 text-sm font-bold mb-2">أبريل 2026<\/div>/) {
    print "            <div className=\"flex items-center gap-2 mb-2 print:hidden\">"
    print "              <select className=\"bg-slate-900 text-white px-2 py-1 text-sm font-bold rounded cursor-pointer\" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>"
    print "                {monthsList.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}"
    print "              </select>"
    print "              <select className=\"bg-slate-900 text-white px-2 py-1 text-sm font-bold rounded cursor-pointer\" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>"
    print "                {yearsList.map(y => <option key={y} value={y}>{y}</option>)}"
    print "              </select>"
    print "            </div>"
    print "            <div className=\"hidden print:block bg-slate-900 text-white px-4 py-1 text-sm font-bold mb-2\">"
    print "               {monthsList[selectedMonth - 1]} {selectedYear}"
    print "            </div>"
  } else {
    print $0
  }
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
