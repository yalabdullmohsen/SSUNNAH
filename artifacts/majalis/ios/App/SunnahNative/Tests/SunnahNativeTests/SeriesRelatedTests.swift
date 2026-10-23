import XCTest
@testable import SunnahNative

/// روابط «مرتبط» في القارئ المتسلسل: تُبنى من كلمات تامة في النص، لا من أجزاء كلمات أخرى.
final class SeriesRelatedTests: XCTestCase {
    private func routes(_ text: String) -> [String] { SeriesRelated.sections(in: text).map(\.route) }

    func testPartOfAnotherWordDoesNotLink() {
        XCTAssertEqual(routes("كُتبت الآيات بالرسم العثماني"), [], "«عثمان» داخل «العثماني»")
        XCTAssertEqual(routes("ذكر آل عمران"), [], "«عمر» داخل «عمران»")
        XCTAssertEqual(routes("خرج في عمرة القضاء وعمره ستون"), [])
        XCTAssertEqual(routes("أبرز الأحداث في هذه المرحلة"), [], "«أحد» داخل «الأحداث»")
        XCTAssertEqual(routes("قالت الطائفة الأخرى"), [], "«الطائف» داخل «الطائفة»")
    }

    func testWholeWordsWithAttachedPrefixesLink() {
        XCTAssertEqual(routes("هاجر إلى المدينة"), ["/islamic-landmarks"])
        XCTAssertEqual(routes("وُلد بمكة"), ["/islamic-landmarks"])
        XCTAssertEqual(routes("غزوة أحد"), ["/islamic-landmarks"])
        XCTAssertEqual(routes("وعمر بن الخطاب"), ["/sahabah"])
        XCTAssertEqual(routes("في الحديث الصحيح"), ["/hadith"])
        XCTAssertEqual(routes("قال رسول الله: «…»"), ["/hadith"])
        XCTAssertEqual(routes("عن أبو بكر،"), ["/sahabah"])
    }

    func testOneLinkPerSectionInTableOrder() {
        XCTAssertEqual(routes("حديث عن موسى وعمر في مكة والمدينة"), ["/islamic-landmarks", "/sahabah", "/prophets", "/hadith"])
    }

    func testPeopleUseWholeWordsDedupAndLimit() {
        let known: [(name: String, route: String)] = [("عمر", "/s/omar"), ("عمران", "/s/imran"), ("الفاروق", "/s/omar"), ("بلال", "/s/bilal")]
        XCTAssertEqual(SeriesRelated.people(in: "آل عمران", from: known).map(\.route), ["/s/imran"])
        XCTAssertEqual(SeriesRelated.people(in: "قال عمر الفاروق وبلال", from: known).map(\.title), ["عمر", "بلال"])
        XCTAssertEqual(SeriesRelated.people(in: "عمر وبلال", from: known, limit: 1).count, 1)
    }

    func testMentionsEdges() {
        XCTAssertFalse(SeriesRelated.mentions("نص", ""))
        XCTAssertTrue(SeriesRelated.mentions("مكة", "مكة"))
        XCTAssertTrue(SeriesRelated.mentions("(مكة)", "مكة"))
        XCTAssertTrue(SeriesRelated.mentions("عمران ثم عمر", "عمر"), "يتجاوز الورود الجزئي إلى التام بعده")
        XCTAssertTrue(SeriesRelated.mentions("قال عمرُ بن الخطاب", "عمر"), "التشكيل بعد الكلمة لا يجعلها جزءًا من غيرها")
        XCTAssertFalse(SeriesRelated.mentions("آلُ عِمران", "عمران"), "تشكيل داخل الكلمة لا يطابق (كما قبل)")
    }
}
