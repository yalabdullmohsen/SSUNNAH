import XCTest
import SwiftUI
@testable import SunnahNative

/// فهرس القفز للقوائم الطويلة: حرف العنوان بعد التطبيع، وتجميع الصفوف المتجاورة، وعدم التفعيل لغير الأبجدي أو القصير.
final class JumpIndexGroupingTests: XCTestCase {
    private func key(_ t: String) -> String { SunnahJumpIndex<EmptyView>.key(for: t) }
    private func items(_ titles: [String]) -> [ContentItem] { titles.enumerated().map { ContentItem(id: "\($0.offset)", title: $0.element) } }
    /// 31 صفًا (فوق الحد 30) بالأحرف المعطاة بالترتيب، كل حرف مكرر بقدر ما يلزم.
    private func padded(_ letters: [String]) -> [ContentItem] {
        let per = 31 / letters.count + 1
        return items(letters.flatMap { l in (0..<per).map { "\(l)عنوان \($0)" } })
    }

    func testKeyNormalizesHamzaAndDiacritics() {
        XCTAssertEqual(key("أحكام"), "ا")
        XCTAssertEqual(key("إيمان"), "ا")
        XCTAssertEqual(key("آداب"), "ا")
        XCTAssertEqual(key("  بَيان"), "ب")
    }

    func testKeySkipsLeadingDigitsAndPunctuation() {
        XCTAssertEqual(key("١٠ وصايا"), "و")
        XCTAssertEqual(key("«تنبيه»"), "ت")
    }

    func testKeyWithoutLettersIsHash() {
        XCTAssertEqual(key(""), "#")
        XCTAssertEqual(key("   "), "#")
        XCTAssertEqual(key("123"), "#")
    }

    func testShortListHasNoIndex() {
        XCTAssertTrue(ListTemplate.contiguousGroups(items((0..<30).map { "ا\($0)" })).isEmpty, "30 صفًا بالضبط لا تتجاوز الحد")
    }

    func testAlphabeticalListGroupsContiguousRuns() {
        let g = ListTemplate.contiguousGroups(padded(["ا", "ب", "ت"]))
        XCTAssertEqual(g.map(\.key), ["ا", "ب", "ت"])
        XCTAssertEqual(g.reduce(0) { $0 + $1.items.count }, padded(["ا", "ب", "ت"]).count)
    }

    func testNonAlphabeticalListDisablesIndex() {
        XCTAssertTrue(ListTemplate.contiguousGroups(padded(["ا", "ب", "ا"])).isEmpty, "حرف يعود بعد غيره: لا فهرس")
    }
}
