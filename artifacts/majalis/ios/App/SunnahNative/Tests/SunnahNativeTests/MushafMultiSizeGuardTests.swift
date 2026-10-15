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

    /// أقطار أقراص نهاية الآية بالبكسل (مكوّنات متصلة بلون القرص الأخضر؛ القطر = متوسط عرض/ارتفاع الصندوق المحيط).
    private func discDiameters(_ cg: CGImage) -> [Double] {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        func on(_ i: Int) -> Bool { let r = Int(px[i * 4]), g = Int(px[i * 4 + 1]), b = Int(px[i * 4 + 2]); return g > r + 25 && g > b + 8 && g < 190 && g > 90 }
        var seen = [Bool](repeating: false, count: w * h), boxes: [(x0: Int, x1: Int, y0: Int, y1: Int)] = []
        for start in 0..<(w * h) where !seen[start] && on(start) {
            var stack = [start], x0 = w, x1 = 0, y0 = h, y1 = 0; seen[start] = true
            while let c = stack.popLast() {
                let x = c % w, y = c / w
                x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y)
                for n in [c - 1, c + 1, c - w, c + w] where n >= 0 && n < w * h && !seen[n] && on(n) && abs(n % w - x) <= 1 { seen[n] = true; stack.append(n) }
            }
            let bw = Double(x1 - x0 + 1), bh = Double(y1 - y0 + 1), ratio = bw / bh
            if bw >= 40, bw <= 110, bh >= 40, bh <= 110, ratio >= 0.85, ratio <= 1.18 { boxes.append((x0, x1, y0, y1)) }
        }
        // شظايا داخل القرص (حلقة/رقم) تُحسب مكوّنًا مستقلًا: تُهمَل كل صندوق يقع داخل صندوق أكبر.
        return boxes.filter { a in !boxes.contains { b in b.x0 <= a.x0 && b.x1 >= a.x1 && b.y0 <= a.y0 && b.y1 >= a.y1 && (b.x1 - b.x0) > (a.x1 - a.x0) } }
            .map { Double(($0.x1 - $0.x0 + 1) + ($0.y1 - $0.y0 + 1)) / 2 }
    }

    /// DISC-EQ: أقراص نهاية الآية في الصفحة الواحدة متساوية القطر (أكبر/أصغر ≤ 1.05 أو فرق ≤3px) على ثلاثة أحجام (SE وPro وPro Max).
    @MainActor func testEndOfAyahDiscsAreEqualPerPage() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        for (name, size) in [Self.sizes[0], Self.sizes[3], Self.sizes[4]] { for n in [1, 2, 150, 604] {
            let d = discDiameters(try render(n, size: size, xxxl: false, repo: repo, idx: idx))
            guard let lo = d.min(), let hi = d.max(), d.count >= 2 else { XCTFail("DISC: صفحة \(n) على \(name): أقراص مكتشفة \(d.count)"); continue }
            print("DISC \(name) p\(n) n=\(d.count) min=\(lo) max=\(hi) ratio=\(hi / lo)")
            // القرص Circle بقطر ثابت (fontSize×1.12)؛ فرق ≤3px (1.5pt) ضجيج حواف التنعيم في الصندوق المحيط لا عيب رسم.
            XCTAssertTrue(hi / lo <= 1.05 || hi - lo <= 3, "DISC: صفحة \(n) على \(name): \(lo)…\(hi) نسبة \(hi / lo) \(d)")
        } }
    }

    // القارئ المستضاف (TabView) لا يُرسَم داخل حزمة اختبار بلا تطبيق مضيف: أثبتنا على محاكي iOS أن اللقطة بيضاء كليًا (ink=0 في 30/30)،
    // فكان فحص الحافة السابق يمرّ على صورة فارغة. التغطية الحقيقية للمسار الكامل بلقطات التطبيق (-snapshotRoute /mushaf/page/N).
}
