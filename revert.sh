awk '{
    if ($0 ~ /^[ \t]*)}\s*$/) {
        getline next_line
        if (next_line ~ /^[ \t]*<\/div>\s*$/) {
            print $0
            next
        } else {
            print $0
            print next_line
            next
        }
    }
    print $0
}' src/components/Dashboard.tsx > temp.tsx && mv temp.tsx src/components/Dashboard.tsx
