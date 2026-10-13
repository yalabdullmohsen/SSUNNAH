#!/usr/bin/env bash
# يفشل إن استعمل ملف scripts/native-* أمرًا خاصًا بـGNU غير موجود على macOS.
cd "$(dirname "$0")/.." || exit 2
bad=$(grep -nE '(^|[;&|(` ]|\$\()(timeout|gtimeout) [0-9$]|sed -i( +-[a-zA-Z]+)* +[^'"'"' -]|readlink -f|date -d |stat -c ' scripts/native-*.sh 2>/dev/null | grep -v 'native-gnu-guard.sh')
if [ -n "$bad" ]; then echo "✗ أمر GNU غير متاح على macOS (استعمل perl/python أو sed -i '' أو stat -f):"; echo "$bad"; exit 1; fi
echo "✓ native-gnu-guard"
