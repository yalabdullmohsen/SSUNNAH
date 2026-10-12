#!/usr/bin/env bash
# يفشل إن وُجد NavigationLink خام في SunnahNative (يسبب سهمًا مكررًا مع SunnahListRow): استعمل SunnahNavigationLink.
S="$(cd "$(dirname "$0")/.." && pwd)/artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative"
bad=$(grep -rnE '(^|[^A-Za-z])NavigationLink[ ({]' "$S" --include='*.swift' | grep -v 'Components/SunnahListRow.swift' || true)
[ -z "$bad" ] || { echo "❌ NavigationLink خام (استعمل SunnahNavigationLink):"; echo "$bad"; exit 1; }
echo "✓ لا NavigationLink خام"
