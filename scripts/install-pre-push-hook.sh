#!/usr/bin/env bash
# يثبّت scripts/hooks/pre-push في .git/hooks (آمن لإعادة التشغيل؛ يحفظ نسخة احتياطية للقديم).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)/hooks/pre-push"
HOOK="$(git rev-parse --git-common-dir)/hooks/pre-push"
[[ -f "$HOOK" ]] && ! cmp -s "$SRC" "$HOOK" && cp "$HOOK" "$HOOK.bak"
install -m 755 "$SRC" "$HOOK"
echo "ثُبِّت pre-push الخفيف في $HOOK"

# نسخة احتياطية من قفل البناء للـcheckouts القديمة التي تفتقده
mkdir -p "$(git rev-parse --git-common-dir)/ssunnah-hooks" && cp "$(dirname "$SRC")/bundled/ci-local-lock.sh" "$(git rev-parse --git-common-dir)/ssunnah-hooks/ci-local-lock.sh"
