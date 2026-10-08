import XCTest
@testable import SunnahWidgetKit

/// تطابق HijriCalendar مع Calendar(.islamicUmmAlQura) من Foundation على ٣٦٥ يومًا متتاليًا.
final class HijriFoundationParityTests: XCTestCase {
    func testMatchesFoundationOver365Days() {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        var greg = Calendar(identifier: .gregorian); greg.timeZone = tz
        var um = Calendar(identifier: .islamicUmmAlQura); um.timeZone = tz
        let start = greg.date(from: DateComponents(year: 2026, month: 10, day: 8, hour: 12))!
        var mismatches: [String] = []
        for i in 0..<365 {
            let d = greg.date(byAdding: .day, value: i, to: start)!
            let f = um.dateComponents([.year, .month, .day], from: d)
            let h = HijriCalendar.date(d, timeZone: tz)
            if (h.year, h.month, h.day) != (f.year, f.month, f.day) { mismatches.append("\(i)") }
        }
        XCTAssertTrue(mismatches.isEmpty, "فروق عند الأيام: \(mismatches)")
    }

    func testSourceUsesFoundationCalendarNotManualMath() throws {
        let url = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().appendingPathComponent("Sources/SunnahWidgetKit/HijriCalendar.swift")
        let src = try String(contentsOf: url, encoding: .utf8)
        XCTAssertTrue(src.contains("Calendar(identifier: .islamicUmmAlQura)"))
    }
}
