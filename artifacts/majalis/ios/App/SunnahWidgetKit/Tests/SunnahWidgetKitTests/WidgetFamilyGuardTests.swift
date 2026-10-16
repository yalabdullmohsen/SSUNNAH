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

    /// تباين شاشة القفل قاعدة في المكوّن المشترك: نص فاتح ثابت لكل عائلات accessory داخل `SunnahAccessoryInset`،
    /// والحزام لا يستثنيها (فلا تُخفي اللقطات خللًا).
    func testAccessoryFixedLightRuleLivesInSharedInset() throws {
        let app = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
        let platform = try String(contentsOf: app.appendingPathComponent("PrayerWidget/SunnahWidgetPlatform.swift"), encoding: .utf8)
        for f in [".accessoryRectangular", ".accessoryInline", ".accessoryCircular"] {
            XCTAssertTrue(platform.contains("static func fixedLight") && platform.contains(f), "fixedLight يجب أن يشمل \\(f)")
        }
        XCTAssertTrue(platform.contains("SunnahAccessoryInset.fixedLight(family) ? .dark : colorScheme"))
        let harness = try String(contentsOf: app.appendingPathComponent("WidgetSnapshotHarness/main.swift"), encoding: .utf8)
        XCTAssertFalse(harness.contains("accessoryRectangular") && harness.contains("colorScheme, ."), "الحزام لا يفرض نمط accessory بنفسه")
    }
}
