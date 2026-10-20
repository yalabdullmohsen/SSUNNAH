import XCTest
@testable import SunnahNative

final class DisclosureTests: XCTestCase {
    func testShortIsVerbatimAndLongExtendsIt() {
        XCTAssertTrue(SunnahDisclosure.short.hasPrefix("أُعدّ محتوى هذا التطبيق بمساعدة الذكاء الاصطناعي"))
        XCTAssertTrue(SunnahDisclosure.short.hasSuffix("فاضغطوا «إبلاغ عن خطأ»."))
        XCTAssertGreaterThan(SunnahDisclosure.long.count, SunnahDisclosure.short.count)
        XCTAssertTrue(SunnahDisclosure.long.contains("من إعداد سُنّة"))
    }

    /// الإفصاح في ورقة «!» تفتحها ضغطة المستخدم عبر الذيل الموحّد، لا إشعارًا فوق زر الإبلاغ (حارس scripts/native-detail-guard.mjs).
    func testDisclosureLivesInFooterSheetNotAboveReportButton() throws {
        // نسبةً إلى حزمة SunnahNative نفسها (…/Tests/SunnahNativeTests/<ملف>) فلا يتأثر بعمق المسار (worktree).
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<3 { root.deleteLastPathComponent() }
        let comps = root.appendingPathComponent("Sources/SunnahNative/Components")
        let button = try String(contentsOf: comps.appendingPathComponent("SunnahReportIssueButton.swift"), encoding: .utf8)
        let footer = try String(contentsOf: comps.appendingPathComponent("SunnahContentFooter.swift"), encoding: .utf8)
        XCTAssertFalse(button.contains("SunnahDisclosureNotice("), "الإشعار ممنوع فوق زر الإبلاغ")
        XCTAssertTrue(footer.contains("SunnahDisclosureInfoButton("), "الذيل الموحّد لا يحمل ورقة الإفصاح")
    }
}
