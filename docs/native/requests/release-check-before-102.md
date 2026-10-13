# إعادة native-release-check الكامل قبل بناء 102

- بناء 101 رُفع إلى TestFlight (داخليًا) بعد فحص الـIPA (لا WKWebView ولا Capacitor ولا www؛ الويدجت مضمَّن وموقَّع) و`altool --validate-app` بلا أخطاء.
- `native-release-check.sh --release` الكامل فشل مرة بمهلة بيئة (محاكي بارد، 600ث لجمع التشخيص). `HomeNavigationUITests.testToolbarButtonsOpen` وحده على n1-sim نجح (27ث).
- المطلوب: إعادة `native-release-check.sh --release` كاملًا على محاكي دافئ قبل 102.
