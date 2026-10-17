import XCTest
import SwiftUI
import ImageIO
import UniformTypeIdentifiers
@testable import SunnahNative

/// QuranAyahText: 3:37 و21:81 و38:30 و12:45 مقارنةً بصفحة المصحف نفسها (رموز QPC بحرفها بما فيها علامات الوقف الصغيرة)،
/// ولقطة فاتحة/داكنة تُحفظ في `MUSHAF_SNAP_DIR` إن ضُبط. يحتاج `MUSHAF_DATA`.
final class QuranAyahTextSnapshotTests: XCTestCase {
    private struct RawSurah: Decodable { struct A: Decodable { let numberInSurah: Int; let text: String }; let ayahs: [A] }
    static let keys = ["3:37", "21:81", "38:30", "12:45"]

    private func repo() throws -> (MushafRepository, URL) {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let root = URL(fileURLWithPath: p)
        return (MushafRepository(root: root), root.deletingLastPathComponent().appendingPathComponent("quran"))
    }

    /// ما يعرضه المكوّن = ما في صفحة المصحف حرفًا بحرف وبالترتيب نفسه (ترتيب العلامات لا يتغيّر).
    func testGlyphsEqualMushafPageWords() throws {
        let (repo, _) = try repo()
        for k in Self.keys {
            let w = try XCTUnwrap(MushafAyahWords.load(ayah: k, repo: repo), k)
            let start = try XCTUnwrap(try repo.index().ayahPage[k])
            var expected: [String] = []
            var p = start
            while p <= Mushaf.pageCount {
                let found = try repo.page(p).rows.flatMap { $0.w ?? [] }.filter { $0.v == k }
                expected += found.map(\.c)
                if found.last?.isAyahEnd == true || found.isEmpty { break }
                p += 1
            }
            XCTAssertEqual(w.map(\.c), expected, "\(k): اختلف عن صفحة المصحف")
            XCTAssertTrue(w.last?.isEnd == true, "\(k): تنتهي برمز نهاية الآية")
        }
    }

    /// نص Tanzil لكل آية يحوي علامات وقف صغيرة، وعدد كلمات المصحف يطابقه بعد المواءمة (لا يضيع حرف ولا علامة).
    func testTanzilWaqfMarksAlignWithMushafWords() throws {
        let (repo, qdir) = try repo()
        var sawWaqf = false
        for k in Self.keys {
            let p = k.split(separator: ":").compactMap { Int($0) }
            let t = try XCTUnwrap(QuranAyahPlainText.text(surah: p[0], ayah: p[1], directory: qdir), k)
            let raw = try Data(contentsOf: qdir.appendingPathComponent(String(format: "surah-%03d.json", p[0])))
            let rawText = try XCTUnwrap(try JSONDecoder().decode(RawSurah.self, from: raw).ayahs.first { $0.numberInSurah == p[1] }?.text)
            sawWaqf = sawWaqf || rawText.unicodeScalars.contains { (0x06D6...0x06DC).contains($0.value) }
            let n = try XCTUnwrap(MushafAyahWords.load(ayah: k, repo: repo), k).filter { !$0.isEnd }.count
            XCTAssertEqual(MushafAyahWords.mushafAlignedWords(ayahText: t, wordCount: n).count, n, "\(k): عدد الكلمات")
        }
        XCTAssertTrue(sawWaqf, "إحدى الآيات الأربع تحوي علامة وقف صغيرة")
    }

    @MainActor func testSnapshots() throws {
        let (repo, _) = try repo()
        guard let out = ProcessInfo.processInfo.environment["MUSHAF_SNAP_DIR"] else { throw XCTSkip("MUSHAF_SNAP_DIR غير محدد") }
        for k in Self.keys { for pg in Set((MushafAyahWords.load(ayah: k, repo: repo) ?? []).map(\.page)) { _ = try? repo.ensureFont(page: pg) } }
        for dark in [false, true] {
            let view = VStack(spacing: 14) {
                ForEach(Self.keys, id: \.self) { k in
                    let p = k.split(separator: ":").compactMap { Int($0) }
                    VStack(alignment: .leading, spacing: 4) {
                        Text(k).font(.caption).foregroundStyle(.secondary)
                        QuranAyahText(range: QuranAyahRange(surah: p[0], from: p[1], to: p[1])!, repo: repo, size: 24)
                    }
                }
            }
            .padding(16)
            .frame(width: 402, height: 874, alignment: .top).background(dark ? Color.black : Color.white)
            .environment(\.colorScheme, dark ? .dark : .light)
            let ir = ImageRenderer(content: view); ir.scale = 2
            let cg = try XCTUnwrap(ir.cgImage)
            let url = URL(fileURLWithPath: out).appendingPathComponent("quran-ayah-text-\(dark ? "dark" : "light").png")
            let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
            CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
        }
    }
}
