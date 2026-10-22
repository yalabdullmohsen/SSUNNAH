import XCTest
@testable import SunnahNative

/// بناء مرجع التسميع من صفحات اصطناعية ونص المصحف الحقيقي: الترقيم عبر الصفحات، والبدء من آية، واستثناء الآية كاملة
/// إذا اختلف عدد كلماتها بين الرسم والنص (زيادة أو نقصًا) بدل ربط بعضها بتخمين.
final class MushafTasmeeRefBuildTests: XCTestCase {
    private static var search: MushafSearch?
    private var root: URL!

    private func quranDir() throws -> URL {
        if let s = ProcessInfo.processInfo.environment["MUSHAF_SRC"] { return URL(fileURLWithPath: s).appendingPathComponent("public/data/quran") }
        var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        for _ in 0..<10 {
            for rel in ["public/data/quran", "artifacts/majalis/public/data/quran"] {
                let c = dir.appendingPathComponent(rel)
                if FileManager.default.fileExists(atPath: c.appendingPathComponent("surah-112.json").path) { return c }
            }
            dir.deleteLastPathComponent()
        }
        XCTFail("public/data/quran غير موجود"); throw CocoaError(.fileNoSuchFile)
    }

    private func words(_ v: String, _ n: Int, end: Bool = true) -> [MushafWord] {
        (0..<n).map { MushafWord(c: "g\($0)", v: v) } + (end ? [MushafWord(c: "e", v: v, e: 1)] : [])
    }

    private func write(_ page: Int, _ rows: [MushafRow]) throws {
        let url = root.appendingPathComponent(String(format: "pages/%03d.json", page))
        try JSONEncoder().encode(MushafPage(page: page, opening: false, rows: rows)).write(to: url)
    }

    override func setUpWithError() throws {
        if Self.search == nil { Self.search = try MushafSearch(surahDirectory: quranDir(), ayahPage: [:]) }
        let s = Self.search!
        // نص الآيات المستعملة: ١١٢:٢ كلمتان، ١١٢:٣ أربع، ١١٢:٤ خمس، ١١٣:٢ أربع، ١١٣:٣ خمس.
        for (v, n) in [("112:2", 2), ("112:3", 4), ("112:4", 5), ("113:2", 4), ("113:3", 5)] {
            XCTAssertEqual(s.ayahText(v)?.split(separator: " ").count, n, v)
        }
        root = FileManager.default.temporaryDirectory.appendingPathComponent("tasmee-ref-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: root.appendingPathComponent("pages"), withIntermediateDirectories: true)
        // ص10: ١١٢:٢ كاملة، وأول كلمتين من ١١٢:٤ (تتصل بالصفحة التالية).
        try write(10, [MushafRow(k: "h", s: 112), MushafRow(k: "l", w: words("112:2", 2)), MushafRow(k: "l", w: words("112:4", 2, end: false))])
        // ص11: باقي ١١٢:٤، ثم ١١٢:٣ برسم أكثر من نصها (5 ≠ 4).
        try write(11, [MushafRow(k: "l", w: words("112:4", 3)), MushafRow(k: "l", w: words("112:3", 5))])
        // ص12: ١١٣:٢ برسم أقل من نصها (3 ≠ 4)، ثم ١١٣:٣ سليمة.
        try write(12, [MushafRow(k: "l", w: words("113:2", 3)), MushafRow(k: "l", w: words("113:3", 5))])
    }

    override func tearDownWithError() throws { try? FileManager.default.removeItem(at: root) }

    private func build(_ start: Int, _ count: Int, from: String? = nil) -> MushafTasmeeRef {
        MushafTasmeeRef.build(repo: MushafRepository(root: root), search: Self.search!, startPage: start, pageCount: count, fromVerse: from)
    }

    func testNumbersWordsAcrossPagesAndSkipsMismatchedVersesWhole() {
        let r = build(10, 3)
        XCTAssertEqual(r.words.map(\.id), ["112:2#1", "112:2#2", "112:4#1", "112:4#2", "112:4#3", "112:4#4", "112:4#5",
                                           "113:3#1", "113:3#2", "113:3#3", "113:3#4", "113:3#5"])
        XCTAssertEqual(r.pages, [10, 10, 10, 10, 11, 11, 11, 12, 12, 12, 12, 12])
        XCTAssertEqual(r.skippedVerses, ["112:3", "113:2"], "الزيادة والنقص كلاهما يستثني الآية كاملة")
        XCTAssertFalse(r.keysByPage[11, default: [:]].values.contains { $0.hasPrefix("112:3#") })
        XCTAssertFalse(r.keysByPage[12, default: [:]].values.contains { $0.hasPrefix("113:2#") })
    }

    func testWordTextsComeFromTheVerseInOrder() {
        let r = build(10, 2)
        let t = Self.search!.ayahText("112:4")!.split(separator: " ").map(String.init)
        XCTAssertEqual(r.words.filter { $0.id.hasPrefix("112:4#") }.map(\.text), t)
        XCTAssertEqual(r.indexByKey["112:4#1"], 2)
    }

    func testSlotsSkipHeaderRowsAndAyahEnds() {
        let m = build(10, 1).keysByPage[10]!
        XCTAssertEqual(m[MushafWordSlot(row: 1, col: 0)], "112:2#1")
        XCTAssertEqual(m[MushafWordSlot(row: 2, col: 1)], "112:4#2")
        XCTAssertNil(m[MushafWordSlot(row: 1, col: 2)], "علامة نهاية الآية لا تُربط")
        XCTAssertEqual(m.count, 4)
    }

    func testContinuingVerseKeepsItsNumbering() {
        XCTAssertEqual(build(11, 1).words.map(\.id), ["112:4#3", "112:4#4", "112:4#5"])
    }

    func testFromVerseStartsAtThatVerse() {
        XCTAssertEqual(build(10, 1, from: "112:4").words.map(\.id), ["112:4#1", "112:4#2"])
    }

    func testOutOfRangeStartIsEmpty() {
        XCTAssertTrue(build(0, 2).words.isEmpty)
        XCTAssertTrue(build(605, 1).words.isEmpty)
    }
}
