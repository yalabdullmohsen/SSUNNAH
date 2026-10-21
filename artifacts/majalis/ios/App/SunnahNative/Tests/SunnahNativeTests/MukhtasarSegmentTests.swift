import XCTest
@testable import SunnahNative

/// مقاطع الآيات (تنزيل الآية وحدها بطلب Range): مواضع البايت مولّدة لكل السور، متزايدة، وكل مقطع أصغر كثيرًا من ملف سورته.
final class MukhtasarSegmentTests: XCTestCase {
    func testEverySurahHasMonotonicByteOffsets() {
        for s in 1...114 {
            guard let e = MukhtasarIndex.entry(s), !e.ayahs.isEmpty else { continue }
            let b = try? XCTUnwrap(MukhtasarIndex.generatedBytes[s], "سورة \(s) بلا مواضع بايت")
            guard let b else { continue }
            XCTAssertEqual(b.ayahs.count, e.ayahs.count, "سورة \(s)")
            XCTAssertEqual(b.ayahs, b.ayahs.sorted(), "سورة \(s) مواضع غير متزايدة")
            XCTAssertLessThan(b.ayahs.last ?? 0, b.size, "سورة \(s)")
            XCTAssert(b.leads.allSatisfy { $0 >= 0 && $0 < 0.1 }, "سورة \(s): بداية الآية أبعد من إطار عن بداية المقطع")
        }
    }

    func testAyahSegmentIsSmallAndCoversTheAyah() throws {
        let seg = try XCTUnwrap(MukhtasarIndex.segment(surah: 2, ayah: 178))
        XCTAssertGreaterThan(seg.hi, seg.lo)
        XCTAssertLessThan(seg.hi - seg.lo, seg.size / 20, "مقطع آية البقرة ١٧٨ يجب أن يكون جزءًا صغيرًا من ملف السورة")
        let len = try XCTUnwrap(seg.length)
        let r = MukhtasarIndex.range(surah: 2, ayah: 178)
        XCTAssertEqual(len, (r.end ?? 0) - r.start, accuracy: 0.01)
    }
}
