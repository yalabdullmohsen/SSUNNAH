#!/usr/bin/env bash
# مزامنة صارمة: native_sync_dir <src> <dst> — ينسخ src إلى dst ثم يحذف من dst كل ملف ليس في src (يتيم)،
# ثم حارس يفشل (رمز 1) لو بقي ملف يتيم. .input-hash مستثنى (يكتبه سكربت التصدير نفسه).
native_sync_dir() {
  local src="${1:?src}" dst="${2:?dst}" f orph
  mkdir -p "$dst" && cp -R "$src"/. "$dst"/ || return 1
  (cd "$dst" && find . -type f ! -name .input-hash | while IFS= read -r f; do
    [ -e "$src/$f" ] || rm -f "${dst:?}/${f:?}"
  done; find . -mindepth 1 -type d -empty -delete)
  orph=$(cd "$dst" && find . -type f ! -name .input-hash | while IFS= read -r f; do [ -e "$src/$f" ] || echo "$f"; done)
  [ -z "$orph" ] || { echo "ملفات يتيمة بقيت في $dst: $orph" >&2; return 1; }
}
