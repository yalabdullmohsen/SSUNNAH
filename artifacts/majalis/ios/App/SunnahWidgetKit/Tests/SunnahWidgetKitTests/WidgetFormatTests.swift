import XCTest
@testable import SunnahWidgetKit

final class WidgetFormatTests: XCTestCase {
    func testDigits() {
        XCTAssertEqual(WidgetFormat.digits(1447), "1447")
    }

    func testArabicDayPlurals() {
        XCTAssertEqual(WidgetFormat.days(0), "0 يوم")
        XCTAssertEqual(WidgetFormat.days(1), "1 يوم")
        XCTAssertEqual(WidgetFormat.days(2), "2 يومان")
        XCTAssertEqual(WidgetFormat.days(3), "3 أيام")
        XCTAssertEqual(WidgetFormat.days(7), "7 أيام")
        XCTAssertEqual(WidgetFormat.days(10), "10 أيام")
        XCTAssertEqual(WidgetFormat.days(11), "11 يومًا")
        XCTAssertEqual(WidgetFormat.days(100), "100 يومًا")
        XCTAssertEqual(WidgetFormat.days(-5), "0 يوم")
    }

    func testDuration() {
        XCTAssertEqual(WidgetFormat.duration(seconds: 45 * 60), "45 د")
        XCTAssertEqual(WidgetFormat.duration(seconds: 3 * 3600 + 12 * 60 + 59), "3 س 12 د")
        XCTAssertEqual(WidgetFormat.duration(seconds: -10), "0 د")
    }
}

final class WidgetFormatEdgeCaseTests: XCTestCase {
    func testDaysUntilContext() {
        XCTAssertEqual(WidgetFormat.daysUntil(0), "اليوم")
        XCTAssertEqual(WidgetFormat.daysUntil(1), "غدًا")
        XCTAssertEqual(WidgetFormat.daysUntil(2), "بعد يومين")
        XCTAssertEqual(WidgetFormat.daysUntil(3), "بعد 3 أيام")
        XCTAssertEqual(WidgetFormat.daysUntil(11), "بعد 11 يومًا")
        XCTAssertEqual(WidgetFormat.daysUntil(-5), "اليوم")
    }

    func testStreak() {
        XCTAssertEqual(WidgetFormat.streak(1), "يوم واحد")
        XCTAssertEqual(WidgetFormat.streak(0), "0 يوم")
        XCTAssertEqual(WidgetFormat.streak(2), "2 يومان")
        XCTAssertEqual(WidgetFormat.streak(7), "7 أيام")
    }

    func testDayUnitMatchesDays() {
        for n in [0, 1, 2, 3, 10, 11, 99, 100] {
            XCTAssertTrue(WidgetFormat.days(n).hasSuffix(WidgetFormat.dayUnit(n)), "n=\(n)")
        }
    }
}

final class LatinDigitsPolicyTests: XCTestCase {
    private func assertLatin(_ s: String, _ what: String, file: StaticString = #filePath, line: UInt = #line) {
        let bad = s.unicodeScalars.filter { ("\u{0660}"..."\u{0669}").contains($0) || ("\u{06F0}"..."\u{06F9}").contains($0) }
        XCTAssertTrue(bad.isEmpty, "\(what) يحوي أرقامًا غير لاتينية: \(s)", file: file, line: line)
    }

    func testFormattersEmitOnlyLatinDigits() {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        let d = Date(timeIntervalSince1970: 1_791_500_000)
        assertLatin(WidgetFormat.digits(1448), "digits")
        assertLatin(WidgetFormat.days(142), "days")
        assertLatin(WidgetFormat.daysUntil(5), "daysUntil")
        assertLatin(WidgetFormat.duration(seconds: 3 * 3600 + 720), "duration")
        assertLatin(LiveClock.format(seconds: 12_345), "clock")
        assertLatin(HijriCalendar.display(HijriCalendar.date(d, timeZone: tz)), "hijri")
        assertLatin(WidgetFormat.time(d, timeZone: tz), "time")
        assertLatin(WidgetFormat.gregorian(d, timeZone: tz), "gregorian")
    }

    func testTimeParts() {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        func at(_ h: Int, _ m: Int) -> Date {
            var c = Calendar(identifier: .gregorian); c.timeZone = tz
            return c.date(from: DateComponents(year: 2026, month: 10, day: 9, hour: h, minute: m))!
        }
        XCTAssertEqual(WidgetFormat.time(at(4, 27), timeZone: tz), "4:27 ص")
        XCTAssertEqual(WidgetFormat.time(at(0, 5), timeZone: tz), "12:05 ص")
        XCTAssertEqual(WidgetFormat.time(at(12, 0), timeZone: tz), "12:00 م")
        XCTAssertEqual(WidgetFormat.time(at(17, 36), timeZone: tz), "5:36 م")
    }

    func testGregorianAndWeekday() {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        var c = Calendar(identifier: .gregorian); c.timeZone = tz
        let d = c.date(from: DateComponents(year: 2026, month: 10, day: 9, hour: 12))!
        XCTAssertEqual(WidgetFormat.gregorian(d, timeZone: tz), "9 أكتوبر 2026")
        XCTAssertEqual(WidgetFormat.weekday(d, timeZone: tz), "الجمعة")
    }

    /// لا رقم هندي/فارسي في أي نص مصدري للودجات ولا لغة بلا nu-latn.
    func testWidgetSourcesHaveNoIndicDigitsOrArabicIndicLocale() throws {
        let app = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
        var bad: [String] = []
        for sub in ["PrayerWidget", "SunnahWidgetKit/Sources", "Shared"] {
            let en = FileManager.default.enumerator(at: app.appendingPathComponent(sub), includingPropertiesForKeys: nil)
            while let f = en?.nextObject() as? URL, f.pathExtension == "swift" {
                let s = try String(contentsOf: f, encoding: .utf8)
                for line in s.split(separator: "\n") where !line.trimmingCharacters(in: .whitespaces).hasPrefix("//") {
                    if line.unicodeScalars.contains(where: { ("\u{0660}"..."\u{0669}").contains($0) || ("\u{06F0}"..."\u{06F9}").contains($0) }) {
                        bad.append("\(f.lastPathComponent): \(line.prefix(80))")
                    }
                    if line.contains("Locale(identifier: \"ar\")") || line.contains("numbers=arab") {
                        bad.append("\(f.lastPathComponent): locale بلا أرقام لاتينية")
                    }
                }
            }
        }
        XCTAssertTrue(bad.isEmpty, "\(bad)")
    }
}
