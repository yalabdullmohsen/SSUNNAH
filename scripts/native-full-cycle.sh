#!/usr/bin/env bash
# دورة كاملة بلا PRs: تصدير كامل + بناء + لقطات كل الأقسام + تأشير [x] + دفع PROGRESS إلى native-app. الاستخدام: native-full-cycle.sh
set -uo pipefail
TOOLS="$HOME/.ssunnah-tools"; BOARD="$HOME/ssunnah-board"; LOG="$BOARD/native-loop.log"
WT="$HOME/ssunnah-wt/native-loop"; DD="/tmp/dd-n4"; SIM="${SIM:-D6FD9993-ED1B-4659-9C3B-B74999C0F87E}"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
log() { echo "$(date '+%F %T') [full] $*" >> "$LOG"; }
cd "$WT" || exit 9
git fetch -q origin native-app && git checkout -q -f -B native-loop/progress origin/native-app || { log "فشل checkout"; exit 1; }
bash scripts/native-export-data.sh >"$BOARD/export-full.out" 2>&1 || { log "فشل التصدير"; exit 1; }
log "بوابة البيانات: $(node scripts/native-data-check.mjs | head -1)"
( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1
  xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD" build -quiet 2>&1 | grep -E "^/.*error:" | sort -u > "$BOARD/build-full.out" )
[ -s "$BOARD/build-full.out" ] && { log "فشل البناء: $(head -1 "$BOARD/build-full.out")"; exit 1; }
xcrun simctl boot "$SIM" >/dev/null 2>&1; xcrun simctl install "$SIM" "$DD/Build/Products/Debug-iphonesimulator/SunnahApp.app" || exit 1
TICK="$BOARD/native-loop.ticks"; : > "$TICK"; : > "$BOARD/native-loop.invalid"
bash scripts/native-snapshot.sh sirah aqidah fiqh library quran account learn hadith adhkar >/dev/null 2>&1
while read -r route; do [ -n "$route" ] && sed -i '' "s#^- \[ \] \`$route\` #- [x] \`$route\` #" docs/native/FEATURE_PARITY.md; done < "$TICK"
node scripts/native-backlog.mjs >> "$LOG" 2>&1
PCT=$(node scripts/native-progress.mjs | tr '\n' ' ')
PREV=$(grep -E 'مدموج ومبني: [0-9]+/' docs/native/PROGRESS.md | tail -1 | sed -E 's#.*مدموج ومبني: ([0-9]+)/.*مُتحقَّق بلقطة: ([0-9]+)/.*#\1 \2#')
NB=$(echo "$PCT" | sed -E 's#.*مدموج ومبني: ([0-9]+)/.*#\1#'); NV=$(echo "$PCT" | sed -E 's#.*مُتحقَّق بلقطة: ([0-9]+)/.*#\1#')
GATE=$(node scripts/native-data-check.mjs 2>&1 | head -1 | sed -E 's#.*مفقود: ([0-9]+).*فارغ \(تحذير\): ([0-9]+).*#مفقود \1 فارغ \2#')
DELTA="الفرق: مبني $((NB-${PREV%% *})) · مُتحقَّق $((NV-${PREV##* })) · $GATE"
LASTM=$(gh pr list -R yalabdullmohsen/SSUNNAH --base native-app --state merged --limit 1 --json mergedAt -q '.[0].mergedAt' 2>/dev/null)
if [ -n "$LASTM" ]; then AGE=$(( ( $(date +%s) - $(date -j -u -f %Y-%m-%dT%H:%M:%SZ "$LASTM" +%s 2>/dev/null || echo $(date +%s)) ) / 60 ))
  [ "$AGE" -ge 60 ] && printf '\n> تنبيه: لا حركة منذ %s دقيقة (آخر دمج %s)\n\n' "$AGE" "$LASTM" >> docs/native/PROGRESS.md; fi
printf '| %s | %s | %s | دورة كاملة | %s | 0 |\n' "full-$(date +%Y%m%d-%H%M)" "$(date +%F)" "$PCT" "$DELTA" >> docs/native/PROGRESS.md
git add docs/native/FEATURE_PARITY.md docs/native/PROGRESS.md docs/native/BACKLOG.md
git commit -q -m "ن4 (native-full-cycle): تأشير $(sort -u "$TICK" | wc -l | tr -d ' ') بند — $PCT" && { git pull -q --rebase origin native-app >> "$LOG" 2>&1; git push -q origin HEAD:native-app >> "$LOG" 2>&1; } && log "دُفع التقدم: $PCT"
log "انتهت الدورة الكاملة: $PCT"
