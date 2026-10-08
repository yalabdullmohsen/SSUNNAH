import XCTest
import SunnahPrayer
@testable import SunnahWidgetKit

final class LiveClockTests: XCTestCase {
    private let t0 = Date(timeIntervalSince1970: 1_791_000_000)

    func testFormatUnderAndOverHour() {
        XCTAssertEqual(LiveClock.format(seconds: 0), "٠٠:٠٠")
        XCTAssertEqual(LiveClock.format(seconds: 390), "٠٦:٣٠")
        XCTAssertEqual(LiveClock.format(seconds: 3599), "٥٩:٥٩")
        XCTAssertEqual(LiveClock.format(seconds: 3600), "١:٠٠:٠٠")
        XCTAssertEqual(LiveClock.format(seconds: 3600 + 6 * 60 + 30), "١:٠٦:٣٠")
        XCTAssertEqual(LiveClock.format(seconds: -5), "٠٠:٠٠")
    }

    func testMinutesBeforePrayerCountsDown() {
        let next = t0.addingTimeInterval(14 * 60)
        let mode = LiveClock.resolve(now: t0, elapsedStart: nil, nextDate: next, nextHasStarted: false)
        XCTAssertEqual(mode, .countDown(until: next))
        XCTAssertEqual(LiveClock.staticText(mode, now: t0), "١٤:٠٠")
    }

    func testAtEntryInstantStartsCountUpAtZero() {
        let mode = LiveClock.resolve(now: t0, elapsedStart: t0, nextDate: t0.addingTimeInterval(3 * 3600), nextHasStarted: false)
        XCTAssertEqual(mode, .countUp(since: t0))
        XCTAssertEqual(LiveClock.staticText(mode, now: t0), "٠٠:٠٠")
    }

    func testSecondsAfterEntryCountsUp() {
        let now = t0.addingTimeInterval(7)
        let mode = LiveClock.resolve(now: now, elapsedStart: t0, nextDate: t0.addingTimeInterval(3 * 3600), nextHasStarted: false)
        XCTAssertEqual(LiveClock.staticText(mode, now: now), "٠٠:٠٧")
    }

    func testStartedWithoutElapsedWindow() {
        XCTAssertEqual(LiveClock.resolve(now: t0, elapsedStart: nil, nextDate: t0, nextHasStarted: true), .started)
    }

    func testHoursBoundaryForCountDown() {
        XCTAssertFalse(LiveClock.showsHours(seconds: 3599))
        XCTAssertTrue(LiveClock.showsHours(seconds: 3600))
    }

    /// عبور منتصف الليل: بين العشاء ومنتصف الليل والفجر التالي يبقى العدّ التنازلي إلى فجر الغد صحيحًا.
    func testAcrossMidnightCountsDownToTomorrowFajr() throws {
        let loc = GalleryPrayer.defaultLocation
        let tz = try XCTUnwrap(TimeZone(identifier: loc.timeZoneIdentifier))
        var cal = Calendar(identifier: .gregorian); cal.timeZone = tz
        let late = try XCTUnwrap(cal.date(from: DateComponents(year: 2026, month: 10, day: 8, hour: 23, minute: 50)))
        let after = late.addingTimeInterval(20 * 60) // 00:10 يوم ٩
        let before = try XCTUnwrap(GalleryPrayer.day(now: late))
        let afterDay = try XCTUnwrap(GalleryPrayer.day(now: after))
        XCTAssertEqual(before.nextKey, "fajr")
        XCTAssertEqual(afterDay.nextKey, "fajr")
        XCTAssertEqual(before.nextEpochMs, afterDay.nextEpochMs, "فجر الغد نفسه قبل منتصف الليل وبعده")
        let fajr = Date(timeIntervalSince1970: Double(afterDay.nextEpochMs) / 1000)
        XCTAssertEqual(LiveClock.resolve(now: after, elapsedStart: nil, nextDate: fajr, nextHasStarted: false), .countDown(until: fajr))
        XCTAssertTrue(fajr.timeIntervalSince(after) < 8 * 3600)
    }

    /// تغيّر المنطقة الزمنية لا يغيّر المدة: العدّ يعتمد على لحظات مطلقة.
    func testTimeZoneChangeDoesNotChangeDuration() {
        let next = t0.addingTimeInterval(12 * 60 + 5)
        let saved = NSTimeZone.default
        defer { NSTimeZone.default = saved }
        var texts: [String] = []
        for id in ["Asia/Kuwait", "Pacific/Auckland", "America/Los_Angeles"] {
            NSTimeZone.default = TimeZone(identifier: id)!
            let m = LiveClock.resolve(now: t0, elapsedStart: nil, nextDate: next, nextHasStarted: false)
            texts.append(LiveClock.staticText(m, now: t0)!)
        }
        XCTAssertEqual(Set(texts), ["١٢:٠٥"])
    }

    /// كل الودجات تستعمل المحلّل نفسه: لا مسارات عدّ مستقلة في ملفات الودجات.
    func testAllWidgetsShareOneClockComponent() throws {
        let dir = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("PrayerWidget")
        let files = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
            .filter { $0.pathExtension == "swift" }
        XCTAssertFalse(files.isEmpty)
        for f in files {
            let s = try String(contentsOf: f, encoding: .utf8)
            let name = f.lastPathComponent
            for banned in ["staticRemaining(", "staticElapsed(", "مضى ٤٠ د", "\"٢٥ د\""] {
                XCTAssertFalse(s.contains(banned), "\(name) يحتوي \(banned)")
            }
            if name != "PrayerWidgetViews.swift" {
                XCTAssertFalse(s.contains("style: .timer"), "\(name): عدّ حي خارج PrayerLiveClock")
                XCTAssertFalse(s.contains("timerInterval:"), "\(name): عدّ حي خارج PrayerLiveClock")
            }
        }
    }
}
