sed -i '/const updateMaintenanceSite =/i \
  const addMaintenanceSite = () => {\
    const newId = maintenanceSitesState.length > 0 ? Math.max(...maintenanceSitesState.map((s) => s.id)) + 1 : 1;\
    setMaintenanceSitesState((prev) => [\
      ...prev,\
      { id: newId, name: "موقع جديد", general: "-", furniture: "-", decor: "-", fireAlarm: "-", waterLeak: "-", doors: "-", lighting: "-", floors: "-", ac: "-", externalBoards: "-", electricity: "-", elevators: "-" }\
    ]);\
  };\
  const deleteMaintenanceSite = (id: number) => {\
    setMaintenanceSitesState((prev) => prev.filter((s) => s.id !== id));\
  };\
' src/components/Dashboard.tsx
