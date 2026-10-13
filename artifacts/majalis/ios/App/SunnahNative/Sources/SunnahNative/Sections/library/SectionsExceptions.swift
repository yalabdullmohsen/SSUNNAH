import Foundation

/// الاستثناءات المبرَّرة الوحيدة من «كل مسار موجَّه للمستخدم مدرج في صفحة الأقسام» (ملف واحد، لا قائمة أخرى).
/// المسارات ذات `:param` تفصيلية تُفتح من داخل قائمتها فتُستثنى تلقائيًا ولا تُكتب هنا.
enum SectionsExceptions {
    static let reasons: [String: String] = [
        "/sections": "الصفحة نفسها",
        "/more": "اسم بديل للصفحة نفسها",
        "/sitemap": "اسم بديل للصفحة نفسها",
        "/search": "يُفتح من أيقونة البحث في شريط الأدوات (يغطيه testToolbarButtonsOpen)",
        "/auth/callback": "عودة تقنية من مزوّد الدخول، لا شاشة يختارها المستخدم",
        "/auth/update-password": "يُفتح من رابط البريد فقط",
        "/islamic-sects": "مؤجَّل بقرار المالك (35 سجلًا غير منشور)؛ انظر docs/native/DEFERRED.md",
    ]
    static var routes: Set<String> { Set(reasons.keys) }
}
