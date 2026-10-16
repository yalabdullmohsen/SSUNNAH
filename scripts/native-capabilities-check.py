#!/usr/bin/env python3
"""يقارن Info.plist وentitlements المرفوعين بالقائمة المعتمدة docs/native/capabilities-allowlist.json ويفشل عند أي إذن/قدرة غير مصرَّح بها.
الاستخدام: native-capabilities-check.py            (المصدر: ios-native/SunnahApp/Info.plist + SunnahApp.entitlements، ويفحص الأرشيف إن مُرِّر)
           native-capabilities-check.py APP_DIR    (مجلد .app داخل xcarchive: يفحص Info.plist الفعلي والصلاحيات الموقَّعة عبر codesign)"""
import json, plistlib, subprocess, sys, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
al = json.load(open(os.path.join(root, "docs/native/capabilities-allowlist.json"), encoding="utf-8"))
bad = []
def check(label, info, ent):
    for k in info:
        if k.endswith("UsageDescription") and k not in al["usageDescriptions"]: bad.append(f"{label}: إذن غير معتمد {k}")
    for m in info.get("UIBackgroundModes", []):
        if m not in al["backgroundModes"]: bad.append(f"{label}: UIBackgroundModes غير معتمد «{m}»")
    for t in info.get("BGTaskSchedulerPermittedIdentifiers", []):
        if t not in al["bgTaskIdentifiers"]: bad.append(f"{label}: BGTask غير معتمد «{t}»")
    for k in ent:
        if k not in al["entitlements"]: bad.append(f"{label}: entitlement غير معتمد {k}")
    for f in al["forbidden"]:
        if f in info or f in ent or f in info.get("UIBackgroundModes", []): bad.append(f"{label}: محظور {f}")
def load(p): return plistlib.load(open(p, "rb"))
d = os.path.join(root, "ios-native/SunnahApp")
check("المصدر", load(d + "/Info.plist"), load(d + "/SunnahApp.entitlements"))
w = os.path.join(root, "ios-native/SunnahWatchResources")
check("الساعة", load(w + "/Info.plist"), load(w + "/SunnahWatch.entitlements"))
check("امتداد الساعة", load(w + "/Complications-Info.plist"), load(w + "/SunnahWatchComplications.entitlements"))
if len(sys.argv) > 1:
    app = sys.argv[1].rstrip("/")
    if os.path.basename(app) != "SunnahApp.app": bad.append(f"الأرشيف ليس SunnahApp من ios-native ({os.path.basename(app)}) — هدف Capacitor القديم لا يُرفع")
    info = load(app + "/Info.plist")
    out = subprocess.run(["codesign", "-d", "--entitlements", ":-", app], capture_output=True).stdout
    check("الأرشيف", info, plistlib.loads(out) if out else {})
if bad:
    print("\n".join("✗ " + b for b in bad), file=sys.stderr); sys.exit(1)
print("✓ الأذونات والقدرات ضمن القائمة المعتمدة")
