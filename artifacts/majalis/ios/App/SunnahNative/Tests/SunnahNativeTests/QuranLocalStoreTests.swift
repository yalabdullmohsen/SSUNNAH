import XCTest
@testable import SunnahNative

final class QuranLocalStoreTests: XCTestCase {
    private func store() -> QuranLocalStore {
        let d = UserDefaults(suiteName: "quran-local-\(UUID().uuidString)")!
        return QuranLocalStore(defaults: d)
    }

    func testPlanProgressAndCompletion() {
        var p = MemorizationPlan(surah: 1, ayahFrom: 1, ayahTo: 7, startDate: Date(timeIntervalSince1970: 0))
        XCTAssertEqual(p.total, 7); XCTAssertEqual(p.done, 0)
        p.memorize(upTo: 3); XCTAssertEqual(p.done, 3); XCTAssertEqual(p.status, .active)
        p.memorize(upTo: 99); XCTAssertEqual(p.done, 7); XCTAssertEqual(p.status, .completed)
    }

    func testPlanRangeStartingMidSurah() {
        var p = MemorizationPlan(surah: 2, ayahFrom: 255, ayahTo: 257, startDate: Date())
        p.memorize(upTo: 254); XCTAssertEqual(p.done, 0)
        p.memorize(upTo: 255); XCTAssertEqual(p.done, 1)
    }

    func testRoundTripAndClear() {
        let s = store()
        let plan = MemorizationPlan(surah: 18, ayahFrom: 1, ayahTo: 10, startDate: Date(timeIntervalSince1970: 1_000))
        s.save([plan], .plans)
        XCTAssertEqual(s.load([MemorizationPlan].self, .plans), [plan])
        s.clearAll()
        XCTAssertNil(s.load([MemorizationPlan].self, .plans))
    }

    func testLoopCounter() {
        var l = HifzLoop(); l.target = 2
        l.tick(); XCTAssertFalse(l.reachedTarget)
        l.tick(); XCTAssertTrue(l.reachedTarget); XCTAssertEqual(l.progress, 1)
        l.reset(); XCTAssertEqual(l.count, 0)
    }

    func testPathProgressToggle() throws {
        var g = HifzPathProgress()
        g.toggle(path: "p", unit: "u1"); g.toggle(path: "p", unit: "u2")
        XCTAssertEqual(g.doneCount(path: "p", validUnits: ["u1"]), 1)
        g.toggle(path: "p", unit: "u1"); g.toggle(path: "p", unit: "u2")
        XCTAssertNil(g.completed["p"])
        let s = store(); g.toggle(path: "q", unit: "x"); s.save(g, .pathUnits)
        XCTAssertTrue(try XCTUnwrap(s.load(HifzPathProgress.self, .pathUnits)).isDone(path: "q", unit: "x"))
    }
}
