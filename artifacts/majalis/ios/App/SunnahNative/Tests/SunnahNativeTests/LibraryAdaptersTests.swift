import XCTest
@testable import SunnahNative

/// قواعد قبول قسم المكتبة: بيانات اختبار وهمية لا محتوى شرعي.
final class LibraryAdaptersTests: XCTestCase {
    private func decode<T: Decodable>(_ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(json.utf8))
    }

    private let researchJSON = #"{"categories":[{"id":"fiqh","label":"الفقه","sortOrder":2},{"id":"aqidah","label":"العقيدة","sortOrder":1},{"id":"hadith","label":"الحديث","sortOrder":3}],"records":[{"id":"pub-001","slug":"r1","title":"ب1","kind":"thesis","categoryIds":["fiqh"],"authors":[{"name":"أ","role":"باحث"}],"year":2020,"abstract":"م","keywords":["ك1","ك2"],"reviewStatus":"published","license":"x","accessType":"metadata_only"},{"id":"pub-002","slug":"r2","title":"ب2","categoryIds":["fiqh","aqidah"],"authors":[],"abstract":"م","keywords":["ك1"],"reviewStatus":"published"},{"id":"d1","slug":"d1","title":"تجريبي","categoryIds":["hadith"],"authors":[],"abstract":"م","keywords":["ك3"],"reviewStatus":"published","isDemo":true},{"id":"p1","slug":"p1","title":"مسودة","categoryIds":["hadith"],"authors":[],"abstract":"م","keywords":[],"reviewStatus":"pending"}]}"#

    func testResearchPublishedOnlyAndLookupByIdOrSlug() throws {
        let file: LibraryResearchFile = try decode(researchJSON)
        let items = LibraryAdapters.research(file)
        XCTAssertEqual(items.map(\.id), ["r1", "r2"])
        XCTAssertEqual(items[0].subtitle, "أ (باحث) · 2020")
        XCTAssertEqual(items[0].tags, ["الفقه"])
        XCTAssertEqual(LibraryAdapters.research(file, id: "pub-001")?.title, "ب1")
        XCTAssertEqual(LibraryAdapters.research(file, id: "r2")?.title, "ب2")
        XCTAssertNil(LibraryAdapters.research(file, id: "d1"))
        XCTAssertNil(LibraryAdapters.research(file, id: "p1"))
    }

    func testAssistantInsightsGapsFirstAndTopKeywords() throws {
        let file: LibraryResearchFile = try decode(researchJSON)
        let i = LibraryAdapters.insights(file)
        XCTAssertEqual(i.coverage.map(\.label), ["الحديث", "العقيدة", "الفقه"])
        XCTAssertEqual(i.coverage.map(\.count), [0, 1, 2])
        XCTAssertEqual(i.topKeywords.first, LibraryAdapters.ResearchInsights.Row(label: "ك1", count: 2))
        XCTAssertFalse(i.topKeywords.contains { $0.label == "ك3" })
    }

    func testDarsSkipsEchoedBody() throws {
        let rows: [LibraryDarsSection] = try decode(#"[{"id":"m","num":"1","title":"م","icon":"x","color":"y","lessons":[{"id":"m-1","title":"د","summary":"خ","body":"باب د: خ"}]}]"#)
        XCTAssertEqual(LibraryAdapters.darsSections(rows).first?.body, "د\n\nخ")
    }

    func testGlossaryRequiresSource() throws {
        let rows: [LibraryGlossaryTerm] = try decode(#"[{"id":1,"term":"ب","category":"fiqh","definition":"ت","source":"م"},{"id":2,"term":"أ","category":"fiqh","definition":"ت"}]"#)
        let items = LibraryAdapters.glossary(rows)
        XCTAssertEqual(items.map(\.id), ["1"])
        XCTAssertEqual(items[0].tags, ["الفقه"])
        XCTAssertTrue(items[0].body?.hasSuffix("المصدر: م") == true)
    }

    func testMindMapOutline() throws {
        let maps: [LibraryMindMap] = try decode(#"[{"id":"a","title":"خ","category":"ع","root":{"id":"r","label":"ج","children":[{"id":"c","label":"ف","children":[{"id":"d","label":"ف2"}]}]}}]"#)
        let body = LibraryAdapters.mindMaps(maps)[0].body ?? ""
        XCTAssertEqual(body, "ج\n\u{2003}• ف\n\u{2003}\u{2003}• ف2")
    }

    func testSourcesEnabledAndFeedForAccount() throws {
        let accounts: LibrarySourceAccountsFile = try decode(#"{"version":1,"accounts":[{"id":"a","platform":"x","handle":"h","name_ar":"أ","enabled":true},{"id":"b","name_ar":"ب","enabled":false}]}"#)
        let feed: LibraryFeedFile = try decode(#"{"items":[{"id":"f1","title_ar":"إعلان","sources":[{"id":"a","name_ar":"أ"}]},{"id":"f2","title_ar":"غيره","sources":[{"id":"z"}]}]}"#)
        XCTAssertEqual(LibraryAdapters.sources(accounts).map(\.id), ["a"])
        let item = LibraryAdapters.source(id: "a", accounts: accounts, feed: feed)
        XCTAssertEqual(item?.subtitle, "x · @h")
        XCTAssertTrue(item?.body?.contains("إعلان") == true)
        XCTAssertFalse(item?.body?.contains("غيره") == true)
        XCTAssertNil(LibraryAdapters.source(id: "b", accounts: accounts, feed: feed))
    }

    private let navJSON = #"{"groups":[{"id":"quran","title":"ق","sections":[{"id":"q1","title":"م2","route":"/q1"}]},{"id":"sunnah","title":"س","sections":[{"id":"s1","title":"ل1","route":"/s1"}]},{"id":"account","title":"ح","sections":[{"id":"acc","title":"حساب","route":"/settings"}]}],"sections":[{"id":"q1","title":"م2","route":"/q1"},{"id":"s1","title":"ل1","route":"/s1"}],"settingsRows":[{"id":"terms","title":"الشروط","href":"/terms","icon":"x"}],"sitemap":[{"title":"ق","icon":"quran","links":[{"href":"/mushaf","label":"القرآن","desc":"م"}]},{"title":"فارغ","links":[]}]}"#

    func testMoreGroupsExcludeAccount() throws {
        let nav: LibraryNavigation = try decode(navJSON)
        let groups = LibraryAdapters.more(nav, scope: { _ in true })
        XCTAssertEqual(groups.map(\.title), ["ق", "س", "الحساب والإعدادات"])
        XCTAssertEqual(groups[0].links.map(\.title), ["م2"])
        XCTAssertEqual(groups[1].links.map(\.id), ["s1"])
        XCTAssertEqual(groups[2].links.map(\.route), ["/terms"])
    }

    func testSectionsHubAndSitemap() throws {
        let nav: LibraryNavigation = try decode(navJSON)
        XCTAssertEqual(LibraryAdapters.sections(nav, scope: { _ in true }).map(\.id), ["q1", "s1"])
        XCTAssertEqual(LibraryAdapters.sitemap(nav, scope: { _ in true }).map(\.title), ["ق"])
    }

    func testDocumentKeepsTextVerbatim() throws {
        let doc: LibraryTextDocument = try decode(#"{"title":"الشروط","updatedAt":"2026-08-05","sections":[{"title":"ع1","paragraphs":["ف1","ف2"]}]}"#)
        let item = LibraryAdapters.document(doc, id: "terms")
        XCTAssertEqual(item.body, "ع1\n\nف1\n\nف2")
        XCTAssertEqual(item.subtitle, "آخر تحديث: 2026-08-05")
    }

    func testArabicNormalization() {
        XCTAssertEqual(LibraryAdapters.normalize("الصَّلاةُ"), "الصلاه")
        XCTAssertEqual(LibraryAdapters.normalize("أإآ ى ؤ ئ ـــ"), "ااا ي و ي")
    }

    func testSearchRanksPrefixFirstAndCarriesRoute() throws {
        let index: LibrarySearchIndex = try decode(#"{"version":3,"docs":[{"id":"1","kind":"qa","titleAr":"حكم الصلاة","href":"/qa/1","norm":"حكم الصلاه"},{"id":"2","kind":"history","titleAr":"الصلاة في السفر","href":"/h/2","norm":""},{"id":"3","kind":"surah","titleAr":"البقرة","href":"/quran/2"}]}"#)
        let r = LibraryAdapters.search(index, query: "الصلاة", scope: { _ in true })
        XCTAssertEqual(r.map(\.id), ["2", "1"])
        XCTAssertEqual(r[0].route, "/h/2")
        XCTAssertEqual(r[0].subtitle, "تاريخ")
        XCTAssertTrue(LibraryAdapters.search(index, query: "ا").isEmpty)
    }

    @MainActor
    func testSectionRegistersEveryGeneratedIdAndResolvesParams() {
        let registry = TemplateRegistry()
        LibrarySection.register(in: registry)
        for id in ["academic-research", "academic-research.assistant", "academic-research.submit", "arabic-language", "cards",
                   "islamic-directory", "islamic-glossary", "mawsuaat", "methodology", "mind-map", "more", "search",
                   "sections", "sitemap", "sources", "terms"] {
            XCTAssertNotNil(registry.view(for: id), id)
        }
        for p in ["/academic-research/pub-001", "/scientific-announcements/sci-1", "/sources/web-x"] {
            XCTAssertNotNil(LibrarySection.resolve(path: p), p)
        }
        // خارج ROUTE_TEMPLATE_MAP: تُقرأ داخل شاشتها ولا مسار تفاصيل لها.
        for p in ["/mind-map/aqeeda", "/arabic-language/nahw", "/mawsuaat/x", "/islamic-glossary/1"] {
            XCTAssertNil(LibrarySection.resolve(path: p), p)
        }
        XCTAssertNil(LibrarySection.resolve(path: "/academic-research/assistant"))
        XCTAssertNil(LibrarySection.resolve(path: "/search"))
    }

    func testRouteScopeMatchesKeptPathsAndParams() {
        XCTAssertTrue(LibraryRouteScope.contains("/sources/web-x"))
        XCTAssertTrue(LibraryRouteScope.contains("/teachers/ibn-baz?tab=1"))
        XCTAssertTrue(LibraryRouteScope.contains("/islamic-landmarks"))
        XCTAssertFalse(LibraryRouteScope.contains("/prophets/adam"))
        XCTAssertFalse(LibraryRouteScope.contains("/mind-map/aqeeda"))
        XCTAssertFalse(LibraryRouteScope.contains("/library"))
    }

    func testDeferredRoutesAreHiddenFromNavigationAndSearch() {
        for p in ["/islamic-sects", "/islamic-sects/x"] { XCTAssertFalse(LibraryRouteScope.contains(p), p) }
        // أُعيد إظهارها بعد وصول بياناتها (#3010).
        for p in ["/fikr-waqia", "/competitions", "/competitions/1", "/durus-imaniyya", "/durus-mutanawwia", "/fawaid", "/annual-courses/7", "/institutions"] {
            XCTAssertTrue(LibraryRouteScope.contains(p), p)
        }
        XCTAssertTrue(LibraryRouteScope.deferred.allSatisfy { LibraryRouteScope.kept.contains($0) })
        XCTAssertTrue(LibraryRouteScope.contains("/universities"))
    }

    func testNavigationAndSearchDropRoutesOutsideScope() throws {
        let nav: LibraryNavigation = try decode(navJSON)
        let kept: (String) -> Bool = { $0 == "/q1" || $0 == "/terms" }
        XCTAssertEqual(LibraryAdapters.more(nav, scope: kept).flatMap(\.links).map(\.route), ["/q1", "/terms"])
        XCTAssertEqual(LibraryAdapters.sections(nav, scope: kept).map(\.id), ["q1"])
        XCTAssertTrue(LibraryAdapters.sitemap(nav, scope: kept).isEmpty)
        let index: LibrarySearchIndex = try decode(#"{"docs":[{"id":"1","kind":"qa","titleAr":"الصلاة","href":"/library/1"},{"id":"2","kind":"qa","titleAr":"الصلاة ٢","href":"/sources/2"}]}"#)
        XCTAssertEqual(LibraryAdapters.search(index, query: "الصلاة").map(\.id), ["2"])
    }

    /// يمنع انحراف القائمة المضمّنة عن docs/native/ROUTE_TEMPLATE_MAP.json.
    func testRouteScopeMatchesRouteTemplateMap() throws {
        var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        var map: URL?
        while dir.path != "/" {
            let candidate = dir.appendingPathComponent("docs/native/ROUTE_TEMPLATE_MAP.json")
            if FileManager.default.fileExists(atPath: candidate.path) { map = candidate; break }
            dir.deleteLastPathComponent()
        }
        guard let map else { return XCTFail("ROUTE_TEMPLATE_MAP.json غير موجود في المستودع") }
        struct Map: Decodable { struct Route: Decodable { let path: String }; let routes: [Route] }
        let paths = try JSONDecoder().decode(Map.self, from: Data(contentsOf: map)).routes.map(\.path)
        XCTAssertEqual(Set(LibraryRouteScope.kept), Set(paths))
        XCTAssertEqual(LibraryRouteScope.kept.count, paths.count)
    }
}
