#!/usr/bin/env bash
# منطق قرار بوابة content-sensitive (يستدعيه .github/workflows/content-sensitive-gate.yml؛ مختبَر بـscripts/test-content-sensitive-gate.sh).
# المدخلات (بيئة): LABELS (مفصولة بفواصل) · ACTION · BASE_REF (مثل native-app) · SHA (رأس الـPR) · BEFORE (رأس الدفعة السابقة عند synchronize).
# المخرجات على stdout سطرًا لكل مفتاح: STATE=success|pending · DESC=<سبب> · DROP_LABEL=yes|no (إسقاط visually-verified)؛ التفاصيل على stderr.
# القاعدة: PR يمسّ نصًا شرعيًا لا يُدمج بلا تحقق بصري — وسم visually-verified، أو لقطة مسمّاة لكل ملف حسّاس (native-sensitive-coverage.sh).
set -u
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
D="$(cd "$(dirname "$0")" && pwd)"
LABELS=${LABELS:-}; ACTION=${ACTION:-}; BASE_REF=${BASE_REF:-native-app}; SHA=${SHA:-HEAD}; BEFORE=${BEFORE:-}
BASE="origin/$BASE_REF"
has() { case ",$LABELS," in *,"$1",*) return 0;; esac; return 1; }

HIT=$(git diff --name-only "$BASE...$SHA" | bash "$D/content-sensitive-check.sh")

# التحقق البصري يسقط فقط إذا مسّت الدفعة الجديدة (BEFORE..SHA) ملفًا حسّاسًا من فرق الـPR؛
# لقطات/PROVENANCE/اختبارات/دمج native-app لا تُسقطه. غياب BEFORE (force-push) = إسقاط احتياطي.
DROP=no
if [ "$ACTION" = synchronize ] && has visually-verified; then
  if [ -n "$BEFORE" ] && git cat-file -e "$BEFORE^{commit}" 2>/dev/null; then
    TOUCHED=$(git diff --name-only "$BEFORE" "$SHA" | grep -Fxf <(echo "$HIT") || true)
    [ -n "$TOUCHED" ] && { DROP=yes; echo "الدفعة مسّت ملفًا حسّاسًا: $(echo "$TOUCHED" | head -3 | tr '\n' ' ')" >&2; }
  else DROP=yes; echo "لا دفعة سابقة صالحة ($BEFORE) — إسقاط احتياطي" >&2; fi
  [ $DROP = yes ] && LABELS=$(echo ",$LABELS," | sed 's/,visually-verified,/,/; s/^,//; s/,$//')
fi

SENS=no; has content-sensitive && SENS=yes; [ -n "$HIT" ] && SENS=yes
if [ $SENS = no ]; then STATE=success; DESC="غير حسّاس"
elif has visually-verified; then STATE=success; DESC="حسّاس وتم التحقق البصري ✓"
else
  if [ -n "$HIT" ] && COV=$(bash "$D/native-sensitive-coverage.sh" "$BASE" "$SHA" 2>&1); then STATE=success; DESC="حسّاس ومغطّى بلقطة مسمّاة لكل ملف ✓"
  else
    STATE=pending
    if [ -n "$HIT" ]; then DESC="بانتظار التحقق البصري — لا لقطة مسمّاة لـ: $(echo "${COV:-}" | grep '✗' | head -2 | sed 's/.*: //' | tr '\n' ' ' | cut -c1-80)؛ أضف لقطة باسم الشاشة أو وسم visually-verified"
    else DESC="موسوم content-sensitive — بانتظار وسم visually-verified"; fi
    [ -n "${COV:-}" ] && echo "${COV:-}" >&2
  fi
fi
[ -n "$HIT" ] && echo "$HIT" | head -5 >&2
printf 'STATE=%s\nDESC=%s\nDROP_LABEL=%s\n' "$STATE" "$DESC" "$DROP"
