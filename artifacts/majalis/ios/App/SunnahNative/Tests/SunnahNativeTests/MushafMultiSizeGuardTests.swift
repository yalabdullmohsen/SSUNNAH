import XCTest
import SwiftUI
import ImageIO
import UniformTypeIdentifiers
@testable import SunnahNative

/// حارس المقاسات المتعددة للمصحف (ن3): تُرسم الصفحة بمقاسات الهواتف الفعلية (SE وDisplay Zoom وiPhone 16 وPro Max) وبحجم نص XXXL،
/// ويفشل الفحص إن لامس محتوى الصفحة حافة الشاشة أو خرج عنها (EDGE-OK): عمود الحافة الأول والأخير يبقيان بلون الورق.
/// `MUSHAF_SNAP_DIR` (اختياري) يكتب اللقطات للفحص بالعين. دون `MUSHAF_DATA` يُتخطّى.
final class MushafMultiSizeGuardTests: XCTestCase {
    static let sizes: [(String, CGSize)] = [
        ("se-375x667", CGSize(width: 375, height: 667)),
        ("zoomed-320x693", CGSize(width: 320, height: 693)),
        ("iphone16-393x852", CGSize(width: 393, height: 852)),
        ("iphone16pro-402x874", CGSize(width: 402, height: 874)),
        ("promax-440x956", CGSize(width: 440, height: 956)),
    ]
    static let pages = [1, 2, 150, 187, 293, 604]

    @MainActor private func render(_ n: Int, size: CGSize, xxxl: Bool, repo: MushafRepository, idx: MushafIndex) throws -> CGImage {
        let view = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil)) }
            .frame(width: size.width, height: size.height)
            .environment(\.dynamicTypeSize, xxxl ? .accessibility5 : .large)
        let ir = ImageRenderer(content: view); ir.scale = 2
        return try XCTUnwrap(ir.cgImage)
    }

    /// أعمدة الحافة (حتى `band` بكسل من كل جانب) التي تحوي حبرًا يخالف لون الورق؛ يعيد أول مخالفة أو nil.
    private func edgeInk(_ cg: CGImage, band: Int) -> String? {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        let bg = (px[0], px[1], px[2]) // الزاوية = لون الورق (الصفحة لا تلمس الزاوية)
        for y in 0..<h { for x in list(w, band) {
            let i = (y * w + x) * 4
            if abs(Int(px[i]) - Int(bg.0)) > 24 || abs(Int(px[i + 1]) - Int(bg.1)) > 24 || abs(Int(px[i + 2]) - Int(bg.2)) > 24 { return "حبر عند x=\(x) y=\(y) من \(w)×\(h)" }
        } }
        return nil
    }
    /// نسبة البكسلات المخالفة للورق في الجزء الأوسط: صفر تقريبًا = صورة فارغة (القارئ لم يرسم) فلا تُعدّ دليل نجاح.
    private func inkRatio(_ cg: CGImage) -> Double {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        let bg = (px[0], px[1], px[2]); var ink = 0, total = 0
        for y in stride(from: h / 6, to: h * 5 / 6, by: 2) { for x in stride(from: 0, to: w, by: 2) {
            let i = (y * w + x) * 4; total += 1
            if abs(Int(px[i]) - Int(bg.0)) > 24 || abs(Int(px[i + 1]) - Int(bg.1)) > 24 || abs(Int(px[i + 2]) - Int(bg.2)) > 24 { ink += 1 }
        } }
        return Double(ink) / Double(max(total, 1))
    }
    private func list(_ w: Int, _ band: Int) -> [Int] { Array(0..<band) + Array((w - band)..<w) }

    @MainActor func testPagesStayInsideEdgesOnAllPhoneSizes() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        let out = ProcessInfo.processInfo.environment["MUSHAF_SNAP_DIR"]
        for (name, size) in Self.sizes { for xxxl in [false, true] { for n in Self.pages {
            let cg = try render(n, size: size, xxxl: xxxl, repo: repo, idx: idx)
            if let out {
                let url = URL(fileURLWithPath: out).appendingPathComponent("\(name)\(xxxl ? "-xxxl" : "")-p\(n).png")
                let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
                CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
            }
            XCTAssertGreaterThan(inkRatio(cg), 0.02, "EMPTY: صفحة \(n) على \(name)\(xxxl ? " XXXL" : "") فارغة")
            if let bad = edgeInk(cg, band: 4) { XCTFail("EDGE: صفحة \(n) على \(name)\(xxxl ? " XXXL" : ""): \(bad)") }
        } } }
    }

    #if canImport(UIKit) && !os(macOS)
    /// القارئ الكامل (TabView + الرأس + الخرطوشة) داخل نافذة بمقاس الشاشة الفعلي: هنا يظهر أي فرق بين إطار الصفحة وحجم التخطيط.
    @MainActor private func hostedReader(_ n: Int, size: CGSize, repo: MushafRepository, idx: MushafIndex) throws -> CGImage {
        let suite = UserDefaults(suiteName: "mushaf-multisize-\(UUID().uuidString)")!
        let store = MushafStore(defaults: suite)
        let reader = MushafReaderView(repo: repo, index: idx, search: nil, store: store, startPage: n)
        let host = UIHostingController(rootView: reader)
        let window = UIWindow(frame: CGRect(origin: .zero, size: size))
        window.rootViewController = host; window.makeKeyAndVisible()
        host.view.frame = window.bounds; host.view.layoutIfNeeded()
        RunLoop.main.run(until: Date().addingTimeInterval(0.6))
        let img = UIGraphicsImageRenderer(size: size, format: { let f = UIGraphicsImageRendererFormat(); f.scale = 2; return f }()).image { _ in
            host.view.drawHierarchy(in: CGRect(origin: .zero, size: size), afterScreenUpdates: true)
        }
        window.isHidden = true
        return try XCTUnwrap(img.cgImage)
    }

    @MainActor func testHostedReaderStaysInsideEdgesOnAllPhoneSizes() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        let out = ProcessInfo.processInfo.environment["MUSHAF_SNAP_DIR"]
        for (name, size) in Self.sizes { for n in [1, 2, 187] {
            let cg = try hostedReader(n, size: size, repo: repo, idx: idx)
            if let out {
                let url = URL(fileURLWithPath: out).appendingPathComponent("reader-\(name)-p\(n).png")
                let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
                CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
            }
            XCTAssertGreaterThan(inkRatio(cg), 0.02, "EMPTY(reader): صفحة \(n) على \(name) فارغة")
            if let bad = edgeInk(cg, band: 4) { XCTFail("EDGE(reader): صفحة \(n) على \(name): \(bad)") }
        } }
    }
    #endif
}
