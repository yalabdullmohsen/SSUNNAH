#!/bin/sh
# نقطة اتصال: يستدعي سكربت التصدير الرسمي (ن1، #2921) دون أي منطق تصدير أو تحقق محتوى هنا.
# يُستدعى من Run Script Phase في هدف SunnahApp قبل Copy Bundle Resources.
# الاستعمال: ios-native/scripts/prepare-data.sh [وسائط تُمرَّر كما هي إلى السكربت]
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXPORT="$ROOT/scripts/native-export-data.sh"
if [ ! -x "$EXPORT" ]; then
  echo "error: scripts/native-export-data.sh غير موجود بعد (ينتظر دمج #2921)" >&2
  exit 1
fi
exec "$EXPORT" "$@"
