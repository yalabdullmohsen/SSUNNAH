import XCTest
@testable import SunnahPrayer

final class GeneralNotificationPlannerTests: XCTestCase {
    let location = PrayerLocation.kuwaitCity
    let settings = PrayerSettings()
    // 2026-03-01 00:00 بتوقيت الكويت.
    let now = Date(timeIntervalSince1970: 1_772_312_400)

    func plan(_ options: GeneralNotificationOptions = .init(), events: [NotificationEvent] = [], capacity: Int = 24) -> [PlannedGeneralNotification] {
        GeneralNotificationPlanner.plan(location: location, settings: settings, options: options,
                                        events: events, now: now, capacity: capacity)
    }

    func minute(_ d: Date) -> Int {
        var c = Calendar(identifier: .gregorian); c.timeZone = location.timeZone
        let p = c.dateComponents([.hour, .minute], from: d)
        return p.hour! * 60 + p.minute!
    }

    func testDefaultsAdhkarTwicePerDayForSevenDays() {
        let out = plan()
        XCTAssertEqual(out.count, 14)
        XCTAssertTrue(out.allSatisfy { $0.group == .adhkar && $0.id.hasPrefix(GeneralNotificationPlanner.idPrefix) })
        XCTAssertEqual(Set(out.map(\.id)).count, out.count)
        XCTAssertEqual(out, out.sorted { $0.fireDate < $1.fireDate })
    }

    func testCapacityLimitsTotalSoPendingStaysWithin64() {
        let prayer = PrayerNotificationPlanner.plan(location: location, settings: settings, options: .init(), now: now)
        let capacity = PrayerNotificationBudget.iosPendingLimit - prayer.count
        var o = GeneralNotificationOptions(); o.wirdEnabled = true; o.periodicEnabled = true; o.dailyCap = 20
        let out = plan(o, capacity: capacity)
        XCTAssertEqual(out.count, capacity)
        XCTAssertLessThanOrEqual(prayer.count + out.count, 64)
        XCTAssertTrue(plan(o, capacity: 0).isEmpty)
    }

    func testQuietHoursAndDailyCap() {
        var o = GeneralNotificationOptions(); o.periodicEnabled = true; o.periodicIntervalMinutes = 60; o.dailyCap = 50
        let out = plan(o, capacity: 1000)
        XCTAssertFalse(out.contains { o.isQuiet(minuteOfDay: minute($0.fireDate)) })
        o.dailyCap = 3
        let capped = plan(o, capacity: 1000)
        XCTAssertEqual(capped.count, 21)
        // الأذكار تسبق الدوري عند السقف.
        XCTAssertEqual(capped.filter { $0.group == .adhkar }.count, 14)
    }

    func testQuietWrapsMidnight() {
        let o = GeneralNotificationOptions()
        XCTAssertTrue(o.isQuiet(minuteOfDay: 23 * 60 + 30))
        XCTAssertTrue(o.isQuiet(minuteOfDay: 4 * 60))
        XCTAssertFalse(o.isQuiet(minuteOfDay: 12 * 60))
        var off = o; off.quietStartMinute = 0; off.quietEndMinute = 0
        XCTAssertFalse(off.isQuiet(minuteOfDay: 0))
    }

    func testEventsHavePriorityAndRespectWindow() {
        let inWindow = NotificationEvent(id: "lesson-1", title: "درس", fireAt: now.timeIntervalSince1970 + 86400 + 18 * 3600)
        let past = NotificationEvent(id: "old", title: "قديم", fireAt: now.timeIntervalSince1970 - 3600)
        let far = NotificationEvent(id: "far", title: "بعيد", fireAt: now.timeIntervalSince1970 + 30 * 86400)
        var o = GeneralNotificationOptions(); o.dailyCap = 1
        let out = plan(o, events: [inWindow, past, far], capacity: 100)
        XCTAssertTrue(out.contains { $0.id == "sunnah.general.events.lesson-1" })
        XCTAssertFalse(out.contains { $0.id.hasSuffix(".old") || $0.id.hasSuffix(".far") })
        XCTAssertEqual(out.count, 7)
    }

    func testSoundPackFallsBackToSystemForUnapproved() {
        XCTAssertNil(NotificationSoundPack.approvedName("adhan-short-makkah.caf"))
        XCTAssertNil(NotificationSoundPack.approvedName("prayer-alert.caf"))
    }
}
