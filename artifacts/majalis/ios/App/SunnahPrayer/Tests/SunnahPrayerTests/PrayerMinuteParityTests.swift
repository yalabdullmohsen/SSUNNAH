import XCTest
@testable import SunnahPrayer

private struct MinuteFixture: Decodable {
    let name: String
    let lat: Double
    let lon: Double
    let tz: String
    let method: String
    let madhab: String
    let highLatitude: String
    let adjustments: [String: Int]
    let day: String
    /// مفاتيح الويب بحرف كبير: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha؛ القيمة HH:mm في منطقة المدينة.
    let times: [String: String]
}

/// مطابقة Swift لمخرجات الموقع الفعلية (computePrayerTimesForDate) على مستوى الدقيقة.
/// اللقطات من `TZ=UTC node scripts/gen-prayer-parity.mjs`. أي فرق دقيقة واحدة = فشل.
final class PrayerMinuteParityTests: XCTestCase {
    func testMatchesWebToTheMinute() throws {
        let url = try XCTUnwrap(Bundle.module.url(forResource: "web-minute-parity", withExtension: "json"))
        let fixtures = try JSONDecoder().decode([MinuteFixture].self, from: Data(contentsOf: url))
        XCTAssertGreaterThanOrEqual(fixtures.count, 10)
        XCTAssertGreaterThanOrEqual(Set(fixtures.map(\.name)).count, 10)
        XCTAssertGreaterThanOrEqual(Set(fixtures.map(\.method)).count, 8)

        var mismatches: [String] = []
        for f in fixtures {
            let parts = f.day.split(separator: "-").compactMap { Int($0) }
            let location = PrayerLocation(label: f.name, latitude: f.lat, longitude: f.lon, timeZoneIdentifier: f.tz)
            let a = f.adjustments
            let settings = PrayerSettings(
                method: try XCTUnwrap(PrayerMethod(rawValue: f.method)),
                madhab: try XCTUnwrap(PrayerMadhab(rawValue: f.madhab)),
                highLatitude: try XCTUnwrap(HighLatitudeOption(rawValue: f.highLatitude)),
                adjustments: PrayerMinuteAdjustments(
                    fajr: a["fajr"] ?? 0, sunrise: a["sunrise"] ?? 0, dhuhr: a["dhuhr"] ?? 0,
                    asr: a["asr"] ?? 0, maghrib: a["maghrib"] ?? 0, isha: a["isha"] ?? 0))
            let day = try XCTUnwrap(PrayerCalculator.times(
                for: location, day: DateComponents(year: parts[0], month: parts[1], day: parts[2]), settings: settings))

            var calendar = Calendar(identifier: .gregorian)
            calendar.timeZone = location.timeZone
            let webKeys: [(Prayer, String)] = [
                (.fajr, "Fajr"), (.sunrise, "Sunrise"), (.dhuhr, "Dhuhr"),
                (.asr, "Asr"), (.maghrib, "Maghrib"), (.isha, "Isha")]
            for (prayer, key) in webKeys {
                let c = calendar.dateComponents([.hour, .minute, .second], from: day.time(prayer))
                let swiftText = String(format: "%02d:%02d", c.hour ?? -1, c.minute ?? -1)
                let web = try XCTUnwrap(f.times[key])
                if swiftText != web {
                    mismatches.append("\(f.name) \(f.day) \(f.method)/\(f.madhab)/\(f.highLatitude) \(key): web \(web) ≠ swift \(swiftText) (ث \(c.second ?? -1))")
                }
            }
        }
        XCTAssertTrue(mismatches.isEmpty, "فروق دقيقة (\(mismatches.count)):\n" + mismatches.joined(separator: "\n"))
    }
}
