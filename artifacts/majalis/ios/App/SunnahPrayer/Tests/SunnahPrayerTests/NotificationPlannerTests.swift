import XCTest
@testable import SunnahPrayer

final class NotificationPlannerTests: XCTestCase {
    let location = PrayerLocation.kuwaitCity
    let settings = PrayerSettings()
    // 2026-03-01 00:00 بتوقيت الكويت.
    let now = Date(timeIntervalSince1970: 1_772_312_400)

    func slot(_ alerts: Int, adhan: Bool = true, chain: Int = 4) -> PrayerNotificationPlanner.Slot {
        .init(prayer: .dhuhr, dayKey: "d", time: now, alertCount: alerts, adhan: adhan, chainLength: chain)
    }

    func testBudgetMatchesWebPolicy() {
        // 30 صلاة بكلفة دنيا 2 → 20 تتسع في 40 ولا تبقى حصة للترقية.
        let plans = PrayerNotificationPlanner.budget(Array(repeating: slot(1), count: 30))
        XCTAssertEqual(plans.filter(\.include).count, 20)
        XCTAssertFalse(plans[20].include)
        XCTAssertEqual(plans.map(\.cost).reduce(0, +), 40)
        // 10 صلوات بكلفة 1 → يتبقى 30 فتُرقّى أقرب 4 فقط إلى أذان كامل.
        let small = PrayerNotificationPlanner.budget(Array(repeating: slot(0), count: 10))
        XCTAssertEqual(small.prefix(4).map(\.segmentCount), [4, 4, 4, 4])
        XCTAssertEqual(small[4].segmentCount, 1)
    }

    func testNoGapAfterFirstSlotThatDoesNotFit() {
        let plans = PrayerNotificationPlanner.budget([slot(1), slot(10), slot(0)], share: 5)
        XCTAssertEqual(plans.map(\.include), [true, false, false])
    }

    func testDefaultPlanCoversSevenDaysWithinShare() {
        let planned = PrayerNotificationPlanner.plan(location: location, settings: settings,
                                                     options: PrayerNotificationOptions(), now: now)
        XCTAssertLessThanOrEqual(planned.count, PrayerNotificationBudget.prayerShare)
        XCTAssertEqual(Set(planned.map(\.id)).count, planned.count, "معرّفات فريدة")
        XCTAssertFalse(planned.contains { $0.prayer == .sunrise })
        let span = planned.last!.fireDate.timeIntervalSince(planned.first!.fireDate)
        XCTAssertGreaterThan(span, 6 * 86400)
        // 35 صلاة × 1 = 35، والباقي 5 يتسع لترقية واحدة (+3) كالويب.
        XCTAssertEqual(planned.count, 38)
        XCTAssertEqual(planned.filter { $0.kind == .adhanSegment }.count, 3)
        XCTAssertTrue(planned.allSatisfy { $0.fireDate > now })
    }

    func testPreAlertAndSilentAdhan() {
        let opts = PrayerNotificationOptions(enabledPrayers: [.maghrib], minutesBefore: 10, adhanEnabled: false)
        let planned = PrayerNotificationPlanner.plan(location: location, settings: settings, options: opts, now: now)
        XCTAssertEqual(planned.count, 14)
        let first = planned.prefix(2)
        XCTAssertEqual(first.map(\.kind), [.pre, .enter])
        XCTAssertEqual(first.last!.fireDate.timeIntervalSince(first.first!.fireDate), 600)
        XCTAssertEqual(first.last!.sound, "prayer_default.caf")
    }

    func testOptionsRoundTrip() {
        let defaults = UserDefaults(suiteName: "test.\(UUID())")!
        XCTAssertEqual(PrayerNotificationOptions.read(from: defaults), PrayerNotificationOptions())
        let opts = PrayerNotificationOptions(enabledPrayers: [.fajr], minutesBefore: 5, adhanEnabled: false, fullAdhanChain: false)
        opts.save(to: defaults)
        XCTAssertEqual(PrayerNotificationOptions.read(from: defaults), opts)
    }
}
