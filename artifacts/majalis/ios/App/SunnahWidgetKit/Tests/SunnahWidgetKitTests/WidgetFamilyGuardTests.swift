import XCTest

/// عائلة الودجة تُقرأ من الغلاف `@SunnahFamily` فقط، حتى يفرضها حزام اللقطات وفحص الحافة؛ `\.widgetFamily` للقراءة فقط في WidgetKit.
final class WidgetFamilyGuardTests: XCTestCase {
    func testWidgetFamilyReadOnlyThroughSunnahFamilyWrapper() throws {
        let dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("PrayerWidget")
        var bad: [String] = []
        for f in try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil) where f.pathExtension == "swift" {
            let s = try String(contentsOf: f, encoding: .utf8)
            for (n, line) in s.split(separator: "\n", omittingEmptySubsequences: false).enumerated()
            where line.contains("@Environment(\\.widgetFamily)") && !line.contains("private var real") {
                bad.append("\(f.lastPathComponent):\(n + 1)")
            }
        }
        XCTAssertTrue(bad.isEmpty, "استعملوا @SunnahFamily بدل @Environment(\\.widgetFamily): \(bad)")
    }
}
