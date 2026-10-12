import XCTest
@testable import SunnahNative

final class WidgetCenterTests: XCTestCase {
    private func pool(_ n: Int) -> [DailyAyahEntry] {
        (0..<n).map { DailyAyahEntry(id: "da-\($0)", text: "t", surah: "s", ayahNumber: $0, reference: "r", meaning: "m") }
    }

    func testEmptyPoolYieldsNil() {
        XCTAssertNil(DailyAyahEntry.pick(from: [], on: Date()))
    }

    func testPickMatchesSiteDayIndex() {
        // 2026-01-01 (Asia/Kuwait) = يوم 20454 منذ epoch؛ 20454 % 30 = 24
        let date = ISO8601DateFormatter().date(from: "2026-01-01T09:00:00Z")!
        XCTAssertEqual(DailyAyahEntry.pick(from: pool(30), on: date)?.id, "da-24")
    }
}
