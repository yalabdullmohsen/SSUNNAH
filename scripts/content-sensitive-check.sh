#!/usr/bin/env bash
# يقرأ مسارات من stdin ويطبع المسارات الحسّاسة وفق .github/content-sensitive-paths
set -u
F="$(cd "$(dirname "$0")/.." && pwd)/.github/content-sensitive-paths"
INC=(); EXC=()
while IFS= read -r l; do
  case "$l" in ''|'#'*) continue;; '!'*) EXC+=("${l#!}");; *) INC+=("$l");; esac
done < "$F"
while IFS= read -r p; do
  hit=no
  for r in "${INC[@]}"; do [[ "$p" =~ $r ]] && { hit=yes; break; }; done
  if [ $hit = yes ]; then for r in "${EXC[@]}"; do [[ "$p" =~ $r ]] && { hit=no; break; }; done; fi
  [ $hit = yes ] && echo "$p"
done
exit 0
