import XCTest
@testable import SunnahWidgetKit

final class WidgetFormatTests: XCTestCase {
    func testDigits() {
        XCTAssertEqual(WidgetFormat.digits(1447), "١٤٤٧")
    }

    func testArabicDayPlurals() {
        XCTAssertEqual(WidgetFormat.days(0), "٠ يوم")
        XCTAssertEqual(WidgetFormat.days(1), "١ يوم")
        XCTAssertEqual(WidgetFormat.days(2), "٢ يومان")
        XCTAssertEqual(WidgetFormat.days(3), "٣ أيام")
        XCTAssertEqual(WidgetFormat.days(7), "٧ أيام")
        XCTAssertEqual(WidgetFormat.days(10), "١٠ أيام")
        XCTAssertEqual(WidgetFormat.days(11), "١١ يومًا")
        XCTAssertEqual(WidgetFormat.days(100), "١٠٠ يومًا")
        XCTAssertEqual(WidgetFormat.days(-5), "٠ يوم")
    }

    func testDuration() {
        XCTAssertEqual(WidgetFormat.duration(seconds: 45 * 60), "٤٥ د")
        XCTAssertEqual(WidgetFormat.duration(seconds: 3 * 3600 + 12 * 60 + 59), "٣ س ١٢ د")
        XCTAssertEqual(WidgetFormat.duration(seconds: -10), "٠ د")
    }
}

final class WidgetFormatEdgeCaseTests: XCTestCase {
    func testDaysUntilContext() {
        XCTAssertEqual(WidgetFormat.daysUntil(0), "اليوم")
        XCTAssertEqual(WidgetFormat.daysUntil(1), "غدًا")
        XCTAssertEqual(WidgetFormat.daysUntil(2), "بعد يومين")
        XCTAssertEqual(WidgetFormat.daysUntil(3), "بعد ٣ أيام")
        XCTAssertEqual(WidgetFormat.daysUntil(11), "بعد ١١ يومًا")
        XCTAssertEqual(WidgetFormat.daysUntil(-5), "اليوم")
    }

    func testStreak() {
        XCTAssertEqual(WidgetFormat.streak(1), "يوم واحد")
        XCTAssertEqual(WidgetFormat.streak(0), "٠ يوم")
        XCTAssertEqual(WidgetFormat.streak(2), "٢ يومان")
        XCTAssertEqual(WidgetFormat.streak(7), "٧ أيام")
    }

    func testDayUnitMatchesDays() {
        for n in [0, 1, 2, 3, 10, 11, 99, 100] {
            XCTAssertTrue(WidgetFormat.days(n).hasSuffix(WidgetFormat.dayUnit(n)), "n=\(n)")
        }
    }
}

final class ArabicDigitsPolicyTests: XCTestCase {
    private func assertArabic(_ s: String, _ what: String, file: StaticString = #filePath, line: UInt = #line) {
        let bad = s.unicodeScalars.filter { ("0"..."9").contains($0) || ("\u{06F0}"..."\u{06F9}").contains($0) }
        XCTAssertTrue(bad.isEmpty, "\(what) يحوي أرقامًا لاتينية/فارسية: \(s)", file: file, line: line)
    }

    func testFormattersEmitNoLatinDigits() {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        let d = Date(timeIntervalSince1970: 1_791_500_000)
        assertArabic(WidgetFormat.digits(1448), "digits")
        assertArabic(WidgetFormat.days(142), "days")
        assertArabic(WidgetFormat.daysUntil(5), "daysUntil")
        assertArabic(WidgetFormat.duration(seconds: 3 * 3600 + 720), "duration")
        assertArabic(LiveClock.format(seconds: 12_345), "clock")
        assertArabic(HijriCalendar.display(HijriCalendar.date(d, timeZone: tz)), "hijri")
        assertArabic(WidgetFormat.time(d, timeZone: tz), "time")
        assertArabic(WidgetFormat.gregorian(d, timeZone: tz), "gregorian")
    }

    func testRTLStateAndNameOrderIsExplicit() {
        let t = WidgetFormat.stateAndName("بقي على", "العصر")
        XCTAssertEqual(t, "\u{200F}بقي على العصر")
        XCTAssertEqual(WidgetFormat.stateAndName("حان وقت", "الظهر"), "\u{200F}حان وقت الظهر")
        XCTAssertEqual(WidgetFormat.stateAndName("حان وقت", ""), "\u{200F}حان وقت")
        XCTAssertEqual(WidgetFormat.rtl(WidgetFormat.rtl("مضى")), "\u{200F}مضى")
    }

    func testLocaleUsesArabicIndicNumbering() {
        XCTAssertEqual(WidgetFormat.locale.identifier, "ar@numbers=arab")
        let f = NumberFormatter(); f.locale = WidgetFormat.locale
        XCTAssertEqual(f.string(from: 53), "٥٣")
    }

    func testTimeParts() {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        func at(_ h: Int, _ m: Int) -> Date {
            var c = Calendar(identifier: .gregorian); c.timeZone = tz
            return c.date(from: DateComponents(year: 2026, month: 10, day: 9, hour: h, minute: m))!
        }
        XCTAssertEqual(WidgetFormat.time(at(4, 27), timeZone: tz), "٤:٢٧ ص")
        XCTAssertEqual(WidgetFormat.time(at(0, 5), timeZone: tz), "١٢:٠٥ ص")
        XCTAssertEqual(WidgetFormat.time(at(12, 0), timeZone: tz), "١٢:٠٠ م")
        XCTAssertEqual(WidgetFormat.time(at(17, 36), timeZone: tz), "٥:٣٦ م")
    }

    func testGregorianAndWeekday() {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        var c = Calendar(identifier: .gregorian); c.timeZone = tz
        let d = c.date(from: DateComponents(year: 2026, month: 10, day: 9, hour: 12))!
        XCTAssertEqual(WidgetFormat.gregorian(d, timeZone: tz), "٩ أكتوبر ٢٠٢٦")
        XCTAssertEqual(WidgetFormat.weekday(d, timeZone: tz), "الجمعة")
    }

    /// لا رقم هندي/فارسي حرفي في مصدر الودجات (التحويل يتم عبر arabicDigits) ولا لغة عربية بلا nu-arab صريح.
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
                    if line.contains("Locale(identifier: \"ar\")") || line.contains("nu-latn") {
                        bad.append("\(f.lastPathComponent): لغة بأرقام لاتينية صريحة")
                    }
                }
            }
        }
        XCTAssertTrue(bad.isEmpty, "\(bad)")
    }
}
