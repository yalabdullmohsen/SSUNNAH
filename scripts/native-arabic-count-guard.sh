#!/usr/bin/env bash
# يمنع عددًا جديدًا بتمييز ثابت في نص واجهة («\(n) درسًا» يعطي «١ درسًا» و«٥ درسًا»).
# الصواب: ArabicCount.label(n, one:two:few:many:genitive:) من Design/ArabicCount.swift.
# سقف (ratchet): المواضع القائمة في scripts/native-arabic-count-baseline.txt مسموحة مؤقتًا. أي موضع جديد يفشل.
# صيغ «N من M» و«N / M» مستثناة، لأن التمييز فيها يتبع M.
set -euo pipefail
cd "$(dirname "$0")/.."
SN=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative
BASE=scripts/native-arabic-count-baseline.txt
NOUNS='درسًا|درس|سؤالًا|حديث|ذكرًا|آية|دقيقة|ثانية|صفحة|صفحات|موضوعًا|بحثًا|مساهمة|سجل|بطاقة|وحدة|مرة|يومًا|أيام|يوم|شارة|عنصرًا'
HITS=$(grep -rnoE "\\\\\([^\"]*\)\s*($NOUNS)( |\"|\.)" "$SN" --include=*.swift | grep -vE 'من \\\(|/ \\\(' || true)
BAD=""
while IFS= read -r h; do
  [ -z "$h" ] && continue
  file=${h%%:*}; rest=${h#*:}; snippet=${rest#*:}
  key="${file#"$SN"/}|$snippet"
  grep -qxF "$key" "$BASE" 2>/dev/null || BAD+="$h"$'\n'
done <<< "$HITS"
if [ -n "$BAD" ]; then
  echo "عدد بتمييز ثابت (استعمل ArabicCount.label):"; printf '%s' "$BAD"; exit 1
fi
STALE=$(while IFS= read -r k; do [ -z "$k" ] || [[ $k == \#* ]] && continue; f=${k%%|*}; s=${k#*|}; grep -qF -- "$s" "$SN/$f" 2>/dev/null || echo "$k"; done < "$BASE")
[ -n "$STALE" ] && { echo "تنبيه: مواضع في السقف أُصلحت، احذفها من $BASE:"; echo "$STALE"; }
echo "arabic-count-guard: OK"
