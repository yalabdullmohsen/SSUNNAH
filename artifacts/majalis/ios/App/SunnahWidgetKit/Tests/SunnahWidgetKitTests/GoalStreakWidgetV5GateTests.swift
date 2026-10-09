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

    func testStreakUnitsAreShortAndLatin() {
        for n in [0, 1, 2, 3, 10, 11, 365] {
            let unit = WidgetFormat.dayUnit(n)
            XCTAssertLessThanOrEqual(WidgetTextBudget.wordCount(unit), 2)
            XCTAssertEqual(WidgetFormat.digits(n), String(n))
        }
    }

    func testAyahCardNeverTruncatesAndHasCalmEmptyState() throws {
        let base = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
        let full = try String(contentsOf: base.appendingPathComponent("PrayerWidget/SunnahQuranMushafWidgetCatalog.swift"), encoding: .utf8)
        let start = try XCTUnwrap(full.range(of: "struct SunnahAyahCard"))
        let end = try XCTUnwrap(full.range(of: "struct MushafContinueView"))
        let src = String(full[start.lowerBound..<end.lowerBound])
        XCTAssertTrue(src.contains("ViewThatFits"))
        XCTAssertFalse(src.contains(".lineLimit(") && src.contains("ayahText)\n            .font"), "نص الآية بلا lineLimit")
        XCTAssertFalse(src.contains(".white"))
        XCTAssertTrue(src.contains("WidgetFormat.digits"))
        XCTAssertTrue(src.contains("SunnahCalmCard"))
        XCTAssertGreaterThanOrEqual(src.components(separatedBy: ".widgetAccentable(").count - 1, src.components(separatedBy: "SunnahBrandColors.gold").count - 1)
    }
}
