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

    /// حدّ تماثل أقطار الأقراص في الصفحة الواحدة (أكبر/أصغر) — لا يُرفع.
    static let maxDiscRatio: Double = 1.05

    /// DISC-EQ: مواضع الأقراص وأقطارها من نموذج التخطيط نفسه الذي يرسم منه العرض (`MushafMetrics.Layout.discs`)، لا من كشف بكسلات
    /// (فلا تدخل زخارف إطار السورة). كل علامة نهاية آية في الصفحة لها قرص واحد بالضبط، وتماثل الأقطار ≤ `maxDiscRatio`.
    static func discFailure(_ l: MushafMetrics.Layout, endMarks: Int) -> String? {
        let d = l.discs.values.flatMap { $0.values }.map(Double.init)
        guard d.count == endMarks else { return "أقراص \(d.count) ≠ علامات نهاية \(endMarks)" }
        guard let lo = d.min(), let hi = d.max(), lo > 0 else { return endMarks == 0 ? nil : "قطر غير موجب" }
        return hi / lo <= maxDiscRatio ? nil : "نسبة \(hi / lo) (\(lo)…\(hi))"
    }

    @MainActor func testEndOfAyahDiscsAreEqualPerPage() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p))
        var checked = 0
        for (name, size) in Self.sizes { for n in 1...Mushaf.pageCount where size.width == Self.sizes[0].1.width || n % 6 == 1 {
            let page = try repo.page(n), family = try repo.ensureFont(page: n)
            let pl = repo.pageLayout(page, family: family, size: size)
            let marks = pl.m.rows.reduce(0) { $0 + ($1.w ?? []).filter(\.isAyahEnd).count }
            if let bad = Self.discFailure(pl.layout, endMarks: marks) { XCTFail("DISC: صفحة \(n) على \(name): \(bad)") }
            checked += marks
        } }
        XCTAssertGreaterThan(checked, 6000, "عدد الأقراص المفحوصة قليل جدًا")
    }

    /// اختبار تحريف: تغيير أقطار أقراص عمدًا في نموذج صفحة حقيقية يجب أن يُفشل الحارس (وإلا ضعف الكاشف).
    @MainActor func testDiscGuardFailsWhenDiscSizesAreMutated() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p))
        let (name, size) = Self.sizes[0]
        for n in [1, 150, 293, 446, 604] {
            let page = try repo.page(n), family = try repo.ensureFont(page: n)
            let pl = repo.pageLayout(page, family: family, size: size)
            let marks = pl.m.rows.reduce(0) { $0 + ($1.w ?? []).filter(\.isAyahEnd).count }
            XCTAssertNil(Self.discFailure(pl.layout, endMarks: marks), "أساس سليم p\(n) \(name)")
            guard let (line, k) = pl.layout.discs.flatMap({ l, ws in ws.keys.map { (l, $0) } }).first else { XCTFail("لا أقراص p\(n)"); continue }
            for (label, f) in [("قرص واحد ×1.2", 1.2), ("قرص واحد ×0.8", 0.8), ("قرص واحد ×1.07", 1.07)] as [(String, CGFloat)] {
                var m = pl.layout; let base = m.discs[line]?[k] ?? 0; m.discs[line]?[k] = base * f
                if marks >= 2 { XCTAssertNotNil(Self.discFailure(m, endMarks: marks), "الحارس لم يفشل عند \(label) p\(n)") }
            }
            if pl.layout.discs.count >= 2 {   // تضخيم أقراص أسطر بالتناوب (لا كلها فيبقى التماثل)
                var alt = pl.layout
                for (idx, l) in alt.discs.keys.sorted().enumerated() where idx % 2 == 1 { for w in alt.discs[l]!.keys { alt.discs[l]![w]! *= 1.5 } }
                XCTAssertNotNil(Self.discFailure(alt, endMarks: marks), "الحارس لم يفشل عند تضخيم أقراص أسطر بالتناوب p\(n)")
            }
            var lost = pl.layout; lost.discs[line]?[k] = nil
            XCTAssertNotNil(Self.discFailure(lost, endMarks: marks), "الحارس لم يفشل عند فقد قرص p\(n)")
        }
        // ضمّ الرسم بالنموذج: حجم الخط الممرَّر لـMushafEndMark هو ما يحدد حجم الرسم فعلًا (مساحة الزخرفة تكبر بكبر القطر الممرَّر).
        let page1 = try repo.page(1), fam = try repo.ensureFont(page: 1)
        let glyph = try XCTUnwrap(page1.rows.flatMap { $0.w ?? [] }.first { $0.isAyahEnd }).c
        func green(_ fs: CGFloat) throws -> Int {
            let ir = ImageRenderer(content: ZStack { Color.white; MushafEndMark(glyph: glyph, family: fam, fontSize: fs) }.frame(width: 100, height: 100)); ir.scale = 2
            let cg = try XCTUnwrap(ir.cgImage), w = cg.width, h = cg.height
            let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
            let px = ctx.data!.assumingMemoryBound(to: UInt8.self)
            return (0..<(w * h)).filter { min(px[$0 * 4], px[$0 * 4 + 1], px[$0 * 4 + 2]) < 225 }.count   // حبر غير أبيض: زخرفة #3590 ذهبية لا خضراء
        }
        let small = try green(16), big = try green(26)   // القطر الممرَّر مُهمَل عمدًا (#3590)؛ الرسم يتبع حجم الخط
        XCTAssertGreaterThan(big, Int(Double(small) * 1.3), "حجم خط الزخرفة لا يتحكم برسمها (\(small) → \(big))")
    }

    /// قياس بكسلي على لقطة الشاشة لكل قرص نهاية آية: الفراغ الأفقي الصافي بين حدّ الدائرة وأقرب حبر في الجانبين (nil = لا جار)، وفراغ الكلمات المتوسط في السطر نفسه. سالب = حبر داخل القرص.
    struct DiscMeasure { var cy: Int; var right: Double?; var left: Double?; var ref: Double; var d: Double = 0 }
    private func measureDiscs(_ cg: CGImage) -> [DiscMeasure] {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        func green(_ i: Int) -> Bool { let r = Int(px[i * 4]), g = Int(px[i * 4 + 1]), b = Int(px[i * 4 + 2]); return g > r + 22 && g > b + 6 && g < 190 && g > 45 }
        func ink(_ i: Int) -> Bool { let r = Int(px[i * 4]), g = Int(px[i * 4 + 1]), b = Int(px[i * 4 + 2]); return (r + g + b) / 3 < 120 && !green(i) }
        var seen = [Bool](repeating: false, count: w * h), out: [DiscMeasure] = []
        var boxes: [(x0: Int, x1: Int, y0: Int, y1: Int)] = []
        for start in 0..<(w * h) where !seen[start] && green(start) {
            var stack = [start], x0 = w, x1 = 0, y0 = h, y1 = 0; seen[start] = true
            while let c = stack.popLast() {
                let x = c % w, y = c / w
                x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y)
                for n in [c - 1, c + 1, c - w, c + w] where n >= 0 && n < w * h && !seen[n] && green(n) && abs(n % w - x) <= 1 { seen[n] = true; stack.append(n) }
            }
            let bw = Double(x1 - x0 + 1), bh = Double(y1 - y0 + 1), ratio = bw / bh
            if bw >= 40, bw <= 150, bh >= 40, bh <= 150, ratio >= 0.85, ratio <= 1.18 { boxes.append((x0, x1, y0, y1)) }
        }
        let discs = boxes.filter { a in !boxes.contains { b in b.x0 <= a.x0 && b.x1 >= a.x1 && b.y0 <= a.y0 && b.y1 >= a.y1 && (b.x1 - b.x0) > (a.x1 - a.x0) } }
        for d in discs {
            let cy = (d.y0 + d.y1) / 2, r = (d.y1 - d.y0) / 2, cx = (d.x0 + d.x1) / 2
            var overlap = false
            for y in d.y0...d.y1 { for x in d.x0...d.x1 where ink(y * w + x) {
                let dx = x - cx, dy = y - cy; if abs(dy) <= r / 2, dx * dx + dy * dy <= r * r { overlap = true } // حبر السطر نفسه فقط؛ ذيول السطرين المجاورين تتداخل رأسيًا بتصميم المصحف
            } }
            if overlap { out.append(DiscMeasure(cy: cy, right: nil, left: nil, ref: 0)); continue } // حبر ملاصق للقرص من علامة الكلمة نفسها (وقف/سجدة): غير قابل للقياس الموثوق، يُفحص بالعين
            // فراغ كل جانب = أصغر مسافة (على صفوف شريط القرص) من حدّ الدائرة عند الصف إلى أقرب حبر؛ nil إن لم يوجد حبر قبل حافة الصورة.
            var rb: Int? = nil, lb: Int? = nil
            // صفّان (≈0.03 من القطر) تسامحًا عند حدّ الشريط: علامات السطرين المجاورين تلامس الحدّ بصفّ أو اثنين بتصميم المصحف وليست من الكلمة المجاورة (تحقق: لا تظهر في مسبار الكلمة نفسها)
            for y in (cy - r / 2 + 2)...(cy + r / 2 - 2) {
                let half = Int((Double(r * r - (y - cy) * (y - cy))).squareRoot())
                var x = cx + half + 1, k = 0
                while x < w { if ink(y * w + x) { rb = min(rb ?? k, k); break }; x += 1; k += 1 }
                x = cx - half - 1; k = 0
                while x >= 0 { if ink(y * w + x) { lb = min(lb ?? k, k); break }; x -= 1; k += 1 }
            }
            // فراغ الكلمات في السطر: فجوات الأعمدة الفارغة ≥ 0.07em (قطر القرص = 1.12em) في شريط ارتفاع القرص، دون الفجوات الملامسة لقرص.
            let em = Double(2 * r) / 1.12, minRun = max(2, Int(0.07 * em))
            var col = [Int](repeating: 0, count: w) // 0 فارغ، 1 حبر، 2 قرص
            for x in 0..<w { for y in (cy - r)...(cy + r) where y >= 0 && y < h {
                let i = y * w + x
                if green(i) { col[x] = 2; break }; if ink(i) { col[x] = 1 }
            } }
            var runs: [Int] = [], x = 0
            while x < w && col[x] == 0 { x += 1 }
            while x < w {
                var e = x; while e < w && col[e] == 0 { e += 1 }
                if e >= w { break }
                let touching = (x > 0 && col[x - 1] == 2) || col[e] == 2
                if e - x >= minRun && !touching { runs.append(e - x) }
                x = e + 1
                while x < w && col[x] != 0 { x += 1 }
            }
            let ref = runs.isEmpty ? 0 : Double(runs.reduce(0, +)) / Double(runs.count)
            out.append(DiscMeasure(cy: cy, right: rb.map(Double.init), left: lb.map(Double.init), ref: ref, d: Double(2 * r)))
        }
        return out
    }

    /// DISC-CLEAR (بكسل 2x على لقطة فعلية): (أ) كل جانب فيه جار ≥ 70% من متوسط فراغ كلمات سطره وليس أقل من `minClearPx`؛ (ب) القيمة المطلقة |يمين − يسار| ≤ max(2px، 8% من قطر القرص) — الحكم في `isAsymBad` المثبَّت بـ`DiscAsymThresholdTests` لكل قرص (لا متوسط موقّع: الموجب والسالب يلغيان بعضهما).
    /// الافتراضي عيّنة 12 صفحة؛ `MUSHAF_ALL_PAGES=1` يفحص الـ604 كلها على SE وPro وPro Max وiPad 11 وiPad 13.
    /// فراغ كل جانبيه ≥ 1.5× متوسط فراغ الكلمات = تباعد السطر الطبيعي (لا حشوة فيه)؛ لا يُقاس عليه التماثل.
    static let naturalGapFactor = 1.5
    static let minClearPx = 2.0, minRatio = 0.7, maxAsymFrac = 0.08, minAsymTol = 2.0
    /// حكم التفاوت بين جانبي القرص: سيئ إن زاد |يمين − يسار| عن max(minAsymTol، maxAsymFrac × القطر). دالة نقية يثبّتها `DiscAsymThresholdTests` كي لا يضعف الحد دون أن يفشل اختبار.
    static func isAsymBad(diff: Double, d: Double) -> Bool { diff > max(minAsymTol, maxAsymFrac * d) }
    static let discSizes: [(String, CGSize)] = [sizes[0], sizes[3], sizes[4], ("ipad11-834x1194", CGSize(width: 834, height: 1194)), ("ipad13-1032x1376", CGSize(width: 1032, height: 1376))]
    @MainActor func testEndOfAyahDiscsKeepClearanceFromNeighbourInk() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        let all = ProcessInfo.processInfo.environment["MUSHAF_ALL_PAGES"] == "1"
        let pages = all ? Array(1...604) : (ProcessInfo.processInfo.environment["MUSHAF_PAGES"]?.split(separator: ",").compactMap { Int($0) } ?? [1, 2, 3, 50, 100, 150, 187, 293, 400, 500, 603, 604])
        let only = ProcessInfo.processInfo.environment["MUSHAF_SIZE"]
        var sumDiff = 0.0, nDiff = 0
        let rowsOn = ProcessInfo.processInfo.environment["MUSHAF_ROWS"] != nil
        var total = 0, bad = 0, badRatio = 0, badAsym = 0, worst = Double.infinity, worstRatio = Double.infinity, worstAsym = 0.0
        for (name, size) in Self.discSizes where only == nil || name.hasPrefix(only!) {
            var sb = 0, st = 0, absPx: [Double] = [], absPct: [Double] = []
            for n in pages {
                let img = try render(n, size: size, xxxl: false, repo: repo, idx: idx)
                for m in measureDiscs(img) {
                    total += 1; st += 1
                    let sides = [m.right, m.left].compactMap { $0 }
                    if ProcessInfo.processInfo.environment["MUSHAF_DUMP"] != nil { print("DISCDUMP \(name) p\(n) y=\(m.cy) right=\(m.right.map { String($0) } ?? "-") left=\(m.left.map { String($0) } ?? "-") d=\(m.d) ref=\(m.ref)") }
                    var fail = false
                    for v in sides {
                        worst = min(worst, v)
                        if v < Self.minClearPx { fail = true }
                        if m.ref > 0, sides.count == 2 { worstRatio = min(worstRatio, v / m.ref); if v < Self.minRatio * m.ref { badRatio += 1; fail = true } }
                    }
                    if let r = m.right, let l = m.left, max(r, l) > 0, min(r, l) < Self.naturalGapFactor * m.ref || m.ref == 0 {
                        sumDiff += r - l; nDiff += 1; let diff = abs(r - l), pct = m.d > 0 ? diff / m.d : 0
                        absPx.append(diff); absPct.append(pct); worstAsym = max(worstAsym, pct)
                        if Self.isAsymBad(diff: diff, d: m.d) { badAsym += 1; fail = true }
                        if rowsOn { print("DISCROW \(name) p\(n) y=\(m.cy) right=\(r) left=\(l) d=\(m.d) absDiff=\(diff) pct=\(pct)") }
                    }
                    if fail { bad += 1; sb += 1; if let dir = ProcessInfo.processInfo.environment["MUSHAF_SNAP_DIR"], let crop = img.cropping(to: CGRect(x: 0, y: max(0, Int(m.cy) - 50), width: img.width, height: 100)), let d = CGImageDestinationCreateWithURL(URL(fileURLWithPath: dir).appendingPathComponent("bad-\(name)-p\(n)-y\(Int(m.cy)).png") as CFURL, UTType.png.identifier as CFString, 1, nil) { CGImageDestinationAddImage(d, crop, nil); CGImageDestinationFinalize(d) }
                        if sb <= 6 { print("DISCCLEAR-BAD \(name) p\(n) y=\(m.cy) right=\(String(describing: m.right)) left=\(String(describing: m.left)) ref=\(m.ref)") } }
                }
            }
            let sp = absPct.sorted(), top = sp.isEmpty ? [] : Array(sp[Int(Double(sp.count) * 0.95)...])
            func pc(_ v: Double) -> String { String(format: "%.1f%%", v * 100) }
            print("DISCCLEAR size \(name) discs=\(st) bad=\(sb) absMeanPx=\(String(format: "%.2f", absPx.reduce(0, +) / Double(max(absPx.count, 1)))) absMeanPct=\(pc(absPct.reduce(0, +) / Double(max(absPct.count, 1)))) worst5pctMeanPct=\(pc(top.reduce(0, +) / Double(max(top.count, 1)))) maxPx=\(absPx.max() ?? 0) maxPct=\(pc(sp.last ?? 0))")
        }
        print("DISCCLEAR meanRminusL=\(sumDiff / Double(max(nDiff, 1))) n=\(nDiff)\nDISCCLEAR summary discs=\(total) bad=\(bad) badRatio=\(badRatio) badAsym=\(badAsym) worstPx=\(worst) worstRatio=\(worstRatio) worstAsym=\(worstAsym) pages=\(pages.count)")
        // سقف ratchet لا يُرفع: القياس يأخذ شريط حبر الجار عند مركز القرص فيضلّل أحيانًا عند علامات/ألفات عالية (فُحصت بالعين: ص31 وص46 iPhone سليمتان).
        // المقيس 604 صفحة: iPad11 0.31%، iPhone16Pro 0.61%، ProMax 0.46%، SE 0.59%.
        XCTAssertLessThanOrEqual(Double(bad), 0.007 * Double(max(total, 1)), "DISC-CLEAR: \(bad) قرصًا من \(total) تخالف النسبة/التماثل/الحد الأدنى")
    }

    // القارئ المستضاف (TabView) لا يُرسَم داخل حزمة اختبار بلا تطبيق مضيف: أثبتنا على محاكي iOS أن اللقطة بيضاء كليًا (ink=0 في 30/30)،
    // فكان فحص الحافة السابق يمرّ على صورة فارغة. التغطية الحقيقية للمسار الكامل بلقطات التطبيق (-snapshotRoute /mushaf/page/N).
}

/// تثبيت حد تماثل الأقراص: يفشل إن ضعف الحد (تفاوت 9٪ يجب أن يُرفض) أو شُدّد بلا مبرر (6٪ و8٪ الحدّي يُقبلان).
final class DiscAsymThresholdTests: XCTestCase {
    func testThresholdConstantsAreNotLoosened() {
        XCTAssertEqual(MushafMultiSizeGuardTests.maxAsymFrac, 0.08, accuracy: 1e-9)
        XCTAssertEqual(MushafMultiSizeGuardTests.minAsymTol, 2.0, accuracy: 1e-9)
    }

    func testNineAndTenPercentAreRejected() {
        for d in [40.0, 60.0, 90.0, 120.0] {
            XCTAssertTrue(MushafMultiSizeGuardTests.isAsymBad(diff: 0.09 * d, d: d), "9٪ من \(d) يجب أن يُرفض")
            XCTAssertTrue(MushafMultiSizeGuardTests.isAsymBad(diff: 0.10 * d, d: d), "10٪ من \(d) يجب أن يُرفض")
        }
    }

    func testSixPercentAndExactBoundaryPass() {
        for d in [40.0, 60.0, 90.0, 120.0] {
            XCTAssertFalse(MushafMultiSizeGuardTests.isAsymBad(diff: 0.06 * d, d: d), "6٪ من \(d) يجب أن يُقبل")
            XCTAssertFalse(MushafMultiSizeGuardTests.isAsymBad(diff: 0.08 * d, d: d), "8٪ الحدّي من \(d) يجب أن يُقبل")
        }
    }

    func testAbsoluteToleranceFloorForSmallDiscs() {
        XCTAssertFalse(MushafMultiSizeGuardTests.isAsymBad(diff: 2.0, d: 20))
        XCTAssertTrue(MushafMultiSizeGuardTests.isAsymBad(diff: 2.1, d: 20))
    }
}
