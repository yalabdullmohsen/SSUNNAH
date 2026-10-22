import XCTest
@testable import SunnahNative

/// العدد وتمييزه بقواعد العربية: مفرد/مثنى/جمع/منصوب، والمئات، وأرقام عربية دائمًا.
final class ArabicCountTests: XCTestCase {
    private func lessons(_ n: Int) -> String {
        ArabicCount.label(n, one: "درس واحد", two: "درسان", few: "دروس", many: "درسًا", genitive: "درس")
    }

    func testOneAndTwoUseDedicatedForms() {
        XCTAssertEqual(lessons(1), "درس واحد")
        XCTAssertEqual(lessons(2), "درسان")
    }

    func testThreeToTenTakePlural() {
        XCTAssertEqual(lessons(3), "\(3.arabicDigits) دروس")
        XCTAssertEqual(lessons(10), "\(10.arabicDigits) دروس")
    }

    func testElevenToNinetyNineTakeAccusativeSingular() {
        XCTAssertEqual(lessons(11), "\(11.arabicDigits) درسًا")
        XCTAssertEqual(lessons(99), "\(99.arabicDigits) درسًا")
    }

    func testHundredsFollowLastTwoDigits() {
        XCTAssertEqual(lessons(100), "\(100.arabicDigits) درس")
        XCTAssertEqual(lessons(101), "\(101.arabicDigits) درس")
        XCTAssertEqual(lessons(102), "\(102.arabicDigits) درس")
        XCTAssertEqual(lessons(103), "\(103.arabicDigits) دروس")
        XCTAssertEqual(lessons(110), "\(110.arabicDigits) دروس")
        XCTAssertEqual(lessons(111), "\(111.arabicDigits) درسًا")
        XCTAssertEqual(lessons(3_535), "\(3_535.arabicDigits) درسًا")
    }

    func testZeroUsesGenitiveSingular() {
        XCTAssertEqual(lessons(0), "\(0.arabicDigits) درس")
    }

    func testNeverLatinDigits() {
        let latin = CharacterSet(charactersIn: "0123456789")
        for n in 0...1_200 { XCTAssertNil(lessons(n).rangeOfCharacter(from: latin), "\(n)") }
    }
}
