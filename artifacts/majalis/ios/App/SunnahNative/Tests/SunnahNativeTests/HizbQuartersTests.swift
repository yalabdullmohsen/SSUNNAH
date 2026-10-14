import XCTest
@testable import SunnahNative

/// أرباع الأحزاب من Tanzil (quran-data.xml): 60 حزبًا و240 ربعًا، والحزب لأول آية في الصفحة.
final class HizbQuartersTests: XCTestCase {
    func testCounts() {
        XCTAssertEqual(HizbQuarters.quarterCount, 240)
        XCTAssertEqual(HizbQuarters.hizbCount, 60)
        let sorted = HizbQuarters.starts.map { $0.surah * 1000 + $0.ayah }
        XCTAssertEqual(sorted, sorted.sorted(), "الأرباع مرتبة تصاعديًا")
        XCTAssertEqual(Set(sorted).count, 240)
    }

    func testKnownBoundaries() {
        XCTAssertEqual(HizbQuarters.hizb(surah: 1, ayah: 1), 1)
        XCTAssertEqual(HizbQuarters.quarter(surah: 2, ayah: 25), 1)
        XCTAssertEqual(HizbQuarters.quarter(surah: 2, ayah: 26), 2)
        XCTAssertEqual(HizbQuarters.hizb(surah: 114, ayah: 6), 60)
        XCTAssertEqual(HizbQuarters.quarter(surah: 114, ayah: 6), 240)
        XCTAssertEqual(HizbQuarters.hizb(ayahID: "17:105"), 30)
    }

    func testPageHizbFromRealData() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let r = MushafRepository(root: URL(fileURLWithPath: p))
        func hizb(_ n: Int) throws -> Int? { try r.page(n).rows.compactMap { $0.w?.first?.v }.first.flatMap(HizbQuarters.hizb(ayahID:)) }
        XCTAssertEqual(try hizb(1), 1)
        XCTAssertEqual(try hizb(293), 30)
        XCTAssertEqual(try hizb(604), 60)
        var last = 0
        for n in 1...Mushaf.pageCount { let h = try XCTUnwrap(hizb(n)); XCTAssertGreaterThanOrEqual(h, last); last = h }
    }
}
