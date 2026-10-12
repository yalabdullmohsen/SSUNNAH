import XCTest
@testable import SunnahNative

/// قسم «الدروس والتعلم»: فكّ أشكال البيانات الحقيقية، منطق الأرشفة والمقارنة والمؤقّت، وحلّ المسارات.
final class LearnSectionTests: XCTestCase {
    private func decode<T: Decodable>(_ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(json.utf8))
    }

    /// artifacts/majalis — لفكّ ملفات المستودع الحقيقية عند توفرها (تُتخطّى خارج المستودع).
    private func repoFile(_ relative: String) throws -> Data {
        var url = URL(fileURLWithPath: #filePath)
        for _ in 0..<6 { url.deleteLastPathComponent() }
        let file = url.appendingPathComponent(relative)
        guard FileManager.default.fileExists(atPath: file.path) else { throw XCTSkip("غير موجود: \(relative)") }
        return try Data(contentsOf: file)
    }

    // MARK: الدروس

    func testLessonShapeAndLines() throws {
        let l: LearnLesson = try decode(#"{"id":"kw-1","title":"تفسير سورة النحل","speaker_name":"الشيخ","mosque":"مسجد موضي","region":"الصديق","city":"حولي","day_of_week":"الجمعة","lesson_time":"بعد المغرب","schedule":null,"end_date":null,"is_recurring":true,"keywords":null,"status":"approved"}"#)
        XCTAssertEqual(l.scheduleLine, "الجمعة — بعد المغرب")
        XCTAssertEqual(l.placeLine, "مسجد موضي، الصديق، حولي")
        XCTAssertEqual(l.listSubtitle, "الشيخ · الجمعة — بعد المغرب")
    }

    func testLessonArchiveSplit() throws {
        let now = ISO8601DateFormatter().date(from: "2026-10-11T12:00:00Z")!
        let past: LearnLesson = try decode(#"{"id":"a","title":"أ","end_date":"2026-07-16"}"#)
        let future: LearnLesson = try decode(#"{"id":"b","title":"ب","end_date":"2026-12-01"}"#)
        let oneOff: LearnLesson = try decode(#"{"id":"c","title":"ج","is_recurring":false,"start_date":"2026-10-01"}"#)
        let weekly: LearnLesson = try decode(#"{"id":"d","title":"د","is_recurring":true}"#)
        let pending: LearnLesson = try decode(#"{"id":"e","title":"هـ","status":"pending"}"#)
        let split = LearnLessonArchive.split([past, future, oneOff, weekly, pending], now: now)
        XCTAssertEqual(split.active.map(\.id), ["b", "d"])
        XCTAssertEqual(split.archived.map(\.id), ["a", "c"])
    }

    func testLessonEndOfDayIsKuwaitTime() {
        // 2026-10-11 23:59:59+03:00 = 20:59:59Z
        let end = LearnLessonArchive.endOfDay("2026-10-11")
        XCTAssertEqual(end, ISO8601DateFormatter().date(from: "2026-10-11T20:59:59Z"))
    }

    func testRealLessonsChunkDecodes() throws {
        let lessons = try JSONDecoder().decode([LearnLesson].self, from: repoFile("public/data/lessons/chunk-000.json"))
        XCTAssertFalse(lessons.isEmpty)
    }

    // MARK: الأسئلة

    func testQuizManifestChunkTitles() throws {
        let m: LearnQuizManifest = try decode(#"{"total":3,"chunks":[{"file":"السيرة_النبوية-012.json","count":3}]}"#)
        XCTAssertEqual(m.chunks[0].title, "السيرة النبوية")
        XCTAssertEqual(m.chunks[0].resourceName, "السيرة_النبوية-012")
    }

    func testRealQuizChunkDecodes() throws {
        let manifest = try JSONDecoder().decode(LearnQuizManifest.self, from: repoFile("public/data/quiz/manifest.json"))
        let first = try XCTUnwrap(manifest.chunks.first)
        let qs = try JSONDecoder().decode([LearnOpenQuestion].self, from: repoFile("public/data/quiz/" + first.file))
        XCTAssertEqual(qs.count, first.count)
    }

    func testOpenQuizFlow() {
        var s = LearnOpenQuizState(count: 2)
        s.grade(knewIt: true) // قبل الإظهار لا يُحتسب
        XCTAssertEqual(s.index, 0)
        s.reveal(); s.grade(knewIt: true)
        s.reveal(); s.grade(knewIt: false)
        XCTAssertTrue(s.finished); XCTAssertEqual(s.known, 1)
        s.restart()
        XCTAssertEqual(s, LearnOpenQuizState(count: 2))
    }

    // MARK: الأدلة

    func testRealUniversitiesDecode() throws {
        let list = try JSONDecoder().decode([LearnUniversity].self, from: repoFile("src/data/universities-catalog.json"))
        XCTAssertFalse(list.isEmpty)
        XCTAssertEqual(Set(list.map(\.slug)).count, list.count, "المعرّف slug فريد")
    }

    func testRealInstitutionsDecode() throws {
        let list = try JSONDecoder().decode([LearnInstitution].self, from: repoFile("src/data/institutions-catalog.json"))
        XCTAssertFalse(list.isEmpty)
        XCTAssertTrue(list.allSatisfy { $0.typeLabel != nil })
        // قرار المالك: الـ44 كلها needs_review فلا يُعرض منها شيء.
        XCTAssertTrue(list.filter(\.isReviewed).isEmpty)
    }

    func testCompareSelectionCapsAtFour() {
        var s = LearnCompareSelection()
        for slug in ["a", "b", "c", "d", "e"] { s.toggle(slug) }
        XCTAssertEqual(s.slugs, ["a", "b", "c", "d"])
        XCTAssertFalse(s.canAdd)
        s.toggle("b")
        XCTAssertEqual(s.slugs, ["a", "c", "d"])
    }

    func testUniversityDerivedFields() throws {
        let u: LearnUniversity = try decode(#"{"slug":"x","name_ar":"س","accreditation_status":"accredited","programs":[{"degree_level":"بكالوريوس","has_scholarship":true},{"degree_level":"بكالوريوس"},{"degree_level":"ماجستير"}]}"#)
        XCTAssertEqual(u.degreeLevels, ["بكالوريوس", "ماجستير"])
        XCTAssertTrue(u.offersScholarship)
        XCTAssertEqual(u.accreditationLabel, "موثّقة في الدليل")
    }

    // MARK: المعرفة

    func testRealGraphRelations() throws {
        let g = try JSONDecoder().decode(LearnKnowledgeGraph.self, from: repoFile("public/data/graph/links.json"))
        let linked = try XCTUnwrap(g.links.first)
        let node = try XCTUnwrap(g.node(linked.from))
        XCTAssertTrue(g.relations(of: node).contains { $0.node.kind == linked.to.kind && $0.node.slug == linked.to.slug })
        XCTAssertEqual(g.groups.reduce(0) { $0 + $1.nodes.count }, g.nodes.count)
    }

    func testKnowledgeFileShapes() throws {
        let item = #"{"id":"k1","title":"ع","body":"ن","evidences":[{"type":"ayah","ref":"1:1","text":"ت","grade":"","graded_by":""}],"sources":[],"tags":[],"review_status":"verified"}"#
        XCTAssertEqual(try (decode("[\(item)]") as LearnKnowledgeFile).items.count, 1)
        XCTAssertEqual(try (decode(#"{"items":[\#(item),\#(item)]}"#) as LearnKnowledgeFile).items.count, 2)
        let single: LearnKnowledgeFile = try decode(item)
        XCTAssertEqual(single.items.first?.evidences.first?.ref, "1:1")
        XCTAssertTrue(single.items[0].isVerified)
    }

    func testRealKnowledgeFilesDecode() throws {
        for section in ["history", "intro-islam", "nations", "prophets"] {
            let rel = try XCTUnwrap(LearnKnowledgeSections.files(for: section)?.first)
            let file = try JSONDecoder().decode(LearnKnowledgeFile.self, from: repoFile("public/data/knowledge/" + rel))
            XCTAssertFalse(file.items.isEmpty, section)
        }
    }

    func testSourcesAreBundledOnly() {
        // مراجعة المحتوى: لا جلب من الموقع؛ الدروس والمعرفة من الحزمة المحقَّقة فقط.
        guard case .bundled("chunk-000", "Data/lessons"?) = LearnSources.lessons else { return XCTFail("الدروس ليست محزومة") }
        guard case .bundled("adam", "Data/knowledge/prophets"?) = LearnSources.knowledge("prophets/adam.json") else { return XCTFail("مسار نبي") }
        guard case .bundled("history", "Data/knowledge"?) = LearnSources.knowledge("history.json") else { return XCTFail("ملف جذري") }
        guard case .bundled("surah-003-batch-08", "Data/knowledge/tafsir/ayahs"?) = LearnSources.knowledge("tafsir/ayahs/surah-003-batch-08.json") else { return XCTFail("مسار متداخل") }
    }

    func testUnexportedKnowledgeIsEmptyNotError() async throws {
        let loader = ContentLoader(bundle: Bundle(for: Self.self))
        let items = try await LearnSources.loadKnowledge(section: "history", with: loader)
        XCTAssertTrue(items.isEmpty)
    }

    func testKnowledgeSectionFiles() {
        XCTAssertEqual(LearnKnowledgeSections.files(for: "quiz")?.first, "quiz/batch-001.json")
        XCTAssertEqual(LearnKnowledgeSections.files(for: "tafsir")?.last, "tafsir/ayahs/surah-003-batch-08.json")
        XCTAssertEqual(LearnKnowledgeSections.files(for: "prophets")?.count, 23)
        XCTAssertNil(LearnKnowledgeSections.files(for: "nope"))
        for s in LearnKnowledgeSections.titles.keys { XCTAssertNotNil(LearnKnowledgeSections.files(for: s), s) }
    }

    // MARK: غرفة المذاكرة

    func testStudyTimerCycle() {
        let t0 = Date(timeIntervalSince1970: 0)
        var t = LearnStudyTimer()
        XCTAssertEqual(t.remaining(at: t0), 25 * 60)
        t.start(at: t0)
        t.pause(at: t0.addingTimeInterval(60))
        XCTAssertEqual(t.remaining(at: t0.addingTimeInterval(500)), 24 * 60, "الإيقاف يجمّد المتبقي")
        t.start(at: t0.addingTimeInterval(600))
        t.advanceIfDue(at: t0.addingTimeInterval(600 + 24 * 60))
        XCTAssertEqual(t.phase, .rest); XCTAssertEqual(t.completedWork, 1)
        XCTAssertEqual(t.remaining(at: t0.addingTimeInterval(600 + 24 * 60)), 5 * 60)
        t.reset()
        XCTAssertEqual(t.phase, .idle)
    }

    // MARK: المسارات

    func testResolveRoutes() {
        for p in ["/lessons", "/lessons/archive", "/lessons/kw-1", "/kuwait-lessons", "/quiz", "/competitions", "/competitions/x",
                  "/universities", "/universities/compare", "/universities/islamic-university-madinah", "/institutions",
                  "/knowledge-graph", "/knowledge/history", "/durus-imaniyya", "/durus-mutanawwia", "/study-room", "/lessons/?x=1",
                  "/fawaid", "/flashcards", "/my-learning", "/progress", "/reading-plans", "/researcher", "/annual-courses/c-1"] {
            XCTAssertNotNil(LearnSection.resolve(path: p), p)
        }
        XCTAssertNotNil(LearnSection.resolve(path: "/knowledge/nope"), "قسم معرفة مجهول يعرض حالة «غير موجود» لا placeholder")
        for p in ["/", "/lessons/a/b", "/annual-courses", "/learning-plan"] {
            XCTAssertNil(LearnSection.resolve(path: p), p)
        }
    }

    @MainActor func testRegisterCoversNonParamRoutes() {
        let registry = TemplateRegistry()
        LearnSection.register(in: registry)
        for id in LearnSection.screenIds.values { XCTAssertNotNil(registry.view(for: id), id) }
    }

    func testAllTwentyThreeMapRoutesAreNative() {
        // الـ23 المبقاة للقسم في docs/native/ROUTE_TEMPLATE_MAP.json — كلها أصلية، ولا مسار خارجها.
        let all = Set(LearnSection.screenIds.keys).union(LearnSection.paramRoutes)
        XCTAssertEqual(all.count, 23)
        XCTAssertEqual(LearnSection.screenIds.count + LearnSection.paramRoutes.count, 23)
    }

    // MARK: بطاقات المراجعة

    func testSM2MatchesWeb() {
        var s = LearnSM2.State()
        s = LearnSM2.review(s, quality: 4); XCTAssertEqual(s, LearnSM2.State(intervalDays: 1, easeFactor: 2.5, repetitions: 1))
        s = LearnSM2.review(s, quality: 4); XCTAssertEqual(s, LearnSM2.State(intervalDays: 6, easeFactor: 2.5, repetitions: 2))
        s = LearnSM2.review(s, quality: 5); XCTAssertEqual(s, LearnSM2.State(intervalDays: 15, easeFactor: 2.6, repetitions: 3))
        s = LearnSM2.review(s, quality: 0); XCTAssertEqual(s, LearnSM2.State(intervalDays: 1, easeFactor: 1.8, repetitions: 0))
        XCTAssertEqual(LearnSM2.review(LearnSM2.State(intervalDays: 1, easeFactor: 1.3, repetitions: 0), quality: 0).easeFactor, 1.3, "حد أدنى 1.3")
    }

    func testNextReviewIsUTCMidnightPlusDays() {
        let now = ISO8601DateFormatter().date(from: "2026-10-11T20:00:00Z")!
        XCTAssertEqual(LearnSM2.nextReview(from: now, days: 1), ISO8601DateFormatter().date(from: "2026-10-12T00:00:00Z"))
    }

    func testFlashcardSessionDueFirstThenNew() throws {
        let hs: [LearnHadith] = try decode(#"[{"id":"a","text":"أ"},{"id":"b","text":"ب"},{"id":"c","text":"ج"},{"id":"d","text":"د"}]"#)
        let t0 = Date(timeIntervalSince1970: 1_800_000_000)
        var deck = LearnFlashcardDeck()
        deck.record("c", quality: 0, now: t0)          // مستحقة غدًا
        deck.record("a", quality: 4, now: t0)          // مستحقة غدًا أيضًا
        deck.record("b", quality: 5, now: t0)
        deck.record("b", quality: 5, now: t0)          // بعد 6 أيام
        let tomorrow = t0.addingTimeInterval(2 * 86_400)
        XCTAssertEqual(deck.session(from: hs, now: tomorrow, limit: 10).map(\.id).sorted(), ["a", "c", "d"])
        XCTAssertEqual(deck.session(from: hs, now: tomorrow, limit: 10).last?.id, "d", "الجديدة بعد المستحقة")
        XCTAssertEqual(deck.session(from: hs, now: tomorrow, limit: 1).count, 1)
        XCTAssertEqual(deck.stats(now: tomorrow), LearnFlashcardDeck.Stats(total: 3, due: 2, mastered: 0))
    }

    func testHadithAttribution() throws {
        let h: LearnHadith = try decode(#"{"id":"x","text":"ن","narrator":"أنس","source_name":"البخاري (13)","grade":"صحيح"}"#)
        XCTAssertEqual(h.attribution, "رواه: أنس\nالمصدر: البخاري (13)\nالدرجة: صحيح")
        let bare: LearnHadith = try decode(#"{"id":"y","text":"ن"}"#)
        XCTAssertEqual(bare.attribution, "حديث موثّق")
    }

    func testRealSahihFileDecodes() throws {
        let list = try JSONDecoder().decode([LearnHadith].self, from: repoFile("public/data/hadith-verified/sahih-004.json"))
        XCTAssertFalse(list.isEmpty)
    }

    // MARK: خطط القراءة

    func testReadingPlanPace() {
        var cal = Calendar(identifier: .gregorian); cal.timeZone = TimeZone(identifier: "UTC")!
        let f = ISO8601DateFormatter()
        // 2026-10-03 سبت … 2026-10-16 جمعة: أسبوعان، القراءة السبت والاثنين والأربعاء ⇒ 6 أيام.
        var plan = LearnReadingPlan(bookTitle: "ك", totalPages: 60, startDate: f.date(from: "2026-10-03T00:00:00Z")!,
                                    endDate: f.date(from: "2026-10-16T00:00:00Z")!, readingDays: [7, 2, 4], dailyMinutes: 30)
        XCTAssertEqual(plan.readingDayCount(from: plan.startDate, to: plan.endDate, calendar: cal), 6)
        let mid = f.date(from: "2026-10-08T12:00:00Z")!   // مضى 3 أيام قراءة (السبت والاثنين والأربعاء)
        XCTAssertEqual(plan.expectedPage(at: mid, calendar: cal), 30)
        XCTAssertEqual(plan.pace(at: mid, calendar: cal), .behind)
        XCTAssertEqual(plan.pagesPerRemainingDay(at: mid, calendar: cal), 20, "60 صفحة على 3 أيام متبقية (الخميس ليس منها)")
        plan.logPage(40, at: mid)
        XCTAssertEqual(plan.pace(at: mid, calendar: cal), .ahead)
        plan.logPage(999, at: mid)
        XCTAssertEqual(plan.currentPage, 60); XCTAssertEqual(plan.status, .completed); XCTAssertEqual(plan.log.count, 2)
    }

    // MARK: التخزين المحلي

    func testLocalStoreRoundTripAndClear() throws {
        let suite = "learn.tests.\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        let store = LearnLocalStore(defaults: defaults)
        // ثوانٍ صحيحة: ISO8601 لا يحفظ أجزاء الثانية، فالمقارنة بعد الحفظ تحتاج تاريخًا بلا كسور.
        let now = Date(timeIntervalSince1970: 1_800_000_000)
        var deck = LearnFlashcardDeck(); deck.record("a", quality: 5, now: now)
        store.save(deck, .flashcards)
        store.save([LearnReadingPlan(bookTitle: "ك", totalPages: 10, startDate: Date(), endDate: Date(), readingDays: [1], dailyMinutes: 10)], .readingPlans)
        store.save(3, .studyCycles)
        XCTAssertEqual(store.load(LearnFlashcardDeck.self, .flashcards), deck)
        let summary = LearnLocalSummary.read(from: store, now: now)
        XCTAssertEqual(summary.flashcards.total, 1); XCTAssertEqual(summary.activePlans.count, 1); XCTAssertEqual(summary.studyCycles, 3)
        store.clearAll()
        XCTAssertEqual(LearnLocalSummary.read(from: store), LearnLocalSummary(flashcards: .init(), activePlans: [], studyCycles: 0))
    }

    func testResearcherProfileCleaning() {
        var p = LearnResearcherProfile(displayName: "  س  ", publications: ["", " بحث "])
        p.toggleInterest("أصول الفقه"); p.toggleInterest("علم الرجال"); p.toggleInterest("أصول الفقه")
        XCTAssertEqual(p.interests, ["علم الرجال"])
        XCTAssertEqual(p.cleaned.displayName, "س"); XCTAssertEqual(p.cleaned.publications, ["بحث"])
    }

    // MARK: الفوائد والدورات

    func testInstitutionsShowReviewedOnly() throws {
        let list: [LearnInstitution] = try decode(#"[{"id":"a","name":"أ","contentStatus":"needs_review"},{"id":"b","name":"ب","contentStatus":"verified"},{"id":"c","name":"ج"}]"#)
        XCTAssertEqual(list.filter(\.isReviewed).map(\.id), ["b"])
    }

    func testFawaidHideSourceless() throws {
        let all: [LearnFaidah] = try decode(#"[{"id":"1","text":"ف","category":"فوائد فقهية","source":"المغني"},{"id":"2","text":"ب","category":"فوائد فقهية"},{"id":"3","text":"ج","author_name":"ابن القيم","category":"الأخلاق"}]"#)
        XCTAssertEqual(LearnFaidah.filter(all, query: "", category: nil).map(\.id), ["1", "3"])
        XCTAssertEqual(LearnFaidah.filter(all, query: "", category: "الأخلاق").map(\.id), ["3"])
        XCTAssertEqual(LearnFaidah.filter(all, query: "المغني", category: nil).map(\.id), ["1"])
    }

    func testAnnualCourseDecodeAndFind() throws {
        let all: [LearnAnnualCourse] = try decode(#"[{"id":"u1","external_key":"course-x","title":"د","year":2026,"season":"1447هـ","schedule":[{"day":"السبت","time":"بعد المغرب"}],"status":"approved"},{"id":"u2","title":"هـ","year":"1447","status":"pending"}]"#)
        XCTAssertEqual(all[0].year, "2026"); XCTAssertEqual(all[1].year, "1447")
        XCTAssertEqual(LearnAnnualCourse.find("course-x", in: all)?.id, "u1")
        XCTAssertNil(LearnAnnualCourse.find("u2", in: all), "غير المعتمد لا يُعرض")
        XCTAssertEqual(all[0].metaLine, "1447هـ · 2026")
    }

    func testUnexportedListsAreEmpty() async throws {
        let loader = ContentLoader(bundle: Bundle(for: Self.self))
        let f = try await LearnSources.loadIfExported([LearnFaidah].self, from: LearnSources.fawaid, with: loader)
        XCTAssertTrue(f.isEmpty)
    }

    // MARK: شكل ContentItem المُصدَّر (#3010)

    func testInstitutionsDecodeFlatShapeWithPendingBadge() throws {
        let list: [LearnInstitution] = try decode(#"[{"id":"a","title":"المسجد الحرام","subtitle":"مكة","body":"و","tags":["mosque","قيد المراجعة","needs_review"],"route":"https://x.sa"},{"id":"b","title":"ب","tags":["library","معتمد"]}]"#)
        XCTAssertEqual(list.map(\.name), ["المسجد الحرام", "ب"])
        XCTAssertEqual(list[0].type, "mosque"); XCTAssertEqual(list[0].website, "https://x.sa"); XCTAssertEqual(list[0].city, "مكة")
        XCTAssertEqual(list.map(\.isReviewed), [false, true])
    }

    func testFawaidAndCoursesDecodeFlatShape() throws {
        let f: [LearnFaidah] = try decode(#"[{"id":"f1","title":"ع","subtitle":"القرآن","body":"نص الفائدة","tags":["عقيدة","verified"]}]"#)
        XCTAssertEqual(f[0].text, "نص الفائدة"); XCTAssertEqual(f[0].source, "القرآن"); XCTAssertEqual(f[0].category, "عقيدة")
        XCTAssertEqual(LearnFaidah.filter(f, query: "", category: nil).count, 1)
        let c: [LearnAnnualCourse] = try decode(#"[{"id":"c1","title":"دورة","subtitle":"1447هـ","body":"**عن**","tags":["سنوية"]}]"#)
        XCTAssertEqual(c[0].summary, "1447هـ"); XCTAssertEqual(c[0].courseType, "سنوية"); XCTAssertNotNil(LearnAnnualCourse.find("c1", in: c))
    }

    func testDarsListGroupsFlatItemsByFirstTagAndKeepsRawShape() throws {
        let flat: LearnDarsList = try decode(#"[{"id":"1","title":"أ","subtitle":"م","body":"باب «أ»: م","tags":["قلوب"]},{"id":"2","title":"ب","tags":["عقيدة"]},{"id":"3","title":"ج","tags":["قلوب"]}]"#)
        XCTAssertEqual(flat.sections.map(\.title), ["قلوب", "عقيدة"])
        XCTAssertEqual(flat.sections[0].lessons.map(\.id), ["1", "3"]); XCTAssertNil(flat.sections[0].lessons[0].body)
        let raw: LearnDarsList = try decode(#"[{"id":"s","title":"ع","lessons":[{"id":"l","title":"د"}]}]"#)
        XCTAssertEqual(raw.sections.first?.lessons.count, 1)
    }
}
