import XCTest
@testable import SunnahPrayer

final class NotificationRoutingTests: XCTestCase {
    func testEveryNotificationKindRoutesToItsScreen() {
        let p = PrayerNotificationPlanner.idPrefix, g = GeneralNotificationPlanner.idPrefix
        XCTAssertEqual(NotificationRouting.path(forIdentifier: "\(p)2026-03-01.fajr.pre"), "/prayer-times")
        XCTAssertEqual(NotificationRouting.path(forIdentifier: "\(g)adhkar.2026-03-01.morning"), "/adhkar")
        XCTAssertEqual(NotificationRouting.path(forIdentifier: "\(g)periodic.2026-03-01.0"), "/adhkar")
        XCTAssertEqual(NotificationRouting.path(forIdentifier: "\(g)wird.2026-03-01"), "/daily-wird")
        XCTAssertEqual(NotificationRouting.path(forIdentifier: "\(g)events.lesson-42"), "/lessons")
        XCTAssertEqual(NotificationRouting.path(forIdentifier: "\(g)events.jumuah-1"), "/jumuah")
    }

    func testForeignIdentifiersAreNotOurs() {
        XCTAssertNil(NotificationRouting.path(forIdentifier: "capacitor.123"))
        XCTAssertNil(NotificationRouting.resolve(identifier: "web.1", userInfo: [:]))
    }

    func testUserInfoRouteIsValidated() {
        let id = "\(GeneralNotificationPlanner.idPrefix)wird.d"
        XCTAssertEqual(NotificationRouting.resolve(identifier: id, userInfo: ["route": "/quiz"]), "/quiz")
        XCTAssertEqual(NotificationRouting.resolve(identifier: id, userInfo: ["route": "https://evil.example"]), "/daily-wird")
        XCTAssertEqual(NotificationRouting.resolve(identifier: id, userInfo: ["route": "/../x"]), "/daily-wird")
        XCTAssertEqual(NotificationRouting.resolve(identifier: id, userInfo: ["route": "quiz"]), "/daily-wird")
    }

    /// حارس: كل زناد تقويمي يُبنى من triggerComponents (بمنطقة الموقع) لا من مكوّنات بلا منطقة.
    func testTriggersAlwaysCarryLocationTimeZone() throws {
        let dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahPrayer")
        for name in try FileManager.default.contentsOfDirectory(atPath: dir.path) where name.hasSuffix(".swift") {
            let src = try String(contentsOf: dir.appendingPathComponent(name), encoding: .utf8)
            guard src.contains("UNCalendarNotificationTrigger(dateMatching:") else { continue }
            XCTAssertTrue(src.contains("triggerComponents(for:"), "\(name): الزناد بلا منطقة الموقع")
            XCTAssertFalse(src.contains("calendar.dateComponents([.year"), "\(name): مكوّنات بلا timeZone")
        }
    }

    func testTwoTimeZonesKeepWallClockOfLocation() {
        let date = Date(timeIntervalSince1970: 1_772_312_400 + 4 * 3600 + 30 * 60) // 04:30 الكويت
        for id in ["Asia/Kuwait", "America/New_York", "Asia/Tokyo"] {
            let tz = TimeZone(identifier: id)!
            let parts = GeneralNotificationPlanner.triggerComponents(for: date, timeZone: tz)
            XCTAssertEqual(parts.timeZone, tz)
            var cal = Calendar(identifier: .gregorian)
            cal.timeZone = tz
            XCTAssertEqual(cal.date(from: parts), date, id)
        }
        let kuwait = GeneralNotificationPlanner.triggerComponents(for: date, timeZone: TimeZone(identifier: "Asia/Kuwait")!)
        let ny = GeneralNotificationPlanner.triggerComponents(for: date, timeZone: TimeZone(identifier: "America/New_York")!)
        XCTAssertEqual(kuwait.hour, 4)
        XCTAssertNotEqual(kuwait.hour, ny.hour)
    }
}
