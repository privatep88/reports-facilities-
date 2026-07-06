sed -i '418,427c\
             <div className="bg-white border border-slate-200 shadow-sm flex flex-col">\
                <div className="bg-slate-900 text-white px-4 py-3 font-bold text-sm flex justify-between">\
                  <span>التكلفة المالية</span>\
                  <span className="text-slate-400 text-xs tracking-widest uppercase">Financial Cost</span>\
                </div>\
                <table className="w-full text-sm">\
                  <thead className="bg-slate-50 border-b border-slate-200">\
                    <tr><th className="py-2 text-right px-4 font-bold w-12">م</th><th className="py-2 text-right px-4 font-bold">الوصف</th><th className="py-2 text-center px-4 font-bold w-32">المبلغ</th></tr>\
                  </thead>\
                  <tbody>\
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">1</td><td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-500"/> التكلفة / النثرية</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell isEditing={editModes.maintenance} value={maintenanceServices.costPettyCash} onChange={(v) => setMaintenanceServices(p => ({ ...p, costPettyCash: String(v) }))} /></td></tr>\
                    <tr className="border-b border-slate-100"><td className="py-3 px-4 font-bold text-slate-500">2</td><td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-blue-500"/> التكلفة / أمر شراء</td><td className="py-3 text-center px-4 font-bold text-slate-900"><EditableCell isEditing={editModes.maintenance} value={maintenanceServices.costPurchaseOrder} onChange={(v) => setMaintenanceServices(p => ({ ...p, costPurchaseOrder: String(v) }))} /></td></tr>\
                    <tr className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200"><td colSpan={3} className="py-3 px-4 text-transparent select-none">-</td></tr>\
                  </tbody>\
                </table>\
             </div>\
          </div>\
' src/components/Dashboard.tsx
