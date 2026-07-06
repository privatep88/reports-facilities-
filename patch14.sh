awk '{
  if (NR == 17) {
    print "const defaultMaintenanceServices = { fromFacilities: 0, fromOthers: 0, costPettyCash: \"-\", costPurchaseOrder: \"-\" };"
    print "const defaultApprovals = { preparation: { role: \"ضابط أول المرافق والأصول\", name: \"معاذ المصعبي\", date: \"\", signature: \"\" }, review: { role: \"رئيس قسم إدارة المرافق\", name: \"فيصل سويد السليماني\", date: \"\", signature: \"\" } };"
    print "function useMonthlyState<T>(key: string, defaultValue: T, yearMonth: string) {"
    print "  const [state, setState] = useState<T>(() => {"
    print "    try {"
    print "      const stored = localStorage.getItem(`${key}-${yearMonth}`);"
    print "      if (stored) return JSON.parse(stored);"
    print "    } catch (e) {}"
    print "    return defaultValue;"
    print "  });"
    print "  React.useEffect(() => {"
    print "    try {"
    print "      const stored = localStorage.getItem(`${key}-${yearMonth}`);"
    print "      if (stored) {"
    print "        setState(JSON.parse(stored));"
    print "      } else {"
    print "        setState(defaultValue);"
    print "      }"
    print "    } catch (e) {"
    print "      setState(defaultValue);"
    print "    }"
    print "  }, [yearMonth, key]);"
    print "  React.useEffect(() => {"
    print "    localStorage.setItem(`${key}-${yearMonth}`, JSON.stringify(state));"
    print "  }, [state, yearMonth, key]);"
    print "  return [state, setState] as const;"
    print "}"
    print $0
  } else {
    print $0
  }
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
