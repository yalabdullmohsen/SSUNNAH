# يُحمَّل بـ source: يحدد $SIM لمحاكٍ خاص بالنافذة (SIM_NAME أو NATIVE_WINDOW)، وينشئه إن لم يوجد، ويرفض المحاكي المشترك الافتراضي.
# النوافذ: n4-sim (ن4)، n3-quran (ن3)، n2-sim (ن2)، n1-sim (ن1: للقياس) وn1-sim-b (ن1 فقط: للتحقق البصري والبناء؛ NATIVE_WINDOW=n1-b).
SIM_NAME="${SIM_NAME:-}"
if [ -z "$SIM_NAME" ] && [ -n "${NATIVE_WINDOW:-}" ]; then
  case "$NATIVE_WINDOW" in n3) SIM_NAME=n3-quran;; n1-b) SIM_NAME=n1-sim-b;; n1|n2|n4) SIM_NAME="$NATIVE_WINDOW-sim";; *) SIM_NAME="$NATIVE_WINDOW";; esac
fi
if [ -z "$SIM_NAME" ]; then
  echo "native-sim: اضبط SIM_NAME (مثل n4-sim) أو NATIVE_WINDOW (n1|n2|n3|n4)؛ مرفوض العمل على المحاكي المشترك الافتراضي (تصادم simctl بين النوافذ). انظر docs/native/SIMULATOR_PER_WINDOW.md" >&2; exit 2
fi
SIM=$(xcrun simctl list devices | sed -n "s/^ *$SIM_NAME (\([0-9A-F-]\{36\}\)).*/\1/p" | head -1)
if [ -z "$SIM" ]; then
  RT=$(xcrun simctl list runtimes | sed -n 's/.*\(com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]*\).*/\1/p' | tail -1)
  SIM=$(xcrun simctl create "$SIM_NAME" com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro "$RT") || { echo "native-sim: تعذّر إنشاء $SIM_NAME" >&2; exit 2; }
  echo "native-sim: أُنشئ $SIM_NAME ($SIM)" >&2
fi
# المحاكي المطفأ (مثلًا بعد إنشائه الآن) يفشل معه simctl install/launch بـ405؛ شغّله وانتظر الجاهزية (محاكي النافذة نفسها فقط)
if ! xcrun simctl list devices | grep -F "$SIM" | grep -q "(Booted)"; then
  echo "native-sim: تشغيل $SIM_NAME" >&2
  xcrun simctl boot "$SIM" >/dev/null 2>&1
  xcrun simctl bootstatus "$SIM" -b >/dev/null 2>&1 || { echo "native-sim: تعذّر تشغيل $SIM_NAME" >&2; exit 2; }
fi
export SIM SIM_NAME
