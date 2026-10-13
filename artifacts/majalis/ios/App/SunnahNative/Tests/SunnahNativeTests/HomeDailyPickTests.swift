import XCTest
@testable import SunnahNative

final class HomeDailyPickTests: XCTestCase {
    private func date(_ iso: String) -> Date { ISO8601DateFormatter().date(from: iso)! }

    func testKuwaitMidnightBoundary() {
        // 20:59:59Z = 23:59:59 بالكويت (نفس اليوم)، 21:00:00Z = منتصف الليل (اليوم التالي).
        let a = HomeDailyPick.dayIndex(date("2026-10-12T20:59:59Z"))
        let b = HomeDailyPick.dayIndex(date("2026-10-12T21:00:00Z"))
        XCTAssertEqual(b, a + 1)
        XCTAssertEqual(a, Int(date("2026-10-12T00:00:00Z").timeIntervalSince1970 / 86400))
    }

    func testPickWrapsAroundPool() {
        let d = date("2026-10-12T12:00:00Z")
        let n = 7, i = HomeDailyPick.dayIndex(d) % n
        XCTAssertEqual(HomeDailyPick.pick(Array(0..<n), on: d), i)
        XCTAssertNil(HomeDailyPick.pick([Int](), on: d))
    }

    /// يطابق الموقع (`getDailyAyah`/`getDailyHadith`) لتواريخ ذهبية مصدّرة من ن1؛ يُتخطّى حتى يصل التصدير.
    func testGoldenMatchesSite() throws {
        guard let url = Bundle.module.url(forResource: "golden", withExtension: "json", subdirectory: "Fixtures/daily") else {
            throw XCTSkip("لم يصل golden التصدير من ن1 بعد")
        }
        struct Row: Decodable { let iso: String; let ayahId: String; let hadithId: String }
        let rows = try JSONDecoder().decode([Row].self, from: Data(contentsOf: url))
        XCTAssertGreaterThanOrEqual(rows.count, 10)
        for r in rows {
            let d = date(r.iso)
            XCTAssertEqual(try pickedIds(d).0, r.ayahId, r.iso)
            XCTAssertEqual(try pickedIds(d).1, r.hadithId, r.iso)
        }
    }

    private func pickedIds(_ d: Date) throws -> (String, String) {
        func pool<T: Decodable>(_ n: String) throws -> [T] {
            let u = try XCTUnwrap(Bundle.module.url(forResource: n, withExtension: "json", subdirectory: "Fixtures/daily"))
            return try JSONDecoder().decode([T].self, from: Data(contentsOf: u))
        }
        let a: [HomeDailyAyah] = try pool("daily-ayah"), h: [HomeDailyHadith] = try pool("daily-hadith")
        return (try XCTUnwrap(HomeDailyPick.pick(a, on: d)).id, try XCTUnwrap(HomeDailyPick.pick(h, on: d)).id)
    }
}
