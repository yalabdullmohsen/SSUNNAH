import XCTest

/// نصوص الودجات: لا لغة داخلية/مطوّرين، ولا ادعاء إنجاز لم يُقرأ من مصدره.
final class WidgetCopyTests: XCTestCase {
    private func widgetSources() throws -> [(String, String)] {
        let dir = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("PrayerWidget")
        return try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
            .filter { $0.pathExtension == "swift" }
            .map { ($0.lastPathComponent, try String(contentsOf: $0, encoding: .utf8)) }
    }

    func testNoInternalWording() throws {
        let banned = ["تتبع معتمد", "بلا اختراع", "الآية المعتمدة", "نص آية معتمد", "تهيئة اليوم", "canonical", "TODO", "placeholder text"]
        for (name, s) in try widgetSources() {
            for b in banned where name != "SunnahWidgetPreviewFixtures.swift" {
                // الأسماء البرمجية (hasCanonical…) مسموحة؛ نمنع النص الظاهر فقط
                let shown = s.components(separatedBy: "\n").filter { $0.contains("\"\(b)") || $0.contains("\(b)\"") || $0.contains("description(") && $0.contains(b) }
                XCTAssertTrue(shown.isEmpty, "\(name): نص داخلي ظاهر «\(b)»")
            }
        }
    }

    /// «الصلاة مكتمل» كانت تظهر لمجرد وجود صلاة حالية؛ لا مصدر لإتمام الصلاة في الحمولة.
    func testSpiritualDayDoesNotFabricatePrayerCompletion() throws {
        let s = try XCTUnwrap(widgetSources().first { $0.0 == "SunnahHomeWidgetCatalog.swift" }?.1)
        XCTAssertFalse(s.contains("statusRow(\"الصلاة\""))
    }

    func testSharedLayoutHelpersExist() throws {
        let s = try XCTUnwrap(widgetSources().first { $0.0 == "SunnahWidgetPlatform.swift" }?.1)
        XCTAssertTrue(s.contains("func sunnahCardLayout"))
        XCTAssertTrue(s.contains("func sunnahDynamicTypeCap"))
    }
}
