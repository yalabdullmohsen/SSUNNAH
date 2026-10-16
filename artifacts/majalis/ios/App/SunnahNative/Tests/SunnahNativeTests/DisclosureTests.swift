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
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<8 { root.deleteLastPathComponent() }
        let p = root.appendingPathComponent("artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Components/SunnahReportIssueButton.swift")
        XCTAssertTrue(try String(contentsOf: p, encoding: .utf8).contains("SunnahDisclosureNotice("))
    }
}
