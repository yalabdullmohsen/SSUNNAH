#!/usr/bin/env bash
set -uo pipefail
D="$(cd "$(dirname "$0")" && pwd)"; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; fail=0
ok(){ echo "  ✓ $1"; }; no(){ echo "  ✗ $1"; fail=1; }
cd "$T" && git init -q . && mkdir -p ios-native/R docs/native
printf 'x' > ios-native/R/a.ttf
cat > docs/native/ASSETS_LICENSES.md <<'X'
## 1) أمثلة
| `ios-native/old.png` | x | رسم أصلي | d | o |
## 3) السجلّ
| `ios-native/R/a.ttf` | Google | OFL-1.1 | d | o |
X
cat > docs/native/assets-budget.json <<'X'
{"maxBytes":{"image":1000,"vector":1000,"font":1000,"sound":1000,"video":1000},"maxPixels":{"image":2048,"appIcon":1024},"maxTrackedAssetsTotal":1500,"maxBundledDataTotal":1000}
X
git add -A; L(){ GUARD_REPO=$T bash "$D/native-assets-license-guard.sh" >/dev/null 2>&1; }; S(){ GUARD_REPO=$T bash "$D/native-assets-size-guard.sh" >/dev/null 2>&1; }
L && ok "أصل مسجَّل يمرّ" || no "أصل مسجَّل"
printf 'y' > ios-native/R/b.png; git add -A; L && no "غير المسجَّل يجب أن يفشل" || ok "أصل غير مسجَّل يفشل"
printf '| `ios-native/R/b.png` | https://example.com/x.png | غير معروف | d | o |\n' >> docs/native/ASSETS_LICENSES.md
L && no "ترخيص مجهول/إنترنت" || ok "صورة إنترنت بلا ترخيص صريح تُرفض"
sed -i '' 's#| غير معروف |#| CC0 |#' docs/native/ASSETS_LICENSES.md; L && ok "ترخيص صريح يمرّ" || no "CC0"
sed -i '' 's#| CC0 |#| OWNER_DECISION |#' docs/native/ASSETS_LICENSES.md; L && ok "OWNER_DECISION يمرّ بتحذير" || no "OD"
RC_FINAL=1 GUARD_REPO=$T bash "$D/native-assets-license-guard.sh" >/dev/null 2>&1 && no "RC_FINAL" || ok "OWNER_DECISION يفشل في النهائي"
S && ok "الحجم ضمن السقف" || no "حجم"
head -c 5000 /dev/zero > ios-native/R/big.ttf; printf '| `ios-native/R/big.ttf` | g | OFL-1.1 | d | o |\n' >> docs/native/ASSETS_LICENSES.md; git add -A
S && no "خط كبير" || ok "أصل فوق السقف يفشل"
[ $fail = 0 ] && echo "assets-guards tests OK" || { echo FAILED; exit 1; }
