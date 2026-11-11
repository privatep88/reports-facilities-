awk '{
  if ($0 ~ /  const handleExportPDF = \(\) => {/) {
    print "  const [showToast, setShowToast] = useState(false);"
    print "  React.useEffect(() => {"
    print "    let timeout: any;"
    print "    const handleSave = () => {"
    print "      setShowToast(true);"
    print "      clearTimeout(timeout);"
    print "      timeout = setTimeout(() => setShowToast(false), 2000);"
    print "    };"
    print "    window.addEventListener(\"data-saved\", handleSave);"
    print "    return () => {"
    print "      window.removeEventListener(\"data-saved\", handleSave);"
    print "      clearTimeout(timeout);"
    print "    };"
    print "  }, []);"
    print $0
  } else {
    print $0
  }
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
