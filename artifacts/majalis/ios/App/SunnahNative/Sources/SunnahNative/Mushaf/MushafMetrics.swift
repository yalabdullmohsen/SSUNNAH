import Foundation
import CoreText

/// قياس عرض كلمات السطر بخط الصفحة نفسه (Core Text) لتوزيع السطر على عرض الصفحة كما في المصحف المطبوع.
enum MushafMetrics {
    static func textWidth(_ text: String, family: String, size: CGFloat) -> CGFloat {
        let font = CTFontCreateWithName(family as CFString, size, nil)
        let attr = NSAttributedString(string: text, attributes: [NSAttributedString.Key(kCTFontAttributeName as String): font])
        return CGFloat(CTLineGetTypographicBounds(CTLineCreateWithAttributedString(attr), nil, nil, nil))
    }

    /// حدود حبر الكلمة (Core Text) عند حجم المسبار: العرض الطباعي ومدى الحبر الأفقي.
    static func wordMetrics(_ text: String, family: String, size: CGFloat) -> (width: CGFloat, inkL: CGFloat, inkR: CGFloat, cInkL: CGFloat, cInkR: CGFloat) {
        let font = CTFontCreateWithName(family as CFString, size, nil)
        let attr = NSAttributedString(string: text, attributes: [NSAttributedString.Key(kCTFontAttributeName as String): font])
        let line = CTLineCreateWithAttributedString(attr)
        let w = CGFloat(CTLineGetTypographicBounds(line, nil, nil, nil))
        // الحبر داخل نطاق ارتفاع القرص فقط (ذيول الحروف تنزل خارجه فلا تُحتسب)، بمسح نقطي بدقة 2x.
        let asc = CTFontGetAscent(font), desc = CTFontGetDescent(font), lead = CTFontGetLeading(font)
        let cy = asc - ((asc + desc + lead) / 2 + 0.07 * size)
        let half = 0.28 * size
        let sc: CGFloat = 2
        let padPx = 24 // هامش لحبر يتجاوز صندوق الكلمة (يعاد سالبًا)
        let pw = Int(ceil(w * sc)) + 2 * padPx, ph = Int(ceil(2 * half * sc))
        guard pw > 2 * padPx, ph > 0, let ctx = CGContext(data: nil, width: pw, height: ph, bitsPerComponent: 8, bytesPerRow: pw, space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue), let px = ctx.data?.assumingMemoryBound(to: UInt8.self) else { return (w, 0, 0, 0, 0) }
        ctx.setFillColor(gray: 1, alpha: 1); ctx.fill(CGRect(x: 0, y: 0, width: pw, height: ph)); ctx.setFillColor(gray: 0, alpha: 1)
        ctx.scaleBy(x: sc, y: sc)
        ctx.textPosition = CGPoint(x: CGFloat(padPx) / sc, y: half - cy)
        CTLineDraw(line, ctx)
        var first = -1, last = -1
        let bandLo = Int((half - 0.28 * size) * sc), bandHi = ph - bandLo
        for x in 0..<pw {
            var hit = false
            for y in bandLo..<bandHi where px[y * pw + x] < 190 { hit = true; break }
            if hit { if first < 0 { first = x }; last = x }
        }
        if first < 0 { return (w, w / 2, w / 2, w / 2, w / 2) }
        // نسخة واعية بانحناء القرص: كل صف يزيد فراغه بقدر ما ينحسر حدّ الدائرة عنده عن أقصى عرضها (R - √(R²-dy²))، فيطابق قياس الحارس على اللقطة.
        let rad = 0.56 * size * sc
        var cl = CGFloat.greatestFiniteMagnitude, cr = CGFloat.greatestFiniteMagnitude
        for y in 0..<ph {
            let dy = CGFloat(y) + 0.5 - CGFloat(ph) / 2
            let extra = rad - max(rad * rad - dy * dy, 0).squareRoot()
            var f = -1, l = -1
            for x in 0..<pw where px[y * pw + x] < 190 { if f < 0 { f = x }; l = x }
            if f >= 0 { cl = min(cl, CGFloat(f - padPx) + extra); cr = min(cr, CGFloat(pw - padPx - (l + 1)) - (CGFloat(pw) - 2 * CGFloat(padPx) - w * sc) + extra) }
        }
        let inkL = CGFloat(first - padPx) / sc, inkR = w - CGFloat(last + 1 - padPx) / sc
        return (w, inkL, inkR, cl == .greatestFiniteMagnitude ? inkL : cl / sc, cr == .greatestFiniteMagnitude ? inkR : cr / sc)
    }

    struct EndPad: Equatable {
        /// حشوة جهة الكلمة السابقة (يمين في RTL) وجهة الكلمة التالية (يسار).
        var lead: CGFloat
        var trail: CGFloat
    }

    struct Layout: Equatable {
        var fontSize: CGFloat
        /// فراغ ثابت بين الكلمات لكل سطر؛ nil = سطر قصير يُوسَّط بفراغ طبيعي.
        var gaps: [Int: CGFloat]
        /// حشوة أفقية مستقلة لكل جانب من رمز نهاية الآية، سطر ← موضع الكلمة: يحسبها التخطيط من حبر الجارين الفعلي ليتماثل الفراغ حول القرص ويبلغ نسبة من فراغ الكلمات.
        var endPads: [Int: [Int: EndPad]] = [:]
    }

    /// هامش أمان (em) بين حدّ القرص وحبر الحرف المجاور (حدّ أدنى مطلق).
    static let discSafetyEm: CGFloat = 0.06
    /// هدف الفراغ حول القرص كنسبة من فراغ الحبر المتوسط بين كلمات السطر (الحارس يفرض ≥0.7).
    static let discClearRatio: CGFloat = 0.8
    /// أقصى تفاوت مسموح بين جانبي القرص (الحارس يفرض ≤30%).
    static let discSideRatio: CGFloat = 1.0
    /// أدنى فراغ كلمات (نسبة من الطبيعي) يُقبل لإفساح مكان للقرص قبل تصغير الخط.
    static let minGapFactor: CGFloat = 0.9

    static let naturalGapEm: CGFloat = 0.12

    private struct Line {
        var i: Int
        var w: [CGFloat], inkL: [CGFloat], inkR: [CGFloat], cL: [CGFloat], cR: [CGFloat]
        var ends: [Bool]
    }

    /// حلّ سطر واحد عند حجم خط `s`: الفراغ بين الكلمات وحشوات الأقراص بحيث يملأ السطر `width` (أو يبقى قصيرًا بفراغ طبيعي).
    private static func solve(_ l: Line, s: CGFloat, width: CGFloat, probe: CGFloat) -> (gap: CGFloat, justified: Bool, pads: [Int: EndPad]) {
        let f = s / probe, n = l.w.count
        let w = l.w.map { $0 * f }, iL = l.inkL.map { $0 * f }, iR = l.inkR.map { $0 * f }, cL = l.cL.map { $0 * f }, cR = l.cR.map { $0 * f }
        let nat = naturalGapEm * s
        guard l.ends.contains(true) else {
            if n < 2 { return (nat, false, [:]) }
            let g = (width - w.reduce(0, +)) / CGFloat(n - 1)
            return g <= s * 0.6 ? (max(g, 0), true, [:]) : (nat, false, [:])
        }
        // متوسط فراغ الحبر بين كلمتين عاديتين متجاورتين = g + هذا المتوسط.
        var ins: [CGFloat] = []
        for k in 0..<max(n - 1, 0) where !l.ends[k] && !l.ends[k + 1] { ins.append(iL[k] + iR[k + 1]) }
        let refIns = ins.isEmpty ? 0 : ins.reduce(0, +) / CGFloat(ins.count)
        let dd = MushafPageView.ayahDiscEm * s, safety = discSafetyEm * s
        func pads(_ g: CGFloat) -> [Int: EndPad] {
            var out: [Int: EndPad] = [:]
            let target = max(safety, discClearRatio * (g + refIns))
            for k in 0..<n where l.ends[k] {
                let ov = (dd - w[k]) / 2 // القرص يتجاوز صندوق الرمز بهذا القدر في كل جانب (سالب إن كان أصغر منه)
                let edge = max(0, ov) + safety // جهة بلا جار (حافة السطر)
                let natLead: CGFloat? = k > 0 ? g - ov + cL[k - 1] : nil
                let natTrail: CGFloat? = k < n - 1 ? g - ov + cR[k + 1] : nil
                let base = max(target, discSideRatio * max(natLead ?? 0, natTrail ?? 0))
                out[k] = EndPad(lead: natLead.map { max(0, base - $0) } ?? edge, trail: natTrail.map { max(0, base - $0) } ?? edge)
            }
            return out
        }
        if n < 2 { return (nat, false, pads(nat)) }
        let sumW = w.reduce(0, +)
        func padSum(_ p: [Int: EndPad]) -> CGFloat { p.values.reduce(0) { $0 + $1.lead + $1.trail } }
        var g = nat, p = pads(g)
        for _ in 0..<16 {
            let gn = (width - sumW - padSum(p)) / CGFloat(n - 1)
            if gn > s * 0.6 { return (nat, false, pads(nat)) }
            g = 0.5 * g + 0.5 * max(gn, 0); p = pads(g)
        }
        let gf = (width - sumW - padSum(p)) / CGFloat(n - 1)
        return gf > s * 0.6 ? (nat, false, pads(nat)) : (max(gf, 0), true, p)
    }

    /// حجم موحّد للصفحة (أكبر حجم يتسع معه أعرض سطر مع حشوات الأقراص) ثم تبرير كل سطر.
    static func layout(rows: [MushafRow], family: String, width: CGFloat, maxFont: CGFloat) -> Layout {
        let probe: CGFloat = 100
        let lines = rows.enumerated().compactMap { i, r -> Line? in
            guard r.k == "l", let w = r.w, !w.isEmpty else { return nil }
            let m = w.map { wordMetrics($0.c, family: family, size: probe) }
            return Line(i: i, w: m.map(\.width), inkL: m.map(\.inkL), inkR: m.map(\.inkR), cL: m.map(\.cInkL), cR: m.map(\.cInkR), ends: w.map(\.isAyahEnd))
        }
        var widest: CGFloat = probe
        for l in lines {
            let sum: CGFloat = l.w.reduce(0, +)
            widest = max(widest, sum + CGFloat(max(l.w.count - 1, 0)) * naturalGapEm * probe)
        }
        let hi = min(width / widest * probe, maxFont)
        func fits(_ s: CGFloat) -> Bool {
            lines.allSatisfy { l in
                let r = solve(l, s: s, width: width, probe: probe)
                return !r.justified || r.gap >= minGapFactor * naturalGapEm * s
            }
        }
        var size = hi
        if !fits(hi) {
            var lo = hi * 0.6, up = hi
            for _ in 0..<14 { let mid = (lo + up) / 2; if fits(mid) { lo = mid } else { up = mid } }
            size = lo
        }
        var gaps: [Int: CGFloat] = [:]
        var endPads: [Int: [Int: EndPad]] = [:]
        for l in lines {
            let r = solve(l, s: size, width: width, probe: probe)
            if r.justified { gaps[l.i] = r.gap }
            if !r.pads.isEmpty { endPads[l.i] = r.pads }
        }
        return Layout(fontSize: size, gaps: gaps, endPads: endPads)
    }
}
