import XCTest

/// بوابات مصدرية لودجات الصلاة v5: لا حالات فارغة قديمة، لا خطوط مزخرفة، لا ألوان ثابتة في شاشة القفل.
final class PrayerWidgetV5GateTests: XCTestCase {
    private func source(_ name: String) throws -> String {
        let dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("PrayerWidget")
        return try String(contentsOf: dir.appendingPathComponent(name), encoding: .utf8)
    }

    private let prayerFiles = ["SunnahPrayerWidgetCatalog.swift", "PrayerWidgetViews.swift", "SunnahStandBySupport.swift"]

    func testNoLegacyEmptyStatesInPrayerWidgets() throws {
        for f in prayerFiles {
            let s = try source(f)
            for bad in ["غير متاح", "لا صلاة سابقة", "اختر المحتوى", "بعد الفجر", "PrayerTimelineStrip"] {
                XCTAssertFalse(s.contains(bad), "\(f) يحوي «\(bad)»")
            }
        }
    }

    func testNoDecorativeOrMonospacedFontsInPrayerWidgets() throws {
        for f in prayerFiles {
            let s = try source(f)
            XCTAssertFalse(s.contains("design: .rounded"), f)
            XCTAssertFalse(s.contains("design: .monospaced"), f)
        }
    }

    func testLockScreenSectionHasNoFixedColors() throws {
        let s = try source("PrayerWidgetViews.swift")
        let lock = try XCTUnwrap(s.range(of: "// MARK: - Lock Screen")).upperBound
        let tail = String(s[lock...])
        for bad in [".white", ".black", "Color(", "SunnahBrandColors"] {
            XCTAssertFalse(tail.contains(bad), "شاشة القفل تحوي لونًا ثابتًا: \(bad)")
        }
    }

    func testPlatformFontSizesRespectMinimum() throws {
        let s = try source("SunnahWidgetPlatform.swift")
        let re = try NSRegularExpression(pattern: #"WidgetType\.(?:primary|secondary|icon)\((\d+(?:\.\d+)?)\)"#)
        for f in prayerFiles + ["SunnahWidgetPlatform.swift"] {
            let t = try source(f)
            for m in re.matches(in: t, range: NSRange(t.startIndex..., in: t)) {
                let n = Double(t[Range(m.range(at: 1), in: t)!])!
                XCTAssertGreaterThanOrEqual(n, 11, "\(f): خط أصغر من 11pt")
            }
        }
        XCTAssertFalse(s.isEmpty)
    }
}
