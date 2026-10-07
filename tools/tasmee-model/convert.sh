#!/bin/bash
# تحويل tarteel-ai/whisper-{base,tiny}-ar-quran (Apache-2.0) إلى CoreML بصيغة WhisperKit — بلا تدريب.
# الاستعمال: convert.sh <base|tiny> <workDir>
# المتطلبات: Python 3.12 · whisperkittools (torch==2.5.0 مثبّت داخلها) · اتصال لتنزيل الأوزان مرة واحدة.
# الخرج: <workDir>/models/<size>/<folder>/ {AudioEncoder,TextDecoder,MelSpectrogram}.mlmodelc + tokenizer.json + tokenizer_config.json
set -euo pipefail
SIZE=${1:?base|tiny}; WORK=${2:?workDir}
HERE="$(cd "$(dirname "$0")" && pwd)"
PY="$WORK/venv/bin/python"
if [ ! -x "$PY" ]; then
  python3.12 -m venv "$WORK/venv"
  git clone --depth 1 https://github.com/argmaxinc/whisperkittools.git "$WORK/wkt"
  "$WORK/venv/bin/pip" install -q -e "$WORK/wkt"
fi
"$PY" "$HERE/prepare_hf_model.py" "$SIZE" "$WORK/hf"
"$WORK/venv/bin/whisperkit-generate-model" --model-version "$WORK/hf/whisper-$SIZE-ar-quran" --output-dir "$WORK/models/$SIZE"
OUT=$(ls -d "$WORK/models/$SIZE"/*/)
cp "$WORK/hf/tok-$SIZE/tokenizer.json" "$WORK/hf/tok-$SIZE/tokenizer_config.json" "$OUT"
echo "تم: $OUT"
