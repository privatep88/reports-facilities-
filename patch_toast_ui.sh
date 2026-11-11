awk '{
  if ($0 ~ /      <\/main>/) {
    print "        {/* Toast Notification */}"
    print "        <div"
    print "          className={`fixed bottom-6 right-6 md:right-auto md:left-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded shadow-lg transition-all duration-300 print:hidden ${showToast ? \"translate-y-0 opacity-100\" : \"translate-y-4 opacity-0 pointer-events-none\"}`}"
    print "        >"
    print "          <CheckCircle className=\"w-5 h-5 text-emerald-400\" />"
    print "          <span className=\"font-bold text-sm\">تم حفظ التغييرات بنجاح</span>"
    print "        </div>"
    print $0
  } else {
    print $0
  }
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
