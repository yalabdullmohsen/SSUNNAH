import XCTest
import SwiftUI
@testable import SunnahNative

import ImageIO
import UniformTypeIdentifiers

/// الحارس البصري للمصحف (ن3): لقطات بكسلية لصفحات 1 و2 و187 و293 و301 و604 فاتحًا وداكنًا مقابل مراجع في Fixtures/MushafVisual.
/// أي فرق بصري يفشل. لإعادة توليد المراجع عمدًا (تغيير تصميم من ن1 فقط): `MUSHAF_VISUAL_RECORD=1`.
/// البيئة: `MUSHAF_DATA=<out>/mushaf`. دونه يُتخطّى (والـCI/ن4 يضبطه).
final class MushafVisualGuardTests: XCTestCase {
    static let pages = [1, 2, 187, 293, 301, 604]
    static let size = CGSize(width: 402, height: 874)
    /// عتبة تسامح لفروق تنعيم الحواف بين الأجهزة: أقصى فرق قناة، ونسبة البكسلات المختلفة المسموحة.
    static let channelTolerance = 8, ratioTolerance = 0.0005

    /// المراجع لكل منصة: macOS في MushafVisual، وiOS (المحاكي) في MushafVisual-ios — تنعيم الخطوط يختلف بين المنصتين.
    #if os(macOS)
    private static let refName = "MushafVisual"
    #else
    private static let refName = "MushafVisual-ios"
    #endif
    private var refDir: URL { URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("Fixtures/\(Self.refName)") }

    /// صورة RGBA مباشرة (sRGB) قابلة للمقارنة على المنصتين.
    struct Bitmap { let w: Int, h: Int, px: [UInt8]; let cg: CGImage }
    private func bitmap(_ cg: CGImage) -> Bitmap {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        return Bitmap(w: w, h: h, px: px, cg: cg)
    }

    @MainActor private func render(_ n: Int, dark: Bool, repo: MushafRepository, idx: MushafIndex) throws -> Bitmap {
        let view = ZStack {
            Sunnah.Colors.mushafPaper
            MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil))
        }
        .frame(width: Self.size.width, height: Self.size.height)
        .environment(\.colorScheme, dark ? .dark : .light)
        let ir = ImageRenderer(content: view); ir.scale = 1
        let cg = try XCTUnwrap(ir.cgImage)
        return bitmap(cg)
    }

    private func png(_ b: Bitmap) throws -> Data {
        let data = NSMutableData()
        let dest = try XCTUnwrap(CGImageDestinationCreateWithData(data, UTType.png.identifier as CFString, 1, nil))
        CGImageDestinationAddImage(dest, b.cg, nil)
        XCTAssertTrue(CGImageDestinationFinalize(dest))
        return data as Data
    }

    private func diffRatio(_ a: Bitmap, _ b: Bitmap) -> Double {
        guard a.w == b.w, a.h == b.h else { return 1 }
        var bad = 0
        for i in stride(from: 0, to: a.px.count, by: 4) {
            var d = 0
            for k in 0..<4 { d = max(d, abs(Int(a.px[i + k]) - Int(b.px[i + k]))) }
            if d > Self.channelTolerance { bad += 1 }
        }
        return Double(bad) / Double(a.w * a.h)
    }

    @MainActor func testPagesMatchReferenceSnapshots() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        let record = ProcessInfo.processInfo.environment["MUSHAF_VISUAL_RECORD"] == "1"
        try FileManager.default.createDirectory(at: refDir, withIntermediateDirectories: true)
        for n in Self.pages { for dark in [false, true] {
            let name = "page-\(n)-\(dark ? "dark" : "light").png", url = refDir.appendingPathComponent(name)
            let got = try render(n, dark: dark, repo: repo, idx: idx)
            if record { try png(got).write(to: url); continue }
            guard let data = try? Data(contentsOf: url), let src = CGImageSourceCreateWithData(data as CFData, nil), let refCG = CGImageSourceCreateImageAtIndex(src, 0, nil) else { XCTFail("المرجع ناقص: \(name)"); continue }
            let r = diffRatio(got, bitmap(refCG))
            if r > Self.ratioTolerance {
                let out = FileManager.default.temporaryDirectory.appendingPathComponent("mushaf-visual-\(name)")
                try? png(got).write(to: out)
                XCTFail("فرق بصري في \(name): \(String(format: "%.3f", r * 100))% من البكسلات (اللقطة: \(out.path))")
            }
        } }
    }
}
