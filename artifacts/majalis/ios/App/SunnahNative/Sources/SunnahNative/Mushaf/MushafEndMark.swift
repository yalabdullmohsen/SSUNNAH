import SwiftUI
import CoreText

/// علامة نهاية الآية الموحّدة (صفحة المصحف + MushafAyahText: بحث/علامات/قوائم) كما في المصحف المطبوع:
/// غليف QPC نفسه (الزخرفة والرقم من خط الصفحة، بلا أصول خارجية) مكبَّرًا بـ`endMarkScale`، ملوّنًا بثلاث طبقات من مسار الغليف:
/// حشوة بيج داخل الإطار (المحيط الخارجي)، والإطار والزخارف ذهبي بُنّي، والأرقام بحبر النص. النص القرآني نفسه بلا أي تعديل.
struct MushafEndMark: View {
    let glyph: String
    let family: String
    let fontSize: CGFloat
    /// مُبقًى لتوافق الاستدعاءات (قطر من التخطيط)؛ الرسم الآن من مسار الغليف نفسه.
    var diameter: CGFloat? = nil

    var body: some View {
        let fs = fontSize * MushafPageView.endMarkScale
        if let art = MushafEndMarkArt.parts(glyph: glyph, family: family, size: fs) {
            // هامش رسم حول صندوق التخطيط (لا يغيّر العرض): Canvas يقصّ ما خارج إطاره، فكان طرف الزخرفة يُقطع في آخر السطر.
            let m = fs * 0.12
            Canvas { ctx, _ in
                // إحداثيات Core Text: الأصل على خط الأساس والمحور الصادي للأعلى؛ الإطار = العرض الطباعي × (الصاعد + النازل) كصندوق Text.
                ctx.translateBy(x: art.inkMidX + m, y: art.ascent + m)
                ctx.scaleBy(x: MushafPageView.endMarkSquash, y: -1)
                ctx.translateBy(x: -art.inkMidX, y: 0)
                ctx.fill(Path(art.silhouette), with: .color(Sunnah.Colors.mushafEndFill))
                ctx.fill(Path(art.frame), with: .color(Sunnah.Colors.mushafEndGold))
                ctx.fill(Path(art.digits), with: .color(Sunnah.Colors.mushafText))
            }
            .frame(width: art.advance + 2 * m, height: art.ascent + art.descent + 2 * m)
            .padding(-m)
            .environment(\.layoutDirection, .leftToRight)
            .accessibilityHidden(true)
        } else {
            Text(glyph).lineLimit(1).fixedSize()
                .font(.custom(family, fixedSize: fs))
                .foregroundStyle(Sunnah.Colors.mushafEndGold)
        }
    }
}

/// تفكيك غليف نهاية الآية إلى طبقات من مساره الفعلي (CTFontCreatePathForGlyph):
/// - silhouette: المحيط الخارجي (أكبر كفاف) = شكل الزخرفة كاملًا للحشوة.
/// - digits: كفافات صغيرة في وسط الغليف (أرقام الآية) — بحبر النص.
/// - frame: بقية الكفافات (الإطار والزخارف) — ذهبي.
/// القياسات بوحدة em من حجم الغليف؛ مختبرة على 150 علامة من 17 صفحة (أرقام 1–3 خانات) بلا خطأ تصنيف.
enum MushafEndMarkArt {
    struct Parts {
        let advance: CGFloat
        let ascent: CGFloat
        let descent: CGFloat
        let inkMidX: CGFloat
        let silhouette: CGPath
        let frame: CGPath
        let digits: CGPath
    }

    /// حدود تصنيف الرقم (em من حجم الغليف): عرض/ارتفاع الكفاف، وبعد مركزه عن مركز حبر الغليف.
    static let digitMaxW: CGFloat = 0.32
    static let digitMaxH: CGFloat = 0.36
    static let digitMaxDX: CGFloat = 0.30
    static let digitMaxDY: CGFloat = 0.20

    private static let lock = NSLock()
    private static var cache: [String: Parts] = [:]

    static func parts(glyph: String, family: String, size: CGFloat) -> Parts? {
        let key = "\(family)|\(glyph)|\(Int((size * 10).rounded()))"
        lock.lock(); if let hit = cache[key] { lock.unlock(); return hit }; lock.unlock()
        guard let made = make(glyph: glyph, family: family, size: size) else { return nil }
        lock.lock(); if cache.count > 600 { cache.removeAll() }; cache[key] = made; lock.unlock()
        return made
    }

    /// كفافات مسار (تقسيم عند كل moveTo).
    static func contours(of path: CGPath) -> [CGPath] {
        var out: [CGMutablePath] = []
        path.applyWithBlock { el in
            let e = el.pointee, p = e.points
            switch e.type {
            case .moveToPoint: let m = CGMutablePath(); m.move(to: p[0]); out.append(m)
            case .addLineToPoint: out.last?.addLine(to: p[0])
            case .addQuadCurveToPoint: out.last?.addQuadCurve(to: p[1], control: p[0])
            case .addCurveToPoint: out.last?.addCurve(to: p[2], control1: p[0], control2: p[1])
            case .closeSubpath: out.last?.closeSubpath()
            @unknown default: break
            }
        }
        return out
    }

    /// تصنيف الكفافات: الفهرس الأكبر مساحةً (المحيط)، وأي الكفافات أرقام.
    static func classify(_ boxes: [CGRect], ink: CGRect, size: CGFloat) -> (silhouette: Int, digits: Set<Int>) {
        var digits = Set<Int>(), best = 0, bestArea: CGFloat = -1
        for (i, b) in boxes.enumerated() {
            let area = b.width * b.height
            if area > bestArea { bestArea = area; best = i }
            if b.width < digitMaxW * size, b.height < digitMaxH * size,
               abs(b.midX - ink.midX) < digitMaxDX * size, abs(b.midY - ink.midY) < digitMaxDY * size { digits.insert(i) }
        }
        digits.remove(best)
        return (best, digits)
    }

    private static func make(glyph: String, family: String, size: CGFloat) -> Parts? {
        let font = CTFontCreateWithName(family as CFString, size, nil)
        let chars = Array(glyph.utf16)
        var glyphs = [CGGlyph](repeating: 0, count: chars.count)
        guard !chars.isEmpty, CTFontGetGlyphsForCharacters(font, chars, &glyphs, chars.count), let g = glyphs.first, g != 0,
              let path = CTFontCreatePathForGlyph(font, g, nil) else { return nil }
        var adv = CGSize.zero
        CTFontGetAdvancesForGlyphs(font, .horizontal, [g], &adv, 1)
        let parts = contours(of: path)
        guard !parts.isEmpty else { return nil }
        let ink = path.boundingBoxOfPath
        let (sil, dig) = classify(parts.map(\.boundingBoxOfPath), ink: ink, size: size)
        let frame = CGMutablePath(), digits = CGMutablePath()
        for (i, c) in parts.enumerated() { (dig.contains(i) ? digits : frame).addPath(c) }
        // الطباعي من الخط نفسه (CTLine) كما في قياس التخطيط: لا يتغيّر عرض السطر.
        let attr = NSAttributedString(string: glyph, attributes: [NSAttributedString.Key(kCTFontAttributeName as String): font])
        let width = CGFloat(CTLineGetTypographicBounds(CTLineCreateWithAttributedString(attr), nil, nil, nil))
        return Parts(advance: max(width, adv.width), ascent: CTFontGetAscent(font), descent: CTFontGetDescent(font), inkMidX: ink.midX,
                     silhouette: parts[sil], frame: frame, digits: digits)
    }
}

/// تثخين حبر خط المصحف كالمطبوع (قرار المالك: «أعرض وأغمق» كالمرجع): نسختان مزاحتان أفقيًا بجزء صغير من حجم الخط
/// بنفس لون الحبر — لا يغيّر شكل الحروف ولا عرض السطر (الظل لا يدخل في التخطيط).
struct MushafInkWeight: ViewModifier {
    let fontSize: CGFloat
    static let ratio: CGFloat = 0.014
    func body(content: Content) -> some View {
        let d = fontSize * Self.ratio
        content
            .shadow(color: Sunnah.Colors.mushafText, radius: 0, x: d, y: 0)
            .shadow(color: Sunnah.Colors.mushafText, radius: 0, x: -d, y: 0)
    }
}

extension View {
    func mushafInkWeight(_ fontSize: CGFloat) -> some View { modifier(MushafInkWeight(fontSize: fontSize)) }
}
