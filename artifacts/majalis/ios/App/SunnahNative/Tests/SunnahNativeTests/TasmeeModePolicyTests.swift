import XCTest
@testable import SunnahNative

final class TasmeeModePolicyTests: XCTestCase {
    func opts(_ m: TasmeeMode, _ l: TasmeeHideLevel = .firstLetter) -> TasmeeModeOptions { var o = TasmeeModeOptions(); o.mode = m; o.level = l; return o }

    func testFollowShowsEverything() { XCTAssertEqual(opts(.follow).mask(position: 1, count: 6), .shown) }
    func testReciteExamRepeatHideAll() {
        for m in [TasmeeMode.recite, .exam, .repeat] { XCTAssertEqual(opts(m).mask(position: 3, count: 6), .hidden) }
    }
    func testGradedLevels() {
        XCTAssertEqual(opts(.graded, .firstLetter).mask(position: 2, count: 6), .firstLetter)
        XCTAssertEqual(opts(.graded, .alternate).mask(position: 1, count: 6), .hidden)
        XCTAssertEqual(opts(.graded, .alternate).mask(position: 2, count: 6), .shown)
        XCTAssertEqual(opts(.graded, .ayahEnd).mask(position: 3, count: 6), .shown)
        XCTAssertEqual(opts(.graded, .ayahEnd).mask(position: 4, count: 6), .hidden)
        XCTAssertEqual(opts(.graded, .ayah).mask(position: 1, count: 6), .hidden)
    }
    func testNumbersForcedHiddenInExamAndPage() {
        XCTAssertTrue(opts(.exam).effectiveHideNumbers)
        XCTAssertTrue(opts(.graded, .page).effectiveHideNumbers)
        XCTAssertFalse(opts(.recite).effectiveHideNumbers)
    }
    func testNoHintsInExam() { XCTAssertFalse(opts(.exam).allowsHints); XCTAssertTrue(opts(.recite).allowsHints) }
    func testRepeatCounterResetsOnError() {
        var c = TasmeeRepeatCounter(target: 3)
        c.record(clean: true); c.record(clean: true); c.record(clean: false)
        XCTAssertEqual(c.streak, 0)
        c.record(clean: true); c.record(clean: true)
        XCTAssertTrue(c.record(clean: true))
    }
    func testExamStartStaysInRange() {
        var g = SystemRandomNumberGenerator()
        for _ in 0..<200 {
            let s = TasmeeExam.randomStart(in: 1...30, length: 5, using: &g)
            XCTAssertTrue((1...26).contains(s))
        }
        XCTAssertEqual(TasmeeExam.randomStart(in: 5...6, length: 10, using: &g), 5)
    }
    func testOptionsRoundTripClampsRepeat() {
        let d = UserDefaults(suiteName: "tasmee.modes.test")!; d.removePersistentDomain(forName: "tasmee.modes.test")
        var o = opts(.graded, .ayahEnd); o.repeatTarget = 99; o.save(d)
        let l = TasmeeModeOptions.load(d)
        XCTAssertEqual(l.mode, .graded); XCTAssertEqual(l.level, .ayahEnd); XCTAssertEqual(l.repeatTarget, 20)
    }
}
