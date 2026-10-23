import XCTest
@testable import SunnahNative

final class TasmeeDayHeatmapTests: XCTestCase {
    private var cal: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; return c }
    private let now = Date(timeIntervalSince1970: 1_760_000_000)

    private func rec(daysAgo: Int, words: Int, wrong: Int = 0) -> TasmeeSessionRecord {
        let at = cal.date(byAdding: .day, value: -daysAgo, to: now)!
        let evs = (0..<wrong).map { TasmeeSessionEvent(surah: 2, ayah: 1, wordIndex: $0, kind: .wrong) }
        return TasmeeSessionRecord(startedAt: at, durationSec: 60, mode: .recite, surah: 2, fromAyah: 1, toAyah: 5, totalWords: words, events: evs)
    }

    func testLengthOrderAndEmptyDays() {
        let h = TasmeeDayHeatmap.build(sessions: [], now: now, days: 7, calendar: cal)
        XCTAssertEqual(h.count, 7)
        XCTAssertTrue(h.allSatisfy { $0.level == 0 && $0.accuracy == nil })
        XCTAssertEqual(h.last?.day, cal.startOfDay(for: now))
    }

    func testSameDaySessionsMergeWithWeightedAccuracy() {
        let h = TasmeeDayHeatmap.build(sessions: [rec(daysAgo: 1, words: 100, wrong: 10), rec(daysAgo: 1, words: 100)], now: now, days: 3, calendar: cal)
        XCTAssertEqual(h[1].words, 200)
        XCTAssertEqual(h[1].accuracy ?? 0, 0.95, accuracy: 0.0001)
        XCTAssertEqual(h[1].level, 3)
    }

    func testOutsideWindowIgnoredAndLevelBounds() {
        let h = TasmeeDayHeatmap.build(sessions: [rec(daysAgo: 10, words: 900)], now: now, days: 3, calendar: cal)
        XCTAssertTrue(h.allSatisfy { $0.words == 0 })
        XCTAssertEqual([0, 1, 49, 50, 199, 200, 499, 500].map(TasmeeDayHeatmap.level(words:)), [0, 1, 1, 2, 2, 3, 3, 4])
    }
}
