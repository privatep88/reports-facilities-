sed -i '434,440c\
                       {editModes.maintenance ? (\
                         <td className="py-3 px-2 text-center">\
                           <button onClick={() => deleteMaintenanceSite(site.id)} className="text-rose-500 hover:text-rose-700 p-1">\
                             <Trash2 className="w-4 h-4" />\
                           </button>\
                         </td>\
                       ) : null}\
' src/components/Dashboard.tsx
