#!/usr/bin/env bash
# حارس حجم الأصول (docs/native/assets-budget.json): سقف لكل أصل حسب نوعه، ودقة PNG/JPG (≤2048px، والأيقونات ≤1024)،
# وسقف إجمالي للأصول المُتتبَّعة، وسقف لـios-native/Data المولَّدة إن وُجدت. الصور النقطية الكبيرة تُرفض: استعمل متجهًا (SVG/PDF).
set -u
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
python3 - "${ASSETS_BUDGET:-docs/native/assets-budget.json}" <<'PY'
import json, os, re, struct, subprocess, sys
B = json.load(open(sys.argv[1]))
EXT = r'\.(png|jpe?g|svg|pdf|heic|webp|gif|caf|mp3|m4a|wav|aiff|ttf|otf|mp4|mov|lottie)$'
ROOTS = ('ios-native/', 'artifacts/majalis/ios/App/SunnahNative/', 'artifacts/majalis/ios/App/PrayerWidget/')
files = [f for f in subprocess.check_output(['git', 'ls-files'], text=True).splitlines()
         if f.startswith(ROOTS) and re.search(EXT, f, re.I) and '/Tests/' not in f and not f.startswith('ios-native/Data/') and os.path.isfile(f)]
def kind(f):
    e = f.rsplit('.', 1)[-1].lower()
    return ('image' if e in ('png','jpg','jpeg','heic','webp','gif') else 'vector' if e in ('svg','pdf')
            else 'font' if e in ('ttf','otf') else 'sound' if e in ('caf','mp3','m4a','wav','aiff') else 'video')
def dims(f):
    try:
        with open(f, 'rb') as h: d = h.read(32)
        if d[:8] == b'\x89PNG\r\n\x1a\n': return struct.unpack('>II', d[16:24])
    except OSError: pass
    return None
fail = 0; total = 0
for f in files:
    s = os.path.getsize(f); total += s; k = kind(f)
    if s > B['maxBytes'][k]: print(f'✗ {f}: {s} بايت > سقف {k} ({B["maxBytes"][k]})'); fail = 1
    if k == 'image':
        d = dims(f); lim = B['maxPixels']['appIcon'] if 'appiconset' in f else B['maxPixels']['image']
        if d and max(d) > lim: print(f'✗ {f}: دقة {d[0]}x{d[1]} > {lim}px — استعمل متجهًا أو قلّل الدقة'); fail = 1
if total > B['maxTrackedAssetsTotal']: print(f'✗ مجموع الأصول المُتتبَّعة {total} > {B["maxTrackedAssetsTotal"]}'); fail = 1
data = 'ios-native/Data'; dt = 0
if os.path.isdir(data):
    for r, _, fs in os.walk(data):
        for x in fs:
            try: dt += os.path.getsize(os.path.join(r, x))
            except OSError: pass
    if dt > B['maxBundledDataTotal']: print(f'✗ ios-native/Data {dt} > {B["maxBundledDataTotal"]}'); fail = 1
if not fail: print(f'✓ {len(files)} أصلًا ضمن السقوف (مجموع {total//1024}KB؛ Data {dt//1048576}MB)')
sys.exit(fail)
PY
