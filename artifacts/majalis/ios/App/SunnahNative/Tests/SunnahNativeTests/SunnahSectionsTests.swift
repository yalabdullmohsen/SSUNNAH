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
        for h in ["الدليل", "أثر", "حديث"] {
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

    private let miracle = "قال تعالى: ﴿وَآيَةٌ لَّهُمُ﴾\n\nالإشارة المختصرة: إشارة قصيرة.\n\nخلاصة التفسير: خلاصة قصيرة.\n\nشرح إضافي.\n\nملاحظة للتفكر: ملاحظة.\n\nالمرجع: تفسير السعدي — يس.\n\nتنبيه: تنبيه قصير.\n\nالمصدر: مصدر آخر."

    func testLabeledParagraphsBecomeSections() {
        let s = SunnahMarkdown.sections(miracle)
        XCTAssertEqual(s.compactMap { $0.headingText }, ["الإشارة المختصرة", "خلاصة التفسير", "ملاحظة للتفكر", "تنبيه", "المصدر والمرجع"])
        XCTAssertNil(s[0].headingText); XCTAssertTrue(s[0].isProtected)
        XCTAssertEqual(s[2].blocks.count, 2, "الفقرة غير المسمّاة تتبع القسم السابق")
    }

    func testReferencesMergeAndSecondarySectionsStartCollapsed() {
        let s = SunnahMarkdown.sections(miracle)
        let ref = s.last!
        XCTAssertEqual(ref.blocks.count, 2); XCTAssertTrue(ref.startsCollapsed)
        XCTAssertTrue(s.first { $0.headingText == "تنبيه" }!.startsCollapsed)
        XCTAssertFalse(s.first { $0.headingText == "خلاصة التفسير" }!.startsCollapsed, "القصير غير الثانوي مفتوح")
        XCTAssertFalse(s[0].startsCollapsed, "الآية لا تُطوى")
    }

    func testBoldLabelBecomesSectionAndPlainSentenceDoesNot() {
        let s = SunnahMarkdown.sections("**عن الدورة:** وصف\n\nجملة عادية: لا تقسّم")
        XCTAssertEqual(s.first?.headingText, "عن الدورة")
        XCTAssertEqual(SunnahMarkdown.sections("جملة عادية: لا تقسّم").count, 1)
    }

    func testGenericWordsNoLongerProtectBodies() {
        let s = SunnahMarkdown.sections("## شرح\n\(long) هذه سورة وآية ومرجع")
        XCTAssertTrue(s[0].isCollapsible)
    }
}
