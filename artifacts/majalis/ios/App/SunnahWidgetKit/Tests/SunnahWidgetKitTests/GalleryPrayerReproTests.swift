import XCTest
@testable import SunnahWidgetKit

/// إعادة إنتاج PR-B: الخميس ٨ أكتوبر ٢٠٢٦ بالكويت، ٥:١٢ م → التالية المغرب ٥:٢٦ ثم العشاء.
/// قبل الإصلاح: المعرض يصنع «الظهر» بعد ٢٥ دقيقة من الآن (٥:٣٧ م) بتوقيت الرياض.
final class GalleryPrayerReproTests: XCTestCase {
    private let tz = TimeZone(identifier: "Asia/Kuwait")!
    private func at(_ h: Int, _ m: Int) -> Date {
        var c = Calendar(identifier: .gregorian); c.timeZone = tz
        return c.date(from: DateComponents(year: 2026, month: 10, day: 8, hour: h, minute: m))!
    }

    func testNextAtFiveTwelveIsMaghribThenIsha() throws {
        let d = try XCTUnwrap(GalleryPrayer.day(now: at(17, 12)))
        XCTAssertEqual(d.nextKey, "maghrib")
        XCTAssertEqual(d.nextNameAr, "المغرب")
        var c = Calendar(identifier: .gregorian); c.timeZone = tz
        let t = c.dateComponents([.hour, .minute], from: Date(timeIntervalSince1970: Double(d.nextEpochMs) / 1000))
        XCTAssertEqual(t.hour, 17); XCTAssertTrue((25...27).contains(t.minute ?? 0))
        let after = try XCTUnwrap(GalleryPrayer.day(now: Date(timeIntervalSince1970: Double(d.nextEpochMs) / 1000 + 1)))
        XCTAssertEqual(after.nextKey, "isha")
    }

    func testNextNeverDependsOnOffsetFromNow() throws {
        // الصلاة التالية تتبع الجدول لا الساعة: عند ٣:٠٠ فجرًا التالية الفجر لا «الظهر بعد ٢٥ د».
        let d = try XCTUnwrap(GalleryPrayer.day(now: at(3, 0)))
        XCTAssertEqual(d.nextKey, "fajr")
    }

    func testWidgetGalleryHasNoSyntheticNextPrayer() throws {
        let url = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("PrayerWidget/PrayerWidgetEntry.swift")
        let src = try String(contentsOf: url, encoding: .utf8)
        XCTAssertFalse(src.contains("addingTimeInterval(25 * 60)"), "المعرض يصنع صلاة تالية مزيفة")
        XCTAssertFalse(src.contains("\"Asia/Riyadh\""), "المعرض مثبّت على الرياض")
    }
}
