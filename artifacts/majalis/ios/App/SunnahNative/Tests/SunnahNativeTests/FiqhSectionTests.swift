import XCTest
@testable import SunnahNative

/// قسم الفقه: فكّ الأشكال الحقيقية، قواعد النشر المنقولة من fiqh-books.ts، المحوّلات، وتوجيه المسارات.
/// نصوص العيّنات هنا عناصر نائبة للاختبار لا محتوى يُعرض.
final class FiqhSectionTests: XCTestCase {
    private func decode<T: Decodable>(_ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(json.utf8))
    }

    private let src = #"[{"book":"ك","author":"م","ref":"ب"}]"#

    private func lesson(_ id: String, status: String = "published", sources: String? = nil, extra: String = "") -> String {
        #"{"id":"\#(id)","title":"م \#(id)","bookId":"b1","chapterId":"c1","level":"مبتدئ","status":"\#(status)","summary":"ملخص","evidence":"دليل","preferred":"راجح","sources":\#(sources ?? src)\#(extra)}"#
    }

    private func catalog(lessons: [String], chapterExtra: String = #","topics":["ت"]"#) throws -> FiqhCatalog {
        try decode(#"""
        {"version":1,"madhhab":"hanbali","books":[{"id":"b1","title":"كتاب","description":"وصف","orderReason":"سبب","category":"ibadat","order":1,"sources":\#(src),
          "chapters":[{"id":"c1","title":"باب","order":1,"definition":"تعريف","summary":"خلاصة","evidence":"دليل","notes":"تنبيه","sources":\#(src)\#(chapterExtra),
            "lessons":[\#(lessons.joined(separator: ","))]}]}]}
        """#)
    }

    // MARK: قواعد النشر

    func testDraftAndNeedsReviewLessonsAreHidden() throws {
        let c = try catalog(lessons: [lesson("ok"), lesson("draft", status: "draft"), lesson("nr", extra: #","needsReview":true"#)])
        XCTAssertEqual(c.books[0].chapters[0].lessons.count, 3)
        XCTAssertEqual(FiqhVisibility.publishedLessons(c.books[0].chapters[0]).map(\.id), ["ok"])
        XCTAssertNotNil(c.visibleLesson(book: "b1", lesson: "ok"))
        XCTAssertNil(c.visibleLesson(book: "b1", lesson: "draft"))
        XCTAssertNil(c.visibleLesson(book: "b1", lesson: "nr"))
    }

    func testLessonWithIncompleteSourceIsHidden() throws {
        let c = try catalog(lessons: [lesson("x", sources: #"[{"book":"ك","author":"","ref":"ب"}]"#)])
        XCTAssertTrue(c.publishedBooks.isEmpty, "باب بلا مسألة منشورة لا يُنشر، وكتاب بلا باب منشور لا يُنشر")
    }

    func testChapterWithoutTopicsIsHidden() throws {
        let c = try catalog(lessons: [lesson("ok")], chapterExtra: "")
        XCTAssertNil(c.visibleBook("b1"))
        XCTAssertNil(c.visibleChapter(book: "b1", chapter: "c1"))
    }

    func testAliasResolvesToTargetBook() throws {
        let c = try catalog(lessons: [lesson("ok")])
        let aliases: FiqhAliasList = try decode(#"{"aliases":[{"aliasTitle":"كتاب الرهن","aliasId":"rahn","targetBookId":"b1","targetChapterId":"c1"}]}"#)
        XCTAssertEqual(c.visibleBook("rahn", aliases: aliases.aliases)?.id, "b1")
        XCTAssertNil(c.visibleBook("rahn"))
    }

    func testTemplateSentenceIsStripped() {
        let s = FiqhVisibility.stripTemplate("دليل.  مع مراعاة قواعد المذهب الحنبلي في الجمع بين النص والفقه.")
        XCTAssertEqual(s, "دليل.")
    }

    // MARK: المحوّلات

    func testLessonAdapterOrderAndFallbacks() throws {
        let c = try catalog(lessons: [lesson("ok", extra: #","examples":["  ","مثال"],"commonMistakes":[]"#)])
        let hit = try XCTUnwrap(c.visibleLesson(book: "b1", lesson: "ok"))
        let r = FiqhAdapters.lesson(hit.0, hit.1, hit.2)
        let ids = r.tabs.first?.blocks.map(\.id)
        XCTAssertEqual(ids, ["summary", "ruling", "evidence", "examples", "sources"])
        let ruling = r.tabs[0].blocks.first { $0.id == "ruling" }
        XCTAssertEqual(ruling?.paragraphs, ["راجح"], "الحكم المختصر يرجع إلى preferred عند غياب ruling")
        XCTAssertEqual(r.tabs[0].blocks.first { $0.id == "examples" }?.bullets, ["مثال"])
        XCTAssertEqual(r.tabs[0].blocks.last?.bullets, ["ك — م — ب"])
    }

    func testHubGroupsBooksAndLinksChapters() throws {
        let c = try catalog(lessons: [lesson("ok")])
        let hub = FiqhAdapters.hub(c)
        XCTAssertEqual(hub.links.first?.route, "/fiqh/books/b1")
        XCTAssertEqual(hub.links.first?.group, "العبادات")
        let book = FiqhAdapters.book(c.books[0])
        XCTAssertEqual(book.links.map(\.route), ["/fiqh/books/b1/chapters/c1"])
        let chapter = FiqhAdapters.chapter(c.books[0], c.books[0].chapters[0])
        XCTAssertEqual(chapter.links.map(\.route), ["/fiqh/books/b1/lessons/ok"])
    }

    func testGuideDecodesAndBuildsTabs() throws {
        let g: FiqhGuide = try decode(#"""
        {"slug":"jumuah","path":"/jumuah","title":"صلاة الجمعة","badge":"العبادات","subtitle":"وصف","seoTitle":"x","seoDescription":"x","keywords":[],
         "quizCategoryId":["fiqh","salah"],"methodology":"منهج","related":[{"href":"/fiqh","label":"الفقه"}],
         "tabs":[{"id":"ruling","label":"الحكم","cards":[{"id":"fard","title":"حكم","summary":"ملخص","evidence":"﴿آية﴾","evidenceRef":"الجمعة: 9"}]},
                 {"id":"empty","label":"فارغ","cards":[]}]}
        """#)
        let r = FiqhAdapters.guide(g)
        XCTAssertEqual(r.tabs.map(\.id), ["ruling"], "التبويب الفارغ لا يُعرض")
        XCTAssertEqual(r.tabs[0].blocks.map(\.id), ["methodology", "fard"])
        XCTAssertEqual(r.tabs[0].blocks[1].quote, "﴿آية﴾")
        XCTAssertEqual(r.tabs[0].blocks[1].reference, "الجمعة: 9")
        XCTAssertEqual(r.links.map(\.route), ["/fiqh"])
    }

    func testMadhhabAdapter() throws {
        let list: [Madhhab] = try decode(#"""
        [{"id":"hanbali","color":"#000","icon":"x","name":"الحنبلي","fullName":"المذهب الحنبلي","founder":"أحمد","born":"164هـ","died":"241هـ",
          "origin":"بغداد","spread":"نجد","summary":"ملخص","methodology":"منهج","sources":["الكتاب"],"features":[],"books":[{"title":"المغني","author":"ابن قدامة"}],
          "scholars":[],"quote":{"text":"قول","source":"مصدر"}}]
        """#)
        XCTAssertEqual(FiqhAdapters.madhahib(list).links.map(\.route), ["/madhahib/hanbali"])
        let r = FiqhAdapters.madhhab(list[0])
        let blocks = r.tabs[0].blocks
        XCTAssertEqual(blocks.map(\.id), ["overview", "meta", "method", "sources", "books", "quote"])
        XCTAssertTrue(blocks[1].bullets.contains("المؤسس: الإمام أحمد (164هـ–241هـ)"))
        XCTAssertEqual(blocks.last?.quote, "«قول»")
    }

    func testOnlyReviewedSinsAreListedAndLinked() throws {
        let b: SinsAndRightsBundle = try decode(#"""
        {"topics":[{"id":"1","slug":"a","title":"أ","sinType":["qalbi"],"reviewStatus":"reviewed","relatedSlugs":["b","c"],"quranEvidence":[{"text":"آية","source":"سورة"}],"hadithEvidence":[]},
                   {"id":"2","slug":"b","title":"ب","sinType":"qawli","reviewStatus":"pending"},
                   {"id":"3","slug":"c","title":"ج","reviewStatus":"reviewed"}],
         "categories":[{"id":"k","title":"حقوق الله","topicSlugs":["a","b"]}]}
        """#)
        let list = FiqhAdapters.sinsList(b)
        XCTAssertEqual(list.links.map(\.route), ["/sins-and-rights/a", "/sins-and-rights/c"])
        XCTAssertEqual(list.links.map(\.group), ["حقوق الله", nil])
        let reviewed = FiqhAdapters.reviewedSins(b)
        let detail = FiqhAdapters.sin(reviewed[0], related: reviewed.filter { $0.slug == "c" })
        XCTAssertEqual(detail.tabs[0].blocks.first { $0.id == "quran" }?.bullets, ["آية — سورة"])
        XCTAssertEqual(detail.links.map(\.route), ["/sins-and-rights/c"])
    }

    func testUsulSplitsOverviewDetailsAndLinks() throws {
        let t: [UsulTopic] = try decode(#"""
        [{"id":"adilla","title":"الأدلة","summary":"س","kind":"أدلة","status":"ready","details":[{"title":"الكتاب","summary":"س","evidence":"﴿آية﴾","source":{"book":"روضة الناظر","author":"ابن قدامة","ref":"باب"}}]},
         {"id":"naskh","title":"النسخ","summary":"س","kind":"ب","status":"structure","source":{"book":"الورقات","author":"الجويني","ref":"النسخ"}},
         {"id":"qawaid","title":"القواعد","summary":"س","kind":"ق","status":"ready","href":"/fiqh-qawaid"}]
        """#)
        let r = FiqhAdapters.usul(t)
        XCTAssertEqual(r.tabs.map(\.id), ["topics", "adilla"])
        XCTAssertEqual(r.tabs[0].blocks.map(\.reference), ["أدلة", "الورقات — الجويني — النسخ"])
        XCTAssertEqual(r.tabs[1].blocks[0].reference, "روضة الناظر — ابن قدامة — باب")
        XCTAssertEqual(r.links.map(\.route), ["/fiqh-qawaid"])
    }

    func testAmrAndMedicineAndRanksDecode() throws {
        let amr: AmrBilMarufBundle = try decode(#"""
        {"levels":[{"id":"l2","rank":2,"title":"ثانية","arabic_name":"x","description":"و","conditions":["ش"],"evidence":[{"type":"قرآن","text":"آية","source":"س"}],"notes":"ن","is_obligatory":true,"who_can_do":"م"},
                   {"id":"l1","rank":1,"title":"أولى","arabic_name":"x","description":"و","conditions":[],"evidence":[],"notes":"","is_obligatory":true,"who_can_do":"م"}],
         "conditions":[{"id":"c","title":"شرط","detail":"ت","scholar_note":"ق"}],"munkaraat":[{"id":"m","category":"منكر","title":"م","explanation":"ش","level_required":"يد","tags":[]}],"maaruf":[]}
        """#)
        let a = FiqhAdapters.amrBilMaruf(amr)
        XCTAssertEqual(a.tabs.map(\.id), ["levels", "conditions", "munkar"])
        XCTAssertEqual(a.tabs[0].blocks.map(\.id), ["l1", "l2"])
        XCTAssertEqual(a.tabs[0].blocks[1].bullets, ["ش", "آية — س"])

        let pm: [PropheticMedicineItem] = try decode(#"""
        [{"id":"a","name":"أ","category":"الغذاء والتغذية","icon":"x","hadith":"«ح»","hadithSource":"البخاري","benefits":["ف"],"body":"ن"},
         {"id":"b","name":"ب","category":"العلاج والدواء","icon":"x","hadith":"«ح»","hadithSource":"مسلم","benefits":[],"body":"ن"},
         {"id":"c","name":"ج","category":"الغذاء والتغذية","icon":"x","hadith":"«ح»","hadithSource":"مسلم","benefits":[],"body":"ن"}]
        """#)
        XCTAssertEqual(FiqhAdapters.propheticMedicine(pm).tabs.map { $0.blocks.map(\.id) }, [["a", "c"], ["b"]])

        let ranks: [PrayerRank] = try decode(#"[{"title":"المرتبة الأولى","label":"و","ruling":"ح","text":"ن","benefit":"ف"}]"#)
        XCTAssertEqual(FiqhAdapters.prayerRanks(ranks).tabs[0].blocks[0].paragraphs, ["ن", "ف"])
    }

    func testEmptyBlocksAreDropped() {
        XCTAssertNil(FiqhReading.block("x", "عنوان", text: " \n ", bullets: ["  "], quote: ""))
        XCTAssertTrue(FiqhReading.single(title: "ع", blocks: [nil]).isEmpty)
    }

    // MARK: التوجيه

    func testResolveCoversSectionPathsOnly() {
        let handled = FiqhSection.staticPaths + [
            "/fiqh/books/taharah", "/fiqh/books/taharah/chapters/miyah", "/fiqh/books/taharah/lessons/x",
            "/fiqh/topics/islamic-finance", "/fiqh/topics/unknown", "/madhahib/hanbali", "/sins-and-rights/ghiba", "/fiqh?tab=1",
        ]
        for p in handled { XCTAssertNotNil(FiqhSection.resolve(path: p), p) }
        // تبقى للمولّد/الويب حتى تُصدَّر بياناتها أو تُكتب شاشتها (docs/native/requests/fiqh.md).
        for p in ["/hajj", "/zakat", "/mawarith/calculator/x", "/prayer-times", "/fiqh/books/x/other/y", "/fiqh/usul/x", "/"] {
            XCTAssertNil(FiqhSection.resolve(path: p), p)
        }
    }

    func testRegistryIdsMatchGenerator() {
        XCTAssertEqual(FiqhSection.registryId("/fiqh/usul"), "fiqh.usul")
        XCTAssertEqual(FiqhSection.staticPaths.count, 17)
        XCTAssertEqual(FiqhRoutes.topicRedirect("islamic-finance"), "/riba")
        XCTAssertEqual(FiqhRoutes.topicRedirect("unknown"), "/fiqh")
    }

    @MainActor func testRegisterOverridesGeneratedIds() {
        let registry = TemplateRegistry()
        FiqhSection.register(in: registry)
        for p in FiqhSection.staticPaths { XCTAssertNotNil(registry.view(for: FiqhSection.registryId(p)), p) }
    }

    // MARK: البيانات الحقيقية (content/fiqh/books.json في المستودع)

    func testRealCatalogDecodesWithExpectedPublishedCounts() throws {
        let content = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("content")
        let books = content.appendingPathComponent("fiqh/books.json")
        guard FileManager.default.fileExists(atPath: books.path) else { throw XCTSkip("books.json غير متاح: \(books.path)") }
        let c = try JSONDecoder().decode(FiqhCatalog.self, from: Data(contentsOf: books))
        // المحجوز يُستبعد في التصدير؛ ومنه درس فيه مفتاح needsReview مكرر بقيمتين، فلا يُعتمد على أيّهما يقرأ المفكّك.
        struct Holds: Decodable { struct Hold: Decodable { let id: String }; let holds: [Hold] }
        let held = Set(try JSONDecoder().decode(Holds.self, from: Data(contentsOf: content.appendingPathComponent("content-hold.json"))).holds.map(\.id))
        let chapters = c.publishedBooks.flatMap(FiqhVisibility.publishedChapters)
        let lessons = chapters.flatMap(FiqhVisibility.publishedLessons).filter { !held.contains($0.id) }
        // محسوبة بقواعد fiqh-books.ts على النسخة الحالية (2026-10-11) بعد استبعاد المحجوز.
        XCTAssertEqual(c.publishedBooks.count, 19)
        XCTAssertEqual(chapters.count, 283)
        XCTAssertEqual(lessons.count, 1146)
        XCTAssertNotNil(c.visibleLesson(book: "taharah", lesson: "taharah-miyah-overview"))
    }
}
