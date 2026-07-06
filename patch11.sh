sed -i '411,412c\
                    <th className="py-3 px-2 font-bold whitespace-nowrap">عطل مصاعد</th>\
                    {editModes.maintenance ? <th className="py-3 px-2 font-bold whitespace-nowrap w-10"></th> : null}\
                  </tr>\
' src/components/Dashboard.tsx
