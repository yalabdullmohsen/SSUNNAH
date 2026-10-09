import XCTest
@testable import SunnahPrayer

final class LegacyWebNotificationsTests: XCTestCase {
    func testAdhkarEnabledRemovesWebAdhkarOnly() {
        let ids = LegacyWebNotifications.identifiers(replacedBy: GeneralNotificationOptions())
        for id in ["9700", "9850", "9998", "9999", "9601", "9604"] { XCTAssertTrue(ids.contains(id), id) }
        // الافتراضي: الورد والدوري مطفآن، فتبقى تذكيرات الويب الخاصة بهما.
        for id in ["9301", "9401", "9605", "9600"] { XCTAssertFalse(ids.contains(id), id) }
    }

    func testDisabledGroupsKeepWebReminders() {
        let off = GeneralNotificationOptions(adhkarEnabled: false, wirdEnabled: false, periodicEnabled: false)
        XCTAssertTrue(LegacyWebNotifications.identifiers(replacedBy: off).isEmpty)
    }

    func testWirdAndPeriodicReplaceTheirWebCounterparts() {
        let on = GeneralNotificationOptions(adhkarEnabled: false, wirdEnabled: true, periodicEnabled: true)
        let ids = LegacyWebNotifications.identifiers(replacedBy: on)
        XCTAssertEqual(ids, Set(["9301"] + (9401...9407).map(String.init)))
    }

    /// لا تكرار: بعد إزالة نظائر الويب لا يبقى تذكير أذكار إلا من الصدفة الأصلية.
    func testNoDuplicateAdhkarAfterCleanup() {
        let options = GeneralNotificationOptions()
        let webAdhkarPending = (9700...9713).map(String.init) + ["9601", "9602", "9604", "9999"]
        let legacy = LegacyWebNotifications.identifiers(replacedBy: options)
        XCTAssertTrue(webAdhkarPending.allSatisfy(legacy.contains))
        let native = GeneralNotificationPlanner.plan(location: .kuwaitCity, settings: PrayerSettings(), options: options,
                                                     events: [], now: Date(timeIntervalSince1970: 1_772_312_400), capacity: 24)
        XCTAssertFalse(native.isEmpty)
        XCTAssertTrue(native.allSatisfy { !legacy.contains($0.id) })
    }
}
