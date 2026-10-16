#!/usr/bin/env python3
"""حارس مانيفست الخصوصية: PrivacyInfo.xcprivacy موجود ومرتبط في Resources، وكل Required Reason API مستعمل في الكود مصرَّح به في فئته،
والبيانات المجمّعة تطابق إجابات ملصق App Privacy (docs/native/store/PRIVACY_CHECK.md)، وبلا تتبع."""
import plistlib, re, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(root, *a)
bad = []
MAN = "ios-native/SunnahApp/PrivacyInfo.xcprivacy"
if not os.path.exists(P(MAN)):
    print("✗ مانيفست الخصوصية مفقود: " + MAN, file=sys.stderr); sys.exit(1)
m = plistlib.load(open(P(MAN), "rb"))
pbx = open(P("ios-native/SunnahApp.xcodeproj/project.pbxproj"), encoding="utf-8").read()
if "PrivacyInfo.xcprivacy in Resources" not in pbx: bad.append("PrivacyInfo.xcprivacy غير مرتبط بـResources في pbxproj")
if m.get("NSPrivacyTracking") is not False: bad.append("NSPrivacyTracking يجب أن يكون false")
if m.get("NSPrivacyTrackingDomains"): bad.append("NSPrivacyTrackingDomains يجب أن تكون فارغة")
declared = {t["NSPrivacyAccessedAPIType"] for t in m.get("NSPrivacyAccessedAPITypes", [])}
for t in m.get("NSPrivacyAccessedAPITypes", []):
    if not t.get("NSPrivacyAccessedAPITypeReasons"): bad.append(f"{t['NSPrivacyAccessedAPIType']}: بلا أسباب")
pre = "NSPrivacyAccessedAPICategory"
cats = {
    pre + "UserDefaults": r"UserDefaults|@AppStorage|NSUserDefaults",
    pre + "FileTimestamp": r"\.creationDate|\.modificationDate|ModificationDateKey|creationDateKey|\bstat\(|\bfstat\(|getattrlist|attributesOfItem",
    pre + "SystemBootTime": r"systemUptime|mach_absolute_time|kern\.boottime",
    pre + "DiskSpace": r"volumeAvailableCapacity|volumeTotalCapacity|systemFreeSize|\.systemSize|FileAttributeKey\.systemSize|statfs|statvfs",
    pre + "ActiveKeyboards": r"activeInputModes",
}
dirs = ["artifacts/majalis/ios/App/SunnahNative/Sources", "artifacts/majalis/ios/App/SunnahDataKit/Sources",
        "artifacts/majalis/ios/App/SunnahPrayer/Sources", "artifacts/majalis/ios/App/SunnahWidgetKit/Sources",
        "artifacts/majalis/ios/App/SunnahWeb/Sources", "ios-native/SunnahApp"]
used = {}
for d in dirs:
    for dp, _, fs in os.walk(P(d)):
        for f in fs:
            if not f.endswith(".swift"): continue
            src = open(os.path.join(dp, f), encoding="utf-8", errors="ignore").read()
            src = re.sub(r"//[^\n]*", "", src)
            for c, rx in cats.items():
                if re.search(rx, src): used.setdefault(c, os.path.relpath(os.path.join(dp, f), root))
for c, f in used.items():
    if c not in declared: bad.append(f"API مستعمل غير مصرَّح به: {c} (مثلًا في {f})")
# البيانات المجمّعة ↔ ملصق App Privacy
exp = {"EmailAddress", "UserID", "Name", "OtherUserContent", "ProductInteraction"}
got = set()
for t in m.get("NSPrivacyCollectedDataTypes", []):
    n = t["NSPrivacyCollectedDataType"].replace("NSPrivacyCollectedDataType", "")
    got.add(n)
    if t.get("NSPrivacyCollectedDataTypeTracking") is not False: bad.append(f"{n}: Tracking يجب false")
    if t.get("NSPrivacyCollectedDataTypeLinked") is not True: bad.append(f"{n}: Linked يجب true")
    if t.get("NSPrivacyCollectedDataTypePurposes") != ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]: bad.append(f"{n}: الغرض يجب AppFunctionality فقط")
if got != exp: bad.append(f"أنواع البيانات المجمّعة لا تطابق ملصق PRIVACY_CHECK: مفقود {sorted(exp-got)} زائد {sorted(got-exp)}")
pc = open(P("docs/native/store/PRIVACY_CHECK.md"), encoding="utf-8").read()
for k in ("Email Address", "Name", "User ID", "Other User Content", "Product Interaction"):
    if k not in pc: bad.append(f"PRIVACY_CHECK.md لا يذكر «{k}»")
if not os.path.exists(P("ios-native/PrayerWidgetResources/PrivacyInfo.xcprivacy")): bad.append("مانيفست الودجت مفقود")
if not os.path.exists(P("ios-native/SunnahWatchResources/PrivacyInfo.xcprivacy")): bad.append("مانيفست الساعة مفقود")
if bad:
    print("\n".join("✗ " + b for b in bad), file=sys.stderr); sys.exit(1)
print("OK")
