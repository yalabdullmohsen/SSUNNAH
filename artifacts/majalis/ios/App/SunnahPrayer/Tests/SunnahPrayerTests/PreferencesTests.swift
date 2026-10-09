import XCTest
@testable import SunnahPrayer

@MainActor
final class PreferencesTests: XCTestCase {
    private func freshDefaults() -> UserDefaults {
        let name = "SunnahPrayerTests.\(UUID().uuidString)"
        let d = UserDefaults(suiteName: name)!
        d.removePersistentDomain(forName: name)
        return d
    }

    func testDefaultsMatchWeb() {
        let store = PrayerPreferencesStore(defaults: freshDefaults())
        XCTAssertEqual(store.preferences.location, .kuwaitCity)
        XCTAssertEqual(store.preferences.settings.method, .kuwait)
        XCTAssertEqual(store.preferences.settings.madhab, .shafi)
    }

    func testPersistsAcrossInstancesForWidgetAndBackground() {
        let defaults = freshDefaults()
        let store = PrayerPreferencesStore(defaults: defaults)
        let riyadh = ReferenceCities.search("الرياض")[0]
        store.preferences.location = riyadh
        store.preferences.settings.method = .ummAlQura

        XCTAssertEqual(PrayerPreferencesStore(defaults: defaults).preferences.location, riyadh)
        XCTAssertEqual(PrayerPreferencesStore.read(from: defaults)?.settings.method, .ummAlQura)
    }

    func testReferenceCitiesAreValid() {
        XCTAssertEqual(Set(ReferenceCities.all.map(\.label)).count, ReferenceCities.all.count)
        for city in ReferenceCities.all {
            XCTAssertNotNil(TimeZone(identifier: city.timeZoneIdentifier), city.label)
            XCTAssertTrue((-90...90).contains(city.latitude) && (-180...180).contains(city.longitude), city.label)
            XCTAssertNotNil(PrayerCalculator.times(for: city, on: Date(), settings: PrayerSettings()), city.label)
        }
    }

    func testSearchNormalizesArabic() {
        XCTAssertEqual(ReferenceCities.search("مكه").first?.label, "مكة المكرمة")
        XCTAssertEqual(ReferenceCities.search("اسطنبول").first?.label, "إسطنبول")
        XCTAssertEqual(ReferenceCities.search("").count, ReferenceCities.all.count)
    }

    func testClockUsesLocationTimeZone() throws {
        let instant = try XCTUnwrap(ISO8601DateFormatter().date(from: "2026-10-08T09:05:00Z"))
        let kuwait = PrayerTimeFormat.clock(instant, in: TimeZone(identifier: "Asia/Kuwait")!)
        let london = PrayerTimeFormat.clock(instant, in: TimeZone(identifier: "Europe/London")!)
        XCTAssertNotEqual(kuwait, london)
        XCTAssertTrue(kuwait.contains("12:05"), kuwait)
    }

    func testCountdownFormat() {
        XCTAssertEqual(PrayerTimeFormat.countdown(3_725), "01:02:05")
        XCTAssertEqual(PrayerTimeFormat.countdown(-5), "00:00:00")
    }
}
