#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// القائمة السفلية للآية المحددة: لقطات حقيقية (نافذة UIKit) لحالات مغلقة / آية قصيرة / متوسطة / أطول آية (تمرير داخلي)،
/// iPhone وiPad، فاتحًا وداكنًا. الشرط: تظليل الآية المحددة كله فوق القائمة (لا يُقطع ولا يُحجب) وفي القائمة نص الآية بحبر.
final class MushafSelectionSheetTests: XCTestCase {
    private static func pixels(_ img: UIImage) -> (px: [UInt8], w: Int, h: Int) {
        let cg = img.cgImage!, w = cg.width, h = cg.height
        var buf = [UInt8](repeating: 0, count: w * h * 4)
        let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h)); return (buf, w, h)
    }

    @MainActor func testSheetStatesNeverClipOrHideSelectedAyah() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: dp)), idx = try repo.index()
        var rowsOf: [String: Int] = [:], pageOf: [String: Int] = [:]
        for p in 1...Mushaf.pageCount { for row in (try? repo.page(p))?.rows ?? [] { for v in Set((row.w ?? []).map(\.v)) { rowsOf[v, default: 0] += 1; pageOf[v] = p } } }
        let longest = try XCTUnwrap(rowsOf.max { $0.value < $1.value }?.key)
        let states: [(String, Int, String?)] = [("closed", 42, nil), ("short", 1, "1:2"), ("mid", 42, "2:255"), ("full", try XCTUnwrap(pageOf[longest]), longest)]
        let dir = ProcessInfo.processInfo.environment["SELECT_SNAP_DIR"].map { $0 + "/sheet" }
        if let dir { try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true) }
        var table = ["| الحالة | الآية | الجهاز | الوضع | تظليل px | أسفل التظليل | أعلى القائمة | حبر في القائمة |", "|---|---|---|---|---|---|---|---|"]
        for (name, page, ayah) in states {
            for (dev, size) in [("iphone", CGSize(width: 402, height: 874)), ("ipad", CGSize(width: 834, height: 1194))] {
                for dark in [false, true] {
                    let store = MushafStore(defaults: UserDefaults(suiteName: "sheet-\(name)-\(dev)-\(dark)")!)
                    let host = UIHostingController(rootView: MushafReaderView(repo: repo, index: idx, search: nil, store: store, startPage: page, initialSelection: ayah))
                    let win = (UIApplication.shared.connectedScenes.first as? UIWindowScene).map { UIWindow(windowScene: $0) } ?? UIWindow()
                    win.frame = CGRect(origin: .zero, size: size); win.overrideUserInterfaceStyle = dark ? .dark : .light
                    win.rootViewController = host; win.makeKeyAndVisible()
                    host.view.frame = win.bounds; host.view.layoutIfNeeded()
                    RunLoop.current.run(until: Date().addingTimeInterval(1.6)); host.view.layoutIfNeeded()
                    RunLoop.current.run(until: Date().addingTimeInterval(0.6))
                    let fmt = UIGraphicsImageRendererFormat(); fmt.scale = 2
                    let img = UIGraphicsImageRenderer(size: size, format: fmt).image { c in host.view.layer.render(in: c.cgContext) }
                    win.isHidden = true
                    if let dir, let d = img.jpegData(compressionQuality: 0.92) { try? d.write(to: URL(fileURLWithPath: "\(dir)/sheet-\(name)-\(dev)-\(dark ? "dark" : "light").jpg")) }
                    guard let ayah else { continue }
                    let (px, pw, ph) = Self.pixels(img)
                    // لون التظليل الفعلي = أكثر لون غير الورق تكرارًا في صفحة مرجعية بالتظليل نفسه
                    let refView = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: repo, index: idx, number: page, selectedAyah: .constant(ayah)) }.frame(width: size.width, height: size.height).environment(\.colorScheme, dark ? .dark : .light)
                    let ir = ImageRenderer(content: refView); ir.scale = 2
                    let (rp, rw, rh) = Self.pixels(UIImage(cgImage: try XCTUnwrap(ir.cgImage), scale: 2, orientation: .up))
                    var counts: [UInt32: Int] = [:]
                    for i in stride(from: 0, to: rw * rh * 4, by: 16) where rp[i] != rp[0] || rp[i+1] != rp[1] || rp[i+2] != rp[2] { counts[UInt32(rp[i]) << 16 | UInt32(rp[i+1]) << 8 | UInt32(rp[i+2]), default: 0] += 1 }
                    let key = try XCTUnwrap(counts.max { $0.value < $1.value }?.key)
                    func isHL(_ i: Int) -> Bool { abs(Int(px[i]) - Int(key >> 16)) <= 6 && abs(Int(px[i+1]) - Int((key >> 8) & 255)) <= 6 && abs(Int(px[i+2]) - Int(key & 255)) <= 6 }
                    // أعلى القائمة: من عمود داخل حشوتها (24pt من اليسار) صعودًا من أسفلها حتى أول بكسل يخالف لون سطحها
                    func far(_ i: Int, _ j: Int, _ t: Int) -> Bool { let dr: Int = abs(Int(px[i]) - Int(px[j])); let dg: Int = abs(Int(px[i+1]) - Int(px[j+1])); let db: Int = abs(Int(px[i+2]) - Int(px[j+2])); return dr > t || dg > t || db > t }
                    let cx = 48, sy = ph - 2 * 60   // 60pt من الأسفل = داخل الورقة (حدّها السفلي ≈46pt)؛ 20pt كانت تقع في خلفية الصفحة تحتها
                    let sIdx = (sy * pw + cx) * 4
                    var top = sy
                    while top > 0 { if far(((top * pw + cx) * 4), sIdx, 3) { break }; top -= 1 }
                    var hlPx = 0, hlBottom = 0, ink = 0
                    for y in 0..<ph { for x in stride(from: 0, to: pw, by: 1) { let i = (y * pw + x) * 4; if y < top, isHL(i) { hlPx += 1; hlBottom = y } } }
                    for y in (top + 4)..<(ph - 40) { for x in stride(from: 40, to: pw - 40, by: 2) { let i = (y * pw + x) * 4; if far(i, sIdx, 60) { ink += 1 } } }
                    table.append("| \(name) | \(ayah) | \(dev) | \(dark ? "داكن" : "فاتح") | \(hlPx) | \(hlBottom / 2) | \(top / 2) | \(ink) |")
                    XCTAssertGreaterThan(hlPx, 200, "تظليل الآية غائب/محجوب \(name) \(dev) dark=\(dark)")
                    XCTAssertLessThan(hlBottom, top, "التظليل يلامس/يدخل القائمة \(name) \(dev) dark=\(dark)")
                    XCTAssertGreaterThan(top, ph / 3, "القائمة تغطي أكثر من ثلثي الشاشة \(name) \(dev) dark=\(dark)")
                    XCTAssertGreaterThan(ink, 300, "لا نص آية في القائمة \(name) \(dev) dark=\(dark)")
                }
            }
        }
        if let dir { try? table.joined(separator: "\n").write(toFile: dir + "/sheet-table.md", atomically: true, encoding: .utf8) }
    }
}
#endif
