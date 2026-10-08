import XCTest
@testable import SunnahPrayer

/// إعادة إنتاج: الخميس ٨ أكتوبر ٢٠٢٦ بالكويت، الساعة ٥:١٢ م → التالية المغرب ثم العشاء.
final class WidgetReproKuwaitTests: XCTestCase {
    func testNextAtFiveTwelveIsMaghribThenIsha() throws {
        let tz = TimeZone(identifier: "Asia/Kuwait")!
        let loc = PrayerLocation(label: "الكويت", latitude: 29.3759, longitude: 47.9774, timeZoneIdentifier: tz.identifier)
        var cal = Calendar(identifier: .gregorian); cal.timeZone = tz
        let now = cal.date(from: DateComponents(year: 2026, month: 10, day: 8, hour: 17, minute: 12))!
        let settings = PrayerSettings()
        let next = try XCTUnwrap(PrayerCalculator.next(after: now, location: loc, settings: settings))
        XCTAssertEqual(next.prayer, .maghrib)
        let c = cal.dateComponents([.hour, .minute], from: next.time)
        print("MAGHRIB", c.hour!, c.minute!)
        XCTAssertEqual(c.hour, 17); XCTAssertTrue((24...28).contains(c.minute!), "المغرب ~٥:٢٦")
        let after = try XCTUnwrap(PrayerCalculator.next(after: next.time.addingTimeInterval(1), location: loc, settings: settings))
        XCTAssertEqual(after.prayer, .isha)
    }
}
