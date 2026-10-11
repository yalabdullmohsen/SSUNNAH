import XCTest
@testable import SunnahPrayer

final class NotificationPlannerTests: XCTestCase {
    let location = PrayerLocation.kuwaitCity
    let settings = PrayerSettings()
    // 2026-03-01 00:00 بتوقيت الكويت.
    let now = Date(timeIntervalSince1970: 1_772_312_400)

    func slot(_ alerts: Int) -> PrayerNotificationPlanner.Slot {
        .init(prayer: .dhuhr, dayKey: "d", time: now, alertCount: alerts)
    }

    func testBudgetCoversNearestWithoutGaps() {
        // 30 صلاة بتنبيهين → 20 تتسع في 40 ولا فجوة بعدها.
        let keep = PrayerNotificationPlanner.budget(Array(repeating: slot(2), count: 30))
        XCTAssertEqual(keep.filter { $0 }.count, 20)
        XCTAssertFalse(keep[20])
        let gap = PrayerNotificationPlanner.budget([slot(1), slot(10), slot(0)], share: 5)
        XCTAssertEqual(gap, [true, false, false])
    }

    func testDefaultPlanTwoPhraseAlertsPerPrayer() {
        let planned = PrayerNotificationPlanner.plan(location: location, settings: settings,
                                                     options: PrayerNotificationOptions(), now: now)
        XCTAssertLessThanOrEqual(planned.count, PrayerNotificationBudget.prayerShare)
        XCTAssertEqual(Set(planned.map(\.id)).count, planned.count, "معرّفات فريدة")
        XCTAssertFalse(planned.contains { $0.prayer == .sunrise })
        XCTAssertEqual(planned.count, 40)
        XCTAssertTrue(planned.allSatisfy { $0.fireDate > now })
        XCTAssertTrue(planned.filter { $0.kind == .pre }.allSatisfy { $0.title.hasPrefix("اقترب أذان ") })
        XCTAssertTrue(planned.filter { $0.kind == .enter }.allSatisfy { $0.title.hasPrefix("حان الآن موعد أذان ") })
        let allowed = Set(PrayerNotificationPlanner.allSoundNames)
        XCTAssertEqual(allowed.count, 10)
        XCTAssertTrue(planned.allSatisfy { allowed.contains($0.sound) })
        XCTAssertFalse(planned.contains { $0.sound.contains("adhan") })
    }

    func testPreAlertAndEnterSounds() {
        let opts = PrayerNotificationOptions(enabledPrayers: [.maghrib], minutesBefore: 10)
        let planned = PrayerNotificationPlanner.plan(location: location, settings: settings, options: opts, now: now)
        XCTAssertEqual(planned.count, 14)
        let first = planned.prefix(2)
        XCTAssertEqual(first.map(\.kind), [.pre, .enter])
        XCTAssertEqual(first.last!.fireDate.timeIntervalSince(first.first!.fireDate), 600)
        XCTAssertEqual(first.map(\.sound), ["prayer_pre_maghrib.caf", "prayer_now_maghrib.caf"])
    }

    func testNoPreAlertWhenDisabled() {
        let opts = PrayerNotificationOptions(enabledPrayers: [.fajr], minutesBefore: 0)
        let planned = PrayerNotificationPlanner.plan(location: location, settings: settings, options: opts, now: now)
        XCTAssertEqual(planned.count, 7)
        XCTAssertTrue(planned.allSatisfy { $0.kind == .enter })
    }

    func testOptionsRoundTrip() {
        let defaults = UserDefaults(suiteName: "test.\(UUID())")!
        XCTAssertEqual(PrayerNotificationOptions.read(from: defaults), PrayerNotificationOptions())
        let opts = PrayerNotificationOptions(enabledPrayers: [.fajr], minutesBefore: 5)
        opts.save(to: defaults)
        XCTAssertEqual(PrayerNotificationOptions.read(from: defaults), opts)
    }
}
