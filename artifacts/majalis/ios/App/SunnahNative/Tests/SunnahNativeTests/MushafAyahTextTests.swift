import XCTest
import SwiftUI
import ImageIO
import UniformTypeIdentifiers
@testable import SunnahNative

/// MushafAyahText (ن3): مطابقة الإبراز، نسبة تطابق عدد كلمات Tanzil/QPC على 6236 آية، ولقطات نتائج «يوسف» فاتحًا وداكنًا.
/// يحتاج `MUSHAF_DATA` (ios-native/Data/mushaf)؛ نصوص Tanzil من المجلد الشقيق `quran`.
final class MushafAyahTextTests: XCTestCase {
    func testMatchingIgnoresDiacriticsAndHamzaForms() {
        let text = "وَقَالَ يُوسُفُ لِأَبِيهِ"
        XCTAssertEqual(MushafAyahWords.matchingWords(query: "يوسف", ayahText: text, wordCount: 3), [1])
        XCTAssertEqual(MushafAyahWords.matchingWords(query: "لابيه", ayahText: text, wordCount: 3), [2])
        XCTAssertEqual(MushafAyahWords.matchingWords(query: "xyz", ayahText: text, wordCount: 3), [])
    }

    func testCountMismatchGivesNoHighlight() {
        XCTAssertNil(MushafAyahWords.matchingWords(query: "يوسف", ayahText: "وَقَالَ يُوسُفُ", wordCount: 5))
    }

    private func env() throws -> (MushafRepository, MushafIndex, URL) {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let root = URL(fileURLWithPath: p), repo = MushafRepository(root: root)
        return (repo, try repo.index(), root.deletingLastPathComponent().appendingPathComponent("quran"))
    }

    /// 37:130: Tanzil «إِلْ يَاسِينَ» كلمتان والمصحف كلمة واحدة بجلايفين (قيس من صفحة 451)؛ الإبراز يبقى على الكلمة الصحيحة.
    func testElYasinSplitDoesNotDisableHighlight() {
        let t = "سَلَٰمٌ عَلَىٰٓ إِلْ يَاسِينَ"
        XCTAssertEqual(MushafAyahWords.matchingWords(query: "ياسين", ayahText: t, wordCount: 3), [2])
        XCTAssertEqual(MushafAyahWords.matchingWords(query: "سلم", ayahText: t, wordCount: 3), [0])
        XCTAssertNil(MushafAyahWords.matchingWords(query: "ياسين", ayahText: t, wordCount: 5), "اختلاف حقيقي يبقى nil")
    }

    /// ۞ والبسملة المدمجة لا تُفقدان الإبراز: كانتا سبب 327 آية (5.24%) بلا إبراز.
    func testHizbMarkAndBasmalaDoNotDisableHighlight() {
        XCTAssertEqual(MushafAyahWords.matchingWords(query: "الله", ayahText: "۞ إِنَّ ٱللَّهَ لَا يَسْتَحْىِۦٓ", wordCount: 4), [1])
        XCTAssertEqual(MushafAyahWords.matchingWords(query: "الم", ayahText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ", wordCount: 1), [0])
        XCTAssertNil(MushafAyahWords.matchingWords(query: "الله", ayahText: "إِنَّ ٱللَّهَ لَا", wordCount: 5), "اختلاف حقيقي يبقى nil")
    }

    /// نسبة الآيات التي يطابق فيها عدد كلمات نص Tanzil عدد كلمات المصحف (دون رمز النهاية). الإبراز يعمل فقط عند التطابق.
    func testWordCountAgreementAcrossAllAyahs() throws {
        let (repo, idx, qdir) = try env()
        var total = 0, same = 0, missing = 0
        var bad: [String] = []
        for key in idx.ayahPage.keys.sorted(by: { $0.localizedStandardCompare($1) == .orderedAscending }) {
            let parts = key.split(separator: ":").compactMap { Int($0) }
            guard parts.count == 2, let text = QuranAyahPlainText.text(surah: parts[0], ayah: parts[1], directory: qdir) else { missing += 1; continue }
            guard let w = MushafAyahWords.load(ayah: key, repo: repo) else { missing += 1; continue }
            total += 1
            let wc = w.filter({ !$0.isEnd }).count
            if MushafAyahWords.mushafAlignedWords(ayahText: text, wordCount: wc).count == wc { same += 1 } else { bad.append(key) }
        }
        let pct = total == 0 ? 0 : Double(same) * 100 / Double(total)
        print("AYAH-WORDCOUNT total=\(total) same=\(same) missing=\(missing) pct=\(pct) bad=\(bad.prefix(15))")
        XCTAssertEqual(total + missing, 6236)
        XCTAssertEqual(missing, 0)
        XCTAssertGreaterThanOrEqual(pct, 99.0, "نسبة تطابق العدد انخفضت (كانت 94.76% قبل إسقاط ۞ والبسملة)")
    }

    @MainActor func testYusufResultsSnapshots() throws {
        let (repo, _, qdir) = try env()
        guard let out = ProcessInfo.processInfo.environment["MUSHAF_SNAP_DIR"] else { throw XCTSkip("MUSHAF_SNAP_DIR غير محدد") }
        let keys = ["12:4", "12:7", "12:8", "12:9", "12:99", "2:255"]
        for dark in [false, true] {
            for k in keys { if let w = MushafAyahWords.load(ayah: k, repo: repo) { for pg in Set(w.map(\.page)) { _ = try? repo.ensureFont(page: pg) } } }
            let view = VStack(spacing: 12) {
                ForEach(keys, id: \.self) { k in
                    let p = k.split(separator: ":").compactMap { Int($0) }
                    let t = QuranAyahPlainText.text(surah: p[0], ayah: p[1], directory: qdir) ?? ""
                    let n = MushafAyahWords.load(ayah: k, repo: repo)?.filter { !$0.isEnd }.count ?? 0
                    MushafAyahText(ayah: k, repo: repo, size: 24, highlightWords: MushafAyahWords.matchingWords(query: "يوسف", ayahText: t, wordCount: n) ?? [], plainText: t)
                }
            }
            .padding(16)
            .frame(width: 402, height: 874, alignment: .top).background(Sunnah.Colors.mushafPaper.opacity(0.35).background(dark ? Color.black : Color.white))
            .environment(\.colorScheme, dark ? .dark : .light)
            let ir = ImageRenderer(content: view); ir.scale = 2
            let cg = try XCTUnwrap(ir.cgImage)
            let url = URL(fileURLWithPath: out).appendingPathComponent("yusuf-search-\(dark ? "dark" : "light").png")
            let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
            CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
        }
    }
}
