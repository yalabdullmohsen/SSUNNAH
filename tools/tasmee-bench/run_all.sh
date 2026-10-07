#!/bin/bash
# يشغّل إعدادات القياس تباعًا (تسلسليًا حتى لا يتأثر زمن الفك بالتزاحم).
# الاستعمال: run_all.sh <modelsDir> <corpusSetDir> <runsDir>
set -e
MODELS=$1; SET=$2; RUNS=$3
BIN="$(dirname "$0")/.build/out/Products/Release/tasmee-bench"
base=$(ls -d "$MODELS"/base/*/); tiny=$(ls -d "$MODELS"/tiny/*/)
recs=$(python3 -c "import json;print(' '.join(m['id'] for m in json.load(open('$SET/manifest.json'))))")
run() { # name model flags...
  name=$1; model=$2; shift 2
  mkdir -p "$RUNS/$name"
  for r in $recs; do [ -f "$RUNS/$name/$r.json" ] || "$BIN" --model "$model" --set "$SET" --rec "$r" --out "$RUNS/$name/$r.json" "$@" >/dev/null; done
  echo "done $name"
}
# فك الترميز بلا prompt مستقل عن المطابِق فيُعاد تشغيل المطابِق على السجلات (replay.ts)؛ أما الـprompt فيعتمد على مؤشر المطابِق فيُشغَّل متصلًا.
run base_plain "$base"
run base_prompt5 "$base" --prompt 5
run base_corrupt_prompt5 "$base" --corrupt 8 --prompt 5
# tiny بعد إصلاح التحويل (use_cache): run tiny_plain / tiny_prompt5 يدويًا
if [ -n "${TINY_FIXED:-}" ]; then
  run tiny_plain "$tiny"
  run tiny_prompt5 "$tiny" --prompt 5
fi
