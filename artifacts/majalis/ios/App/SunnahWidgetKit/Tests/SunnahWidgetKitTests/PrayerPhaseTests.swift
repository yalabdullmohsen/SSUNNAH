import XCTest
@testable import SunnahWidgetKit

final class PrayerPhaseTests: XCTestCase {
    private let isha = Date(timeIntervalSince1970: 1_000_000)
    private var fajr: Date { isha.addingTimeInterval(8 * 3600) }
    private var dhuhr: Date { fajr.addingTimeInterval(6 * 3600) }
    private var all: [Date] { [isha, fajr, dhuhr] }

    func testOneSecondBeforeAdhanIsBefore() {
        // بعد انتهاء نافذة العشاء وقبل الفجر: تنازلي إلى الفجر مع «مضى على العشاء».
        XCTAssertEqual(PrayerPhase.resolve(now: fajr.addingTimeInterval(-1), adhans: all), .afterWindow(since: isha, next: fajr))
    }

    func testExactAdhanStartsWindow() {
        XCTAssertEqual(PrayerPhase.resolve(now: fajr, adhans: all), .inWindow(adhan: fajr, until: fajr.addingTimeInterval(1800), next: dhuhr))
    }

    func testWindowEndsAtExactlyThirtyMinutes() {
        XCTAssertEqual(PrayerPhase.resolve(now: fajr.addingTimeInterval(29 * 60 + 59), adhans: all), .inWindow(adhan: fajr, until: fajr.addingTimeInterval(1800), next: dhuhr))
        XCTAssertEqual(PrayerPhase.resolve(now: fajr.addingTimeInterval(30 * 60), adhans: all), .afterWindow(since: fajr, next: dhuhr))
    }

    func testBeforeFirstAdhanOfDataIsBefore() {
        XCTAssertEqual(PrayerPhase.resolve(now: isha.addingTimeInterval(-60), adhans: all), .before(next: isha))
    }

    func testFajrAfterIshaUsesTomorrowAdhan() {
        let late = isha.addingTimeInterval(2 * 3600)
        XCTAssertEqual(PrayerPhase.resolve(now: late, adhans: all), .afterWindow(since: isha, next: fajr))
    }

    func testAfterLastAdhanWithoutNextKeepsNilNext() {
        XCTAssertEqual(PrayerPhase.resolve(now: dhuhr.addingTimeInterval(3600), adhans: all), .afterWindow(since: dhuhr, next: nil))
        XCTAssertEqual(PrayerPhase.resolve(now: dhuhr, adhans: []), .none)
    }

    func testCustomWindowIsHonoured() {
        XCTAssertEqual(PrayerPhase.resolve(now: fajr.addingTimeInterval(20 * 60), adhans: all, window: 20 * 60), .afterWindow(since: fajr, next: dhuhr))
    }

    func testBoundariesContainAdhanAndPlusThirty() {
        let b = PrayerPhase.boundaries(after: fajr.addingTimeInterval(-1), adhans: all)
        XCTAssertEqual(Array(b.prefix(3)), [fajr, fajr.addingTimeInterval(1800), dhuhr])
        XCTAssertEqual(PrayerPhase.boundaries(after: dhuhr.addingTimeInterval(1800), adhans: all), [])
    }

    /// الجمعة: الظهر يتبع القاعدة نفسها (لا استثناء عرضي لنافذة الأذان).
    func testFridayDhuhrFollowsSameWindow() {
        var cal = Calendar(identifier: .gregorian); cal.timeZone = TimeZone(identifier: "Asia/Riyadh")!
        let friday = cal.date(from: DateComponents(year: 2026, month: 10, day: 16, hour: 11, minute: 40))!
        let asr = friday.addingTimeInterval(3.5 * 3600)
        XCTAssertEqual(cal.component(.weekday, from: friday), 6)
        XCTAssertEqual(PrayerPhase.resolve(now: friday.addingTimeInterval(1800), adhans: [friday, asr]), .afterWindow(since: friday, next: asr))
    }

    /// المناطق الزمنية: القرار مطلق اللحظة ولا يتأثر بالمنطقة الافتراضية.
    func testTimeZoneIndependent() {
        let saved = NSTimeZone.default; defer { NSTimeZone.default = saved }
        var out: [PrayerPhase] = []
        for id in ["Asia/Kuwait", "Pacific/Auckland", "America/Los_Angeles"] {
            NSTimeZone.default = TimeZone(identifier: id)!
            out.append(PrayerPhase.resolve(now: fajr.addingTimeInterval(10 * 60), adhans: all))
        }
        XCTAssertEqual(Set(out.map { "\($0)" }).count, 1)
    }
}
