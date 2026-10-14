import XCTest
@testable import SunnahNative

/// نسخ/مشاركة الآية: النص العثماني الحرفي من البيانات (لا غليفات QPC ولا PUA) بصيغة «﴿…﴾ [الكهف: 1]».
/// يحتاج MUSHAF_DATA وMUSHAF_QURAN (مجلد surah-NNN.json)؛ دونهما يُتخطّى.
final class MushafShareTests: XCTestCase {
    private func load() throws -> (MushafIndex, MushafSearch) {
        let env = ProcessInfo.processInfo.environment
        guard let d = env["MUSHAF_DATA"], let q = env["MUSHAF_QURAN"] else { throw XCTSkip("MUSHAF_DATA/MUSHAF_QURAN غير محددين") }
        let idx = try MushafRepository(root: URL(fileURLWithPath: d)).index()
        return (idx, try MushafSearch(surahDirectory: URL(fileURLWithPath: q), ayahPage: idx.ayahPage))
    }

    private func hasPUA(_ s: String) -> Bool { s.unicodeScalars.contains { (0xE000...0xF8FF).contains($0.value) || (0xF0000...0x10FFFF).contains($0.value) } }

    func testKahf1MatchesReferenceWithoutBasmalaOrPUA() throws {
        let (idx, s) = try load()
        let t = try XCTUnwrap(MushafShare.text(ayah: "18:1", index: idx, search: s))
        XCTAssertEqual(t, "﴿ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجَا ۜ﴾ [الكهف: 1]")
        XCTAssertFalse(hasPUA(t)); XCTAssertFalse(t.contains("\u{FEFF}"))
    }

    func testAyatAlKursiMultiLineMatchesReference() throws {
        let (idx, s) = try load()
        let t = try XCTUnwrap(MushafShare.text(ayah: "2:255", index: idx, search: s))
        XCTAssertEqual(t, "﴿ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ﴾ [البقرة: 255]")
        XCTAssertFalse(hasPUA(t))
    }

    func testBasmalaKeptOnlyWhereItIsAnAyah() throws {
        let (idx, s) = try load()
        XCTAssertTrue(try XCTUnwrap(s.ayahText("1:1")).hasPrefix("بِسْمِ"))
        XCTAssertFalse(try XCTUnwrap(s.ayahText("2:1")).hasPrefix("بِسْمِ"))
    }

    func testFatihaShareKeepsFullBasmalaAndOthersDoNot() throws {
        let (idx, s) = try load()
        let f = try XCTUnwrap(MushafShare.text(ayah: "1:1", index: idx, search: s))
        XCTAssertEqual(f, "﴿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ﴾ [الفاتحة: 1]") // سكون U+0652 كسائر النص العثماني في البيانات
        for a in ["2:1", "18:1"] {
            let t = try XCTUnwrap(MushafShare.text(ayah: a, index: idx, search: s))
            XCTAssertFalse(t.contains("بِسْمِ") || t.contains("ٱلرَّحِيمِ"), a)
        }
        let t = try XCTUnwrap(MushafShare.text(ayah: "9:1", index: idx, search: s))
        XCTAssertTrue(t.hasPrefix("﴿بَرَآءَةٌۭ مِّنَ") && t.hasSuffix("[التوبة: 1]"))
        XCTAssertFalse(t.contains("بِسْمِ"))
    }

    func testTafsirAyahRoute() {
        XCTAssertTrue(TafsirAyahRoute.parse("/tafsir/18:1")! == (18, 1))
        XCTAssertNil(TafsirAyahRoute.parse("/tafsir")); XCTAssertNil(TafsirAyahRoute.parse("/tafsir/115:1")); XCTAssertNil(TafsirAyahRoute.parse("/tafsir/2:0"))
    }
}
