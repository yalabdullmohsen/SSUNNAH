import XCTest
@testable import SunnahWidgetKit

/// بوابة ودجتي هدف القرآن وسلسلة الأذكار v5: رقم واحد في حلقة، أرقام لاتينية، بلا حالات فارغة قديمة.
final class GoalStreakWidgetV5GateTests: XCTestCase {
    private func source(_ file: String, from start: String, to end: String? = nil) throws -> String {
        let url = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("PrayerWidget/\(file)")
        let full = try String(contentsOf: url, encoding: .utf8)
        let a = try XCTUnwrap(full.range(of: start))
        let tail = full[a.lowerBound...]
        guard let end, let b = tail.range(of: end) else { return String(tail) }
        return String(tail[..<b.lowerBound])
    }

    private func assertClean(_ src: String, _ name: String) {
        for banned in ["SunnahWidgetEmptyState", "SunnahWidgetTimeFormatting.arabic", ".white", ".headline", ".caption", ".title2"] {
            XCTAssertFalse(src.contains(banned), "\(name): محظور \(banned)")
        }
        XCTAssertTrue(src.contains("SunnahRingStat"), "\(name): حلقة موحّدة")
        XCTAssertTrue(src.contains("SunnahCalmCard"), "\(name): بطاقة هادئة بلا بيانات")
        XCTAssertTrue(src.contains("WidgetFormat.digits"), "\(name): أرقام لاتينية")
        let gold = src.components(separatedBy: "SunnahBrandColors.gold").count - 1
        let accentable = src.components(separatedBy: ".widgetAccentable(").count - 1
        XCTAssertGreaterThanOrEqual(accentable, gold, "\(name): كل ذهبي يحمل widgetAccentable")
    }

    func testQuranGoalView() throws {
        let src = try source("SunnahQuranMushafWidgetCatalog.swift", from: "struct QuranDailyGoalView", to: "struct MushafProgressView")
        assertClean(src, "هدف القرآن")
    }

    func testStreakView() throws {
        let src = try source("SunnahAdhkarWidgetCatalog.swift", from: "struct AdhkarStreakView")
        assertClean(src, "سلسلة الأذكار")
        XCTAssertTrue(src.contains("WidgetFormat.dayUnit"))
    }

    func testMushafViewsUseUnifiedCardAndCalmEmptyState() throws {
        let src = try source("SunnahQuranMushafWidgetCatalog.swift", from: "struct MushafContinueView", to: "struct QuranDailyGoalView")
        let prog = try source("SunnahQuranMushafWidgetCatalog.swift", from: "struct MushafProgressView", to: "struct MushafQuickOpenView")
        for (name, text) in [("تابع المصحف/الإشارة", src), ("رحلة المصحف", prog)] {
            for banned in ["SunnahWidgetEmptyState", "SunnahWidgetTimeFormatting.arabic", ".white", ".title3", "٪"] {
                XCTAssertFalse(text.contains(banned), "\(name): محظور \(banned)")
            }
            XCTAssertTrue(text.contains("SunnahMushafPositionCard"))
            XCTAssertTrue(text.contains("SunnahCalmCard"))
        }
        XCTAssertTrue(src.contains("cue: \"تابع\""))
    }

    func testStreakUnitsAreShortAndLatin() {
        for n in [0, 1, 2, 3, 10, 11, 365] {
            let unit = WidgetFormat.dayUnit(n)
            XCTAssertLessThanOrEqual(WidgetTextBudget.wordCount(unit), 2)
            XCTAssertEqual(WidgetFormat.digits(n), String(n))
        }
    }
}
