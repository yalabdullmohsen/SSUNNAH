#!/usr/bin/env bash
# حلقة البناء الأصلي (ن4) — بلا Claude: PRs بوسم native-section → temp → بناء + اختبارات تحت القفل
# → تعليق بالأخطاء / دمج الناجح / لقطات فاتح+داكن / تأشير [x] / PROGRESS.md. تُشغَّل من launchd كل ساعتين.
# استعمال: native-loop.sh            (دورة كاملة)    native-loop.sh --dry  (بلا دمج/تعليق/دفع)
set -uo pipefail
TOOLS="$HOME/.ssunnah-tools"; BOARD="$HOME/ssunnah-board"; LOG="$BOARD/native-loop.log"
[ -f "$TOOLS/native-loop.env" ] && . "$TOOLS/native-loop.env"
REPO="${REPO:-$HOME/majalis-correct}"; GHR="${GHR:-yalabdullmohsen/SSUNNAH}"
WT="$HOME/ssunnah-wt/native-loop"; DD="$HOME/ssunnah-build/DerivedData/native-loop"
SIM="${SIM:-D6FD9993-ED1B-4659-9C3B-B74999C0F87E}"; BID=com.yousef.majlisilm
LOCK="$TOOLS/scripts/ci-local-lock.sh"; [ -x "$LOCK" ] || LOCK="$REPO/scripts/ci-local-lock.sh"
PKG=artifacts/majalis/ios/App/SunnahNative
ALLOW='^(artifacts/majalis/ios/App/SunnahNative/(Sources/SunnahNative/Sections/|Tests/)|docs/native/requests/)'
DRY=0; [ "${1:-}" = "--dry" ] && DRY=1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
mkdir -p "$BOARD/snapshots"
log() { echo "$(date '+%F %T') $*" >> "$LOG"; }
ERRS=0; MERGED=(); REJECTED=(); FAILED=()

# 3) حراس القرص والذاكرة
FREE=$(df -g "$HOME" | awk 'NR==2{print $4}')
[ "${FREE:-0}" -lt 15 ] && { log "امتناع: الفارغ ${FREE}GB < 15GB"; exit 0; }
FREEMB=$(vm_stat | awk '/page size/{ps=$8} /Pages free|Pages inactive/{gsub("\\.","",$3); n+=$3} END{printf "%d", n*ps/1048576}')
[ "${FREEMB:-0}" -lt 1200 ] && { log "امتناع: الذاكرة المتاحة ${FREEMB}MB < 1200MB"; exit 0; }

# بناء مرحلة الداخل تحت القفل: --inner <نتيجة.txt>
if [ "${1:-}" = "--inner" ]; then
  OUT="$2"; cd "$WT" || exit 9
  : > "$OUT"
  ( cd ios-native && ruby scripts/generate-xcodeproj.rb >/dev/null 2>&1
    xcodebuild -project SunnahApp.xcodeproj -scheme SunnahApp -destination "platform=iOS Simulator,id=$SIM" \
      -derivedDataPath "$DD" build -quiet 2>&1 | grep -E "error:" | grep -E "^/" | sort -u > "$OUT.build" )
  if [ -s "$OUT.build" ]; then echo BUILD_FAIL > "$OUT"; exit 0; fi
  ( cd "$PKG" && xcodebuild test -scheme SunnahNative -destination "platform=iOS Simulator,id=$SIM" -derivedDataPath "$DD-pkg" 2>&1 | grep -E "error:|failed \(|: error" | grep -E "^/|failed" | sort -u > "$OUT.test" )
  if [ -s "$OUT.test" ]; then echo TEST_FAIL > "$OUT"; else echo OK > "$OUT"; fi
  exit 0
fi

log "=== بدء دورة ($( [ $DRY = 1 ] && echo dry || echo حقيقية )) الفارغ ${FREE}GB ذاكرة ${FREEMB}MB"
cd "$REPO" || { log "REPO غير موجود"; exit 1; }
git fetch -q origin native-app 2>&1 | tail -1
[ -d "$WT" ] || git worktree add -q --detach "$WT" origin/native-app 2>&1 | tail -1
for d in "$REPO/node_modules"; do [ -e "$WT/node_modules" ] || ln -s "$d" "$WT/node_modules"; done
[ -e "$WT/artifacts/majalis/node_modules" ] || ln -s "$REPO/artifacts/majalis/node_modules" "$WT/artifacts/majalis/node_modules" 2>/dev/null

# دمج main في native-app (merge فقط، لا rebase) قبل جمع الـPRs؛ التعارض يُسجَّل ويتوقف الدمج دون إيقاف الدورة
if [ $DRY = 0 ]; then
  git fetch -q origin main 2>&1 | tail -1
  if [ -n "$(git rev-list -1 origin/native-app..origin/main 2>/dev/null)" ]; then
    git -C "$WT" checkout -q -f -B native-loop/sync origin/native-app 2>&1 | tail -1
    if git -C "$WT" merge -q --no-edit origin/main >>"$LOG" 2>&1; then
      git -C "$WT" push -q origin HEAD:native-app >>"$LOG" 2>&1 && log "دُمج main في native-app" || log "تعذّر دفع دمج main (hook/تزامن)"
    else git -C "$WT" merge --abort 2>/dev/null; log "تعارض دمج main→native-app — يحتاج تدخّلًا يدويًا"; fi
    git fetch -q origin native-app 2>&1 | tail -1
  fi
fi

PRS="${PRS_OVERRIDE:-$(gh pr list -R "$GHR" --label native-section --base native-app --state open --json number -q '.[].number' 2>>"$LOG")}"
[ -z "$PRS" ] && { log "لا PRs بوسم native-section"; exit 0; }

comment() { # رقم نص (مرة واحدة لكل علامة)
  [ $DRY = 1 ] && { log "[dry] تعليق #$1: $3"; return; }
  gh pr view "$1" -R "$GHR" --json comments -q '.comments[].body' 2>/dev/null | grep -qF "<!-- native-loop:$2 -->" && return
  gh pr comment "$1" -R "$GHR" --body "<!-- native-loop:$2 -->
من ن4 (native-loop آلي): $3" >/dev/null 2>&1
}

build_set() { # PRs المرشّحة في $CAND → يملأ $RESULT
  git -C "$WT" checkout -q -f -B native-loop/tmp origin/native-app 2>&1 | tail -1
  MERGEDSET=()
  for n in $CAND; do
    b=$(gh pr view "$n" -R "$GHR" --json headRefName -q .headRefName)
    git -C "$WT" fetch -q origin "$b" 2>/dev/null
    if git -C "$WT" merge --no-edit -q FETCH_HEAD >/dev/null 2>&1; then MERGEDSET+=("$n")
    else git -C "$WT" merge --abort 2>/dev/null; comment "$n" conflict "تعارض دمج مع native-app — حدّث فرعك بدمج native-app ثم ادفع."; FAILED+=("$n"); ERRS=$((ERRS+1)); fi
  done
  [ ${#MERGEDSET[@]} -eq 0 ] && { RESULT=EMPTY; return; }
  RES="$BOARD/native-loop.result"
  bash "$LOCK" env CI_LOCAL_LOCK_STALE=7200 CI_LOCAL_LOCK_WAIT=3000 bash "$0" --inner "$RES" >> "$LOG" 2>&1
  RESULT=$(cat "$RES" 2>/dev/null || echo NOLOCK)
}

# 1) فرز: ملفات مشتركة ⇒ تخطٍّ
CAND=""
for n in $PRS; do
  b=$(gh pr view "$n" -R "$GHR" --json headRefName -q .headRefName)
  case "$b" in n2/*|n3/*) CAND="$CAND $n"; continue;; esac
  bad=$(gh pr view "$n" -R "$GHR" --json files -q '.files[].path' | grep -Ev "$ALLOW" | head -5)
  if [ -n "$bad" ]; then
    comment "$n" shared "يحتاج مراجعة ن2/ن3: يعدّل ملفات خارج Sections/<قسمك>/ و Tests/: \`$(echo "$bad" | tr '\n' ' ')\`. ادفع التعديل المشترك عبر ن2/ن3 أو docs/native/requests/."
    REJECTED+=("$n"); log "تخطي #$n (ملف مشترك)"
  else CAND="$CAND $n"; fi
done

# 2) بناء/عزل الفاشلين (حتى 3 جولات)
for round in 1 2 3; do
  [ -z "${CAND// }" ] && break
  build_set
  case "$RESULT" in
    OK) break;;
    EMPTY) CAND=""; break;;
    BUILD_FAIL|TEST_FAIL)
      F="$BOARD/native-loop.result.$([ "$RESULT" = BUILD_FAIL ] && echo build || echo test)"
      attributed=0; NEW=""
      for n in $CAND; do
        files=$(gh pr view "$n" -R "$GHR" --json files -q '.files[].path')
        hit=""; while read -r p; do [ -n "$p" ] && grep -qF "$p" "$F" && hit="$hit$(grep -F "$p" "$F" | head -5)"$'\n'; done <<< "$files"
        if [ -n "$hit" ]; then
          attributed=1; ERRS=$((ERRS+1)); FAILED+=("$n")
          comment "$n" "fail-$RESULT-$(date +%s)" "فشل $RESULT في الدفعة. الأخطاء (ملف:سطر):
\`\`\`
$(echo "$hit" | sed "s#$WT/##" | head -10)
\`\`\`"
          log "فشل #$n ($RESULT)"
        else NEW="$NEW $n"; fi
      done
      CAND="$NEW"
      [ $attributed = 0 ] && { log "فشل $RESULT غير منسوب لأي PR — إيقاف الدورة: $(head -3 "$F" | tr '\n' ' ')"; ERRS=$((ERRS+1)); CAND=""; RESULT=UNATTRIBUTED; break; };;
    *) log "نتيجة غير متوقعة: $RESULT"; CAND=""; break;;
  esac
done
[ "$RESULT" != OK ] && { log "انتهت الدورة بلا دمج (النتيجة=${RESULT:-EMPTY}) أخطاء=$ERRS رفض=${#REJECTED[@]}"; exit 0; }

# 3) لقطات فاتح/داكن للأقسام المدموجة (مسارات القسم كلها، حتى 60)
APP="$DD/Build/Products/Debug-iphonesimulator/SunnahApp.app"
xcrun simctl boot "$SIM" >/dev/null 2>&1; xcrun simctl install "$SIM" "$APP" >/dev/null 2>&1
TS=$(date +%Y%m%d-%H%M)
TICK="$BOARD/native-loop.ticks"; : > "$TICK"
for n in "${MERGEDSET[@]}"; do
  secs=$(gh pr view "$n" -R "$GHR" --json files -q '.files[].path' | sed -n 's#.*Sections/\([a-z]*\)/.*#\1#p' | sort -u)
  for s in $secs; do
    node -e '
      const m=require("fs").readFileSync(process.argv[1],"utf8"),d=JSON.parse(m);
      const ID={"السيرة والتاريخ والأعلام":"sirah","العقيدة والتزكية":"aqidah","الفقه والعبادات":"fiqh","اللغة والمكتبة والبحث":"library","القرآن":"quran","الحساب والإعدادات":"account","الدروس والتعلم":"learn","الحديث والسنة":"hadith","الأذكار والأدعية":"adhkar"};
      d.routes.filter(r=>ID[r.section]===process.argv[2]).slice(0,60).forEach(r=>console.log(r.path))' "$WT/docs/native/ROUTE_TEMPLATE_MAP.json" "$s" > "$BOARD/native-loop.routes.$s"
    mkdir -p "$BOARD/snapshots/$s"
    while read -r route; do
      slug=$(echo "$route" | tr '/:' '__'); [ -z "$route" ] && continue
      for mode in light dark; do
        xcrun simctl terminate "$SIM" $BID >/dev/null 2>&1
        xcrun simctl ui "$SIM" appearance $mode
        xcrun simctl launch "$SIM" $BID -snapshotRoute "$route" >/dev/null 2>&1
        python3 -c "import time;time.sleep(3)"
        xcrun simctl io "$SIM" screenshot "$BOARD/snapshots/$s/$TS$slug-$mode.png" >/dev/null 2>&1
      done
      L="$BOARD/snapshots/$s/$TS$slug-light.png"; D="$BOARD/snapshots/$s/$TS$slug-dark.png"
      if [ -s "$L" ] && [ -s "$D" ] && ! cmp -s "$L" "$D"; then echo "$route" >> "$TICK"; fi
    done < "$BOARD/native-loop.routes.$s"
  done
done

# 4) دمج PRs الناجحة على GitHub (squash؛ بلا --admin)
for n in "${MERGEDSET[@]}"; do
  if [ $DRY = 1 ]; then log "[dry] كان سيُدمج #$n"; MERGED+=("$n"); continue; fi
  if gh pr merge "$n" -R "$GHR" --squash >/dev/null 2>&1; then MERGED+=("$n"); log "دُمج #$n"; else log "تعذّر دمج #$n"; ERRS=$((ERRS+1)); fi
done

# 5) تأشير [x] + PROGRESS.md ثم دفع (خارج القفل)
if [ $DRY = 0 ] && { [ ${#MERGED[@]} -gt 0 ]; }; then
  git -C "$WT" fetch -q origin native-app; git -C "$WT" checkout -q -f -B native-loop/progress origin/native-app
  cd "$WT"
  while read -r route; do [ -n "$route" ] && sed -i '' "s#^- \[ \] \`$route\` #- [x] \`$route\` #" docs/native/FEATURE_PARITY.md; done < "$TICK"
  PCT=$(node scripts/native-progress.mjs | tail -1)
  printf '| %s | %s | %s | #%s | %s | %s |\n' "auto-$TS" "$(date +%F)" "$PCT" "$(IFS=,#; echo "${MERGED[*]}")" "${REJECTED[*]:-—}" "$ERRS" >> docs/native/PROGRESS.md
  git add docs/native/FEATURE_PARITY.md docs/native/PROGRESS.md
  git commit -q -m "ن4 (native-loop): دمج ${#MERGED[@]} PR + تأشير $(wc -l < "$TICK" | tr -d ' ') بند — $PCT" && git push -q origin HEAD:native-app >> "$LOG" 2>&1 && log "دُفع التقدم: $PCT"
fi
log "انتهت الدورة: مدموج=${#MERGED[@]} مرفوض=${#REJECTED[@]} أخطاء=$ERRS"
