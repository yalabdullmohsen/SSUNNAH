#!/usr/bin/env bash
# يفشل إن فقدت شاشة محتوى شرعي الذيل الموحّد `SunnahContentFooter` (إفصاح + مصدر + إبلاغ)،
# أو استُعمل `SunnahReportIssueButton` مباشرة خارج Components (يعيد شاشة بلا مصدر).
# الاستعمال: bash scripts/native-content-footer-guard.sh   (من جذر المستودع)
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
S="${FOOTER_GUARD_SRC:-$ROOT/artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative}"
# شاشات المحتوى الشرعي (مسار نسبي → يجب أن يحوي `SunnahContentFooter(`). المصحف والمواقيت بنمط خفيف بمراجعة ن3 (لم تُضف بعد).
REQUIRED="
Templates/DetailTemplate.swift
Templates/ArticleTemplate.swift
Special/HadithScreens.swift
Special/WeakHadithScreens.swift
Sections/quran/PublishedScreens+Native.swift
Sections/quran/TafsirScreens+Native.swift
Sections/fiqh/FiqhReadingView.swift
Special/AdhkarScreen.swift
Special/CitationScreen.swift
Special/HomeScreen.swift
Sections/sirah/ShamailView.swift
"
rc=0
for f in $REQUIRED; do
  if [ ! -f "$S/$f" ]; then echo "✗ ملف مطلوب غير موجود: $f"; rc=1
  elif ! grep -q 'SunnahContentFooter(' "$S/$f"; then echo "✗ بلا الذيل الموحّد: $f"; rc=1; fi
done
direct=$(grep -rn --include='*.swift' 'SunnahReportIssueButton(' "$S" | grep -v '/Components/SunnahReportIssueButton.swift' | grep -v '/Components/SunnahContentFooter.swift')
if [ -n "$direct" ]; then echo "✗ استعمال مباشر لـSunnahReportIssueButton (استعمل SunnahContentFooter):"; echo "$direct"; rc=1; fi
# التنبيه الكامل لا يظهر داخل صفحة محتوى: النص/البطاقة الكاملة في الأماكن الثابتة فقط (الذيل يعرض أيقونة «!» فقط).
FULL_ALLOW='Support/SunnahDisclosure.swift|Sections/account/AccountLegalScreens.swift|Special/SettingsScreens.swift|Intro/IntroView.swift'
full=$(grep -rn --include='*.swift' -E 'SunnahDisclosureNotice\(|SunnahDisclosure\.(short|long)' "$S" | grep -vE "($FULL_ALLOW)")
if [ -n "$full" ]; then echo "✗ نص التنبيه الكامل داخل صفحة محتوى (استعمل SunnahContentFooter):"; echo "$full"; rc=1; fi
# لا فتح تلقائي للرسالة: حالة العرض false أولًا ولا onAppear/task في زر «!».
D="$S/Support/SunnahDisclosure.swift"
if [ -f "$D" ]; then
  blk=$(awk '/struct SunnahDisclosureInfoButton/{f=1} f' "$D")
  echo "$blk" | grep -q '@State private var showing = false' || { echo "✗ SunnahDisclosureInfoButton: حالة العرض يجب أن تبدأ false"; rc=1; }
  echo "$blk" | grep -qE '\.onAppear|\.task|isPresented: \.constant\(true\)' && { echo "✗ SunnahDisclosureInfoButton: فتح تلقائي ممنوع (بضغطة المستخدم فقط)"; rc=1; }
  [ "$(echo "$blk" | grep -c 'showing = true')" -eq 1 ] || { echo "✗ showing = true يجب أن يرد مرة واحدة داخل Button"; rc=1; }
fi
[ $rc -eq 0 ] && echo "✓ الذيل الموحّد حاضر في كل شاشات المحتوى الشرعي"
exit $rc
