# محاكٍ خاص لكل نافذة

لكل نافذة محاكٍ باسمها: ن4 `n4-sim`، ن3 `n3-quran`، ن2 `n2-sim`، ن1 `n1-sim`. `native-snapshot.sh` و`native-quick-check.sh` يتطلبان `SIM_NAME` (أو `NATIVE_WINDOW=n1|n2|n3|n4`)، ينشئان المحاكي تلقائيًا بـ`simctl create` إن لم يوجد، ويرفضان المحاكي الافتراضي المشترك (`scripts/native-sim.sh`). سبب القاعدة: تصادم xcodebuild/simctl بين النوافذ على محاكٍ واحد.
مثال: `SIM_NAME=n4-sim bash scripts/native-snapshot.sh /settings`.
