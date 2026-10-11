import Foundation
import CoreText

/// قياس عرض كلمات السطر بخط الصفحة نفسه (Core Text) لتوزيع السطر على عرض الصفحة كما في المصحف المطبوع.
enum MushafMetrics {
    static func textWidth(_ text: String, family: String, size: CGFloat) -> CGFloat {
        let font = CTFontCreateWithName(family as CFString, size, nil)
        let attr = NSAttributedString(string: text, attributes: [NSAttributedString.Key(kCTFontAttributeName as String): font])
        return CGFloat(CTLineGetTypographicBounds(CTLineCreateWithAttributedString(attr), nil, nil, nil))
    }

    struct Layout: Equatable {
        var fontSize: CGFloat
        /// فراغ ثابت بين الكلمات لكل سطر؛ nil = سطر قصير يُوسَّط بفراغ طبيعي.
        var gaps: [Int: CGFloat]
    }

    static let naturalGapEm: CGFloat = 0.12

    /// حجم موحّد للصفحة (أعرض سطر يملأ العرض) ثم تبرير كل سطر.
    static func layout(rows: [MushafRow], family: String, width: CGFloat, maxFont: CGFloat) -> Layout {
        let probe: CGFloat = 100
        let lines = rows.enumerated().compactMap { i, r -> (Int, [CGFloat])? in
            guard r.k == "l", let w = r.w, !w.isEmpty else { return nil }
            return (i, w.map { textWidth($0.c, family: family, size: probe) })
        }
        var widest: CGFloat = probe
        for (_, ws) in lines {
            let sum: CGFloat = ws.reduce(0, +)
            let gaps: CGFloat = CGFloat(max(ws.count - 1, 0)) * naturalGapEm * probe
            widest = max(widest, sum + gaps)
        }
        let size = min(width / widest * probe, maxFont)
        var gaps: [Int: CGFloat] = [:]
        for (i, ws) in lines where ws.count > 1 {
            let sum = ws.reduce(0, +) * size / probe
            let gap = (width - sum) / CGFloat(ws.count - 1)
            if gap <= size * 0.6 { gaps[i] = max(gap, 0) }
        }
        return Layout(fontSize: size, gaps: gaps)
    }
}
