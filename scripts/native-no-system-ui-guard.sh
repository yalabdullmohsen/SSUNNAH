#!/bin/bash
# حارس «لا مظهر iOS افتراضي» (قرار يوسف 19 أكتوبر): يمنع مكوّنات النظام في واجهة SunnahNative ويفرض المكوّنات المشتركة للنموذج ٢.
# الممنوع: List/Form/.listStyle/Toggle/Picker/.pickerStyle/.searchable/.sheet/DisclosureGroup/.toolbar{}/.navigationTitle/NavigationLink.
# السقف في docs/native/no-system-ui-baseline.json يُخفَّض فقط حتى صفر؛ زيادة أي بند = فشل. --write-baseline لتحديثه بعد خفض.
set -u
cd "$(dirname "$0")/.."
S=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative
B=docs/native/no-system-ui-baseline.json
# مستثنى: المكوّنات المشتركة نفسها (تلفّ النظام داخليًا إن لزم) وأدوات DEBUG.
EXCL='/Components/|/Design/|Debug|Probe'
declare -A P=(
  [list]='\bList\s*[\({]'
  [form]='\bForm\s*\{'
  [listStyle]='\.listStyle\('
  [toggle]='\bToggle\('
  [picker]='\bPicker\('
  [pickerStyle]='\.pickerStyle\('
  [searchable]='\.searchable\('
  [sheet]='\.sheet\('
  [disclosure]='DisclosureGroup'
  [toolbar]='\.toolbar\s*\{'
  [navTitle]='\.navigationTitle\('
  [navLink]='NavigationLink\('
)
files=$(find "$S" -name '*.swift' | grep -Ev "$EXCL")
declare -A N; json='{'
for k in $(printf '%s\n' "${!P[@]}" | sort); do
  n=$(grep -hE "${P[$k]}" $files 2>/dev/null | grep -vE '^\s*//' | wc -l | tr -d ' ')
  N[$k]=$n; json="$json\"$k\":$n,"
done
json="${json%,}}"
if [ "${1:-}" = "--write-baseline" ]; then printf '{"about":"سقف مكوّنات iOS الافتراضية؛ يُخفَّض فقط حتى صفر","counts":%s}\n' "$json" > "$B"; echo "baseline: $json"; exit 0; fi
fail=0
for k in "${!N[@]}"; do
  cap=$(python3 -c "import json,sys;print(json.load(open('$B'))['counts'].get('$k',0))")
  if [ "${N[$k]}" -gt "$cap" ]; then echo "✗ $k: ${N[$k]} > السقف $cap — استعمل المكوّن المشترك (SunnahCard/SunnahTile/SunnahSettingsRow/SunnahSegmented/SunnahSwitch/SunnahSearchField/SunnahPage)"; grep -nE "${P[$k]}" $files | grep -vE '^\S+:\s*//' | head -5; fail=1; fi
done
total=0; for k in "${!N[@]}"; do total=$((total+N[$k])); done
[ "$fail" = 0 ] && echo "✓ لا زيادة في مكوّنات iOS الافتراضية (المتبقي $total — الهدف 0)"
exit "$fail"
