import XCTest
@testable import SunnahNative

/// أقسام الطيّ: المقدمة مفتوحة، الطويل يُطوى، والنص الشرعي ومصدره لا يُطوى أبدًا.
final class SunnahSectionsTests: XCTestCase {
    private let long = String(repeating: "جملة تعريفية عادية للاختبار فقط. ", count: 14)

    func testIntroStaysOpenAndLongPlainSectionStartsCollapsed() {
        let s = SunnahMarkdown.sections("مقدمة قصيرة\n\n## تفاصيل\n\(long)")
        XCTAssertEqual(s.count, 2)
        XCTAssertNil(s[0].headingText); XCTAssertFalse(s[0].startsCollapsed)
        XCTAssertTrue(s[1].isCollapsible); XCTAssertTrue(s[1].startsCollapsed)
    }

    func testShortSectionStartsOpen() {
        let s = SunnahMarkdown.sections("مقدمة\n\n## موجز\nسطر قصير.")
        XCTAssertTrue(s[1].isCollapsible); XCTAssertFalse(s[1].startsCollapsed)
    }

    func testQuoteSectionIsProtected() {
        let s = SunnahMarkdown.sections("## نص\n> اقتباس\n\(long)")
        XCTAssertTrue(s[0].isProtected); XCTAssertFalse(s[0].isCollapsible); XCTAssertFalse(s[0].startsCollapsed)
    }

    func testShariaMarkersAndSourceHeadingsAreProtected() {
        for body in ["﴿ نص ﴾", "رواه البخاري", "قال رسول الله", "ﷺ"] {
            let s = SunnahMarkdown.sections("## قسم\n\(long)\n\(body)")
            XCTAssertFalse(s[0].isCollapsible, body)
        }
        for h in ["الدليل", "المصادر", "أثر", "حديث"] {
            let s = SunnahMarkdown.sections("## \(h)\n\(long)")
            XCTAssertFalse(s[0].startsCollapsed, h)
        }
    }

    func testPageIsNeverFullyCollapsed() {
        let s = SunnahMarkdown.sections("## أ\n\(long)\n\n## ب\n\(long)")
        XCTAssertTrue(s.contains { !$0.startsCollapsed })
    }

    func testNoTextIsLost() {
        let src = "مقدمة\n\n## أ\nنص أ\n\n### ب\n- بند\n> اقتباس"
        let joined = SunnahMarkdown.sections(src).flatMap { $0.allBlocks }
        XCTAssertEqual(joined, SunnahMarkdown.blocks(src))
    }
}
