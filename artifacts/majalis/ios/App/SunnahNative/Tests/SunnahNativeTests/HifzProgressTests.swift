import XCTest
@testable import SunnahNative

final class HifzProgressTests: XCTestCase {
    /// فهرس مصغّر: 3 سور، 30 جزءًا موزّعة بالتساوي (الجزء ج يبدأ 20(ج-1)+1 تقريبًا).
    private func makeIndex() throws -> MushafIndex {
        let juz = (0..<30).map { $0 * 20 + 1 }
        let json = """
        {"surahs":[
         {"id":1,"name":"الفاتحة","ayahs":7,"firstPage":1,"lastPage":1,"place":"مكية","bismillahPre":false},
         {"id":2,"name":"البقرة","ayahs":286,"firstPage":2,"lastPage":49,"place":"مدنية","bismillahPre":true},
         {"id":3,"name":"آل عمران","ayahs":200,"firstPage":50,"lastPage":76,"place":"مدنية","bismillahPre":true}],
         "juzStart":\(juz),
         "ayahPage":{"2:1":2,"2:2":2,"2:50":9,"3:1":50}}
        """
        return try JSONDecoder().decode(MushafIndex.self, from: Data(json.utf8))
    }

    func testEmptyOverall() {
        let s = HifzProgress().overall
        XCTAssertEqual(s.total, 604)
        XCTAssertEqual(s.memorizedFraction, 0)
        XCTAssertEqual(s.derived, .none)
    }

    func testRatiosAndReviewCountsAsMemorized() {
        var p = HifzProgress()
        p.set(.memorized, pages: 1...60)
        p.set(.review, pages: 61...72)
        p.set(.partial, pages: 73...90)
        let s = p.overall
        XCTAssertEqual(s.memorized, 60)
        XCTAssertEqual(s.review, 12)
        XCTAssertEqual(s.partial, 18)
        XCTAssertEqual(s.memorizedTotal, 72)
        XCTAssertEqual(s.none, 604 - 90)
        XCTAssertEqual(s.memorizedFraction, 72.0 / 604.0, accuracy: 1e-9)
        XCTAssertEqual(HifzSummary.percent(s.memorizedFraction), 12)
    }

    func testDerivedState() {
        var p = HifzProgress()
        p.set(.memorized, pages: 1...20)
        XCTAssertEqual(p.summary(1...20).derived, .memorized)
        XCTAssertEqual(p.summary(1...30).derived, .partial)
        p.set(.review, pages: 5...5)
        XCTAssertEqual(p.summary(1...20).derived, .review)
        XCTAssertEqual(p.summary(100...120).derived, .none)
    }

    func testSettingNoneRemovesEntries() {
        var p = HifzProgress()
        p.set(.memorized, pages: 10...12)
        p.set(.none, pages: 11...11)
        XCTAssertEqual(p.state(10), .memorized)
        XCTAssertEqual(p.state(11), .none)
        XCTAssertEqual(p.overall.memorized, 2)
    }

    func testRangeClampedTo604() {
        var p = HifzProgress()
        p.set(.memorized, pages: 600...700)
        XCTAssertEqual(p.overall.memorized, 5)
    }

    func testJuzSurahHizbDerivation() throws {
        let idx = try makeIndex()
        var p = HifzProgress()
        p.set(.memorized, pages: 1...20)
        XCTAssertEqual(p.juzSummary(1, juzStart: idx.juzStart).derived, .memorized)
        XCTAssertEqual(p.juzSummary(2, juzStart: idx.juzStart).derived, .none)
        XCTAssertEqual(HifzProgress.juzPages(30, juzStart: idx.juzStart).upperBound, 604)
        XCTAssertEqual(p.surahSummary(idx.surahs[0]).derived, .memorized)
        XCTAssertEqual(p.surahSummary(idx.surahs[1]).memorized, 19)
        XCTAssertEqual(p.hizbSummary(1, juzStart: idx.juzStart).derived, .memorized)
        XCTAssertEqual(p.hizbSummary(2, juzStart: idx.juzStart).memorized, 10)
        XCTAssertEqual(p.topSurahs(idx.surahs, limit: 1).first?.surah.id, 1)
    }

    func testStreak() {
        let cal = Calendar.hifz
        let today = cal.date(from: DateComponents(year: 2026, month: 10, day: 19, hour: 12))!
        var p = HifzProgress()
        for back in 0..<3 {
            p.set(.partial, pages: 1...1, date: cal.date(byAdding: .day, value: -back, to: today)!)
        }
        XCTAssertEqual(p.streak(today: today), 3)
        p.set(.partial, pages: 2...2, date: cal.date(byAdding: .day, value: -5, to: today)!)
        XCTAssertEqual(p.streak(today: today), 3)
        XCTAssertEqual(HifzProgress().streak(today: today), 0)
    }

    func testMigrationFromMarksAndPlans() throws {
        let idx = try makeIndex()
        let now = Date()
        let marks = [
            MushafBookmark(ayah: nil, page: 5, date: now, color: .hifz),
            MushafBookmark(ayah: nil, page: 6, date: now, color: .review),
            MushafBookmark(ayah: "2:50", page: 9, date: now, color: .hifz),
        ]
        var plan = MemorizationPlan(surah: 2, ayahFrom: 1, ayahTo: 2, startDate: now)
        plan.memorizedUpTo = 2
        let p = HifzProgress.migrated(marks: marks, plans: [plan], index: idx)
        XCTAssertEqual(p.state(5), .memorized)
        XCTAssertEqual(p.state(6), .review)
        XCTAssertEqual(p.state(9), .partial)
        XCTAssertEqual(p.state(2), .partial)
        XCTAssertEqual(p.state(7), .none)
    }

    @MainActor func testStorePersistsAndMigratesOnce() throws {
        let d = UserDefaults(suiteName: "hifz.test.\(UUID().uuidString)")!
        let local = QuranLocalStore(defaults: d)
        let a = HifzProgressStore(local: local)
        a.migrateIfNeeded(marks: [MushafBookmark(ayah: nil, page: 5, date: Date(), color: .hifz)], index: try makeIndex())
        XCTAssertEqual(a.progress.state(5), .memorized)
        a.set(.review, pages: 5...6)
        let b = HifzProgressStore(local: local)
        XCTAssertEqual(b.progress.state(6), .review)
        b.set(.none, pages: 5...6)
        b.migrateIfNeeded(marks: [MushafBookmark(ayah: nil, page: 5, date: Date(), color: .hifz)], index: try makeIndex())
        XCTAssertEqual(b.progress.state(5), .none, "الترحيل مرة واحدة فقط")
    }
}
