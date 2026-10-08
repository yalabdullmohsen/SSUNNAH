import XCTest
@testable import SunnahPrayer

private struct Fixture: Decodable {
    let name: String
    let lat: Double
    let lon: Double
    let tz: String
    let method: String
    let day: String
    let times: [String: Double]
}

final class PrayerCalculatorTests: XCTestCase {
    /// معيار اليوم 3-4: تطابق 5 مدن مرجعية مع الويب ±1 دقيقة (فعليًا ±60 ثانية).
    func testMatchesWebAdhanJsWithinOneMinute() throws {
        let url = try XCTUnwrap(Bundle.module.url(forResource: "web-parity", withExtension: "json"))
        let fixtures = try JSONDecoder().decode([Fixture].self, from: Data(contentsOf: url))
        XCTAssertEqual(Set(fixtures.map(\.name)).count, 5)

        for f in fixtures {
            let parts = f.day.split(separator: "-").compactMap { Int($0) }
            let location = PrayerLocation(label: f.name, latitude: f.lat, longitude: f.lon, timeZoneIdentifier: f.tz)
            let settings = PrayerSettings(method: try XCTUnwrap(PrayerMethod(rawValue: f.method)))
            let day = try XCTUnwrap(PrayerCalculator.times(
                for: location, day: DateComponents(year: parts[0], month: parts[1], day: parts[2]), settings: settings))
            for prayer in Prayer.allCases {
                let web = try XCTUnwrap(f.times[prayer.rawValue])
                let diff = abs(day.time(prayer).timeIntervalSince1970 - web)
                XCTAssertLessThanOrEqual(diff, 60, "\(f.name) \(f.day) \(prayer): \(diff)s")
            }
        }
    }

    func testDayKeyFollowsLocationTimeZoneNotDevice() throws {
        // 22:30 UTC يوم 10/07 = 01:30 يوم 10/08 في الكويت.
        let instant = try XCTUnwrap(ISO8601DateFormatter().date(from: "2026-10-07T22:30:00Z"))
        let day = try XCTUnwrap(PrayerCalculator.times(for: .kuwaitCity, on: instant, settings: PrayerSettings()))
        XCTAssertEqual(day.dayKey, "2026-10-08")
    }

    func testNextSkipsSunriseAndRollsToTomorrowFajr() throws {
        let location = PrayerLocation.kuwaitCity
        let today = try XCTUnwrap(PrayerCalculator.times(for: location, day: DateComponents(year: 2026, month: 10, day: 8), settings: PrayerSettings()))

        let afterFajr = today.time(.fajr).addingTimeInterval(60)
        XCTAssertEqual(PrayerCalculator.next(after: afterFajr, location: location, settings: PrayerSettings())?.prayer, .dhuhr)

        let afterIsha = today.time(.isha).addingTimeInterval(60)
        let next = try XCTUnwrap(PrayerCalculator.next(after: afterIsha, location: location, settings: PrayerSettings()))
        XCTAssertEqual(next.prayer, .fajr)
        XCTAssertGreaterThan(next.time, afterIsha)
    }

    func testAdjustmentsShiftMinutes() throws {
        let day = DateComponents(year: 2026, month: 10, day: 8)
        let base = try XCTUnwrap(PrayerCalculator.times(for: .kuwaitCity, day: day, settings: PrayerSettings()))
        var shifted = PrayerSettings()
        shifted.adjustments.isha = 5
        let moved = try XCTUnwrap(PrayerCalculator.times(for: .kuwaitCity, day: day, settings: shifted))
        XCTAssertEqual(moved.time(.isha).timeIntervalSince(base.time(.isha)), 300, accuracy: 1)
        XCTAssertEqual(moved.time(.fajr), base.time(.fajr))
    }

    func testDaysAreConsecutiveAcrossDST() {
        let london = PrayerLocation(label: "London", latitude: 51.5074, longitude: -0.1278, timeZoneIdentifier: "Europe/London")
        let start = ISO8601DateFormatter().date(from: "2026-03-27T12:00:00Z")!
        let keys = PrayerCalculator.days(for: london, from: start, count: 4, settings: PrayerSettings(method: .muslimWorldLeague)).map(\.dayKey)
        XCTAssertEqual(keys, ["2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30"])
    }

    func testSettingsDecodeFromWebIds() throws {
        let json = #"{"method":"UmmAlQura","madhab":"Hanafi","highLatitude":"auto","adjustments":{"fajr":0,"sunrise":0,"dhuhr":0,"asr":0,"maghrib":0,"isha":2}}"#
        let s = try JSONDecoder().decode(PrayerSettings.self, from: Data(json.utf8))
        XCTAssertEqual(s.method, .ummAlQura)
        XCTAssertEqual(s.madhab, .hanafi)
        XCTAssertEqual(s.adjustments.isha, 2)
    }
}
