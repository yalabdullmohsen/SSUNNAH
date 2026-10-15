#!/usr/bin/env bash
# يقيس زمن الإقلاع داخل التطبيق (ms منذ بدء العملية) عبر -perfProbe؛ N تشغيلات على المحاكي ويطبع الوسيط لكل علامة.
# استعمال: bash scripts/launch-probe.sh <UDID> [N=10]   (ثبّت نسخة Release قبلها)
set -uo pipefail
UDID=$1; N=${2:-10}; BID=com.yousef.majlisilm
for i in $(seq 1 "$N"); do
  xcrun simctl terminate "$UDID" $BID >/dev/null 2>&1
  xcrun simctl launch "$UDID" $BID -perfProbe YES -AppleLanguages "(ar)" >/dev/null 2>&1
  sleep 3
  C=$(xcrun simctl get_app_container "$UDID" $BID data)
  cat "$C/Library/Caches/launch-probe.json"; echo
  rm -f "$C/Library/Caches/launch-probe.json"
done | python3 -c '
import sys,json,statistics as st
rows=[json.loads(l) for l in sys.stdin if l.strip().startswith("{")]
for k in sorted({k for r in rows for k in r}):
    v=[r[k] for r in rows if k in r]; print(f"{k}: median {st.median(v):.0f}ms min {min(v):.0f} max {max(v):.0f} (n={len(v)})")'
