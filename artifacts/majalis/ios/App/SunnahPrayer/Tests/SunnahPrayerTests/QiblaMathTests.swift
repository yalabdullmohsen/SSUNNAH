import XCTest
@testable import SunnahPrayer

final class QiblaMathTests: XCTestCase {
    /// قيم `qiblaBearing()` في `src/lib/qibla-math.ts` — الأصلي والويب يتطابقان.
    func testBearingMatchesWeb() {
        let web: [(Double, Double, Double)] = [
            (29.3759, 47.9774, 224.619664),   // الكويت
            (24.7136, 46.6753, 243.797946),   // الرياض
            (51.5074, -0.1278, 118.987219),   // لندن
            (-6.2088, 106.8456, 295.151736),  // جاكرتا
            (40.7128, -74.006, 58.481701),    // نيويورك
            (24.4672, 39.6111, 176.235326),   // المدينة
        ]
        for (lat, lon, expected) in web {
            XCTAssertEqual(QiblaMath.bearing(latitude: lat, longitude: lon), expected, accuracy: 0.01, "\(lat),\(lon)")
        }
    }

    func testShortestDeltaWrapsAcrossNorth() {
        XCTAssertEqual(QiblaMath.shortestDelta(from: 350, to: 10), 20, accuracy: 1e-9)
        XCTAssertEqual(QiblaMath.shortestDelta(from: 10, to: 350), -20, accuracy: 1e-9)
        XCTAssertEqual(QiblaMath.shortestDelta(from: 0, to: 180), 180, accuracy: 1e-9)
    }

    func testAlignmentTolerance() {
        XCTAssertTrue(QiblaMath.isAligned(heading: 222.5, bearing: 224.6))
        XCTAssertFalse(QiblaMath.isAligned(heading: 220, bearing: 224.6))
        XCTAssertTrue(QiblaMath.isAligned(heading: 359, bearing: 1))
    }

    func testSmoothingTakesShortArcAndStaysInRange() {
        let v = QiblaMath.smooth(previous: 355, next: 5, factor: 0.5)
        XCTAssertEqual(v, 0, accuracy: 1e-9)
        XCTAssertEqual(QiblaMath.smooth(previous: nil, next: 42), 42)
        let w = QiblaMath.smooth(previous: 5, next: 345, factor: 0.5)
        XCTAssertEqual(w, 355, accuracy: 1e-9)
    }
}
