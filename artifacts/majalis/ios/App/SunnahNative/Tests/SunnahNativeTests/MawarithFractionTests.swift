import XCTest
@testable import SunnahNative

/// الكسور التي يبني عليها محرك المواريث: التبسيط والإشارة والعمليات والمقارنة والصيغ النصية.
final class MawarithFractionTests: XCTestCase {
    private typealias F = MawarithFraction

    func testInitReducesAndMovesSignToNumerator() {
        XCTAssertEqual(F(2, 4), F(1, 2))
        XCTAssertEqual(F(6, 3).den, 1)
        XCTAssertEqual(F(1, -2).num, -1)
        XCTAssertEqual(F(1, -2).den, 2)
        XCTAssertEqual(F(-3, -6), F(1, 2))
        XCTAssertEqual(F(7).den, 1)
    }

    func testZeroNormalizesToZeroOverOne() {
        let z = F(0, 5)
        XCTAssertEqual(z, .zero)
        XCTAssertEqual(z.den, 1)
        XCTAssertTrue(z.isZero)
        XCTAssertFalse(z.isPositive)
    }

    func testGcd() {
        XCTAssertEqual(F.gcd(12, 18), 6)
        XCTAssertEqual(F.gcd(-12, 18), 6)
        XCTAssertEqual(F.gcd(7, 0), 7)
        XCTAssertEqual(F.gcd(0, 0), 1, "لا قسمة على صفر عند تبسيط 0/0 الداخلي")
    }

    func testFixedSharesSumToWholeEstate() {
        // نصف + ثلث + سدس = التركة كاملة.
        XCTAssertEqual(F(1, 2).add(F(1, 3)).add(F(1, 6)), .one)
    }

    func testAwlSumExceedsOne() {
        // زوج (نصف) وأختان شقيقتان (ثلثان): المجموع 7/6 فتعول المسألة.
        let sum = F(1, 2).add(F(2, 3))
        XCTAssertEqual(sum, F(7, 6))
        XCTAssertTrue(sum.greaterThan(.one))
    }

    func testSubMulDiv() {
        XCTAssertEqual(F.one.sub(F(1, 8)), F(7, 8))
        XCTAssertEqual(F(1, 3).sub(F(1, 2)), F(-1, 6))
        XCTAssertEqual(F(2, 3).mul(F(3, 4)), F(1, 2))
        XCTAssertEqual(F(1, 6).div(F(1, 3)), F(1, 2))
        XCTAssertEqual(F(1, 2).div(F(-1, 4)), F(-2))
    }

    func testGreaterThanHandlesNegativesAndEquality() {
        XCTAssertTrue(F(1, 2).greaterThan(F(1, 3)))
        XCTAssertFalse(F(1, 3).greaterThan(F(1, 2)))
        XCTAssertFalse(F(2, 4).greaterThan(F(1, 2)))
        XCTAssertTrue(F(-1, 3).greaterThan(F(-1, 2)))
        XCTAssertTrue(F(1, -3).greaterThan(F(-1, 2)), "القاسم السالب يُنقل للبسط قبل المقارنة")
    }

    func testDescriptionAndRatioText() {
        XCTAssertEqual(F(3).description, "3")
        XCTAssertEqual(F(3).ratioText, "3/1")
        XCTAssertEqual(F(2, 6).description, "1/3")
        XCTAssertEqual(F(-1, 2).ratioText, "-1/2")
    }

    func testEqualValuesHashTogether() {
        XCTAssertEqual(Set([F(1, 2), F(2, 4), F(3, 6)]).count, 1)
    }
}
