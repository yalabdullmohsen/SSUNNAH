#!/usr/bin/env bash
# طفرات على تغطية docs/site في حارس الروابط (بلا شبكة: LIVE=file:// يُتخطّى)
cd "$(dirname "$0")/.." || exit 2
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; mkdir "$T/src"
run() { SRC="$T/src" SITE="$T/site" LIVE=file:///nonexistent bash scripts/native-static-links-check.sh >"$T/out" 2>&1; }
fresh() { rm -rf "$T/site"; cp -R docs/site "$T/site"; }
fresh; run || { echo "✗ الأصل يجب أن ينجح"; cat "$T/out"; exit 1; }
fresh; sed -i '' 's#href="privacy.html"#href="gone.html"#' "$T/site/support.html"; run && { echo "✗ رابط داخلي مكسور لم يُكتشف"; exit 1; }
fresh; sed -i '' 's#<a data-support-email>…</a>#<a href="mailto:x@y.com">x</a>#' "$T/site/support.html"; run && { echo "✗ بريد مخالف لم يُكتشف"; exit 1; }
fresh; echo 'window.SUPPORT_EMAIL = "";' >"$T/site/config.js"; run && { echo "✗ config بلا بريد لم يُكتشف"; exit 1; }
mkdir -p "$T/src2"; echo 'https://yalabdullmohsen.github.io/SSUNNAH/nope.html' >"$T/src2/a.swift"; fresh
SRC="$T/src2" SITE="$T/site" LIVE=file:///x bash scripts/native-static-links-check.sh 2>&1 | grep -q "لا صفحة" || { echo "✗ رابط تطبيق بلا صفحة لم يُكتشف"; exit 1; }
echo "static-links docs/site tests OK"
