#!/usr/bin/env bash
# حارس ترخيص الأصول (docs/native/ASSETS_LICENSES.md §3): كل أصل مُتتبَّع (صورة/متجه/صوت/خط/فيديو) تحت
# ios-native/ وSunnahNative/ (عدا Tests) وPrayerWidget/ يجب أن يطابقه سطر في السجل بترخيص مقبول.
# يفشل عند: أصل غير مسجَّل، ترخيص غير مقبول/مجهول، سطر بلا ملف (غير النمط). OWNER_DECISION: تحذير، ويفشل مع RC_FINAL=1.
# GUARD_REPO/ASSETS_REGISTRY للاختبار.
set -u
cd "${GUARD_REPO:-$(cd "$(dirname "$0")/.." && pwd)}" || exit 2
REG=${ASSETS_REGISTRY:-docs/native/ASSETS_LICENSES.md}
python3 - "$REG" <<'PY'
import os, re, subprocess, sys, fnmatch
reg = sys.argv[1]
EXT = r'\.(png|jpe?g|svg|pdf|heic|webp|gif|caf|mp3|m4a|wav|aiff|ttf|otf|mp4|mov|lottie)$'
ROOTS = ('ios-native/', 'artifacts/majalis/ios/App/SunnahNative/', 'artifacts/majalis/ios/App/PrayerWidget/')
OK = {'رسم أصلي', 'OFL-1.1', 'CC0', 'Apache-2.0', 'MIT', 'CC-BY-4.0', 'QPC-QF'}  # QPC-QF: خطوط QPC عبر QF API، قرار المنسّق (ISLAMIC_SOURCES_EVALUATION §QF)
files = [f for f in subprocess.check_output(['git', 'ls-files'], text=True).splitlines()
         if f.startswith(ROOTS) and re.search(EXT, f, re.I) and '/Tests/' not in f and not f.startswith('ios-native/Data/')]
txt = open(reg, encoding='utf-8').read()
sec = txt.split('## 3)', 1)
if len(sec) < 2: print('✗ لا قسم «## 3) السجلّ» في', reg); sys.exit(1)
rows = []
for l in sec[1].splitlines():
    m = re.match(r'^\|\s*`([^`]+)`\s*\|(.*)\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*$', l)
    if m: rows.append((m.group(1), m.group(2).strip(), m.group(3).strip()))
def match(path, pat):
    if pat.endswith('/'): return fnmatch.fnmatchcase(path, pat + '*') if '*' in pat else path.startswith(pat)
    return fnmatch.fnmatchcase(path, pat) if '*' in pat else path == pat
fail = 0; warn = []
for pat, src, lic in rows:
    if lic != 'OWNER_DECISION' and lic not in OK:
        print(f'✗ ترخيص غير مقبول «{lic}» للسطر {pat}'); fail = 1
    if re.search(r'https?://', src) and lic not in OK and lic != 'OWNER_DECISION':
        print(f'✗ مصدر إنترنت بلا ترخيص صريح: {pat}'); fail = 1
    if not any(match(f, pat) for f in files) and '*' not in pat and not pat.startswith('ios-native/Data/'):
        print(f'✗ سطر سجل بلا ملف: {pat}'); fail = 1
for f in files:
    hit = [r for r in rows if match(f, r[0])]
    if not hit: print(f'✗ أصل غير مسجَّل في ASSETS_LICENSES.md: {f}'); fail = 1
    elif all(r[2] == 'OWNER_DECISION' for r in hit): warn.append(f)
if warn:
    print(f'⚠ {len(warn)} أصل بترخيص OWNER_DECISION (بانتظار المالك): ' + ', '.join(os.path.basename(w) for w in warn))
    if os.environ.get('RC_FINAL') == '1': print('✗ RC_FINAL: لا OWNER_DECISION في النهائي'); fail = 1
if not fail: print(f'✓ {len(files)} أصلًا مسجَّلة بتراخيص مقبولة')
sys.exit(fail)
PY
