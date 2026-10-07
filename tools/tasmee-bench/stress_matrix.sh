#!/bin/bash
# عزل سبب النص الفارغ على تلاوتَي الإجهاد: يجرّب كل فلتر/خيار على حدة (٦ نبضات بنافذة ١٠ث).
# الاستعمال: stress_matrix.sh <modelFolder> <corpusSet> <outDir> [rec ...]
MODEL=$1; SET=$2; OUT=$3; shift 3
RECS=${@:-sudais_room_pink15 sudais_phone_pink15}
BIN="$(dirname "$0")/.build/out/Products/Release/tasmee-bench"
mkdir -p "$OUT"
declare -a NAMES=("baseline(all-nil)" "fallback0" "prefill-cache0" "no-suppress-blank" "no-suppress-tokens" "clip1.0" "noSpeech0.6" "logProb-1" "firstTokenLogProb-1.5" "compression2.4" "fallback0+prefill-cache0")
declare -a FLAGS=("" "--fallback 0" "--prefill-cache 0" "--no-suppress-blank" "--no-suppress-tokens" "--clip 1.0" "--noSpeech 0.6" "--logProb -1" "--firstTokenLogProb -1.5" "--compression 2.4" "--fallback 0 --prefill-cache 0")
for r in $RECS; do
  for i in "${!NAMES[@]}"; do
    f="$OUT/$r.${NAMES[$i]}.json"
    # shellcheck disable=SC2086
    "$BIN" --model "$MODEL" --set "$SET" --rec "$r" --hop 8 --window 10 ${FLAGS[$i]} --out "$f" >/dev/null 2>&1
    python3 - "$f" "$r" "${NAMES[$i]}" <<'PY'
import json, sys
d = json.load(open(sys.argv[1])); dec = d["decodes"][:8]
ne = [x for x in dec if x["text"].strip()]
print(f"{sys.argv[2]:22s} {sys.argv[3]:26s} نبضات بنص {len(ne)}/{len(dec)} | كشف {sum(w['state']=='correct' for w in d['words'])}/67 | مثال: {(ne[0]['text'][:48] if ne else '—')}")
PY
  done
done
