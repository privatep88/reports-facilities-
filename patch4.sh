sed -i '270,285c\
           <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4">\
             <div className="flex items-center gap-4">\
               <h3 className="text-lg font-black text-slate-900">ملخص الخدمات</h3>\
               <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Services Summary</span>\
             </div>\
             <div className="flex items-center gap-2">\
               {editModes.services && (\
                 <button onClick={addService} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-sm transition-colors">\
                   + إضافة خدمة\
                 </button>\
               )}\
               <button\
                 onClick={() => toggleEdit("services")}\
                 className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 font-bold text-xs transition-colors shadow-sm"\
               >\
                 {editModes.services ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}\
                 {editModes.services ? "حفظ التعديلات" : "تعديل البيانات"}\
               </button>\
             </div>\
           </div>\
' src/components/Dashboard.tsx
