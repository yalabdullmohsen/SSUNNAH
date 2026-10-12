import XCTest
import SwiftUI
@testable import SunnahNative

/// بيانات المصحف الحقيقية تأتي من سكربت التصدير: `MUSHAF_DATA=<out>/mushaf` (و`MUSHAF_QURAN=<out>/quran`). تُتخطّى الاختبارات بدونها.
final class MushafTests: XCTestCase {
    private func repo() throws -> MushafRepository {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        return MushafRepository(root: URL(fileURLWithPath: p))
    }

    func testIndexAndPages() throws {
        let r = try repo(), idx = try r.index()
        XCTAssertEqual(idx.surahs.count, 114)
        XCTAssertEqual(idx.juzStart.count, 30)
        XCTAssertEqual(idx.ayahPage.count, 6236)
        XCTAssertEqual(idx.juz(onPage: 1), 1); XCTAssertEqual(idx.juz(onPage: 604), 30)
        XCTAssertEqual(idx.surah(onPage: 604)?.id, 114)
        var ayahs = Set<String>()
        for n in 1...Mushaf.pageCount {
            let p = try r.page(n)
            XCTAssertTrue(p.rows.contains { $0.k == "l" }, "صفحة \(n) بلا أسطر")
            ayahs.formUnion(p.rows.flatMap { $0.w ?? [] }.map(\.v))
        }
        XCTAssertEqual(ayahs.count, 6236)
    }

    func testFontRegistersForSamplePages() throws {
        let r = try repo()
        for n in [1, 2, 50, 300, 604] { XCTAssertEqual(try r.ensureFont(page: n), "QCF2\(String(format: "%03d", n))") }
    }

    func testSearchAndStore() throws {
        let r = try repo(), idx = try r.index()
        guard let q = ProcessInfo.processInfo.environment["MUSHAF_QURAN"] else { throw XCTSkip() }
        let s = try MushafSearch(surahDirectory: URL(fileURLWithPath: q), ayahPage: idx.ayahPage)
        let hits = s.search("الحمد لله رب العالمين")
        XCTAssertEqual(hits.first?.ayah, "1:2"); XCTAssertEqual(hits.first?.page, 1)

        let d = UserDefaults(suiteName: "mushaf-test-\(UUID())")!
        let st = MushafStore(defaults: d)
        XCTAssertEqual(st.lastPage, 1)
        st.visit(page: 300); st.visit(page: 301); st.visit(page: 300)
        XCTAssertEqual(MushafStore(defaults: d).lastPage, 300); XCTAssertEqual(st.pagesReadToday, 2)
        st.toggleBookmark(ayah: "2:255", page: 42); XCTAssertTrue(MushafStore(defaults: d).isBookmarked("2:255"))
        st.toggleBookmark(ayah: "2:255", page: 42); XCTAssertFalse(st.isBookmarked("2:255"))
    }

    #if os(macOS)
    @MainActor func testRenderSnapshots() throws {
        let r = try repo(), idx = try r.index()
        guard let out = ProcessInfo.processInfo.environment["MUSHAF_SHOTS"] else { throw XCTSkip() }
        try FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)
        for n in [1, 2, 50, 300, 604] {
            let view = MushafPageView(repo: r, index: idx, number: n, selectedAyah: .constant(nil))
                .frame(width: 390, height: 700).background(Color.white)
            let ir = ImageRenderer(content: view); ir.scale = 2
            let png = try XCTUnwrap(ir.nsImage?.tiffRepresentation.flatMap { NSBitmapImageRep(data: $0)?.representation(using: .png, properties: [:]) })
            try png.write(to: URL(fileURLWithPath: "\(out)/page-\(n).png"))
        }
    }
    #endif
}
