awk '{
  if ($0 ~ /  React.useEffect\(\(\) => {/ && prevLine ~ /  }, \[yearMonth, key\]\);/) {
    print "  const isFirstRender = React.useRef(true);"
    print "  const prevYearMonth = React.useRef(yearMonth);"
    print $0
  } else if ($0 ~ /    localStorage.setItem\(`${key}-${yearMonth}`, JSON.stringify\(state\)\);/) {
    print $0
    print "    if (isFirstRender.current) {"
    print "      isFirstRender.current = false;"
    print "    } else if (prevYearMonth.current === yearMonth) {"
    print "      window.dispatchEvent(new Event(\"data-saved\"));"
    print "    }"
    print "    prevYearMonth.current = yearMonth;"
  } else {
    print $0
  }
  prevLine = $0
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
