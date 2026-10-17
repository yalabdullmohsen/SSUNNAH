#!/usr/bin/env bash
# native_verify_sync <src> <dst> — يقارن عدد الملفات ومحتواها (sha256) بين المصدر والوجهة (دون .input-hash)؛ يفشل (1) ويطبع الفروق عند أي اختلاف.
native_verify_sync() {
  local src="${1:?src}" dst="${2:?dst}" a b
  [ -d "$src" ] && [ -d "$dst" ] || { echo "تحقق المزامنة: مجلد غير موجود ($src | $dst)" >&2; return 1; }
  a=$(cd "$src" && find . -type f ! -name .input-hash -print0 | sort -z | xargs -0 shasum -a 256 2>/dev/null) || return 1
  b=$(cd "$dst" && find . -type f ! -name .input-hash -print0 | sort -z | xargs -0 shasum -a 256 2>/dev/null) || return 1
  if [ "$a" != "$b" ]; then
    echo "فشل تحقق المزامنة: ملفات $(printf '%s\n' "$a" | grep -c .) في المصدر مقابل $(printf '%s\n' "$b" | grep -c .) في الوجهة" >&2
    diff <(printf '%s\n' "$a") <(printf '%s\n' "$b") | head -10 >&2
    return 1
  fi
  echo "تحقق المزامنة: OK ($(printf '%s\n' "$a" | grep -c .) ملفًا مطابقًا)"
}
