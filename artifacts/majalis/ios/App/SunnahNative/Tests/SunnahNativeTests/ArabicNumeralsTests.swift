import XCTest
@testable import SunnahNative

final class ArabicNumeralsTests: XCTestCase {
    func testConvert() {
        XCTAssertEqual(ArabicNumerals.convert("36:1"), "٣٦:١")
        XCTAssertEqual(ArabicNumerals.convert("صفحة 440"), "صفحة ٤٤٠")
        XCTAssertEqual(ArabicNumerals.convert("البقرة: 255"), "البقرة: ٢٥٥")
        XCTAssertEqual(ArabicNumerals.convert(""), "")
        XCTAssertEqual(ArabicNumerals.convert("٣ abc"), "٣ abc")
        XCTAssertEqual(604.arabicDigits, "٦٠٤")
        XCTAssertEqual(0.arabicDigits, "٠")
        XCTAssertEqual("2:255".arabicDigits, "٢:٢٥٥")
    }
    func testNoLatinDigitsInOutput() {
        for n in [0, 7, 15, 114, 604, 6236] {
            XCTAssertNil(n.arabicDigits.first { $0.isASCII && $0.isNumber })
        }
    }
    /// الحارس: لا رقم لاتيني في نصوص واجهة المصحف ومراحل القصة.
    func testGuardScriptPasses() throws {
        var url = URL(fileURLWithPath: #filePath)
        while url.pathComponents.count > 1, !FileManager.default.fileExists(atPath: url.appendingPathComponent("scripts/native-arabic-digits-guard.sh").path) { url.deleteLastPathComponent() }
        let script = url.appendingPathComponent("scripts/native-arabic-digits-guard.sh").path
        try XCTSkipUnless(FileManager.default.fileExists(atPath: script), "المستودع غير متاح على المحاكي")
        #if os(macOS)
        let p = Process(); p.executableURL = URL(fileURLWithPath: "/bin/bash"); p.arguments = [script]
        try p.run(); p.waitUntilExit(); XCTAssertEqual(p.terminationStatus, 0)
        #endif
    }

    /// الأرقام المركّبة «١ / ٤» تُعزل اتجاهيًا فلا تنعكس في RTL؛ ومراجع الآيات لا تتأثر.
    func testRatioIsIsolated() {
        XCTAssertEqual("1 / 4".arabicDigits, "\u{2066}١ / ٤\u{2069}")
        XCTAssertEqual("النتيجة: 3 / 10".arabicDigits, "النتيجة: \u{2066}٣ / ١٠\u{2069}")
        XCTAssertEqual("36:1".arabicDigits, "٣٦:١")
    }
}
