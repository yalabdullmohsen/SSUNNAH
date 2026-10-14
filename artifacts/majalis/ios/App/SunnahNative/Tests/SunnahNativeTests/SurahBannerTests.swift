import XCTest
import SwiftUI
@testable import SunnahNative

#if canImport(AppKit)
import AppKit

@MainActor
final class SurahBannerTests: XCTestCase {
    private func repo() throws -> MushafRepository {
        let src = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("public/fonts/qpc-surah-names/sura_names.ttf")
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("banner-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: root.appendingPathComponent("fonts"), withIntermediateDirectories: true)
        try FileManager.default.copyItem(at: src, to: root.appendingPathComponent("fonts/sura_names.ttf"))
        return MushafRepository(root: root)
    }

    func testGlyphMapping() {
        XCTAssertEqual(Mushaf.surahNameGlyph(1).unicodeScalars.first?.value, 0xE001)
        XCTAssertEqual(Mushaf.surahNameGlyph(18).unicodeScalars.first?.value, 0xE018)
        XCTAssertEqual(Mushaf.surahNameGlyph(99).unicodeScalars.first?.value, 0xE099)
        XCTAssertEqual(Mushaf.surahNameGlyph(114).unicodeScalars.first?.value, 0xE114)
    }

    /// لقطة: الفاتحة والبقرة والكهف والناس. الاسم يُرسم فوق إطار فارغ؛ لكل سورة حبر مختلف داخل الحقل الأوسط، والإطار نفسه بلا حبر هناك.
    func testBannerSnapshots() throws {
        let repo = try repo()
        XCTAssertEqual(try repo.ensureSurahNameFont(), "sura_names")
        var signatures: [Int: [UInt8]] = [:]
        for (n, name) in [(1, "الفاتحة"), (2, "البقرة"), (18, "الكهف"), (114, "الناس")] {
            let view = SurahBanner(surah: n, name: name, repo: repo).frame(width: 390, height: 54)
            let r = ImageRenderer(content: view); r.scale = 2
            let cg = try XCTUnwrap(r.cgImage)
            let rep = NSBitmapImageRep(cgImage: cg)
            // حقل الاسم: الثلث الأوسط عرضًا، والحبر = بكسلات داكنة (خضراء الحبر)
            var ink = 0
            var sig = [UInt8]()
            for y in 0..<rep.pixelsHigh {
                for x in Int(Double(rep.pixelsWide) * 0.37)..<Int(Double(rep.pixelsWide) * 0.63) {
                    guard let c = rep.colorAt(x: x, y: y)?.usingColorSpace(.sRGB) else { continue }
                    let dark = c.redComponent < 0.35 && c.greenComponent < 0.5
                    if dark { ink += 1 }
                    if y % 4 == 0 && x % 4 == 0 { sig.append(dark ? 1 : 0) }
                }
            }
            XCTAssertGreaterThan(ink, 150, "اسم السورة \(n) لم يُرسم")
            signatures[n] = sig
            if let out = ProcessInfo.processInfo.environment["BANNER_SNAPSHOT_OUT"],
               let png = rep.representation(using: .png, properties: [:]) {
                try png.write(to: URL(fileURLWithPath: out).appendingPathComponent("banner-\(n).png"))
            }
        }
        let keys = Array(signatures.keys)
        for i in 0..<keys.count { for j in (i + 1)..<keys.count { XCTAssertNotEqual(signatures[keys[i]], signatures[keys[j]]) } }
    }
}
#endif
