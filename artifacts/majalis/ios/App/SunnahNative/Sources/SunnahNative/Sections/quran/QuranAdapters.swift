import Foundation

/// محوّلات قسم القرآن: تجمع فهرس المصحف (المحزوم) مع ترتيب النزول المُصدَّر. لا نص قرآني ولا تفسير يُولَّد هنا.
enum QuranAdapters {
    static func rows(index: MushafIndex, meta: [QuranSurahMeta]) -> [QuranSurahRow] {
        let order = Dictionary(meta.map { ($0.id, $0.revelationOrder) }, uniquingKeysWith: { a, _ in a })
        return index.surahs.map {
            QuranSurahRow(id: $0.id, name: $0.name, ayahs: $0.ayahs, firstPage: $0.firstPage, place: $0.place, revelationOrder: order[$0.id])
        }
    }

    /// حسب ترتيب النزول؛ ما بلا ترتيب يُستبعد لا يُخمَّن.
    static func byRevelation(_ rows: [QuranSurahRow]) -> [QuranSurahRow] {
        rows.filter { $0.revelationOrder != nil }.sorted { $0.revelationOrder! < $1.revelationOrder! }
    }

    static func makki(_ rows: [QuranSurahRow]) -> [QuranSurahRow] { rows.filter { $0.place == "makkah" } }
    static func madani(_ rows: [QuranSurahRow]) -> [QuranSurahRow] { rows.filter { $0.place != "makkah" } }

    /// أول سورة تبدأ في الجزء (للقائمة): من بداية الجزء إلى السورة التي تحويه.
    static func juzRows(index: MushafIndex) -> [(juz: Int, page: Int, surah: String)] {
        index.juzStart.enumerated().map { i, p in (i + 1, p, index.surah(onPage: p)?.name ?? "") }
    }
}

/// روابط ثابتة (ليست محتوى شرعيًا): مطابقة لـQuranHubScreen. الوجهات التي بلا شاشة أصلية بعد تُعرض «قيد التوثيق».
enum QuranLinks {
    static let hub = [
        SectionLink(id: "surahs", title: "فهرس السور", route: "/quran/surahs"),
        SectionLink(id: "makki-madani", title: "المكي والمدني", route: "/quran/makki-madani"),
        SectionLink(id: "revelation-order", title: "ترتيب النزول", route: "/quran/revelation-order"),
        SectionLink(id: "tafsir", title: "التفسير", route: "/tafsir"),
        SectionLink(id: "tilawa", title: "التلاوة", route: "/quran-hub/tilawa"),
        SectionLink(id: "hifz", title: "مسار الحفظ", route: "/hifz-path"),
        SectionLink(id: "mutashabihat", title: "المتشابهات", route: "/mutashabihat"),
    ]
}
