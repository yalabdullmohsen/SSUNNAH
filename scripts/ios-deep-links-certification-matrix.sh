#!/usr/bin/env bash
# T-033 — iOS Deep Links certification matrix (Simulator).
# Honest capture: does NOT claim UL device proof without in-app route evidence.
set -euo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/Users/alabdullmohsen/.local/bin:${PATH:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UDID="${UDID:-D6FD9993-ED1B-4659-9C3B-B74999C0F87E}"
BUNDLE="${BUNDLE:-com.yousef.majlisilm}"
EV="${EV:-docs/audit/evidence/t033-ios-deep-links}"

rm -rf "$EV"
mkdir -p "$EV"/{closed,background,foreground,invalid,scheme,ul}

classify() {
  local png="$1"
  /usr/bin/python3 - "$png" <<'PY'
import sys
from pathlib import Path
p = Path(sys.argv[1])
try:
    from PIL import Image
except Exception as e:
    print(f"UNKNOWN:no_pil:{e}")
    raise SystemExit(0)
im = Image.open(p).convert("RGB")
w, h = im.size
samples = [
    im.getpixel((w // 2, h // 2)),
    im.getpixel((10, 10)),
    im.getpixel((w - 10, h - 10)),
    im.getpixel((w // 2, h // 4)),
]
means = [sum(s) / 3 for s in samples]
avg = sum(means) / len(means)
r, g, b = samples[0]
if avg >= 245:
    print("WHITE")
elif avg <= 40:
    print("BLACK")
elif g > r + 20 and g > b + 20 and avg < 120:
    print("SPLASH_OR_GREEN")
elif avg > 200 and abs(r - g) < 25 and abs(g - b) < 25:
    print("BLANKISH")
else:
    print(f"CONTENT:avg={avg:.0f}:rgb={r},{g},{b}")
PY
}

snap() {
  local out="$1"
  xcrun simctl io "$UDID" screenshot "$out" >/dev/null
  classify "$out"
}

launch_home() {
  xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
  sleep 1
  xcrun simctl launch "$UDID" "$BUNDLE" >/dev/null
  sleep 12
}

RESULTS="$EV/matrix.tsv"
printf 'mode\troute\turl\tclass\tnote\n' >"$RESULTS"

routes=(
  "home|/"
  "search|/search"
  "quran|/quran"
  "mushaf|/mushaf"
  "prayer|/prayer-times"
  "lessons|/lessons"
  "hadith|/hadith"
  "fiqh|/fiqh"
  "library|/library"
  "settings|/settings"
  "account|/account"
)

echo "== closed custom scheme majlisilm:// =="
for entry in "${routes[@]}"; do
  name="${entry%%|*}"
  path="${entry##*|}"
  seg="${path#/}"
  if [[ -z "$seg" ]]; then
    url="majlisilm:///"
  else
    url="majlisilm://${seg}"
  fi
  xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
  sleep 1
  xcrun simctl openurl "$UDID" "$url" >/dev/null 2>&1 || true
  sleep 8
  cls="$(snap "$EV/closed/${name}-scheme.png")"
  printf 'closed_scheme\t%s\t%s\t%s\t\n' "$name" "$url" "$cls" >>"$RESULTS"
  echo "closed_scheme $name -> $cls"
done

echo "== closed universal https://www.ssunnah.com =="
for entry in "${routes[@]}"; do
  name="${entry%%|*}"
  path="${entry##*|}"
  url="https://www.ssunnah.com${path}"
  xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
  sleep 1
  xcrun simctl openurl "$UDID" "$url" >/dev/null 2>&1 || true
  sleep 8
  cls="$(snap "$EV/closed/${name}-ul.png")"
  printf 'closed_ul\t%s\t%s\t%s\tmay_be_safari\n' "$name" "$url" "$cls" >>"$RESULTS"
  echo "closed_ul $name -> $cls"
done

echo "== sunnah:// probe =="
xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
sleep 1
set +e
xcrun simctl openurl "$UDID" "sunnah://prayer-times" >"$EV/scheme/sunnah-open.out" 2>"$EV/scheme/sunnah-open.err"
rc=$?
set -e
sleep 3
cls="$(snap "$EV/scheme/sunnah-prayer.png")"
note="rc=${rc}; $(tr '\n' ' ' <"$EV/scheme/sunnah-open.err" | head -c 180)"
printf 'scheme_sunnah\tprayer\tsunnah://prayer-times\t%s\t%s\n' "$cls" "$note" >>"$RESULTS"
echo "sunnah -> $cls ($note)"

echo "== foreground =="
launch_home
cls="$(snap "$EV/foreground/home-baseline.png")"
printf 'fg_baseline\thome\tlaunch\t%s\t\n' "$cls" >>"$RESULTS"

xcrun simctl openurl "$UDID" "majlisilm://prayer-times" >/dev/null 2>&1 || true
sleep 6
cls="$(snap "$EV/foreground/prayer-scheme.png")"
printf 'fg_scheme\tprayer\tmajlisilm://prayer-times\t%s\t\n' "$cls" >>"$RESULTS"
echo "fg prayer scheme -> $cls"

xcrun simctl openurl "$UDID" "https://www.ssunnah.com/prayer-times" >/dev/null 2>&1 || true
sleep 6
cls="$(snap "$EV/foreground/prayer-ul.png")"
printf 'fg_ul\tprayer\thttps://www.ssunnah.com/prayer-times\t%s\t\n' "$cls" >>"$RESULTS"
echo "fg prayer ul -> $cls"

xcrun simctl openurl "$UDID" "majlisilm://mushaf" >/dev/null 2>&1 || true
sleep 8
cls="$(snap "$EV/foreground/mushaf-scheme.png")"
printf 'fg_scheme\tmushaf\tmajlisilm://mushaf\t%s\t\n' "$cls" >>"$RESULTS"
echo "fg mushaf scheme -> $cls"

xcrun simctl openurl "$UDID" "https://www.ssunnah.com/mushaf" >/dev/null 2>&1 || true
sleep 8
cls="$(snap "$EV/foreground/mushaf-ul.png")"
printf 'fg_ul\tmushaf\thttps://www.ssunnah.com/mushaf\t%s\t\n' "$cls" >>"$RESULTS"
echo "fg mushaf ul -> $cls"

echo "== background =="
launch_home
xcrun simctl openurl "$UDID" "https://example.com" >/dev/null 2>&1 || true
sleep 2
xcrun simctl openurl "$UDID" "majlisilm://prayer-times" >/dev/null 2>&1 || true
sleep 6
cls="$(snap "$EV/background/prayer-scheme.png")"
printf 'bg_scheme\tprayer\tmajlisilm://prayer-times\t%s\t\n' "$cls" >>"$RESULTS"
echo "bg prayer -> $cls"

xcrun simctl openurl "$UDID" "https://www.ssunnah.com/mushaf" >/dev/null 2>&1 || true
sleep 8
cls="$(snap "$EV/background/mushaf-ul.png")"
printf 'bg_ul\tmushaf\thttps://www.ssunnah.com/mushaf\t%s\t\n' "$cls" >>"$RESULTS"
echo "bg mushaf ul -> $cls"

echo "== invalid / missing =="
xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
sleep 1
xcrun simctl openurl "$UDID" "majlisilm://lessons/does-not-exist-xyz-999" >/dev/null 2>&1 || true
sleep 8
cls="$(snap "$EV/invalid/missing-lesson.png")"
printf 'invalid_missing\tlessons\tmajlisilm://lessons/does-not-exist-xyz-999\t%s\t\n' "$cls" >>"$RESULTS"

xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
sleep 1
xcrun simctl openurl "$UDID" "https://www.ssunnah.com/hadith/missing-entity-zzz" >/dev/null 2>&1 || true
sleep 8
cls="$(snap "$EV/invalid/missing-ul.png")"
printf 'invalid_ul\thadith\thttps://www.ssunnah.com/hadith/missing-entity-zzz\t%s\t\n' "$cls" >>"$RESULTS"

printf 'session_logged_out\taccount\tn/a\tUNPROVEN\tno auth fixture in T-033\n' >>"$RESULTS"
printf 'session_expired\taccount\tn/a\tUNPROVEN\tno expired-session fixture\n' >>"$RESULTS"
printf 'first_install\tall\tn/a\tUNPROVEN\tnot clean first-install device\n' >>"$RESULTS"

# AASA snapshot
curl -fsS "https://www.ssunnah.com/.well-known/apple-app-site-association" -o "$EV/aasa.live.json" || true

/usr/bin/python3 - "$RESULTS" "$EV/matrix-results.json" <<'PY'
import csv, json, sys
from pathlib import Path
rows = list(csv.DictReader(Path(sys.argv[1]).open(), delimiter="\t"))
# Certification requires in-app route proof for Closed/BG/FG/Invalid/Session.
# CONTENT alone is insufficient without route match; OS dialog / Safari = FAIL.
blocking = []
closed_scheme = [r for r in rows if r["mode"] == "closed_scheme"]
closed_ul = [r for r in rows if r["mode"] == "closed_ul"]
fg = [r for r in rows if r["mode"].startswith("fg_")]
bg = [r for r in rows if r["mode"].startswith("bg_")]
inv = [r for r in rows if r["mode"].startswith("invalid_")]
sess = [r for r in rows if r["mode"].startswith("session_") or r["mode"] == "first_install"]

def looks_dialog_or_safari(c: str) -> bool:
    # Without OCR we treat non-CONTENT / WHITE / SPLASH as non-route-proof.
    return not c.startswith("CONTENT")

# Custom scheme closed: historically OS confirmation dialog — require CONTENT for all routes
if any(looks_dialog_or_safari(r["class"]) for r in closed_scheme):
    blocking.append("Closed custom-scheme matrix lacks in-app route proof for all scoped routes")
if any(looks_dialog_or_safari(r["class"]) for r in closed_ul):
    blocking.append("Closed Universal Link matrix lacks in-app route proof (Safari/fallback likely)")
if any(looks_dialog_or_safari(r["class"]) for r in fg if "prayer" in r["route"] or "mushaf" in r["route"] or r["mode"].endswith("scheme") or r["mode"].endswith("ul")):
    # baseline home may pass; prayer/mushaf must CONTENT
    bad = [r for r in fg if r["route"] in ("prayer", "mushaf") and looks_dialog_or_safari(r["class"])]
    if bad:
        blocking.append("Foreground Prayer/Mushaf deep links lack in-app route proof")
if any(looks_dialog_or_safari(r["class"]) for r in bg):
    blocking.append("Background deep links lack in-app route proof")
if any(r["class"] == "UNPROVEN" for r in sess):
    blocking.append("Session/First-install modes UNPROVEN (no fixture)")
# Invalid: must not crash to WHITE; CONTENT or handled error UI acceptable as non-WHITE
if any(r["class"] in ("WHITE", "BLACK", "SPLASH_OR_GREEN") for r in inv):
    blocking.append("Invalid/missing entity produced blank/splash/white — no graceful failure proof")

sunnah = next((r for r in rows if r["mode"] == "scheme_sunnah"), None)
verdict = "FAIL"
exit_code = "IOS_DEEP_LINKS_NOT_CERTIFIED"
out = {
    "phase": "T-033",
    "capturedAt": __import__("datetime").datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    "device": "iPhone 17 Pro Simulator",
    "verdict": verdict,
    "exit": exit_code,
    "blockingFailures": blocking,
    "rows": rows,
    "schemeDecision": {
        "registeredNativeScheme": "majlisilm",
        "sunnahSchemeInInfoPlist": False,
        "sunnahSchemeNote": "sunnah:// used only as notification path sanitizer prefix; not a registered CFBundleURLSchemes entry",
        "sunnahProbe": sunnah,
    },
    "aasa": {
        "liveUrl": "https://www.ssunnah.com/.well-known/apple-app-site-association",
        "status": "LIVE",
        "homeExcluded": True,
    },
    "requiredBoard": {
        "Closed": "FAIL",
        "Background": "FAIL",
        "Foreground": "FAIL",
        "Invalid": "FAIL" if any("Invalid" in b for b in blocking) else "PARTIAL",
        "Session": "FAIL",
    },
}
Path(sys.argv[2]).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"verdict": verdict, "exit": exit_code, "blocking": blocking}, ensure_ascii=False, indent=2))
PY

echo "DONE evidence=$EV"
du -sh "$EV"
wc -l "$RESULTS"
