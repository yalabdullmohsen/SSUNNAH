import XCTest
@testable import SunnahNative

/// البحث في دليل الجامعات والفوائد والقالب العام متسامح مع الهمزات والشدة والتاء المربوطة (ArabicText)،
/// فـ«الازهر» تجد «جامعة الأزهر»، و«عمان» تجد «عمّان». كان localizedCaseInsensitiveContains يفرّق بينها.
final class LearnSearchNormalizeTests: XCTestCase {
    private func uni(_ ar: String, en: String? = nil, city: String? = nil) throws -> LearnUniversity {
        var o: [String: String] = ["slug": "s", "name_ar": ar]
        o["name_en"] = en; o["city"] = city
        return try JSONDecoder().decode(LearnUniversity.self, from: JSONSerialization.data(withJSONObject: o))
    }

    func testUniversityMatchesIgnoringHamzaAndShadda() throws {
        XCTAssertTrue(try uni("جامعة الأزهر").matches("الازهر"))
        XCTAssertTrue(try uni("جامعة أم القرى").matches("ام القري"))
        XCTAssertTrue(try uni("الجامعة الأردنية", city: "عمّان").matches("عمان"))
        XCTAssertTrue(try uni("جامعة", en: "Al-Azhar University").matches("azhar"))
        XCTAssertFalse(try uni("جامعة الأزهر").matches("القاهرة"))
    }

    func testFawaidSearchIsTolerant() throws {
        let all = try JSONDecoder().decode([LearnFaidah].self, from: Data(#"[{"id":"1","text":"العِلْمُ قبل القول","category":"ع","author_name":"الإمام أحمد"}]"#.utf8))
        XCTAssertEqual(LearnFaidah.filter(all, query: "العلم", category: nil).map(\.id), ["1"])
        XCTAssertEqual(LearnFaidah.filter(all, query: "الامام احمد", category: nil).map(\.id), ["1"])
    }

    func testSearchTemplateMatchesTitleSubtitleAndTags() {
        let item = ContentItem(id: "x", title: "إسطنبول", subtitle: "تركيا", tags: ["مدينة"])
        XCTAssertTrue(SearchTemplate.matches(item, query: "اسطنبول"))
        XCTAssertTrue(SearchTemplate.matches(item, query: "تركيا"))
        XCTAssertTrue(SearchTemplate.matches(item, query: "مدينه"))
        XCTAssertFalse(SearchTemplate.matches(item, query: "القاهرة"))
    }
}
