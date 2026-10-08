#!/usr/bin/env bash
# يكتب مفتاح App Store Connect (.p8) من متغير البيئة إلى ملف PEM صالح ويتحقق منه.
# يقبل السر بأي من الصيغ الشائعة: PEM خام، PEM بـ\n حرفية، Base64 لـPEM (مرة أو مرتين)، مع CRLF.
# الاستخدام: write-asc-api-key.sh <مسار الإخراج>   (يقرأ APP_STORE_CONNECT_API_KEY_KEY)
set -euo pipefail
export LC_ALL=C
out="${1:?output path required}"
raw="${APP_STORE_CONNECT_API_KEY_KEY:?APP_STORE_CONNECT_API_KEY_KEY missing}"

is_pem() { grep -q -- '-----BEGIN [A-Z ]*PRIVATE KEY-----' <<<"$1"; }

content="$raw"
for _ in 1 2; do
  is_pem "$content" && break
  decoded=$(printf '%s' "$content" | tr -d ' \r\n\t' | base64 --decode 2>/dev/null) || break
  [ -n "$decoded" ] || break
  content="$decoded"
done

if ! is_pem "$content"; then
  echo "::error::APP_STORE_CONNECT_API_KEY_KEY ليس PEM ولا Base64 لـPEM — أعد حفظ السر من ملف .p8"
  exit 1
fi

# \n حرفية → أسطر حقيقية، وإزالة CR والمسافات الطرفية لكل سطر.
content=$(printf '%s' "$content" | sed 's/\\n/\n/g' | tr -d '\r' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | sed '/^$/d')

(umask 077; printf '%s\n' "$content" > "$out")

if ! openssl pkey -in "$out" -noout 2>/dev/null; then
  rm -f "$out"
  echo "::error::مفتاح ASC بصيغة PEM لكنه غير صالح (تالف أو مقطوع) — أعد حفظ السر من ملف .p8"
  exit 1
fi
echo "ASC key OK"
