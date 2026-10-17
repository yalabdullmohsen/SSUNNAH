#!/usr/bin/env bash
# يفشل إن استُعملت SunnahBottomCard بلا sunnahAvoidsBottomCard() في الملف نفسه،
# أو وُجد overlay(alignment: .bottom) يدوي خارج قائمة السماح. BCARD_GUARD_SRC يبدّل المجلد (للاختبار).
set -euo pipefail
SRC="${BCARD_GUARD_SRC:-artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative}"
ALLOW='Mushaf/MushafReaderView.swift|Intro/IntroView.swift|Components/SunnahBottomCard.swift'
fail=0
while IFS= read -r f; do
  rel="${f#"$SRC"/}"
  if grep -qE 'SunnahBottomCard *[({]' "$f" && ! grep -q 'sunnahAvoidsBottomCard()' "$f" && [[ "$rel" != Components/SunnahBottomCard.swift ]]; then
    echo "✗ $rel: بطاقة سفلية بلا sunnahAvoidsBottomCard()"; fail=1
  fi
  if grep -q 'overlay(alignment: \.bottom)' "$f" && ! [[ "$rel" =~ ^($ALLOW)$ ]]; then
    echo "✗ $rel: overlay سفلي يدوي — استعمل SunnahBottomCard"; fail=1
  fi
done < <(find "$SRC" -name '*.swift')
exit $fail
