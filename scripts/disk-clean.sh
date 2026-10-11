#!/usr/bin/env bash
# تنظيف القرص اليومي (macOS). كله قابل لإعادة التوليد. لا يلمس: ssunnah-board، worktrees غير النظيفة/غير المدموجة، ملفات المستخدم.
# DISK_CLEAN_KEEP_SIM: معرّف المحاكي المُبقى (iPhone 17 Pro). DISK_CLEAN_DRY=1 يعرض worktrees دون حذف.
set -u
KEEP_SIM="${DISK_CLEAN_KEEP_SIM:-D6FD9993-ED1B-4659-9C3B-B74999C0F87E}"
REPO="${DISK_CLEAN_REPO:-$HOME/majalis-correct}"
free() { df -h / | awk 'NR==2{print $4}'; }
step() { echo "[$1] الفارغ الآن: $(free)"; }
step "قبل"
# 1) Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData/* ~/Library/Developer/Xcode/Archives/* ~/Library/Caches/com.apple.dt.Xcode /private/tmp/claude-501/dd-* "$HOME/ssunnah-build/DerivedData"/* 2>/dev/null
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/* 2>/dev/null; step "1 Xcode"
# 2) المحاكيات: أبقِ KEEP_SIM فقط
xcrun simctl shutdown all >/dev/null 2>&1; xcrun simctl delete unavailable >/dev/null 2>&1
xcrun simctl list devices -j 2>/dev/null | python3 -c 'import json,sys;[print(d["udid"]) for v in json.load(sys.stdin)["devices"].values() for d in v]' |
  grep -vx "$KEEP_SIM" | while read -r id; do xcrun simctl delete "$id" >/dev/null 2>&1; done; step "2 simulators"
# 3) كاشات الحزم والمولَّد
pnpm store prune >/dev/null 2>&1; npm cache clean --force >/dev/null 2>&1; yarn cache clean >/dev/null 2>&1
command -v brew >/dev/null && brew cleanup -s >/dev/null 2>&1; pip3 cache purge >/dev/null 2>&1
rm -rf ~/.cache/puppeteer ~/Library/Caches/{Google,pip,node-gyp,pnpm} 2>/dev/null
for w in $(git -C "$REPO" worktree list --porcelain | awk '/^worktree /{print $2}'); do
  rm -rf "$w"/{dist,build,logs,test-results,playwright-report,coverage} "$w"/artifacts/majalis/{dist,build,test-results,playwright-report,coverage} 2>/dev/null
done; step "3 caches"
# 4) لقطات Time Machine
tmutil thinlocalsnapshots / 99999999999 4 >/dev/null 2>&1; step "4 snapshots"
# 5) سجلات وسلة
rm -rf ~/Library/Logs/* ~/.Trash/* 2>/dev/null; step "5 logs/trash"
# 6) Docker
command -v docker >/dev/null && docker system prune -af --volumes >/dev/null 2>&1; step "6 docker"
# 7) worktrees: نظيفة (عدا reports/) + فرعها مدموج PR + كل commits مدفوعة + خاملة >90 دقيقة
git -C "$REPO" fetch -q origin 2>/dev/null
merged=$(gh pr list -R yalabdullmohsen/SSUNNAH --state merged --limit 1500 --json headRefName -q '.[].headRefName' 2>/dev/null | sort -u)
now=$(date +%s)
git -C "$REPO" worktree list --porcelain | awk '/^worktree /{print $2}' | while read -r w; do
  [ "$w" = "$REPO" ] && continue; [ -d "$w" ] || continue
  git -C "$w" status --porcelain | grep -qv ' reports/' && continue
  br=$(git -C "$w" symbolic-ref --short -q HEAD) || continue
  gd=$(git -C "$w" rev-parse --git-dir); age=$(( (now - $(stat -f %m "$gd/index" 2>/dev/null || echo "$now")) / 60 ))
  [ "$age" -lt 90 ] && continue
  echo "$merged" | grep -qxF "$br" || git -C "$w" merge-base --is-ancestor HEAD origin/main 2>/dev/null || continue
  git -C "$w" rev-parse -q --verify "origin/$br" >/dev/null && [ -n "$(git -C "$w" log "origin/$br..HEAD" --oneline | head -1)" ] && continue
  if [ "${DISK_CLEAN_DRY:-0}" = 1 ]; then echo "سيُزال: $w"; else git -C "$REPO" worktree remove --force "$w" 2>/dev/null && echo "أُزيل: $w"; fi
done
git -C "$REPO" worktree prune; git -C "$REPO" gc -q 2>/dev/null; step "7 worktrees"
bash "$(dirname "$0")/post-merge-cleanup.sh" 2>/dev/null
# DISK_LOW: يقرؤه ci-local-lock ويطبع تحذيرًا
free_gb=$(df -g / | awk 'NR==2{print $4}'); LOW="$HOME/ssunnah-board/DISK_LOW"
if [ "$free_gb" -lt 15 ]; then mkdir -p "$(dirname "$LOW")"; echo "$(date '+%F %T') الفارغ ${free_gb}GB < 15GB" > "$LOW"; else rm -f "$LOW"; fi
echo "== $(date '+%F %T') انتهى؛ الفارغ ${free_gb}GB =="
df -g / | awk 'NR==2 && $4<25{print "تحذير: الفارغ "$4"GB < 25GB"}'
