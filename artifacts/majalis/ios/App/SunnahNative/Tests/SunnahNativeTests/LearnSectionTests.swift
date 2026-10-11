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
                  "/knowledge-graph", "/knowledge/history", "/durus-imaniyya", "/durus-mutanawwia", "/study-room", "/lessons/?x=1"] {
            XCTAssertNotNil(LearnSection.resolve(path: p), p)
        }
        for p in ["/", "/fawaid", "/knowledge/nope", "/lessons/a/b", "/progress"] {
            XCTAssertNil(LearnSection.resolve(path: p), p)
        }
    }

    @MainActor func testRegisterCoversNonParamRoutes() {
        let registry = TemplateRegistry()
        LearnSection.register(in: registry)
        for id in LearnSection.screenIds.values { XCTAssertNotNil(registry.view(for: id), id) }
    }

    func testEveryLearnRouteIsHandledOrPending() {
        // الـ23 من FEATURE_PARITY: 16 أصلية + 7 تنتظر منفذًا.
        let handled = Set(LearnSection.screenIds.keys).union(["/competitions/:id", "/knowledge/:section", "/lessons/:id", "/universities/:slug"])
        XCTAssertEqual(handled.count, 16)
        XCTAssertTrue(handled.isDisjoint(with: LearnSection.pendingRoutes))
        XCTAssertEqual(handled.count + Set(LearnSection.pendingRoutes).count, 23)
    }
}
