import XCTest
import SwiftUI
@testable import SunnahNative

#if os(macOS)
import AppKit

/// الحارس البصري للمصحف (ن3): لقطات بكسلية لصفحات 1 و2 و187 و293 و301 و604 فاتحًا وداكنًا مقابل مراجع في Fixtures/MushafVisual.
/// أي فرق بصري يفشل. لإعادة توليد المراجع عمدًا (تغيير تصميم من ن1 فقط): `MUSHAF_VISUAL_RECORD=1`.
/// البيئة: `MUSHAF_DATA=<out>/mushaf`. دونه يُتخطّى (والـCI/ن4 يضبطه).
final class MushafVisualGuardTests: XCTestCase {
    static let pages = [1, 2, 187, 293, 301, 604]
    static let size = CGSize(width: 402, height: 874)
    /// عتبة تسامح لفروق تنعيم الحواف بين الأجهزة: أقصى فرق قناة، ونسبة البكسلات المختلفة المسموحة.
    static let channelTolerance = 8, ratioTolerance = 0.0005

    private var refDir: URL { URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("Fixtures/MushafVisual") }

    @MainActor private func render(_ n: Int, dark: Bool, repo: MushafRepository, idx: MushafIndex) throws -> NSBitmapImageRep {
        let view = ZStack {
            Sunnah.Colors.mushafPaper
            MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil))
        }
        .frame(width: Self.size.width, height: Self.size.height)
        .environment(\.colorScheme, dark ? .dark : .light)
        let ir = ImageRenderer(content: view); ir.scale = 1
        let cg = try XCTUnwrap(ir.cgImage)
        return NSBitmapImageRep(cgImage: cg)
    }

    private func png(_ rep: NSBitmapImageRep) throws -> Data { try XCTUnwrap(rep.representation(using: .png, properties: [:])) }

    private func diffRatio(_ a: NSBitmapImageRep, _ b: NSBitmapImageRep) -> Double {
        guard a.pixelsWide == b.pixelsWide, a.pixelsHigh == b.pixelsHigh else { return 1 }
        var bad = 0
        for y in 0..<a.pixelsHigh { for x in 0..<a.pixelsWide {
            guard let ca = a.colorAt(x: x, y: y)?.usingColorSpace(.sRGB), let cb = b.colorAt(x: x, y: y)?.usingColorSpace(.sRGB) else { bad += 1; continue }
            let d = [abs(ca.redComponent - cb.redComponent), abs(ca.greenComponent - cb.greenComponent), abs(ca.blueComponent - cb.blueComponent), abs(ca.alphaComponent - cb.alphaComponent)].max()!
            if Int((d * 255).rounded()) > Self.channelTolerance { bad += 1 }
        } }
        return Double(bad) / Double(a.pixelsWide * a.pixelsHigh)
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
            guard let data = try? Data(contentsOf: url), let ref = NSBitmapImageRep(data: data) else { XCTFail("المرجع ناقص: \(name)"); continue }
            let r = diffRatio(got, ref)
            if r > Self.ratioTolerance {
                let out = FileManager.default.temporaryDirectory.appendingPathComponent("mushaf-visual-\(name)")
                try? png(got).write(to: out)
                XCTFail("فرق بصري في \(name): \(String(format: "%.3f", r * 100))% من البكسلات (اللقطة: \(out.path))")
            }
        } }
    }
}
#endif
