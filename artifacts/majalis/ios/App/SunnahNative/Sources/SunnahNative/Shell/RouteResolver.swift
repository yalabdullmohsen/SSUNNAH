import SwiftUI

/// مسار → شاشة. الشاشة الخاصة المسجَّلة بمعرّفها تسبق أي قالب عام/مولَّد بالاسم نفسه (مثل /prayer-times → PrayerScreen).
/// يعيش في الحزمة لتختبره الوحدات (RouteResolverTests) ويستدعيه `SunnahApp.resolve`.
@MainActor
public enum RouteResolver {
    /// مسار ويب → معرّف شاشة خاصة مسجَّلة في `SpecialScreens` (يسبق القالب المولَّد المطابق للمسار).
    public static let specialAliases: [String: String] = ["prayer-times": "prayer"]
    /// تحويلات الموقع (FEATURE_PARITY)
    public static let redirects: [String: String] = ["aqidah": "/tawhid", "library": "/search", "profile": "/stats", "sirah": "/seerah",
        "adhan-settings": "/notification-settings"]

    public static func registerAll(in registry: TemplateRegistry) {
        // التسجيل: مولَّد القوالب أولًا ثم الأقسام (تستبدل المعرّفات نفسها) ثم الشاشات الخاصة.
        GeneratedScreens.registerAll(in: registry)
        SirahSection.register(in: registry)
        AqidahSection.register(in: registry)
        FiqhSection.register(in: registry)
        LibrarySection.register(in: registry)
        LearnSection.register(in: registry)
        AccountSection.register(in: registry)
        QuranSection.register(in: registry)
        SpecialScreens.registerAll(in: registry)
    }

    public static func resolve(path raw: String) -> AnyView? { trace(path: raw)?.view }

    /// الشاشة + اسم الخطوة الفائزة (للاختبار: يثبت أن المسجَّل الخاص هو الفائز لا القالب العام).
    public static func trace(path raw: String) -> (step: String, view: AnyView)? {
        let path = Route.normalize(raw)
        let base = path.split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init) ?? path
        let comps = base.split(separator: "/").map(String.init)
        let reg = TemplateRegistry.shared
        // جذر تبويب «الرئيسية» هو "/": مقاطعه فارغة فلا يطابق أي معرّف أدناه.
        if comps.isEmpty, let v = reg.view(for: "home") { return ("special:home", v) }
        if comps.count == 1, let id = specialAliases[comps[0]], let v = reg.view(for: id) { return ("special:\(id)", v) }
        if comps.count == 1, let to = redirects[comps[0]] { return trace(path: to) }
        if let t = TafsirAyahRoute.parse(path) { return ("tafsir-ayah", AnyView(TafsirAyahView(surah: t.surah, ayah: t.ayah))) }
        if let t = MushafRoute.parse(path) { return ("mushaf-deeplink", AnyView(MushafScreen(target: t))) }
        if let v = SirahSection.resolve(path: base) { return ("sirah", v) }
        if let v = AqidahSection.resolve(path: base) { return ("aqidah", v) }
        if let v = FiqhSection.resolve(path: base) { return ("fiqh", v) }
        if let v = LibrarySection.resolve(path: base) { return ("library", v) }
        if let v = LearnSection.resolve(path: base) { return ("learn", v) }
        if let v = QuranSection.resolve(path: base) { return ("quran", v) }
        if let v = AccountSection.resolve(comps) { return ("account", v) }
        if let v = HadithScreens.resolve(path: base) { return ("hadith", v) }
        if let v = GeneratedScreens.resolve(path: base) { return ("generated", v) }
        // صفحات القوائم مسجَّلة كقوالب بمعرّف = المسار (أو مقاطعه مضمومة بشرطة).
        for id in [comps.joined(separator: "/"), comps.joined(separator: "-"), comps.joined(separator: "."), comps.last ?? ""] where !id.isEmpty {
            if let v = reg.view(for: id) { return ("registry:\(id)", v) }
        }
        return nil
    }
}
