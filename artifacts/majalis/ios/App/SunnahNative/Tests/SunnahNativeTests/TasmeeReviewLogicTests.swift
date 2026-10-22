import XCTest
@testable import SunnahNative

/// منطق المراجعة بلا واجهة ولا محاكي: التكرار المتباعد، الأهداف، السلسلة، سجل الجلسة، فلتر الوهم، والمخزن.
@MainActor
final class TasmeeReviewLogicTests: XCTestCase {
    private func calendar(_ tz: String = "UTC") -> Calendar {
        var c = Calendar(identifier: .gregorian); c.timeZone = TimeZone(identifier: tz)!; return c
    }
    private var cal: Calendar { calendar() }
    private func day(_ d: Int, hour: Int = 12) -> Date { cal.date(from: DateComponents(year: 2026, month: 10, day: d, hour: hour))! }
    private func rec(at date: Date, surah: Int = 18, from: Int = 1, to: Int = 3, words: Int = 20,
                     events: [TasmeeSessionEvent] = []) -> TasmeeSessionRecord {
        TasmeeSessionRecord(startedAt: date, durationSec: 60, mode: .recite, surah: surah, fromAyah: from, toAyah: to,
                            totalWords: words, events: events)
    }
    private func wrong(_ ayah: Int, _ word: Int = 0, surah: Int = 18) -> TasmeeSessionEvent {
        TasmeeSessionEvent(surah: surah, ayah: ayah, wordIndex: word, kind: .wrong)
    }
    private func days(_ from: Date, _ to: Date) -> Int? { cal.dateComponents([.day], from: from, to: to).day }

    // MARK: التكرار المتباعد

    func testDueClampsBoxIntoLadder() {
        XCTAssertEqual(days(day(1), TasmeeSpacing.due(afterBox: -3, from: day(1), calendar: cal)), 1)
        XCTAssertEqual(days(day(1), TasmeeSpacing.due(afterBox: 99, from: day(1), calendar: cal)), 32)
    }

    func testFullLadderDoublesThenMasters() {
        var it: TasmeeReviewItem? = TasmeeReviewItem(surah: 2, ayah: 255, dueAt: day(1))
        var gaps: [Int] = []
        var passes = 0
        while let cur = it, passes < 10 {
            it = TasmeeSpacing.passed(cur, now: day(1), calendar: cal)
            passes += 1
            if let n = it { gaps.append(days(day(1), n.dueAt) ?? -1) }
        }
        XCTAssertEqual(gaps, [2, 4, 8, 16, 32])
        XCTAssertEqual(passes, 6, "من الصندوق 0 يتقن بعد ست إصابات")
    }

    func testFailKeepsIdentityCountsMissAndIsDueTomorrow() {
        let it = TasmeeReviewItem(surah: 2, ayah: 255, box: 4, dueAt: day(1), misses: 1)
        let f = TasmeeSpacing.failed(it, now: day(5), calendar: cal)
        XCTAssertEqual(f.id, "2:255")
        XCTAssertEqual(f.box, 0)
        XCTAssertEqual(f.misses, 2)
        XCTAssertEqual(days(day(5), f.dueAt), 1)
    }

    func testIntervalsAreCalendarDaysAcrossDST() {
        // نهاية التوقيت الصيفي في لندن 2026-10-25: اليوم 25 ساعة، والموعد يبقى الساعة نفسها.
        let london = calendar("Europe/London")
        let now = london.date(from: DateComponents(year: 2026, month: 10, day: 24, hour: 12))!
        let due = TasmeeSpacing.due(afterBox: 0, from: now, calendar: london)
        XCTAssertEqual(london.component(.hour, from: due), 12)
        XCTAssertEqual(london.component(.day, from: due), 25)
        XCTAssertEqual(due.timeIntervalSince(now), 25 * 3600, accuracy: 1)
    }

    // MARK: الأهداف والسلسلة

    func testDailyAyahsSumsTodaysSessionsOnly() {
        let g = TasmeeGoal(kind: .dailyAyahs, dailyAyahs: 10)
        XCTAssertTrue(g.isDue(on: day(4), calendar: cal))
        XCTAssertTrue(g.isMet(on: day(4), sessions: [rec(at: day(4), from: 1, to: 3), rec(at: day(4, hour: 20), from: 4, to: 10)], calendar: cal))
        XCTAssertFalse(g.isMet(on: day(4), sessions: [rec(at: day(4), from: 1, to: 3), rec(at: day(3), from: 4, to: 10)], calendar: cal))
    }

    func testDailyAyahsDefaultsToOneAndIgnoresReversedRange() {
        let g = TasmeeGoal(kind: .dailyAyahs)
        XCTAssertTrue(g.isMet(on: day(4), sessions: [rec(at: day(4), from: 5, to: 5)], calendar: cal))
        XCTAssertFalse(g.isMet(on: day(4), sessions: [rec(at: day(4), from: 7, to: 5)], calendar: cal))
    }

    func testJuzReviewNeedsAnySessionThatDay() {
        let g = TasmeeGoal(kind: .juzReview, juz: 30)
        XCTAssertTrue(g.isDue(on: day(4), calendar: cal))
        XCTAssertFalse(g.isMet(on: day(4), sessions: [], calendar: cal))
        XCTAssertFalse(g.isMet(on: day(4), sessions: [rec(at: day(3))], calendar: cal))
        XCTAssertTrue(g.isMet(on: day(4), sessions: [rec(at: day(4), surah: 78)], calendar: cal))
    }

    func testWeeklyGoalWithoutSurahOrWeekdayIsNeverDueOrMet() {
        let g = TasmeeGoal(kind: .surahWeekly)
        XCTAssertFalse(g.isDue(on: day(23), calendar: cal))
        XCTAssertFalse(g.isMet(on: day(23), sessions: [rec(at: day(23))], calendar: cal))
    }

    func testStreakEmptyAndSameDayCountsOnce() {
        XCTAssertEqual(TasmeeStreak.current(sessions: [], now: day(5), calendar: cal), 0)
        let ss = [rec(at: day(1)), rec(at: day(2, hour: 8)), rec(at: day(2, hour: 22))]
        XCTAssertEqual(TasmeeStreak.current(sessions: ss, now: day(2), calendar: cal), 2)
    }

    func testStreakUsesLocalDayNotUTC() {
        // 23:30Z يوم 1 = 02:30 يوم 2 بتوقيت الرياض، فالجلستان في اليوم المحلي نفسه.
        let riyadh = calendar("Asia/Riyadh")
        let ss = [rec(at: day(1, hour: 23).addingTimeInterval(1800)), rec(at: day(2))]
        XCTAssertEqual(TasmeeStreak.current(sessions: ss, now: day(2, hour: 15), calendar: riyadh), 1)
        XCTAssertEqual(TasmeeStreak.current(sessions: ss, now: day(2, hour: 15), calendar: cal), 2)
    }

    // MARK: سجل الجلسة

    func testAccuracyZeroWordsAndClampedAtZero() {
        XCTAssertEqual(rec(at: day(1), words: 0, events: [wrong(1)]).accuracy, 0)
        XCTAssertEqual(rec(at: day(1), words: 1, events: [wrong(1, 0), wrong(1, 1)]).accuracy, 0)
    }

    func testWeakAyahsSortedUniqueAndErrorsPerAyah() {
        let r = rec(at: day(1), events: [
            TasmeeSessionEvent(surah: 18, ayah: 3, wordIndex: 0, kind: .extra),
            TasmeeSessionEvent(surah: 18, ayah: 1, wordIndex: 0, kind: .correct, usedPeek: true),
            TasmeeSessionEvent(surah: 18, ayah: 2, wordIndex: 0, kind: .tashkeelMaybe),
            TasmeeSessionEvent(surah: 18, ayah: 2, wordIndex: 1, kind: .correct),
            wrong(3, 1)])
        XCTAssertEqual(r.weakAyahs, [1, 3])
        XCTAssertEqual(r.errors(inAyah: 2).map(\.kind), [.tashkeelMaybe])
        XCTAssertEqual(r.errors(inAyah: 3).map(\.kind), [.extra, .wrong])
        XCTAssertEqual(r.errorWords, 1, "الزيادة لا تُعدّ كلمة مخطأً فيها")
        XCTAssertEqual(r.count(.correct), 2)
    }

    // MARK: فلتر الكلمات الوهمية

    func testGuardWarmupCountsTowardRepeatAndWhitespaceIsNormalized() {
        let g = HallucinationGuard()
        XCTAssertEqual(g.decide("ب ج", atMs: 0), .warmup)
        XCTAssertEqual(g.decide("  ب   ج ", atMs: 100), .repeat)
        XCTAssertEqual(g.decide("ب\tج", atMs: 200), .hallucination)
        XCTAssertEqual(g.decide("ب ج", atMs: 300), .hallucination, "يبقى وهمًا ما دام يتكرر")
        XCTAssertEqual(g.decide("د", atMs: 400), .use)
    }

    func testGuardEpisodeGapIsStrictAndResetStartsOver() {
        let g = HallucinationGuard()
        XCTAssertEqual(g.decide("ا", atMs: 0), .warmup)
        XCTAssertEqual(g.decide("ب", atMs: HallucinationGuard.episodeGapMs), .use, "الفاصل المساوي للحد ليس صمتًا جديدًا")
        XCTAssertEqual(g.decide("ج", atMs: HallucinationGuard.episodeGapMs * 2 + 1), .warmup)
        g.reset()
        XCTAssertEqual(g.decide("ج", atMs: HallucinationGuard.episodeGapMs * 2 + 2), .warmup)
    }

    // MARK: المخزن

    func testStorePersistsSessionsReviewAndGoals() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("tasmee-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: url) }
        let s = TasmeeHistoryStore(url: url)
        s.append(rec(at: day(1), events: [wrong(2)]), calendar: cal)
        let keep = TasmeeGoal(kind: .juzReview, juz: 30), drop = TasmeeGoal(kind: .dailyAyahs, dailyAyahs: 5)
        s.addGoal(keep); s.addGoal(drop); s.removeGoal(id: drop.id)
        let again = TasmeeHistoryStore(url: url)
        XCTAssertEqual(again.sessions, s.sessions)
        XCTAssertEqual(again.review, s.review)
        XCTAssertEqual(again.goals, [keep])
    }

    func testStoreCorruptFileStartsEmpty() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("tasmee-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: url) }
        try Data("not json".utf8).write(to: url)
        let s = TasmeeHistoryStore(url: url)
        XCTAssertTrue(s.sessions.isEmpty && s.review.isEmpty && s.goals.isEmpty)
    }

    func testStoreKeepsNewest500Sessions() {
        let s = TasmeeHistoryStore(url: nil)
        let all = (0..<501).map { rec(at: day(1).addingTimeInterval(Double($0))) }
        for r in all { s.append(r, calendar: cal) }
        XCTAssertEqual(s.sessions.count, 500)
        XCTAssertEqual(s.sessions.first?.id, all[1].id)
        XCTAssertEqual(s.sessions.last?.id, all[500].id)
    }

    func testRepeatedMistakeResetsBoxAndCountsMiss() {
        let s = TasmeeHistoryStore(url: nil)
        s.append(rec(at: day(1), events: [wrong(2)]), calendar: cal)
        s.append(rec(at: day(2)), calendar: cal)
        XCTAssertEqual(s.review.first?.box, 1)
        s.append(rec(at: day(4), events: [wrong(2)]), calendar: cal)
        XCTAssertEqual(s.review.count, 1)
        XCTAssertEqual(s.review.first?.box, 0)
        XCTAssertEqual(s.review.first?.misses, 2)
        XCTAssertEqual(s.review.first.flatMap { days(day(4), $0.dueAt) }, 1)
    }

    func testCorrectRecitationOnlyPromotesDueItemsInRangeAndSurah() {
        let s = TasmeeHistoryStore(url: nil)
        s.append(rec(at: day(1), events: [wrong(2)]), calendar: cal)
        s.append(rec(at: day(1, hour: 18)), calendar: cal)                     // لم يحن موعدها
        s.append(rec(at: day(3), from: 5, to: 7), calendar: cal)               // خارج النطاق
        s.append(rec(at: day(3), surah: 19, from: 1, to: 3), calendar: cal)    // سورة أخرى
        XCTAssertEqual(s.review.map(\.box), [0])
        XCTAssertEqual(s.dueReview(now: day(3)).map(\.ayah), [2])
    }

    func testItemGraduatesAfterFullLadder() {
        let s = TasmeeHistoryStore(url: nil)
        s.append(rec(at: day(1), events: [wrong(2)]), calendar: cal)
        var passes = 0
        while let it = s.review.first, passes < 10 {
            s.append(rec(at: it.dueAt), calendar: cal)
            passes += 1
        }
        XCTAssertTrue(s.review.isEmpty)
        XCTAssertEqual(passes, 6)
    }

    func testDueReviewSortedByDateThenSurahThenAyah() {
        let s = TasmeeHistoryStore(url: nil)
        s.append(rec(at: day(2), surah: 2, from: 1, to: 1, events: [wrong(1, surah: 2)]), calendar: cal)
        s.append(rec(at: day(1), from: 1, to: 3, events: [wrong(3), wrong(1)]), calendar: cal)
        XCTAssertEqual(s.dueReview(now: day(9)).map(\.id), ["18:1", "18:3", "2:1"])
        XCTAssertEqual(s.dueReview(now: day(2)).map(\.id), ["18:1", "18:3"])
    }

    func testStrengthUsesLastThreeSessionsAndThresholdIsInclusive() {
        let s = TasmeeHistoryStore(url: nil)
        s.append(rec(at: day(1), words: 10, events: [wrong(1, 0), wrong(1, 1), wrong(1, 2)]), calendar: cal)
        XCTAssertEqual(s.strength(ofSurah: 18), .needsReview)
        for d in 2...4 { s.append(rec(at: day(d), words: 10, events: [wrong(1, 0)]), calendar: cal) }
        XCTAssertEqual(s.strength(ofSurah: 18), .strong, "0.9 بالضبط قوية، والجلسة الأولى خرجت من آخر ثلاث")
        XCTAssertEqual(s.strength(ofSurah: 19), .untouched)
    }

    func testErrorLogRanksByCountAndHonoursLimit() {
        let s = TasmeeHistoryStore(url: nil)
        s.append(rec(at: day(1), events: [wrong(3), wrong(1)]), calendar: cal)
        s.append(rec(at: day(2), events: [wrong(3)]), calendar: cal)
        XCTAssertEqual(s.errorLog().map { $0.ayah }, [3, 1])
        XCTAssertEqual(s.errorLog().map { $0.count }, [2, 1])
        XCTAssertEqual(s.errorLog(limit: 1).count, 1)
    }
}
