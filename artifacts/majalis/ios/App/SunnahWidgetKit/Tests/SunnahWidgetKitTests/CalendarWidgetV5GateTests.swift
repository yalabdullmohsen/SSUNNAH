import XCTest
@testable import SunnahWidgetKit

/// بوابات ودجات التاريخ والمناسبات v5: أرقام لاتينية، بلا حالات فارغة قديمة، بلا آيات ولا ألوان ثابتة.
final class CalendarWidgetV5GateTests: XCTestCase {
    private func source(_ name: String) throws -> String {
        let dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("PrayerWidget")
        return try String(contentsOf: dir.appendingPathComponent(name), encoding: .utf8)
    }

    func testCalendarSourceHasNoLegacyStatesOrFixedColors() throws {
        let standBy = try source("SunnahStandBySupport.swift")
        let hijriStart = try XCTUnwrap(standBy.range(of: "struct StandByHijriDateView"))
        let hijriView = String(standBy[hijriStart.lowerBound...].prefix(1500))
        for (f, s) in [("SunnahCalendarWidgetCatalog.swift", try source("SunnahCalendarWidgetCatalog.swift")),
                       ("StandByHijriDateView", hijriView)] {
            for bad in ["غير متاح", "SunnahWidgetEmptyState", "افتح سُنّة لعرض", ".foregroundStyle(.white)",
                        "SunnahWidgetTimeFormatting.arabic", "ramadanLabelAr", "design: .rounded"] {
                XCTAssertFalse(s.contains(bad), "\(f) يحوي «\(bad)»")
            }
        }
    }

    func testCalendarWidgetsCarryNoQuranOrHadithText() throws {
        let s = try source("SunnahCalendarWidgetCatalog.swift")
        for bad in ["﴿", "﴾", "قال رسول الله", "ayah", "hadith"] {
            XCTAssertFalse(s.contains(bad), "ودجة تاريخ تحوي نصًا دينيًا: \(bad)")
        }
    }

    func testDaysUnitLongestStringsFitBudget() {
        for n in [0, 1, 2, 3, 10, 11, 142, 354] {
            XCTAssertLessThanOrEqual(WidgetFormat.dayUnit(n).count, WidgetTextBudget.name)
            XCTAssertTrue(WidgetFormat.digits(n).allSatisfy { $0.isASCII })
        }
        for name in HijriCalendar.monthNamesAr.filter({ !$0.isEmpty }) {
            XCTAssertLessThanOrEqual(name.count, WidgetTextBudget.name)
        }
    }

    func testHijriShortUsesLatinDigitsAndNoRelativeForm() {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: "Asia/Riyadh")!
        let d = cal.date(from: DateComponents(year: 2026, month: 10, day: 9, hour: 12))!
        let text = HijriCalendar.short(HijriCalendar.date(d, timeZone: cal.timeZone))
        XCTAssertTrue(text.unicodeScalars.allSatisfy { !(0x0660...0x0669).contains($0.value) && !(0x06F0...0x06F9).contains($0.value) })
        XCTAssertFalse(text.contains("أشهر"))
    }
}
