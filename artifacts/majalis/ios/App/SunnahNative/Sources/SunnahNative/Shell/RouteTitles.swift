import SwiftUI

/// سجل عناوين المسارات: المصدر الوحيد لعنوان أي شاشة (إلزامي لكل مسار في ROUTE_TEMPLATE_MAP).
/// لا يُكتب عنوان يدويًا في الشاشة؛ `TemplateHost` و`bodyTitledNavigation` يقرآن `\.routeTitle` الذي يحقنه `sunnahDestination`.
/// يفرض `RouteTitlesTests` التغطية الكاملة وعدم التكرار وعدم الفراغ.
public enum RouteTitles {
    /// مسار الويب (`:param` للمقطع المتغيّر) → العنوان.
    public static let table: [String: String] = [
        // الأذكار والأدعية
        "/adhan-help": "مساعدة تنبيهات الصلاة", "/adhan-settings": "إعدادات تنبيهات الصلاة", "/adhkar": "الأذكار", "/daily-wird": "الورد اليومي",
        "/duas": "الأدعية", "/duas-quran": "أدعية القرآن", "/sunan-yawmiyya": "السنن اليومية", "/tasbih": "المسبحة",
        // الحديث
        "/arbaeen-nawawi": "الأربعون النووية", "/arbaeen-nawawi/:id": "حديث الأربعين", "/dalail-nubuwwah": "دلائل النبوة", "/hadith": "الحديث",
        "/hadith-science": "علم مصطلح الحديث", "/hadith/arbaeen-love-of-allah": "أربعون في محبة الله", "/hadith/books": "كتب الحديث",
        "/hadith/books-and-rulings": "كتب الحديث وأحكامها", "/hadith/daif": "الأحاديث الضعيفة", "/hadith/mawdu": "الأحاديث الموضوعة",
        "/hadith/sahih": "الأحاديث الصحيحة", "/sunnah-studies": "دراسات السنة", "/wasaya-nabawiyya": "الوصايا النبوية",
        // الحساب والإعدادات
        "/about": "عن التطبيق", "/account-deletion": "حذف الحساب", "/auth/callback": "إتمام الدخول", "/auth/update-password": "تحديث كلمة المرور",
        "/calendar": "تقويم الدروس", "/car-mode": "وضع السيارة", "/contact": "تواصل معنا", "/data-licenses": "المصادر والتراخيص",
        "/fatwa-policy": "سياسة الفتوى والمراجعة", "/feature-tour": "جولة في التطبيق", "/islam-stats": "الإسلام بالأرقام", "/login": "تسجيل الدخول",
        "/mosque-mode": "وضع المسجد", "/my-submissions": "مساهماتي", "/notification-settings": "إعدادات التنبيهات", "/offline": "مركز دون اتصال",
        "/privacy": "الخصوصية", "/privacy-center": "مركز الخصوصية", "/qibla": "القبلة", "/register": "إنشاء حساب", "/settings": "الإعدادات",
        "/stats": "إحصاءاتي", "/submit": "إضافة محتوى", "/updates": "المستجدات", "/updates/auto/:slug": "تفاصيل المستجد", "/upload": "رفع درس",
        "/vault": "خزانتي", "/widget-center": "مركز الودجت",
        // الدروس والتعلم
        "/annual-courses/:id": "الدورة السنوية", "/competitions": "المسابقات", "/competitions/:id": "تفاصيل المسابقة", "/durus-imaniyya": "الدروس الإيمانية",
        "/durus-mutanawwia": "دروس متنوعة", "/fawaid": "الفوائد", "/flashcards": "البطاقات التعليمية", "/institutions": "المؤسسات العلمية",
        "/knowledge-graph": "خريطة المعرفة", "/knowledge/:section": "قسم المعرفة", "/kuwait-lessons": "دروس الكويت", "/lessons": "الدروس",
        "/lessons/:id": "تفاصيل الدرس", "/lessons/archive": "أرشيف الدروس", "/my-learning": "تعلّمي", "/progress": "مركز التقدّم", "/quiz": "الاختبار",
        "/reading-plans": "خطط القراءة", "/researcher": "ملف الباحث", "/study-room": "غرفة المذاكرة", "/universities": "الجامعات",
        "/universities/:slug": "تفاصيل الجامعة", "/universities/compare": "مقارنة الجامعات",
        // السيرة والتاريخ والأعلام
        "/fikr-waqia": "فكر واقعي", "/islamic-landmarks": "المعالم الإسلامية", "/islamic-landmarks/:id": "تفاصيل المَعلم الإسلامي", "/islamic-landmarks/map": "خريطة المعالم",
        "/nations": "الأمم", "/nations/:slug": "تفاصيل الأمة", "/occasions": "المناسبات", "/occasions-lessons": "دروس المناسبات", "/prophets": "قصص الأنبياء",
        "/prophets/tree": "شجرة الأنبياء", "/sahabah": "الصحابة", "/seerah": "السيرة النبوية", "/shamael": "الشمائل", "/stories": "القصص",
        "/tarikh-islami": "التاريخ الإسلامي", "/tarikh-islami/:id": "تفاصيل الحدث التاريخي", "/teachers": "المعلمون", "/teachers/:slug": "تفاصيل المعلم",
        // العقيدة والتزكية
        "/adab-talab-ilm": "آداب طلب العلم", "/akhlaq": "الأخلاق", "/alamat-saah": "علامات الساعة", "/amrad-qalbiyya": "أمراض القلوب", "/asma-husna": "الأسماء الحسنى",
        "/discover-islam": "اكتشف الإسلام", "/discover-islam/articles/:slug": "مقال اكتشف الإسلام",
        "/discover-islam/doubts": "الشبهات", "/discover-islam/doubts/:slug": "تفاصيل الشبهة", "/discover-islam/how-to-convert": "كيف أصبح مسلمًا",
        "/discover-islam/new-muslim": "مسار المسلم الجديد", "/discover-islam/new-muslim/:day": "يوم المسلم الجديد", "/discover-islam/questions": "الأسئلة الشائعة",
        "/discover-islam/questions/:slug": "تفاصيل السؤال", "/hikam-salaf": "حكم السلف", "/iman-topics": "موضوعات الإيمان", "/islamic-sects": "الفرق الإسلامية",
        "/islamic-sects/:id": "تفاصيل الفرقة", "/janna-naar": "الجنة والنار", "/malaika": "الملائكة", "/raqaiq": "الرقائق", "/tawhid": "التوحيد",
        "/tawhid/:slug": "موضوع التوحيد", "/tazkiya": "التزكية", "/tazkiya-topics": "موضوعات التزكية", "/usra-mujtama": "الأسرة والمجتمع",
        // الفقه والعبادات
        "/amr-bil-maruf": "الأمر بالمعروف", "/arkan": "أركان الإسلام", "/arkan-iman": "أركان الإيمان", "/fadail-aamal": "فضائل الأعمال", "/family": "وضع العائلة",
        "/fiqh": "الفقه", "/fiqh-qawaid": "القواعد الفقهية", "/fiqh/books/:bookId": "كتاب فقهي", "/fiqh/books/:bookId/chapters/:chapterId": "فصل فقهي",
        "/fiqh/books/:bookId/lessons/:lessonId": "درس فقهي", "/fiqh/topics/:topicId": "موضوع فقهي", "/fiqh/usul": "أصول الفقه", "/hajj": "الحج",
        "/janaza": "الجنائز", "/jumuah": "الجمعة", "/madhahib": "المذاهب الفقهية", "/madhahib/:id": "تفاصيل المذهب", "/maqasid-sharia": "مقاصد الشريعة",
        "/mawarith": "المواريث", "/mawarith/calculator": "حاسبة المواريث", "/nikah": "النكاح", "/prayer-ranks": "مراتب الصلاة", "/prayer-times": "مواقيت الصلاة",
        "/prophetic-medicine": "الطب النبوي", "/riba": "الربا", "/ruqya": "الرقية", "/sadaqa": "الصدقة", "/salah-guide": "دليل الصلاة", "/sawm": "الصيام",
        "/sins-and-rights": "الذنوب والحقوق", "/sins-and-rights/:slug": "تفاصيل الذنب والحق", "/sujood-sahw": "سجود السهو", "/tahara": "الطهارة",
        "/talaq": "الطلاق", "/tawba": "التوبة", "/udhiya": "الأضحية", "/waqf": "الوقف", "/worship": "العبادات", "/zakat": "الزكاة",
        // القرآن
        "/c/:slug": "مصدر موثّق", "/hifz-path": "مسار الحفظ", "/hifz-path/c/:category": "فئة مسار الحفظ", "/hifz-path/my": "مساري في الحفظ",
        "/hifz-path/p/:slug": "تفاصيل مسار الحفظ", "/hifz-path/p/:slug/u/:unitId": "وحدة مسار الحفظ", "/memorization": "الحفظ", "/miracles": "الإعجاز",
        "/mushaf": "المصحف", "/mushaf/bookmarks": "علامات المصحف", "/mutashabihat": "المتشابهات", "/quran-circles": "حلقات القرآن", "/quran-engine": "محرك القرآن",
        "/quran-hub": "القرآن الكريم", "/quran-hub/numbers": "أعداد القرآن", "/quran-hub/qiraat": "القراءات", "/quran-hub/seven-ahruf": "الأحرف السبعة",
        "/quran-hub/tajweed": "التجويد", "/quran-hub/tajweed/:chapter": "باب التجويد", "/quran-hub/terms": "مصطلحات علوم القرآن", "/quran-hub/tilawa": "التلاوة",
        "/quran-knowledge": "معارف القرآن", "/quran-memorization": "حفظ القرآن", "/quran/hifz-loop": "تكرار الحفظ", "/quran/makki-madani": "المكي والمدني",
        "/quran/memorization-plans": "خطط الحفظ", "/quran/my-hifz": "حفظي", "/quran/offline-player": "مشغّل القرآن دون اتصال", "/quran/people": "أعلام القرآن",
        "/quran/people/:slug": "تفاصيل العَلَم", "/quran/revelation-order": "ترتيب النزول", "/quran/search": "البحث في القرآن", "/quran/surah-stories": "قصص السور",
        "/quran/surah-stories/:number": "قصة السورة", "/quran/surahs": "فهرس السور", "/quran/worship-hub": "عبادات القرآن", "/tafsir": "التفسير", "/ulum-quran": "علوم القرآن",
        // اللغة والمكتبة والبحث
        "/academic-research": "البحوث الأكاديمية", "/academic-research/:id": "تفاصيل البحث", "/academic-research/assistant": "مساعد الباحث",
        "/academic-research/submit": "إرسال بحث", "/arabic-language": "اللغة العربية", "/cards": "البطاقات", "/islamic-directory": "الدليل الإسلامي",
        "/islamic-glossary": "المعجم الإسلامي", "/mawsuaat": "الموسوعات", "/methodology": "المنهجية", "/mind-map": "الخريطة الذهنية", "/more": "المزيد",
        "/scientific-announcements/:id": "الإشارات الكونية", "/search": "البحث", "/sections": "الأقسام", "/sitemap": "خريطة الموقع", "/sources": "المصادر",
        "/sources/:id": "تفاصيل المصدر", "/terms": "المصطلحات",
        // جذور وتحويلات
        "/": "الرئيسية", "/aqidah": "العقيدة", "/library": "المكتبة", "/profile": "حسابي", "/sirah": "السيرة",
    ]

    /// عنوان المسار؛ nil لمسار خارج السجل (يفشل `RouteTitlesTests` لأي مسار مسجَّل بلا عنوان).
    public static func title(for raw: String) -> String? {
        let path = Route.normalize(raw)
        let base = path.split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init) ?? path
        if let t = table[base] { return t }
        let comps = base.split(separator: "/").map(String.init)
        var best: (score: Int, title: String)?
        for (pattern, title) in table where pattern.contains(":") {
            let pc = pattern.split(separator: "/").map(String.init)
            guard pc.count == comps.count else { continue }
            var score = 0
            var ok = true
            for (p, c) in zip(pc, comps) { if p == c { score += 1 } else if !p.hasPrefix(":") { ok = false; break } }
            if ok, score >= (best?.score ?? -1) { best = (score, title) }
        }
        return best?.title ?? AppTab.allCases.first { $0.rootPath == base }?.title
    }

    /// عنوان وجهة (`.native(id)` يعود لمعرّفه).
    public static func title(for route: Route) -> String? {
        switch route {
        case .web(let path): return title(for: path)
        case .native(_): return nil
        }
    }
}

private struct RouteTitleKey: EnvironmentKey { static let defaultValue: String? = nil }

public extension EnvironmentValues {
    /// عنوان المسار الحالي من `RouteTitles`، يحقنه `sunnahDestination`.
    var routeTitle: String? {
        get { self[RouteTitleKey.self] }
        set { self[RouteTitleKey.self] = newValue }
    }
}

private struct RegistryTitle: ViewModifier {
    @Environment(\.routeTitle) private var routeTitle
    let fallback: String
    func body(content: Content) -> some View { content.sunnahNavTitle(routeTitle ?? fallback) }
}

public extension View {
    /// عنوان شريط التنقل: عنوان السجل إن وُجد للمسار، وإلا الاحتياطي (للأوراق والشاشات المتداخلة). بديل `navigationTitle` في الشاشات.
    func registryTitle(_ fallback: String) -> some View { modifier(RegistryTitle(fallback: fallback)) }
}
