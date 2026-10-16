#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// إثبات حالة الانتقال: عند أي إزاحة وسطية لا يظهر إلا صفحتان متجاورتان، بلا تراكب ولا نص صفحة ثالثة، وحدّ الصفحتين عند الموضع المتوقع بالبكسل.
/// كل صفحة تُرسم بلون مُرمَّز برقمها (R = n%256، G = n/256) فيُقرأ رقم الصفحة من كل عمود بكسل.
final class MushafPagerTransitionTests: XCTestCase {
    static let widths: [CGFloat] = [375, 402, 440, 834, 1032]
    let count = Mushaf.pageCount

    func testNeverMoreThanTwoAdjacentNonOverlappingPagesAtAnyOffset() {
        for w in Self.widths {
            let maxX = CGFloat(count - 1) * w
            var x: CGFloat = 0
            while x <= maxX {
                let v = MushafPager<EmptyView>.visiblePages(atOffsetX: x, width: w, count: count)
                XCTAssertLessThanOrEqual(v.count, 2, "أكثر من صفحتين x=\(x) w=\(w)")
                if v.count == 2 { XCTAssertEqual(abs(v[0] - v[1]), 1, "صفحتان غير متجاورتين x=\(x) w=\(w)") }
                if x.truncatingRemainder(dividingBy: w) == 0 { XCTAssertEqual(v.count, 1, "إزاحة على حدّ صفحة تُظهر أكثر من صفحة x=\(x) w=\(w)") }
                x += max(1, w / 7) + 0.25
            }
        }
    }

    private static func color(_ n: Int) -> UIColor { UIColor(red: CGFloat(n % 256) / 255, green: CGFloat(n / 256) / 255, blue: 0.5, alpha: 1) }

    private static func pixels(_ img: UIImage) -> (px: [UInt8], w: Int, h: Int) {
        let cg = img.cgImage!, w = cg.width, h = cg.height
        var buf = [UInt8](repeating: 0, count: w * h * 4)
        let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        return (buf, w, h)
    }

    private static func page(from px: [UInt8], at i: Int) -> Int { Int(px[i]) + 256 * Int(px[i + 1]) }   // الاستعمال يطابق التقريب عبر match() لا هنا

    private static func collectionView(in v: UIView) -> UICollectionView? {
        if let c = v as? UICollectionView { return c }
        for s in v.subviews { if let c = collectionView(in: s) { return c } }
        return nil
    }

    /// لقطات حالة وسطية (25/50/75٪) بين صفحتين متجاورتين، الاتجاهان، زوجية وفردية، iPhone وiPad؛ تحقق بكسل-بكسل + مواضع الخلايا الظاهرة.
    @MainActor func testMidTransitionSnapshotsShowOnlyTwoAdjacentPagesWithCorrectEdge() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: dp)), idx = try repo.index()
        var cache: [String: UIImage] = [:]
        func renderPage(_ n: Int, size: CGSize) throws -> UIImage {
            let key = "\(n)-\(Int(size.width))"
            if let c = cache[key] { return c }
            let view = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil)) }.frame(width: size.width, height: size.height)
            let ir = ImageRenderer(content: view); ir.scale = 2
            let im = UIImage(cgImage: try XCTUnwrap(ir.cgImage), scale: 2, orientation: .up)
            cache[key] = im; return im
        }
        var rows: [String] = []
        var sheets: [CGFloat: [UIImage]] = [:]
        for w in Self.widths {
            let size = CGSize(width: w, height: (w * 2.1).rounded())
            var page = 150
            let binding = Binding(get: { page }, set: { page = $0 })
            let host = UIHostingController(rootView: MushafPager(current: binding, count: count, renderKey: AnyHashable(0)) { n in Color(Self.color(n)) })
            let win = (UIApplication.shared.connectedScenes.first as? UIWindowScene).map { UIWindow(windowScene: $0) } ?? UIWindow(); win.frame = CGRect(origin: .zero, size: size); win.rootViewController = host; win.makeKeyAndVisible()
            host.view.frame = win.bounds; host.view.layoutIfNeeded()
            RunLoop.current.run(until: Date().addingTimeInterval(0.5)); host.view.setNeedsLayout(); host.view.layoutIfNeeded()
            let cv = try XCTUnwrap(Self.collectionView(in: host.view))
            cv.frame = host.view.bounds; (cv.collectionViewLayout as? UICollectionViewFlowLayout)?.itemSize = size; cv.collectionViewLayout.invalidateLayout(); cv.reloadData(); cv.layoutIfNeeded()
            XCTAssertGreaterThan(cv.bounds.width, 0, "المُقلِّب بلا عرض w=\(w)")
            for p in [150, 151] {              // زوجية وفردية
                for dir in [-1, 1] {           // dir=-1: الصفحة المجاورة p-1 (يمين)، dir=1: p+1 (يسار)
                    for f in [0.25, 0.5, 0.75] {
                        let other = p + (dir < 0 ? -1 : 1)
                        cv.setContentOffset(CGPoint(x: MushafPager<EmptyView>.offsetX(page: p, width: w, count: count) - CGFloat(dir) * CGFloat(f) * w, y: 0), animated: false)
                        cv.layoutIfNeeded()
                        RunLoop.current.run(until: Date().addingTimeInterval(0.4))
                        // 1) الخلايا الظاهرة: صفحتان متجاورتان فقط، حيّزاهما منفصلان ويغطيان النافذة
                        let vis = cv.visibleCells.compactMap { c in cv.indexPath(for: c).map { ($0.item + 1, c.convert(c.bounds, to: cv).offsetBy(dx: -cv.contentOffset.x, dy: 0)) } }.sorted { $0.0 < $1.0 }
                        XCTAssertEqual(Set(vis.map(\.0)), Set([p, other]), "p=\(p) dir=\(dir) f=\(f) w=\(w) ظهر \(vis.map(\.0))")
                        if vis.count == 2 { XCTAssertLessThanOrEqual(vis[0].1.intersection(vis[1].1).width, 0.5, "تراكب صفحتين w=\(w)") }
                        // 2) البكسل: تركيب لقطة من صفحتين حقيقيتين عند حيّزي الخليتين الفعليين (UIHostingConfiguration لا يُرسم خارج شاشة)
                        XCTAssertEqual(vis.count, 2, "عدد الخلايا الظاهرة")
                        let leftCell = try XCTUnwrap(vis.min { $0.1.minX < $1.1.minX })
                        let rightCell = try XCTUnwrap(vis.max { $0.1.minX < $1.1.minX })
                        let boundary = leftCell.1.maxX
                        XCTAssertEqual(boundary, rightCell.1.minX, accuracy: 0.5, "فجوة/تراكب بين الخليتين p=\(p) dir=\(dir) f=\(f) w=\(w)")
                        XCTAssertEqual(boundary, dir < 0 ? (1 - CGFloat(f)) * w : CGFloat(f) * w, accuracy: 1, "حدّ الصفحتين ليس عند الموضع المتوقع")
                        let lImg = try renderPage(leftCell.0, size: size), rImg = try renderPage(rightCell.0, size: size)
                        let img = UIGraphicsImageRenderer(size: size, format: { let f = UIGraphicsImageRendererFormat(); f.scale = 2; return f }()).image { c in
                            UIColor(Sunnah.Colors.mushafPaper).setFill(); c.fill(CGRect(origin: .zero, size: size))
                            c.cgContext.clip(to: CGRect(origin: .zero, size: size))
                            lImg.draw(at: CGPoint(x: leftCell.1.minX, y: 0)); rImg.draw(at: CGPoint(x: rightCell.1.minX, y: 0))
                        }
                        let (px, pw, ph) = Self.pixels(img)
                        let scale = CGFloat(pw) / w
                        let bx = Int((boundary * scale).rounded())
                        let bg = (px[0], px[1], px[2])
                        func isInk(_ xx: Int, _ y: Int) -> Bool { let i = (y * pw + xx) * 4; return abs(Int(px[i]) - Int(bg.0)) > 24 || abs(Int(px[i + 1]) - Int(bg.1)) > 24 || abs(Int(px[i + 2]) - Int(bg.2)) > 24 }
                        // لا قطع للحافة: ±3px حول الحدّ بلا حبر (هامش الصفحة 3٪ فارغ)؛ ولا لقطة فارغة: حبر في كل جانب
                        var edgeInk = 0, inkL = 0, inkR = 0
                        for y in stride(from: 0, to: ph, by: 2) {
                            for xx in max(bx - 3, 0)..<min(bx + 3, pw) where isInk(xx, y) { edgeInk += 1 }
                            for xx in stride(from: 0, to: pw, by: 4) where isInk(xx, y) { if xx < bx { inkL += 1 } else { inkR += 1 } }
                        }
                        let bad = edgeInk + (inkL > 50 || bx <= 4 ? 0 : 1) + (inkR > 50 || bx >= pw - 4 ? 0 : 1)
                        XCTAssertEqual(edgeInk, 0, "حبر مقطوع عند حدّ الصفحتين p=\(p) dir=\(dir) f=\(f) w=\(w)")
                        XCTAssertTrue(bx <= 4 || inkL > 50, "جانب أيسر فارغ (لقطة بيضاء) p=\(p) dir=\(dir) f=\(f) w=\(w)")
                        XCTAssertTrue(bx >= pw - 4 || inkR > 50, "جانب أيمن فارغ (لقطة بيضاء) p=\(p) dir=\(dir) f=\(f) w=\(w)")
                        rows.append("| \(Int(w)) | \(p) | \(dir < 0 ? "←\(other)" : "→\(other)") | \(Int(f * 100))٪ | \(vis.count) | \(bad == 0 ? "✓" : "✗") | \(Int(boundary)) | \(inkL)/\(inkR) |")
                        if w == 402 || w == 834 { sheets[w, default: []].append(img) }
                    }
                }
            }
            win.isHidden = true
        }
        // ورقة لقطات (تُحفَظ عند PAGER_SNAP_DIR) + جدول النتائج
        if let dir = ProcessInfo.processInfo.environment["PAGER_SNAP_DIR"] {
            try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
            for (w, imgs) in sheets {
                let th: CGFloat = 0.3, cw = w * th, ch = w * 2.1 * th, cols = 6
                let rowsN = (imgs.count + cols - 1) / cols
                let sheet = UIGraphicsImageRenderer(size: CGSize(width: CGFloat(cols) * (cw + 6), height: CGFloat(rowsN) * (ch + 6))).image { c in
                    UIColor.white.setFill(); c.fill(CGRect(origin: .zero, size: c.format.bounds.size))
                    for (k, im) in imgs.enumerated() { im.draw(in: CGRect(x: CGFloat(k % cols) * (cw + 6), y: CGFloat(k / cols) * (ch + 6), width: cw, height: ch)) }
                }
                try? sheet.pngData()?.write(to: URL(fileURLWithPath: "\(dir)/pager-transition-\(Int(w)).png"))
            }
            try? (["| العرض | الصفحة | الجار | الإزاحة | صفحات ظاهرة | بكسل | الحدّ x | حبر يسار/يمين |", "|---|---|---|---|---|---|---|---|"] + rows).joined(separator: "\n").write(toFile: "\(dir)/pager-transition-table.md", atomically: true, encoding: .utf8)
        }
    }
}
#endif
