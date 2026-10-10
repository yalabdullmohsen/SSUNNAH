#!/usr/bin/env bash
# غلاف لأي أمر ثقيل (vite build/tsc/playwright…): قفل واحد + حارس ذاكرة + سقف heap.
# الاستعمال: bash scripts/heavy.sh <أمر…>
set -uo pipefail
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
exec bash "$(cd "$(dirname "$0")" && pwd)/ci-local-lock.sh" "$@"
