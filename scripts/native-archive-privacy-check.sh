#!/bin/bash
# فحص Privacy Report للأرشيف (بديل آلي لـOrganizer): يدمج كل PrivacyInfo.xcprivacy داخل .xcarchive ويطابقه مع app-privacy.md والكود.
# الاستعمال: bash scripts/native-archive-privacy-check.sh <path.xcarchive>
set -uo pipefail; cd "$(dirname "$0")/.."
A="${1:?مسار xcarchive}"; [ -d "$A" ] || { echo "✗ لا أرشيف: $A" >&2; exit 2; }
python3 - "$A" <<'PY'
import sys,subprocess,json,glob,os,re
a=sys.argv[1]; bad=0
def fail(m):
    global bad; bad=1; print("✗",m)
files=subprocess.run(["find",a,"-name","PrivacyInfo.xcprivacy"],capture_output=True,text=True).stdout.split()
if not files: fail("لا PrivacyInfo.xcprivacy في الأرشيف")
types=set(); apis={}
for f in files:
    d=json.loads(subprocess.run(["plutil","-convert","json","-o","-",f],capture_output=True,text=True).stdout)
    name=f.split("/Products/")[-1]
    if d.get("NSPrivacyTracking"): fail(f"{name}: NSPrivacyTracking=true")
    if d.get("NSPrivacyTrackingDomains"): fail(f"{name}: نطاقات تتبع")
    for t in d.get("NSPrivacyCollectedDataTypes",[]):
        if t.get("NSPrivacyCollectedDataTypeTracking"): fail(f"{name}: نوع بيانات بتتبع")
        types.add(t["NSPrivacyCollectedDataType"].replace("NSPrivacyCollectedDataType",""))
    for x in d.get("NSPrivacyAccessedAPITypes",[]):
        apis.setdefault(x["NSPrivacyAccessedAPIType"].replace("NSPrivacyAccessedAPICategory",""),set()).update(x.get("NSPrivacyAccessedAPITypeReasons",[]))
    print(f"• {name}")
doc=open("docs/native/store/app-privacy.md",encoding="utf-8").read()
declared=set(re.findall(r"NSPrivacyCollectedDataType([A-Za-z]+)",doc))-{"Linked","Purposes","Tracking"}
declared={x for x in declared if x[0].isupper()}
if types!=declared: fail(f"أنواع البيانات في الأرشيف {sorted(types)} ≠ app-privacy.md {sorted(declared)}")
print("أنواع البيانات:",sorted(types)); print("واجهات السبب المطلوب:",{k:sorted(v) for k,v in apis.items()})
# فئات مستعملة في الكود لازم تكون مصرَّحة
probe={"FileTimestamp":r"attributesOfItem|\.modificationDate|creationDate|contentModificationDateKey",
       "SystemBootTime":r"systemUptime|mach_absolute_time","DiskSpace":r"volumeAvailableCapacity|systemFreeSize|statfs",
       "UserDefaults":r"UserDefaults"}
roots=["ios-native","artifacts/majalis/ios/App/SunnahDataKit/Sources","artifacts/majalis/ios/App/SunnahNative/Sources","artifacts/majalis/ios/App/SunnahPrayer/Sources","artifacts/majalis/ios/App/SunnahWidgetKit/Sources","artifacts/majalis/ios/App/Shared","artifacts/majalis/ios/App/PrayerWidget"]
for cat,pat in probe.items():
    r=subprocess.run(["git","grep","-lE",pat,"--"]+[f"{x}/**/*.swift" if os.path.isdir(x) else x for x in roots]+[f"{x}/*.swift" for x in roots[-2:]],capture_output=True,text=True).stdout.split()
    r=[x for x in r if "/Tests/" not in x]
    if r and cat not in apis: fail(f"الكود يستعمل {cat} ({r[0]}) وغير مصرَّح به في الأرشيف")
print("✓ Privacy Report نظيف" if not bad else "✗ Privacy Report فيه مخالفات")
sys.exit(bad)
PY
