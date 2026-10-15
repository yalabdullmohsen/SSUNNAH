#!/usr/bin/env bash
# يفشل إن وُجد في SunnahNative ما يكسر الوضع الداكن: حقل roundedBorder النظامي (شبه أسود فوق خلفية التطبيق) — استعمل .sunnahFieldChrome().
S="$(cd "$(dirname "$0")/.." && pwd)/artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative"
bad=$(grep -rnE 'textFieldStyle\(\.roundedBorder\)' "$S" --include='*.swift' || true)
[ -z "$bad" ] || { echo "❌ roundedBorder (استعمل .sunnahFieldChrome()):"; echo "$bad"; exit 1; }
echo "✓ لا حقول roundedBorder"
