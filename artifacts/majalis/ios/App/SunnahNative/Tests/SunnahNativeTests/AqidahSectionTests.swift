import XCTest
@testable import SunnahNative

/// قسم «العقيدة والتزكية»: فكّ العقود، وقبول المحتوى، والبحث، والتوجيه، وطلب التواصل.
/// النصوص هنا عيّنات اختبار بنية فقط، لا محتوى يُعرض.
final class AqidahSectionTests: XCTestCase {
    private func decode<T: Decodable>(_ type: T.Type, _ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(json.utf8))
    }

    // MARK: فكّ العقود

    func testGroupDecodesAccordionLessonsAndTabItems() throws {
        let groups = try decode([AqidahGroup].self, """
        [{"id":"g1","num":"1","title":"أ","icon":"x","color":"y","lessons":[{"id":"g1-1","title":"ب","summary":"ملخص","body":" "}]},
         {"id":"g2","title":"ج","items":[{"id":"i1","title":"د","reference":"مرجع"}]}]
        """)
        XCTAssertEqual(groups.map(\.entries.count), [1, 1])
        XCTAssertEqual(groups[0].entries[0].summary, "ملخص")
        XCTAssertNil(groups[0].entries[0].body, "النص الفارغ = غير موجود")
        XCTAssertEqual(groups[1].entries[0].reference, "مرجع")
    }

    func testAsmaDecodesAndRejectsUnsourced() throws {
        let names = try decode([AsmaEntry].self, """
        [{"num":2,"arabic":"ب","meaning":"م","reference":"ر","benefit":"ف","status":"ثابت","category":"ج","documentation_status":"sourced"},
         {"num":1,"arabic":"أ","meaning":"م","reference":"ر","benefit":"ف","status":"مشهور","category":"ج"},
         {"num":3,"arabic":"ت","meaning":"م","reference":"ر","benefit":"ف","status":"ثابت","category":"ج","documentation_status":"unsourced"},
         {"num":4,"arabic":"ث","meaning":"م","reference":"  ","benefit":"ف","status":"ثابت","category":"ج"}]
        """)
        XCTAssertEqual(AqidahContent.accepted(names).map(\.num), [1, 2])
    }

    /// سجلات «قيد المراجعة»: تظهر بشارتها، وكل سجل مُسنَد بمراجع، ولا ألفاظ ممنوعة ولا أرقام هندية.
    func testSectsUnderReviewAreSourcedAndLabelled() throws {
        let url = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("content/native/islamic-sects-under-review.json")
        let raw = try Data(contentsOf: url)
        let sects = try JSONDecoder().decode([IslamicSect].self, from: raw)
        XCTAssertFalse(sects.isEmpty)
        XCTAssertEqual(AqidahContent.accepted(sects).count, sects.count)
        for s in sects {
            XCTAssertEqual(s.publicationStatus, AqidahContent.underReview, s.id)
            XCTAssertTrue((s.references ?? []).contains { $0.contains("shamela.ws") && $0.contains("ص") }, s.id)
            XCTAssertFalse(s.keyBeliefs.isEmpty, s.id)
        }
        let text = String(decoding: raw, as: UTF8.self)
        XCTAssertNil(text.range(of: "[٠-٩]", options: .regularExpression))
        XCTAssertFalse(text.contains("أذان"))
        let drafts = try decode([IslamicSect].self, "[{\"id\":\"d\",\"name\":\"n\",\"fullName\":\"n\",\"category\":\"c\",\"era\":\"\",\"origin\":\"\",\"founder\":\"\",\"foundingCause\":\"\",\"keyBeliefs\":[],\"keyBooks\":[],\"keyScholars\":[],\"status\":\"\",\"spread\":\"\",\"publicationStatus\":\"NEEDS_SHARIA_REVIEW\"}]")
        XCTAssertTrue(AqidahContent.accepted(drafts).isEmpty)
    }

    func testSectsShowPublishedOnly() throws {
        let base = #""name":"ن","fullName":"ن","category":"ك","era":"ع","origin":"أ","founder":"م","foundingCause":"س","keyBeliefs":[],"keyBooks":[],"keyScholars":[],"status":"قائمة","spread":"ا""#
        let sects = try decode([IslamicSect].self, "[{\"id\":\"a\",\(base),\"publicationStatus\":\"PUBLISHED\"},{\"id\":\"b\",\(base),\"publicationStatus\":\"DRAFT\"},{\"id\":\"c\",\(base)}]")
        XCTAssertEqual(AqidahContent.accepted(sects).map(\.id), ["a"])
    }

    func testDawahShapesDecodeSnakeCase() throws {
        let q = try decode([DawahQuestion].self, """
        [{"id":"1","slug":"s","title":"t","short_answer":"a","detailed_answer":"","evidences":[{"type":"quran","ref":"r","text":"x"}],"sources":[{"title":"k"}],"target_religion":null},
         {"id":"2","slug":"e","title":"t","short_answer":"","detailed_answer":""}]
        """)
        XCTAssertEqual(AqidahContent.accepted(q).map(\.slug), ["s"])
        XCTAssertEqual(q[0].evidences.first?.ref, "r")

        let d = try decode([DawahShubha].self, """
        [{"id":"1","slug":"s","title":"t","shubha_text":"x","short_answer":"a","detailed_refutation":"b","historical_linguistic_context":"h",
          "objections_and_responses":[{"objection":"o","response":"r"}],"conclusion":" "}]
        """)
        XCTAssertEqual(d[0].historicalLinguisticContext, "h")
        XCTAssertNil(d[0].conclusion)
        XCTAssertEqual(d[0].objectionsAndResponses.count, 1)

        let a = try decode([DawahArticle].self, #"[{"id":"1","slug":"s","title_ar":"t","body_ar":"b"},{"id":"2","slug":"e","title_ar":"t","body_ar":""}]"#)
        XCTAssertEqual(AqidahContent.accepted(a).map(\.slug), ["s"])

        let days = try decode([NewMuslimDay].self, """
        [{"id":"b","day_number":2,"audience":"all","title":"t","content_ar":"c"},{"id":"a","day_number":1,"audience":"all","title":"t","content_ar":"c"}]
        """)
        XCTAssertEqual(AqidahContent.accepted(days).map(\.dayNumber), [1, 2])
    }

    func testTawhidTopicDecodesBlocks() throws {
        let topics = try decode([TawhidTopic].self, """
        [{"id":"x","slug":"x","title":"t","description":"d","emoji":"e","blocks":[{"title":"b","body":"n","ayah":{"text":"a","ref":"r"},"hadith":{"text":"h","source":"s"}}]},
         {"id":"y","slug":"y","title":"t","description":"d","emoji":"e","blocks":[]}]
        """)
        XCTAssertEqual(AqidahContent.accepted(topics).map(\.slug), ["x"])
        XCTAssertEqual(topics[0].blocks[0].hadith?.source, "s")
    }

    // MARK: البحث العربي

    func testNormalizeUnifiesHamzaTashkeelAndTaMarbuta() {
        XCTAssertEqual(AqidahContent.normalize("الأَخْلاقُ"), AqidahContent.normalize("الاخلاق"))
        XCTAssertEqual(AqidahContent.normalize("رحمة"), AqidahContent.normalize("رحمه"))
        XCTAssertEqual(AqidahContent.normalize("موسى"), AqidahContent.normalize("موسي"))
        XCTAssertTrue(AqidahContent.matches("  ", ["أي شيء"]))
        XCTAssertTrue(AqidahContent.matches("اسماء", [nil, "الأسماء الحسنى"]))
        XCTAssertFalse(AqidahContent.matches("صلاة", ["الصبر"]))
    }

    func testFilterKeepsMatchingEntriesOrWholeGroup() {
        let groups = [
            AqidahGroup(id: "g1", title: "الصبر", entries: [AqidahEntry(id: "1", title: "أ"), AqidahEntry(id: "2", title: "ب")]),
            AqidahGroup(id: "g2", title: "أخرى", entries: [AqidahEntry(id: "3", title: "الصدق"), AqidahEntry(id: "4", title: "د", body: "عن الصدق")]),
        ]
        XCTAssertEqual(AqidahContent.filter(groups, query: "صبر").map(\.entries.count), [2])
        XCTAssertEqual(AqidahContent.filter(groups, query: "الصدق").first?.entries.map(\.id), ["3", "4"])
        XCTAssertTrue(AqidahContent.filter(groups, query: "لا يوجد").isEmpty)
        XCTAssertTrue(AqidahContent.accepted([AqidahGroup(id: "e", title: "ف", entries: [])]).isEmpty)
    }

    // MARK: التقدّم

    func testProgressRoundTrip() {
        XCTAssertEqual(AqidahContent.decodeProgress("3, 1,x,,2"), [1, 2, 3])
        XCTAssertEqual(AqidahContent.encodeProgress([3, 1, 2]), "1,2,3")
        XCTAssertEqual(AqidahContent.decodeProgress(""), [])
    }

    // MARK: التوجيه

    @MainActor
    func testDestinations() {
        XCTAssertEqual(AqidahSection.destination(path: "/discover-islam/articles/a"), .article(slug: "a"))
        XCTAssertEqual(AqidahSection.destination(path: "/discover-islam/doubts/b/"), .doubt(slug: "b"))
        XCTAssertEqual(AqidahSection.destination(path: "discover-islam/questions/c?x=1"), .question(slug: "c"))
        XCTAssertEqual(AqidahSection.destination(path: "/discover-islam/new-muslim/7"), .newMuslimDay(7))
        XCTAssertNil(AqidahSection.destination(path: "/discover-islam/new-muslim/x"))
        XCTAssertEqual(AqidahSection.destination(path: "/islamic-sects/ahl"), .sect(id: "ahl"))
        XCTAssertEqual(AqidahSection.destination(path: "/tawhid/wala-bara"), .tawhidTopic(slug: "wala-bara"))
        XCTAssertNil(AqidahSection.destination(path: "/tawhid"))
        XCTAssertNil(AqidahSection.destination(path: "/discover-islam/contact"))
        XCTAssertNil(AqidahSection.destination(path: "/tawhid/a/b"))
        XCTAssertNotNil(AqidahSection.resolve(path: "/tawhid/wala-bara"))
        XCTAssertNil(AqidahSection.resolve(path: "/akhlaq"))
    }

    @MainActor
    func testRegistersAll21ParamlessRoutes() {
        XCTAssertEqual(AqidahSection.ids.count, 21)
        let registry = TemplateRegistry()
        AqidahSection.register(in: registry)
        for id in AqidahSection.ids { XCTAssertNotNil(registry.view(for: id), id) }
    }

    func testSectionFilesLiveUnderDataAqidah() async {
        do {
            _ = try await ContentLoader(bundle: Bundle(for: Self.self)).load([AqidahGroup].self, from: AqidahGroupedScreen<AqidahAkhlaqPage>.source)
            XCTFail("expected throw")
        } catch {
            XCTAssertEqual(error as? ContentError, .missingBundledFile("Data/aqidah/akhlaq"))
        }
    }

    // MARK: طلب التواصل

    func testContactRequestValidationAndColumns() throws {
        XCTAssertThrowsError(try DawahContactRequest.make(name: "", isAnonymous: true, gender: "male", religion: "christian", country: "",
                                                          topic: "t", contactMethod: "email", contactValue: "v", consent: false)) {
            XCTAssertEqual($0 as? DawahContactRequest.Invalid, .consentRequired)
        }
        XCTAssertThrowsError(try DawahContactRequest.make(name: "", isAnonymous: true, gender: "male", religion: "christian", country: "",
                                                          topic: " ", contactMethod: "email", contactValue: "v", consent: true)) {
            XCTAssertEqual($0 as? DawahContactRequest.Invalid, .topicRequired)
        }
        let r = try DawahContactRequest.make(name: "اسم", isAnonymous: true, gender: "no_preference", religion: "prefer_not_to_say",
                                             country: " ", topic: " موضوع ", contactMethod: "email", contactValue: " a@b.c ",
                                             consent: true, trackingCode: "abc1234567")
        XCTAssertNil(r.name, "المجهول لا يُرسل اسمه")
        XCTAssertNil(r.country)
        XCTAssertEqual(r.topic, "موضوع")
        XCTAssertEqual(r.contactValue, "a@b.c")
        let json = try JSONSerialization.jsonObject(with: JSONEncoder().encode(r)) as? [String: Any]
        XCTAssertEqual(json?["tracking_code"] as? String, "abc1234567")
        XCTAssertEqual(json?["privacy_consent"] as? Bool, true)
        XCTAssertEqual(json?["preferred_daee_gender"] as? String, "no_preference")
        let generated = try DawahContactRequest.make(name: "", isAnonymous: false, gender: "male", religion: "jewish", country: "",
                                                     topic: "t", contactMethod: "phone", contactValue: "1", consent: true)
        XCTAssertEqual(generated.trackingCode.count, 10)
    }
}

