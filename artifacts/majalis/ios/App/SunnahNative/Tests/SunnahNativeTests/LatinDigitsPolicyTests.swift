import XCTest
@testable import SunnahNative

/// أمر المالك: أرقام لاتينية فقط في كل نص معروض. يفشل إن ظهر رقم هندي (٠-٩) أو فارسي في أي سلسلة نصية بمصدر التطبيق.
final class LatinDigitsPolicyTests: XCTestCase {
    func testNoEasternArabicDigitsInSourceStringLiterals() throws {
        let root = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources")
        let digits = CharacterSet(charactersIn: "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹٬٫")
        var offenders: [String] = []
        let en = FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil)!
        for case let url as URL in en where url.pathExtension == "swift" {
            let s = try String(contentsOf: url, encoding: .utf8)
            for (i, line) in s.components(separatedBy: "\n").enumerated() {
                let t = line.trimmingCharacters(in: .whitespaces)
                if t.hasPrefix("//") || t.hasPrefix("///") { continue }
                if t.contains("٠١٢٣٤٥٦٧٨٩") || t.contains("replacingOccurrences") || t.contains("MawarithStep(") { continue }   // محلّلات إدخال/جداول التحويل
                if line.unicodeScalars.contains(where: { digits.contains($0) }) {
                    offenders.append("\(url.lastPathComponent):\(i + 1)")
                }
            }
        }
        XCTAssertTrue(offenders.isEmpty, "أرقام غير لاتينية: \(offenders.prefix(20))")
    }
}

final class LatinDigitsHelperTests: XCTestCase {
    func testConvertsArabicIndicAndPersian() {
        XCTAssertEqual("٢ فأكثر ۱۲ و٣".asLatinDigits, "2 فأكثر 12 و3")
    }
}
