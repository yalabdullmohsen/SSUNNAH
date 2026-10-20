import XCTest
@testable import SunnahNative

final class DisclosureTests: XCTestCase {
    func testShortIsVerbatimAndLongExtendsIt() {
        XCTAssertTrue(SunnahDisclosure.short.hasPrefix("أُعدّ محتوى هذا التطبيق بمساعدة الذكاء الاصطناعي"))
        XCTAssertTrue(SunnahDisclosure.short.hasSuffix("فاضغطوا «إبلاغ عن خطأ»."))
        XCTAssertGreaterThan(SunnahDisclosure.long.count, SunnahDisclosure.short.count)
        XCTAssertTrue(SunnahDisclosure.long.contains("من إعداد سُنّة"))
    }

    /// الإشعار يظهر في كل أنواع التفاصيل: كل شاشة تمرّ بزر الإبلاغ الذي يحمله، والحارس يفرض ذلك (scripts/native-detail-guard.mjs).
    func testReportButtonCarriesDisclosure() throws {
        // نسبةً إلى حزمة SunnahNative نفسها (…/Tests/SunnahNativeTests/<ملف>) فلا يتأثر بعمق المسار (worktree).
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<3 { root.deleteLastPathComponent() }
        let p = root.appendingPathComponent("Sources/SunnahNative/Components/SunnahReportIssueButton.swift")
        XCTAssertTrue(try String(contentsOf: p, encoding: .utf8).contains("SunnahDisclosureNotice("))
    }
}
