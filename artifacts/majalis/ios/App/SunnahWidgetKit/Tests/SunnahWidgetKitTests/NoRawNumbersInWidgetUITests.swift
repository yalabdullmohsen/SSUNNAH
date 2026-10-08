import XCTest

/// كل رقم معروض يمر عبر WidgetFormat/SunnahWidgetTimeFormatting؛ لا تداخل نصي مباشر لعدّادات.
final class NoRawNumbersInWidgetUITests: XCTestCase {
    func testNoRawNumericInterpolationInWidgetViews() throws {
        let dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("PrayerWidget")
        let re = try NSRegularExpression(pattern: #"Text\("[^"]*\\\((?!SunnahWidgetTimeFormatting|WidgetFormat)[^)]*(Days|days|Day\b|Year|[pP]age\b|ayah|Streak|percent|target|done)[^)]*\)"#)
        var bad: [String] = []
        for f in try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) where f.pathExtension == "swift" {
            let s = try String(contentsOf: f, encoding: .utf8)
            for m in re.matches(in: s, range: NSRange(s.startIndex..., in: s)) {
                bad.append("\(f.lastPathComponent): \(String(s[Range(m.range, in: s)!]))")
            }
        }
        XCTAssertTrue(bad.isEmpty, "أرقام تُعرض دون المنسّق: \(bad)")
    }
}
