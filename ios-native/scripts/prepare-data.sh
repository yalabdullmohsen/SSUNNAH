#!/bin/sh
# يولّد حزمة البيانات المدققة إلى ios-native/Data (غير مُلتزَمة) عبر سكربت التصدير.
# يُستدعى من Run Script Phase في هدف SunnahApp قبل Copy Bundle Resources، أو يدويًا.
# الاستعمال: ios-native/scripts/prepare-data.sh [--adhkar-json <ملف>]
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP="$ROOT/artifacts/majalis"
NODE="$(command -v node || echo /opt/homebrew/bin/node)"
# SunnahApp يقرأ من Bundle.main/Data/... فيُضاف المجلد Data كمرجع مجلد (folder reference) في Xcode.
"$NODE" "$APP/scripts/native/export-ios-data.mjs" --out "$ROOT/ios-native/Data" "$@"
test -f "$ROOT/ios-native/Data/MANIFEST.json" || { echo "MANIFEST.json مفقود" >&2; exit 1; }
