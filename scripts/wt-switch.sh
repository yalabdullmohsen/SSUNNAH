#!/usr/bin/env bash
# يبدّل فرع worktree النافذة داخل ~/ssunnah-wt/<window> (ينشئه مرة واحدة فقط). الاستعمال: scripts/wt-switch.sh n4 <branch> [base=origin/main]
set -euo pipefail
W="${1:?window: n1|n2|n3|n4}"; BR="${2:?branch}"; BASE="${3:-origin/main}"
case "$W" in n1|n2|n3|n4) ;; *) echo "النافذة يجب أن تكون n1..n4" >&2; exit 1;; esac
MAIN="${SSUNNAH_MAIN:-$HOME/majalis-correct}"; DIR="$HOME/ssunnah-wt/$W"
git -C "$MAIN" fetch -q origin
if [[ ! -d "$DIR" ]]; then
  mkdir -p "$HOME/ssunnah-wt"
  git -C "$MAIN" worktree add -q --detach "$DIR" "$BASE"
  ln -sfn "$MAIN/node_modules" "$DIR/node_modules"
  ln -sfn "$MAIN/artifacts/majalis/node_modules" "$DIR/artifacts/majalis/node_modules"
fi
cd "$DIR"
[[ -z "$(git status --porcelain | grep -v ' reports/')" ]] || { echo "worktree $W فيه تعديلات غير محفوظة — أودِعها أو احفظها أولًا" >&2; exit 1; }
git checkout -q -- reports 2>/dev/null || true
if git rev-parse -q --verify "refs/heads/$BR" >/dev/null; then git checkout -q "$BR"; else git checkout -q -b "$BR" "$BASE"; fi
echo "$DIR @ $BR"
