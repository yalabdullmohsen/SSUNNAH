# SunnahWatch

واجهة SwiftUI لـApple Watch (ن1). **الهدفان مسجَّلان في `SunnahApp.xcodeproj` (ن4: SunnahWatch وSunnahWatchComplications)**: تطبيق watchOS من `App/*.swift` + امتداد WidgetKit من `Complications/*.swift`.
- كلا الهدفين يضمّان `App/WatchModels.swift` و`App/WatchTheme.swift` و`SunnahWidgetKit/PrayerPhase.swift` (يحتاج `.watchOS(.v9)` في Package.swift أو إدراج الملف مباشرة).
- App Group للساعة: `group.com.yousef.majlisilm.watch`.
- جانب الآيفون: يرسل `WatchPayload` مُرمَّزًا JSON في `WCSession.updateApplicationContext(["sunnah.watch.payload.v1": data])` من بيانات التطبيق المدمجة (أذكار صباح/مساء، آية/دعاء اليوم، أذانات المحرك) — لم يُنفَّذ بعد.
