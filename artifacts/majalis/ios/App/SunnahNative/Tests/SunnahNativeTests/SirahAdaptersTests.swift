import XCTest
@testable import SunnahNative

/// قواعد قبول قسم السيرة: بيانات اختبار وهمية (نص/مصدر) لا محتوى شرعي.
final class SirahAdaptersTests: XCTestCase {
    private func decode<T: Decodable>(_ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(json.utf8))
    }

    func testDarsSectionsSkipEmptyAndJoinLessons() throws {
        let rows: [SirahDarsSection] = try decode(#"[{"id":"s1","num":"1","title":"أ","icon":"x","color":"y","lessons":[{"id":"s1-1","title":"د1","summary":"م"},{"id":"s1-2","title":"د2","summary":"م2","body":"م2"}]},{"id":"s2","num":"2","title":"ب","lessons":[]}]"#)
        let items = SirahAdapters.darsSections(rows)
        XCTAssertEqual(items.map(\.id), ["s1"])
        XCTAssertEqual(items[0].body, "د1\n\nم\n\nد2\n\nم2")
    }

    func testLandmarkMapping() throws {
        let rows: [SirahLandmark] = try decode(#"[{"id":"l1","name":"م","country":"ب","city":"م2","type":"مسجد","era":"ع","description":"و","significance":"أ","lat":1,"lng":2,"tags":[]},{"id":"l2","name":"","country":"","city":"","type":"","era":"","description":"","significance":"","lat":0,"lng":0,"tags":[]}]"#)
        let items = SirahAdapters.landmarks(rows)
        XCTAssertEqual(items.count, 1)
        XCTAssertEqual(items[0].subtitle, "م2، ب")
        XCTAssertEqual(items[0].tags, ["مسجد", "ع"])
    }

    func testNationEvidenceRules() {
        let ok = SirahEvidence(kind: "hadith", text: "ن", ref: "م", grade: "د")
        XCTAssertTrue(SirahAdapters.acceptedEvidence(ok))
        XCTAssertFalse(SirahAdapters.acceptedEvidence(SirahEvidence(kind: "hadith", text: "ن", ref: "م", grade: nil)))
        XCTAssertFalse(SirahAdapters.acceptedEvidence(SirahEvidence(kind: "unverified", text: "ن", ref: "م")))
        XCTAssertFalse(SirahAdapters.acceptedEvidence(SirahEvidence(kind: "disputed", text: "ن", ref: "م")))
        XCTAssertTrue(SirahAdapters.acceptedEvidence(SirahEvidence(kind: "quran", text: "ن", ref: "م")))
        XCTAssertFalse(SirahAdapters.acceptedEvidence(SirahEvidence(kind: "quran", text: "ن", ref: " ")))
    }

    func testNationsSortedByEraAndHideUngradedHadith() throws {
        let rows: [SirahNation] = try decode(#"[{"slug":"b","name":"ب","place":"","era":"","eraOrder":null,"summary":"خ","chapters":[],"quranRefs":[],"hadiths":[],"lessons":[]},{"slug":"a","name":"أ","place":"م","era":"ع","eraOrder":1,"summary":"خ","chapters":[{"id":"c","title":"ف","body":["ف1"],"evidences":[{"kind":"hadith","text":"بلا درجة","ref":"م"}]}],"quranRefs":[{"surah":"س","ayahs":"1-2"}],"hadiths":[{"kind":"unverified","text":"مرفوض","ref":"م"}],"lessons":["ع1"]}]"#)
        let items = SirahAdapters.nations(rows)
        XCTAssertEqual(items.map(\.id), ["a", "b"])
        let body = items[0].body ?? ""
        XCTAssertFalse(body.contains("بلا درجة"))
        XCTAssertFalse(body.contains("مرفوض"))
        XCTAssertTrue(body.contains("سورة س: 1-2"))
    }

    func testOccasionsApprovedWithSourceOnly() throws {
        let rows: [SirahOccasion] = try decode(#"[{"id":"o1","eventName":"م","hijriMonth":9,"hijriDay":null,"verifiedDescription":"و","sourceName":"مص","reviewStatus":"approved"},{"id":"o2","eventName":"م","hijriMonth":1,"verifiedDescription":"و","sourceName":"مص","reviewStatus":"draft"},{"id":"o3","eventName":"م","hijriMonth":1,"verifiedDescription":"و","reviewStatus":"approved"}]"#)
        let items = SirahAdapters.occasions(rows)
        XCTAssertEqual(items.map(\.id), ["o1"])
        XCTAssertEqual(items[0].subtitle, "رمضان")
        XCTAssertTrue(items[0].body?.contains("المصدر: مص") == true)
    }

    func testProphetsVerifiedWithSourcesOnly() throws {
        let rows: [SirahKnowledgeItem] = try decode(#"[{"id":"prophet-nuh","title":"ن","body":"ب","sources":[{"book":"ك","author":"م"}],"review_status":"verified"},{"id":"prophet-x","title":"ن","body":"ب","sources":[{"book":"ك"}],"review_status":"needs_review"},{"id":"prophet-y","title":"ن","body":"ب","sources":[],"review_status":"verified"}]"#)
        let items = SirahAdapters.prophets(rows)
        XCTAssertEqual(items.map(\.id), ["nuh"])
        XCTAssertTrue(items[0].body?.contains("• ك، م") == true)
    }

    func testLineageFlattensDepthFirst() throws {
        let root: SirahLineageNode = try decode(#"{"id":"adam","name":"آ","children":[{"id":"a","name":"أ","isAncestor":true,"children":[{"id":"b","name":"ب","isUlulAzm":true}]},{"id":"c","name":"ج"}]}"#)
        let items = SirahAdapters.lineage(root)
        XCTAssertEqual(items.map(\.id), ["adam", "a", "b", "c"])
        XCTAssertEqual(items[2].subtitle, "من ذرية أ · من أولي العزم")
    }

    func testSahabahNeverShowsUnsourcedQuote() throws {
        let rows: [SirahSahabi] = try decode(#"[{"id":"s","name":"ص","icon":"x","category":["ف"],"born":"م","died":"و","origin":"ن","islam":"إ","fadl":"ف","quote":"قول بلا مصدر","legacy":["أ"]}]"#)
        let items = SirahAdapters.sahabah(rows)
        XCTAssertFalse(items[0].body?.contains("قول بلا مصدر") == true)
        XCTAssertEqual(items[0].tags, ["ف"])
    }

    func testShamailRequiresGradeAndSource() throws {
        let rows: [SirahShamailBab] = try decode(#"[{"id":"khalq-1","tab":"khalq","title":"ب","hadiths":[{"text":"ن","rawi":"ر","source":"م"}]},{"id":"khalq-2","tab":"khalq","title":"ب2","hadiths":[{"text":"ن","rawi":"ر","source":"م","grade":"د"},{"text":"ن2","grade":"د"}]}]"#)
        let items = SirahAdapters.shamail(rows)
        XCTAssertEqual(items.map(\.id), ["khalq-2"])
        XCTAssertEqual(items[0].body, "ن\n— ر، م، د")
        XCTAssertEqual(items[0].subtitle, "صفاته الخَلقية")
    }

    func testStoriesReviewedApprovedSourcedOnly() throws {
        let rows: [SirahStory] = try decode(#"[{"id":1,"slug":"a","title":"ق","full_content":"ن","sources":["م"],"is_approved":true,"editorial_review_status":"reviewed"},{"id":2,"slug":"b","title":"ق","full_content":"ن","sources":["م"],"is_approved":true,"editorial_review_status":"unreviewed"},{"id":3,"slug":"c","title":"ق","full_content":"ن","sources":[],"is_approved":true,"editorial_review_status":"reviewed"},{"id":4,"slug":"d","title":"ق","full_content":"ن","sources":["م"],"is_approved":false,"editorial_review_status":"reviewed"}]"#)
        XCTAssertEqual(SirahAdapters.stories(rows).map(\.id), ["a"])
    }

    func testHistoryExcludesNeedsReviewAndLabelsVerification() throws {
        let rows: [SirahHistoryItem] = try decode(#"[{"id":"h2","title":"ب","summary":"خ","detail":"ت","sources":["م"],"verification":"disputed","timelineOrder":2},{"id":"h1","title":"أ","summary":"خ","detail":"ت","sources":["م"],"verification":"confirmed","timelineOrder":1,"era":"ع"},{"id":"h3","title":"ج","summary":"خ","detail":"ت","sources":["م"],"verification":"needs-review"},{"id":"h4","title":"د","summary":"خ","detail":"ت","sources":[],"verification":"confirmed"}]"#)
        let items = SirahAdapters.history(rows)
        XCTAssertEqual(items.map(\.id), ["h1", "h2"])
        XCTAssertEqual(items[0].tags, ["ثابت", "ع"])
        XCTAssertEqual(items[1].tags, ["مختلف فيه"])
    }

    func testTeachersFromApprovedLessonsOnly() throws {
        let rows: [SirahLessonRow] = try decode(#"[{"id":"1","title":"د","speaker_name":"الشيخ أ","status":"approved"},{"id":"2","title":"د2","speaker_name":"الشيخ أ","status":"approved"},{"id":"3","title":"د3","speaker_name":"الشيخ ب"},{"id":"4","title":"د4","speaker_name":" ","status":"approved"}]"#)
        let links = SirahAdapters.teachers(rows)
        XCTAssertEqual(links.map(\.title), ["الشيخ أ"])
        XCTAssertEqual(links[0].subtitle, "درسان")
        let slug = links[0].id
        XCTAssertEqual(links[0].route, "/teachers/" + slug)
        XCTAssertEqual(SirahAdapters.teacher(slug: slug, rows: rows)?.title, "الشيخ أ")
        XCTAssertEqual(SirahAdapters.teacher(slug: slug, rows: rows)?.subtitle, "درسان")
        XCTAssertEqual(SirahAdapters.lessonCount(1), "درس واحد")
        XCTAssertEqual(SirahAdapters.lessonCount(5), "\(5.arabicDigits) دروس")
        XCTAssertEqual(SirahAdapters.lessonCount(15), "\(15.arabicDigits) درسًا")
        XCTAssertNil(SirahAdapters.teacher(slug: SirahAdapters.teacherSlug("الشيخ ب"), rows: rows))
    }

    @MainActor
    func testSectionRegistersEveryGeneratedIdAndResolvesParams() {
        let registry = TemplateRegistry()
        SirahSection.register(in: registry)
        for id in ["fikr-waqia", "islamic-landmarks", "islamic-landmarks.map", "nations", "occasions", "occasions-lessons",
                   "prophets", "prophets.tree", "sahabah", "seerah", "shamael", "stories", "tarikh-islami", "teachers"] {
            XCTAssertNotNil(registry.view(for: id), id)
        }
        for p in ["/islamic-landmarks/l1", "/nations/aad", "/tarikh-islami/x", "/teachers/a", "/prophets/nuh"] {   // قصة النبي بصفحتها (#3605)
            XCTAssertNotNil(SirahSection.resolve(path: p), p)
        }
        // خارج ROUTE_TEMPLATE_MAP: لا مسار تفاصيل؛ العنصر يُقرأ في شاشته.
        for p in ["/stories/s", "/sahabah/x", "/seerah/x", "/shamael/x", "/occasions/x", "/fikr-waqia/x"] {
            XCTAssertNil(SirahSection.resolve(path: p), p)
        }
        XCTAssertNil(SirahSection.resolve(path: "/prophets/tree"))
        XCTAssertNil(SirahSection.resolve(path: "/nations"))
        XCTAssertNil(SirahSection.resolve(path: "/quran/1"))
    }

    func testFullArticleJoinsItemsUnderTheirTitles() throws {
        let sections: [SirahDarsSection] = try decode(#"[{"id":"a","title":"ع1","lessons":[{"id":"a1","title":"ن1"}]},{"id":"b","title":"ع2","lessons":[{"id":"b1","title":"ن2"}]}]"#)
        let items = SirahAdapters.darsSections(sections)
        let article = SirahAdapters.article(items, id: "stories", title: "القصص")
        XCTAssertEqual(article?.id, "stories")
        XCTAssertEqual(article?.title, "القصص")
        XCTAssertTrue(article?.body?.hasPrefix("ع1") == true)
        XCTAssertTrue(article?.body?.contains("ع2") == true)
        XCTAssertNil(SirahAdapters.article([], id: "stories", title: "القصص"))
    }
}
