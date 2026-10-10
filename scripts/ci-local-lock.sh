#!/usr/bin/env bash
# قفل مشترك لـ ci:local: نافذة واحدة فقط تشغّله في كل مرة على الجهاز (التشغيل المتزامن يستنفد الذاكرة فيقتله النظام).
# الاستعمال: bash scripts/ci-local-lock.sh <أمر…>  — يأخذ القفل ثم يشغّل الأمر ويحرّره عند الخروج حتى لو فشل.
#   CI_LOCAL_LOCK_DIR    مسار القفل (افتراضيًا ~/.majalis-tools/ci-lock)
#   CI_LOCAL_LOCK_WAIT   أقصى انتظار بالثواني (1500 = 25 دقيقة)، ثم يفشل بلا تشغيل
#   CI_LOCAL_LOCK_STALE  قفل أقدم من هذا (2400 = 40 دقيقة) يُعدّ معلّقًا ويُكسر
#   CI_LOCAL_LOCK_POLL   فترة الفحص بالثواني (10)
set -uo pipefail
LOCK="${CI_LOCAL_LOCK_DIR:-$HOME/.majalis-tools/ci-lock}"
WAIT="${CI_LOCAL_LOCK_WAIT:-1500}"
STALE="${CI_LOCAL_LOCK_STALE:-2400}"
POLL="${CI_LOCAL_LOCK_POLL:-10}"
mkdir -p "$(dirname "$LOCK")"

lock_age() {
  local m
  # GNU أولًا: stat -f على Linux يطبع معلومات نظام الملفات قبل أن يفشل فيُفسد العمر
  m=$(stat -c %Y "$LOCK" 2>/dev/null || stat -f %m "$LOCK" 2>/dev/null) || { echo 0; return; }
  echo $(( $(date +%s) - m ))
}

deadline=$(( $(date +%s) + WAIT ))
until mkdir "$LOCK" 2>/dev/null; do
  if (( $(lock_age) > STALE )); then
    echo "ci-local-lock: قفل معلّق (أقدم من ${STALE}ث) — يُكسر" >&2
    rm -rf "$LOCK"
    continue
  fi
  if (( $(date +%s) >= deadline )); then
    echo "ci-local-lock: القفل مأخوذ منذ $(lock_age)ث ($(cat "$LOCK/owner" 2>/dev/null)) — انتهى الانتظار" >&2
    exit 75
  fi
  echo "ci-local-lock: نافذة أخرى تشغّل ci:local ($(cat "$LOCK/owner" 2>/dev/null)) — انتظار…" >&2
  sleep "$POLL"
done
trap 'rm -rf "$LOCK"' EXIT
trap 'exit 130' INT TERM
echo "pid=$$ cwd=$PWD" > "$LOCK/owner"
"$@"
