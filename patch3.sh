sed -i '/function SectionTitle/,/^}/c\
function SectionTitle({ title, subtitle, isEditing, onToggleEdit, onAdd, addLabel }: { title: string; subtitle: string; isEditing?: boolean; onToggleEdit?: () => void; onAdd?: () => void; addLabel?: string }) {\
  return (\
    <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4">\
      <div className="flex items-center gap-4">\
        <h3 className="text-lg font-black text-slate-900">{title}</h3>\
        <span className="text-xs uppercase tracking-widest font-bold text-slate-400">{subtitle}</span>\
      </div>\
      <div className="flex items-center gap-2">\
        {isEditing && onAdd && (\
          <button onClick={onAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-sm transition-colors">\
            + {addLabel || "إضافة"}\
          </button>\
        )}\
        {onToggleEdit && (\
          <button\
            onClick={onToggleEdit}\
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 font-bold text-xs transition-colors shadow-sm"\
          >\
            {isEditing ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}\
            {isEditing ? "حفظ التعديلات" : "تعديل البيانات"}\
          </button>\
        )}\
      </div>\
    </div>\
  );\
}\
' src/components/Dashboard.tsx
