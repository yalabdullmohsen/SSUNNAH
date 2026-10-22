import XCTest
@testable import SunnahNative

/// تسميات الفقرات في SunnahMarkdown: لا يُقسَم سطر عريض كامل فيه نقطتان، ولا يبقى «**» خامًا في النص.
final class MarkdownLabelEdgeTests: XCTestCase {
    private func split(_ p: String) -> String {
        SunnahMarkdown.labeledParagraph(p).map { "\($0.0)|\($0.1)" } ?? "nil"
    }

    func testClosedBoldLabelsStillSplit() {
        XCTAssertEqual(split("**تنبيه:** نص"), "تنبيه|نص")
        XCTAssertEqual(split("**تنبيه**: نص"), "تنبيه|نص")
        XCTAssertEqual(split("**عن الدورة:**\nسطر ثانٍ"), "عن الدورة|سطر ثانٍ")
    }

    func testFullyBoldSentenceWithColonIsNotALabel() {
        XCTAssertEqual(split("**قال رسول الله ﷺ: إنما الأعمال بالنيات**"), "nil")
        XCTAssertEqual(split("**الساعة 10:30**"), "nil")
    }

    func testLabelWithInnerBoldMarkerIsRejected() {
        XCTAssertEqual(split("**تنبيه** مهم: نص"), "nil")
    }

    func testPlainKnownLabelsUnchanged() {
        XCTAssertEqual(split("فائدة: نص"), "فائدة|نص")
        XCTAssertEqual(split("جملة عادية: لا تقسّم"), "nil")
    }

    func testFullyBoldHadithStaysOneParagraphInSections() {
        let s = SunnahMarkdown.sections("**قال رسول الله ﷺ: إنما الأعمال بالنيات**")
        XCTAssertEqual(s.count, 1)
        XCTAssertNil(s[0].headingText)
        guard case .paragraph(let p)? = s[0].blocks.first else { return XCTFail("لا فقرة") }
        XCTAssertEqual(p, "**قال رسول الله ﷺ: إنما الأعمال بالنيات**")
    }
}
