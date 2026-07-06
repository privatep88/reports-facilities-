awk '{
  if ($0 ~ /const \[services, setServices\] = useState<ServiceData\[\]>\(initialServices\);/) {
    print "  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);"
    print "  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());"
    print "  const yearMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, \"0\")}`;"
    print "  const [servicesRaw, setServices] = useMonthlyState<ServiceData[]>(\"services\", initialServices, yearMonth);"
    print "  const services = React.useMemo(() => {"
    print "    return servicesRaw.map(s => {"
    print "      const orig = initialServices.find(is => is.id === s.id);"
    print "      return { ...s, icon: orig ? orig.icon : ClipboardCheck };"
    print "    });"
    print "  }, [servicesRaw]);"
    print "  const monthsList = [\"يناير\", \"فبراير\", \"مارس\", \"أبريل\", \"مايو\", \"يونيو\", \"يوليو\", \"أغسطس\", \"سبتمبر\", \"أكتوبر\", \"نوفمبر\", \"ديسمبر\"];"
    print "  const yearsList = Array.from({ length: 2050 - 2023 + 1 }, (_, i) => 2023 + i);"
  } else if ($0 ~ /const \[contractsState, setContractsState\] = useState<ContractData\[\]>\(contracts\);/) {
    print "  const [contractsState, setContractsState] = useMonthlyState<ContractData[]>(\"contracts\", contracts, yearMonth);"
  } else if ($0 ~ /const \[maintenanceSitesState, setMaintenanceSitesState\] = useState<MaintenanceSite\[\]>\(maintenanceSites\);/) {
    print "  const [maintenanceSitesState, setMaintenanceSitesState] = useMonthlyState<MaintenanceSite[]>(\"maintenanceSites\", maintenanceSites, yearMonth);"
  } else if ($0 ~ /const \[maintenanceServices, setMaintenanceServices\] = useState\({/) {
    print "  const [maintenanceServices, setMaintenanceServices] = useMonthlyState(\"maintenanceServices\", defaultMaintenanceServices, yearMonth);"
    getline
    getline
    getline
    getline
    getline
  } else if ($0 ~ /const \[logisticsState, setLogisticsState\] = useState<LogisticsData\[\]>\(logisticsData\);/) {
    print "  const [logisticsState, setLogisticsState] = useMonthlyState<LogisticsData[]>(\"logistics\", logisticsData, yearMonth);"
  } else if ($0 ~ /const \[securityState, setSecurityState\] = useState<SecurityData\[\]>\(securityData\);/) {
    print "  const [securityState, setSecurityState] = useMonthlyState<SecurityData[]>(\"security\", securityData, yearMonth);"
  } else if ($0 ~ /const \[tasksState, setTasksState\] = useState<TaskData\[\]>\(tasksData\);/) {
    print "  const [tasksState, setTasksState] = useMonthlyState<TaskData[]>(\"tasks\", tasksData, yearMonth);"
  } else if ($0 ~ /const \[challengesState, setChallengesState\] = useState<ChallengeData\[\]>\(challengesData\);/) {
    print "  const [challengesState, setChallengesState] = useMonthlyState<ChallengeData[]>(\"challenges\", challengesData, yearMonth);"
  } else if ($0 ~ /const \[approvalsState, setApprovalsState\] = useState\({/) {
    print "  const [approvalsState, setApprovalsState] = useMonthlyState(\"approvals\", defaultApprovals, yearMonth);"
    getline
    getline
    getline
  } else {
    print $0
  }
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
