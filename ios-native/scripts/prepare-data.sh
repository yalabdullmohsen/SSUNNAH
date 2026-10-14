#!/bin/sh
# نقطة اتصال: يستدعي سكربت التصدير الرسمي (ن1، #2921) دون أي منطق تصدير أو تحقق محتوى هنا.
# يُستدعى من Run Script Phase في هدف SunnahApp قبل Copy Bundle Resources.
# الاستعمال: ios-native/scripts/prepare-data.sh [مجلد_الإخراج]   (الافتراضي: ios-native/Data)
# تزايدي (ن4): hash لمدخلات التصدير (blob SHAs المتتبَّعة + أي تعديل/ملف غير متتبَّع) →
#   ١) ختم Data/.input-hash مطابق ⇒ تخطٍّ فوري  ٢) كاش مشترك بين الـworktrees ⇒ نسخ (clonefile)  ٣) وإلا تصدير كامل ثم نشر للكاش.
# FORCE_EXPORT=1 يتجاوز الكاش. NATIVE_DATA_CACHE يغيّر مجلد الكاش (الافتراضي ~/.cache/ssunnah-native-data).
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXPORT="$ROOT/scripts/native-export-data.sh"
if [ ! -x "$EXPORT" ]; then
  echo "error: scripts/native-export-data.sh غير موجود أو غير قابل للتنفيذ (ادمج main في الفرع)" >&2
  exit 1
fi
OUT="${1:-$ROOT/ios-native/Data}"
M=artifacts/majalis
INPUTS="$M/content $M/public/data $M/public/fonts $M/src $M/scripts/native $M/site.config.json scripts/native-export-data.sh scripts/native-export-weak-hadith.mjs"
HASH=$(cd "$ROOT" && {
  git ls-files -s -- $INPUTS
  git diff HEAD --no-ext-diff -- $INPUTS
  git ls-files -o --exclude-standard -z -- $INPUTS | xargs -0 shasum 2>/dev/null
} | shasum | cut -c1-16)
CACHE="${NATIVE_DATA_CACHE:-$HOME/.cache/ssunnah-native-data}"; mkdir -p "$CACHE"
if [ -z "${FORCE_EXPORT:-}" ] && [ -f "$OUT/MANIFEST.json" ] && [ "$(cat "$OUT/.input-hash" 2>/dev/null)" = "$HASH" ]; then
  echo "prepare-data: مدخلات التصدير لم تتغيّر ($HASH) — تخطٍّ"; exit 0
fi
restore() { rm -rf "$OUT.tmp"; mkdir -p "$OUT.tmp" && cp -cR "$CACHE/$HASH/." "$OUT.tmp"/ 2>/dev/null || cp -R "$CACHE/$HASH/." "$OUT.tmp"/
  rm -rf "$OUT"; mv "$OUT.tmp" "$OUT"; echo "$HASH" > "$OUT/.input-hash"; }
if [ -z "${FORCE_EXPORT:-}" ] && [ -f "$CACHE/$HASH/MANIFEST.json" ]; then
  restore; echo "prepare-data: من الكاش المشترك ($HASH)"; exit 0
fi
# قفل ذري على الـhash كي لا تُصدِّر نافذتان المدخلات نفسها معًا؛ التالية تنتظر ثم تقرأ من الكاش.
L="$CACHE/$HASH.lock"
for i in $(seq 1 360); do
  if mkdir "$L" 2>/dev/null; then echo $$ > "$L/pid"; trap 'rm -rf "$L"' EXIT; break; fi
  P=$(cat "$L/pid" 2>/dev/null || true); [ -n "$P" ] && ! kill -0 "$P" 2>/dev/null && { rm -rf "$L"; continue; }
  if [ -f "$CACHE/$HASH/MANIFEST.json" ] && [ -z "${FORCE_EXPORT:-}" ]; then restore; echo "prepare-data: من الكاش ($HASH)"; exit 0; fi
  sleep 5
done
"$EXPORT" "$OUT"
rm -rf "$CACHE/$HASH.part"; mkdir -p "$CACHE/$HASH.part" && cp -cR "$OUT/." "$CACHE/$HASH.part"/ 2>/dev/null || cp -R "$OUT/." "$CACHE/$HASH.part"/
rm -rf "$CACHE/$HASH"; mv "$CACHE/$HASH.part" "$CACHE/$HASH"; echo "$HASH" > "$OUT/.input-hash"
echo "prepare-data: صُدِّر ونُشر للكاش ($HASH)"
