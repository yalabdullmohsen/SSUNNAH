#!/bin/sh
# نقطة اتصال: يستدعي سكربت التصدير الرسمي (ن1، #2921) دون أي منطق تصدير أو تحقق محتوى هنا.
# يُستدعى من Run Script Phase في هدف SunnahApp قبل Copy Bundle Resources.
# الاستعمال: ios-native/scripts/prepare-data.sh [مجلد_الإخراج]   (الافتراضي: ios-native/Data؛ يُمرَّر كما هو)
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXPORT="$ROOT/scripts/native-export-data.sh"
if [ ! -x "$EXPORT" ]; then
  echo "error: scripts/native-export-data.sh غير موجود أو غير قابل للتنفيذ (ادمج main في الفرع)" >&2
  exit 1
fi
exec "$EXPORT" "$@"
