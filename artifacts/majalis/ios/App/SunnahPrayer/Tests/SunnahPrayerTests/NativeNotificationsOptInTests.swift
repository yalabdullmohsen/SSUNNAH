import XCTest
@testable import SunnahPrayer

final class NativeNotificationsOptInTests: XCTestCase {
    private func freshDefaults() -> UserDefaults {
        let name = "optin-tests-\(UUID().uuidString)"
        let d = UserDefaults(suiteName: name)!
        d.removePersistentDomain(forName: name)
        return d
    }

    func testNoStoredRecordMeansNothingEnabled() {
        let optIn = NativeNotificationsOptIn.read(from: freshDefaults())
        XCTAssertFalse(optIn.prayer)
        XCTAssertFalse(optIn.adhkar)
        XCTAssertFalse(optIn.isAnyEnabled)
    }

    func testRoundTripThroughAppGroupDefaults() {
        let d = freshDefaults()
        NativeNotificationsOptIn(prayer: false, adhkar: true).write(to: d)
        let back = NativeNotificationsOptIn.read(from: d)
        XCTAssertTrue(back.adhkar)
        XCTAssertFalse(back.prayer)
        XCTAssertTrue(back.isAnyEnabled)
    }

    func testLimitingDisablesEveryGroupWithoutConsent() {
        let all = GeneralNotificationOptions(adhkarEnabled: true, wirdEnabled: true, periodicEnabled: true, eventsEnabled: true)
        let none = NativeNotificationsOptIn().limiting(all)
        XCTAssertFalse(none.adhkarEnabled)
        XCTAssertFalse(none.wirdEnabled)
        XCTAssertFalse(none.periodicEnabled)
        XCTAssertFalse(none.eventsEnabled)
        // بلا موافقة لا تُزال إشعارات الويب أيضًا: لا مجموعة أصلية تحل محلها.
        XCTAssertTrue(LegacyWebNotifications.identifiers(replacedBy: none).isEmpty)
    }

    func testAdhkarConsentKeepsAgreedLimitsAndOtherGroupsOff() {
        let limited = NativeNotificationsOptIn(adhkar: true).limiting(GeneralNotificationOptions(wirdEnabled: true, periodicEnabled: true, eventsEnabled: true))
        XCTAssertTrue(limited.adhkarEnabled)
        XCTAssertFalse(limited.wirdEnabled || limited.periodicEnabled || limited.eventsEnabled)
        XCTAssertEqual(limited.quietStartMinute, 23 * 60)
        XCTAssertEqual(limited.quietEndMinute, 5 * 60)
        XCTAssertEqual(limited.dailyCap, 6)
    }

    func testStoredAdhkarOffStaysOffEvenWithConsentFlagOn() {
        let limited = NativeNotificationsOptIn(adhkar: true).limiting(GeneralNotificationOptions(adhkarEnabled: false))
        XCTAssertFalse(limited.adhkarEnabled)
    }
}
