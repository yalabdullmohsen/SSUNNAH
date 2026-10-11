#!/usr/bin/env bash
# فهرس البحث (public/data/search/{index,manifest}.json) مشتقّ من المحتوى وcontent-hold.json.
# بلا وسيط: يعيد التوليد ويفشل إن اختلف المتتبَّع (نفس git diff --exit-code في CI / build).
# --fix: يعيد التوليد فقط ويطبع الملفات المتغيّرة لتُضاف إلى الـcommit.
set -euo pipefail
cd "$(dirname "$0")/.."
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
LOCK="$(git rev-parse --show-toplevel)/scripts/ci-local-lock.sh"
RUN=(pnpm run generate:search-index)
[[ -f "$LOCK" ]] && RUN=(bash "$LOCK" "${RUN[@]}")
"${RUN[@]}" >/dev/null
FILES=(public/data/search/index.json public/data/search/manifest.json)
if [[ "${1:-}" == "--fix" ]]; then git status --short -- "${FILES[@]}"; exit 0; fi
git diff --exit-code --stat -- "${FILES[@]}" >&2 || { echo "✗ فهرس البحث قديم: شغّل bash artifacts/majalis/scripts/check-search-index-fresh.sh --fix ثم أضف الملفات" >&2; exit 1; }
