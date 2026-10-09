import XCTest
@testable import SunnahWidgetKit

/// بوابة ودجات الأذكار v5: ذكر الساعة حتمي ≤6 كلمات، ولا حالات فارغة قديمة ولا ألوان ثابتة.
final class AdhkarWidgetV5GateTests: XCTestCase {
    private let tz = TimeZone(identifier: "Asia/Riyadh")!
    private let pool = [
        "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    ]

    private func date(_ d: Int, _ h: Int, _ m: Int = 0) -> Date {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = tz
        return cal.date(from: DateComponents(year: 2026, month: 10, day: d, hour: h, minute: m))!
    }

    func testEligibleKeepsOnlyShortVerbatimUniqueItems() {
        let long = "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ"
        let out = AdhkarRotation.eligible(pool + [pool[0], long, "  ", ""])
        XCTAssertEqual(out, pool)
        XCTAssertTrue(out.allSatisfy { WidgetTextBudget.wordCount($0) <= WidgetTextBudget.dhikrWords })
    }

    func testSameHourSameDhikrAndNextHourChanges() {
        let a = AdhkarRotation.pick(from: pool, at: date(9, 10, 5), timeZone: tz)
        let b = AdhkarRotation.pick(from: pool, at: date(9, 10, 59), timeZone: tz)
        let c = AdhkarRotation.pick(from: pool, at: date(9, 11, 0), timeZone: tz)
        XCTAssertEqual(a, b)
        XCTAssertNotEqual(b, c, "يتغيّر الذكر عند رأس الساعة")
    }

    func testIndexIsHourPlusDayAndWraps() {
        let n = pool.count
        for h in 0..<24 {
            let i = AdhkarRotation.index(count: n, at: date(9, h), timeZone: tz)
            XCTAssertTrue((0..<n).contains(i))
        }
        XCTAssertNotEqual(
            AdhkarRotation.index(count: 7, at: date(9, 10), timeZone: tz),
            AdhkarRotation.index(count: 7, at: date(10, 10), timeZone: tz),
            "اليوم التالي بنفس الساعة يختار غيره"
        )
    }

    func testEmptyPoolReturnsNilNotPlaceholder() {
        XCTAssertNil(AdhkarRotation.pick(from: [], at: date(9, 10), timeZone: tz))
        XCTAssertNil(AdhkarRotation.pick(from: ["كلمة واحدة اثنتان ثلاث أربع خمس ست سبع"], at: date(9, 10), timeZone: tz))
    }

    func testHourStartsAreTopOfEachHour() {
        let starts = AdhkarRotation.hourStarts(after: date(9, 10, 20), timeZone: tz, count: 3)
        XCTAssertEqual(starts, [date(9, 11), date(9, 12), date(9, 13)])
        XCTAssertEqual(AdhkarRotation.hourStarts(after: date(9, 10, 0), timeZone: tz, count: 1), [date(9, 11)])
    }

    func testAdhkarViewsHaveNoLegacyEmptyStatesOrFixedColors() throws {
        let url = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("PrayerWidget/SunnahAdhkarWidgetCatalog.swift")
        let full = try String(contentsOf: url, encoding: .utf8)
        let cut = try XCTUnwrap(full.range(of: "struct AdhkarStreakView"))
        let src = String(full[..<cut.lowerBound])
        for banned in ["افتح سُنّة لعرض الذكر", "SunnahWidgetEmptyState", "من أذكار سُنّة", "SunnahWidgetTimeFormatting.arabic", ".headline", ".caption"] {
            XCTAssertFalse(src.contains(banned), "محظور في ودجات الأذكار: \(banned)")
        }
        XCTAssertTrue(src.contains("HourlyAdhkarProvider()"), "ذكر الساعة بجدول ساعي")
        XCTAssertTrue(src.contains("AdhkarRotation.pick"))
        XCTAssertTrue(src.contains("minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))"))
        let gold = src.components(separatedBy: "SunnahBrandColors.gold").count - 1
        let accentable = src.components(separatedBy: ".widgetAccentable(").count - 1
        XCTAssertGreaterThanOrEqual(accentable, gold, "كل عنصر ذهبي يحمل widgetAccentable")
    }
}
