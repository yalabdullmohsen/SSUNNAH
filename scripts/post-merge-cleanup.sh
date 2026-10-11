#!/usr/bin/env bash
# يحذف الفروع المحلية التي دُمج PR الخاص بها (مع فروع backup/* لا يلمسها). يُستدعى من disk-clean.sh ويدويًا بعد الدمج.
set -u
MAIN="${SSUNNAH_MAIN:-$HOME/majalis-correct}"; REPO=yalabdullmohsen/SSUNNAH
git -C "$MAIN" fetch -q --prune origin 2>/dev/null
merged=$(gh pr list -R $REPO --state merged --limit 1500 --json headRefName -q '.[].headRefName' 2>/dev/null | sort -u)
[[ -z "$merged" ]] && exit 0
cur=$(git -C "$MAIN" worktree list --porcelain | awk '/^branch /{sub("refs/heads/","",$2);print $2}')
git -C "$MAIN" for-each-ref --format='%(refname:short)' refs/heads | grep -v '^backup/\|^main$' | while read -r b; do
  echo "$merged" | grep -qxF "$b" || continue
  echo "$cur" | grep -qxF "$b" && continue
  git -C "$MAIN" branch -D "$b" >/dev/null 2>&1 && echo "حُذف الفرع المحلي: $b"
done
# worktrees خارج ~/ssunnah-wt وخارج المستودع الرئيسي: تُزال إن كانت نظيفة (عدا reports/) وفرعها مدموج
git -C "$MAIN" worktree list --porcelain | awk '/^worktree /{print $2}' | while read -r w; do
  [[ "$w" == "$MAIN" || "$w" == "$HOME"/ssunnah-wt/* ]] && continue
  br=$(git -C "$w" symbolic-ref --short -q HEAD) || continue
  echo "$merged" | grep -qxF "$br" || continue
  git -C "$w" status --porcelain | grep -qv ' reports/' && continue
  git -C "$MAIN" worktree remove --force "$w" 2>/dev/null && echo "أُزيل worktree: $w"
done
git -C "$MAIN" worktree prune
