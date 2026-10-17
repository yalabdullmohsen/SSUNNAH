# سياسة القرص (بناء iOS)

يُنفَّذ تلقائيًا من `scripts/native-sim-hygiene.sh` قبل كل بناء (`build-slot.sh` و`native-head-build.sh`).

1. **DerivedData / dd-\***: يُحذف أي مجلد في `~/.majalis-tools/dd` و`~/ssunnah-build/DerivedData` و`~/Library/Developer/Xcode/DerivedData` لم يتغيّر منذ ساعتين (`HYGIENE_DD_HOURS`)، ولا تذكره عملية جارية، وبلا أرشفة جارية. تقرير `DD-CLEAN` قبل الحذف.
2. **headbuild**: يُبقى أحدث مفتاحين (`HYGIENE_HB_KEEP`) ويُحذف الأقدم من ساعتين غير المقفل (`.lock`) — `HB-CLEAN`.
3. **المحاكيات**: `xcrun simctl delete unavailable` بعد كل تنظيف.
4. **العتبات**: تحذير تحت 12GB، **رفض البناء (خروج 75)** مع السبب إن بقي الحر < 8GB بعد التنظيف التلقائي (`HYGIENE_DISK_WARN_GB` / `HYGIENE_DISK_MIN_GB`).
5. **لا يُمسّ أبدًا**: `~/.majalis-tools/archives`، مصادر المستودع، أي شيء غير مدفوع.
6. للمعاينة: `HYGIENE_DRY=1 bash scripts/native-sim-hygiene.sh`. الاختبار: `scripts/native-sim-hygiene-test.sh`.
