import Foundation

/// نطاق التطبيق: المسارات الـ212 المبقاة في docs/native/ROUTE_TEMPLATE_MAP.json (قرار المالك: ما ليس فيها لا يُعرض ولا يُربط).
/// روابط التنقل والبحث في هذا القسم تُرشَّح بها؛ واختبار LibraryRouteScopeTests يمنع انحرافها عن الملف.
enum LibraryRouteScope {
    static let kept: [String] = [
        "/about", "/academic-research", "/academic-research/:id", "/academic-research/assistant", "/academic-research/submit",
        "/account-deletion", "/adab-talab-ilm", "/adhan-help", "/adhan-settings", "/adhkar", "/akhlaq", "/alamat-saah", "/amr-bil-maruf",
        "/amrad-qalbiyya", "/annual-courses/:id", "/arabic-language", "/arbaeen-nawawi", "/arbaeen-nawawi/:id", "/arkan", "/arkan-iman",
        "/asma-husna", "/auth/callback", "/auth/update-password", "/c/:slug", "/calendar", "/car-mode", "/cards", "/competitions",
        "/competitions/:id", "/contact", "/daily-wird", "/dalail-nubuwwah", "/data-licenses", "/discover-islam",
        "/discover-islam/articles/:slug", "/discover-islam/contact", "/discover-islam/doubts", "/discover-islam/doubts/:slug",
        "/discover-islam/how-to-convert", "/discover-islam/new-muslim", "/discover-islam/new-muslim/:day", "/discover-islam/questions",
        "/discover-islam/questions/:slug", "/duas", "/duas-quran", "/durus-imaniyya", "/durus-mutanawwia", "/fadail-aamal", "/family",
        "/fatwa-policy", "/fawaid", "/feature-tour", "/fikr-waqia", "/fiqh", "/fiqh-qawaid", "/fiqh/books/:bookId",
        "/fiqh/books/:bookId/chapters/:chapterId", "/fiqh/books/:bookId/lessons/:lessonId", "/fiqh/topics/:topicId", "/fiqh/usul",
        "/flashcards", "/hadith", "/hadith-science", "/hadith/arbaeen-love-of-allah", "/hadith/books", "/hadith/books-and-rulings",
        "/hadith/daif", "/hadith/mawdu", "/hadith/sahih", "/hajj", "/hifz-path", "/hifz-path/c/:category", "/hifz-path/my",
        "/hifz-path/p/:slug", "/hifz-path/p/:slug/u/:unitId", "/hikam-salaf", "/iman-topics", "/institutions", "/islam-stats",
        "/islamic-directory", "/islamic-glossary", "/islamic-landmarks", "/islamic-landmarks/:id", "/islamic-landmarks/map",
        "/islamic-sects", "/islamic-sects/:id", "/janaza", "/janna-naar", "/jumuah", "/knowledge-graph", "/knowledge/:section",
        "/kuwait-lessons", "/lessons", "/lessons/:id", "/lessons/archive", "/login", "/madhahib", "/madhahib/:id", "/malaika",
        "/maqasid-sharia", "/mawarith", "/mawarith/calculator", "/mawsuaat", "/memorization", "/methodology", "/mind-map", "/miracles",
        "/more", "/mosque-mode", "/mushaf", "/mushaf/bookmarks", "/mutashabihat", "/my-learning", "/my-submissions", "/nations",
        "/nations/:slug", "/nikah", "/notification-settings", "/occasions", "/occasions-lessons", "/offline", "/prayer-ranks",
        "/prayer-times", "/privacy", "/privacy-center", "/progress", "/prophetic-medicine", "/prophets", "/prophets/tree", "/qibla",
        "/quiz", "/quran-circles", "/quran-engine", "/quran-hub", "/quran-hub/numbers", "/quran-hub/qiraat", "/quran-hub/seven-ahruf",
        "/quran-hub/tajweed", "/quran-hub/tajweed/:chapter", "/quran-hub/terms", "/quran-hub/tilawa", "/quran-knowledge",
        "/quran-memorization", "/quran/hifz-loop", "/quran/makki-madani", "/quran/memorization-plans", "/quran/offline-player",
        "/quran/people", "/quran/people/:slug", "/quran/revelation-order", "/quran/search", "/quran/surah-stories",
        "/quran/surah-stories/:number", "/quran/surahs", "/quran/worship-hub", "/raqaiq", "/reading-plans", "/register", "/researcher",
        "/riba", "/ruqya", "/sadaqa", "/sahabah", "/salah-guide", "/sawm", "/scientific-announcements/:id", "/search", "/sections",
        "/seerah", "/settings", "/shamael", "/sins-and-rights", "/sins-and-rights/:slug", "/sitemap", "/sources", "/sources/:id", "/stats",
        "/stories", "/study-room", "/submit", "/sujood-sahw", "/sunan-yawmiyya", "/sunnah-studies", "/tafsir", "/tahara", "/talaq",
        "/tarikh-islami", "/tarikh-islami/:id", "/tasbih", "/tawba", "/tawhid", "/tawhid/:slug", "/tazkiya", "/tazkiya-topics",
        "/teachers", "/teachers/:slug", "/terms", "/udhiya", "/ulum-quran", "/universities", "/universities/:slug",
        "/universities/compare", "/updates", "/updates/auto/:slug", "/upload", "/usra-mujtama", "/vault", "/waqf", "/wasaya-nabawiyya",
        "/widget-center", "/worship", "/zakat"
    ]

    private static let patterns: [[String]] = kept.map(segments)

    private static func segments(_ path: String) -> [String] {
        path.split(separator: "/").map(String.init)
    }

    /// يطابق المسار (بلا استعلام أو مرساة) مسارًا مبقى؛ المقطع `:param` يقبل أي قيمة.
    static func contains(_ path: String) -> Bool {
        let cut = path.firstIndex { $0 == "?" || $0 == "#" } ?? path.endIndex
        let s = segments(String(path[..<cut]))
        return patterns.contains { p in
            p.count == s.count && zip(p, s).allSatisfy { $0.hasPrefix(":") || $0 == $1 }
        }
    }
}
