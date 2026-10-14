#!/usr/bin/env bash
# اختبار قائمة المسارات الحسّاسة: يجب أن يُصنَّف كل «حسّاس» و«غير حسّاس» كما هو متوقع
cd "$(dirname "$0")/.."; S=artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative; fail=0
chk() { out=$(echo "$2" | scripts/content-sensitive-check.sh); if [ "$1" = yes ] && [ -z "$out" ] || [ "$1" = no ] && [ -n "$out" ]; then echo "✗ $1: $2"; fail=1; fi; }
for p in ios-native/Data/hadith/x.json ios-native/Data/quran/a.json ios-native/Data/fiqh/b.json artifacts/majalis/public/data/q.json \
  $S/Special/HadithScreens.swift $S/Special/WeakHadithScreens.swift $S/Sections/fiqh/FiqhAdapters.swift $S/Sections/quran/TafsirModels.swift $S/Mushaf/MushafReaderView.swift; do chk yes "$p"; done
for p in ios-native/Data/audio/a.json ios-native/Data/MANIFEST.json docs/native/DATA_CONTRACT.md docs/native/WORKFLOW.md \
  $S/Mushaf/MushafRepository.swift $S/Mushaf/MushafStore.swift $S/Mushaf/MushafPageLayout.swift $S/Mushaf/PageCartouche.swift \
  $S/Components/StateViews.swift $S/Templates/SearchTemplate.swift $S/Sections/quran/QuranLocalStore.swift $S/Sections/aqidah/AqidahComponents.swift \
  .github/workflows/ci.yml scripts/native-audit-fast.sh; do chk no "$p"; done
[ $fail = 0 ] && echo "✓ content-sensitive-paths" || exit 1
