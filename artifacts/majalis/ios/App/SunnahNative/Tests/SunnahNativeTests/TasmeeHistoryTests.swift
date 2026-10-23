import XCTest
@testable import SunnahNative

@MainActor
final class TasmeeHistoryTests: XCTestCase {
    private var cal: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: "UTC")!; return c }
    private func day(_ d: Int) -> Date { cal.date(from: DateComponents(year: 2026, month: 10, day: d, hour: 12))! }
    private func rec(_ d: Int, surah: Int = 18, from: Int = 1, to: Int = 3, words: Int = 20, errs: [(Int, Int)] = []) -> TasmeeSessionRecord {
        TasmeeSessionRecord(startedAt: day(d), durationSec: 60, mode: .recite, surah: surah, fromAyah: from, toAyah: to,
                            totalWords: words, events: errs.map { TasmeeSessionEvent(surah: surah, ayah: $0.0, wordIndex: $0.1, kind: .wrong) })
    }

    func testAccuracyCountsEachWrongWordOnce() {
        let r = TasmeeSessionRecord(startedAt: day(1), durationSec: 1, mode: .recite, surah: 1, fromAyah: 1, toAyah: 1, totalWords: 10, events: [
            .init(surah: 1, ayah: 1, wordIndex: 2, kind: .wrong), .init(surah: 1, ayah: 1, wordIndex: 2, kind: .wrong),
            .init(surah: 1, ayah: 1, wordIndex: 3, kind: .skipped, usedPeek: true), .init(surah: 1, ayah: 1, wordIndex: 4, kind: .extra)])
        XCTAssertEqual(r.accuracy, 0.8, accuracy: 1e-9)
        XCTAssertEqual(r.errorWords, 2)
    }

    func testPeekCountsAgainstAccuracyAndTashkeelDoesNot() {
        let r = TasmeeSessionRecord(startedAt: day(1), durationSec: 1, mode: .exam, surah: 1, fromAyah: 1, toAyah: 1, totalWords: 4, events: [
            .init(surah: 1, ayah: 1, wordIndex: 0, kind: .correct, usedPeek: true), .init(surah: 1, ayah: 1, wordIndex: 1, kind: .tashkeelMaybe)])
        XCTAssertEqual(r.accuracy, 0.75, accuracy: 1e-9)
    }

    func testErrorKindLabelsMarkTashkeelAsMaybe() {
        XCTAssertEqual(TasmeeReportFormat.label(.tashkeelMaybe), "تشكيل (محتمل)")
        XCTAssertEqual(TasmeeReportFormat.label(.wrong), "خاطئة")
        XCTAssertEqual(TasmeeReportFormat.label(.skipped), "متروكة")
        XCTAssertEqual(TasmeeReportFormat.label(.extra), "زائدة")
        XCTAssertEqual(TasmeeReportFormat.detail(.init(surah: 1, ayah: 1, wordIndex: 0, kind: .wrong, said: "أ", expected: "ب")), "قلتَ: أ، الصواب: ب")
    }

    func testCodableRoundTrip() throws {
        let r = rec(1, errs: [(2, 1)])
        XCTAssertEqual(try JSONDecoder().decode(TasmeeSessionRecord.self, from: JSONEncoder().encode(r)), r)
    }

    func testSpacingFailResetsAndPassClimbs() {
        let it = TasmeeReviewItem(surah: 1, ayah: 1, box: 3, dueAt: day(1))
        XCTAssertEqual(TasmeeSpacing.failed(it, now: day(1), calendar: cal).box, 0)
        let up = TasmeeSpacing.passed(it, now: day(1), calendar: cal)!
        XCTAssertEqual(up.box, 4)
        XCTAssertEqual(cal.dateComponents([.day], from: day(1), to: up.dueAt).day, 16)
        XCTAssertNil(TasmeeSpacing.passed(TasmeeReviewItem(surah: 1, ayah: 1, box: TasmeeSpacing.maxBox, dueAt: day(1)), now: day(1), calendar: cal))
    }

    func testStoreAddsWeakAyahToReviewAndGraduatesOnPass() {
        let s = TasmeeHistoryStore(url: nil)
        s.append(rec(1, errs: [(2, 1)]), calendar: cal)
        XCTAssertEqual(s.review.map(\.ayah), [2])
        XCTAssertTrue(s.dueReview(now: day(1)).isEmpty)
        XCTAssertEqual(s.dueReview(now: day(3)).count, 1)
        s.append(rec(3), calendar: cal)
        XCTAssertEqual(s.review.first?.box, 1)
    }

    func testStreakTodayOrYesterdayAndGap() {
        let ss = [rec(1), rec(2), rec(3), rec(5)]
        XCTAssertEqual(TasmeeStreak.current(sessions: ss, now: day(5), calendar: cal), 1)
        XCTAssertEqual(TasmeeStreak.current(sessions: ss, now: day(4), calendar: cal), 3)
        XCTAssertEqual(TasmeeStreak.current(sessions: ss, now: day(8), calendar: cal), 0)
    }

    func testFridayGoal() {
        let g = TasmeeGoal(kind: .surahWeekly, surah: 18, weekday: 6)
        let fri = day(23) // 2026-10-23 جمعة
        XCTAssertTrue(g.isDue(on: fri, calendar: cal))
        XCTAssertFalse(g.isDue(on: day(22), calendar: cal))
        XCTAssertTrue(g.isMet(on: fri, sessions: [rec(23)], calendar: cal))
        XCTAssertFalse(g.isMet(on: fri, sessions: [rec(23, surah: 2)], calendar: cal))
    }

    func testStrengthAndErrorLog() {
        let s = TasmeeHistoryStore(url: nil)
        XCTAssertEqual(s.strength(ofSurah: 18), .untouched)
        s.append(rec(1, errs: [(2, 1), (2, 2), (2, 3)]), calendar: cal)
        XCTAssertEqual(s.strength(ofSurah: 18), .needsReview)
        s.append(rec(2, errs: [(2, 1)]), calendar: cal)
        XCTAssertEqual(s.errorLog().first?.ayah, 2)
        XCTAssertEqual(s.errorLog().first?.count, 2)
    }
}
