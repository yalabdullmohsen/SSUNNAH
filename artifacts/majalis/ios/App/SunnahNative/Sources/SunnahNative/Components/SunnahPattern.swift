import SwiftUI

/// نقش هندسي إسلامي: نجمة ثمانية ذهبية مملوءة بخفة + حلقة مثمّنة داخلية + معيّنات تربط النجوم (نمط «الخاتم»)؛
/// يُستعمل بشفافية 10–14% في الترويسات والبطاقات المميزة فقط.
public struct SunnahStarPattern: View {
    let tile: CGFloat; let opacity: Double
    public init(tile: CGFloat = 56, opacity: Double = 0.13) { self.tile = tile; self.opacity = opacity }
    public var body: some View {
        Canvas { ctx, size in
            let gold = Color(red: 0.85, green: 0.75, blue: 0.54)
            var y: CGFloat = 0
            while y < size.height + tile {
                var x: CGFloat = 0
                while x < size.width + tile {
                    let c = CGPoint(x: x + tile / 2, y: y + tile / 2)
                    let star = octagram(c, tile * 0.42)
                    ctx.fill(star, with: .color(gold.opacity(opacity * 0.45)))
                    ctx.stroke(star, with: .color(gold.opacity(opacity * 1.5)), lineWidth: 0.9)
                    ctx.stroke(polygon(c, tile * 0.19, 8, .pi / 8), with: .color(Color.white.opacity(opacity * 1.2)), lineWidth: 0.8)
                    ctx.stroke(polygon(CGPoint(x: x, y: y), tile * 0.17, 4, .pi / 4), with: .color(Color.white.opacity(opacity)), lineWidth: 0.8)
                    x += tile
                }
                y += tile
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
    private func polygon(_ c: CGPoint, _ r: CGFloat, _ n: Int, _ phase: Double) -> Path {
        var p = Path()
        for i in 0..<n {
            let a = phase + Double(i) * 2 * .pi / Double(n)
            let pt = CGPoint(x: c.x + r * CGFloat(cos(a)), y: c.y + r * CGFloat(sin(a)))
            i == 0 ? p.move(to: pt) : p.addLine(to: pt)
        }
        p.closeSubpath()
        return p
    }
    /// نجمة ثمانية {8/2}: مربعان متداخلان بزاوية 45°.
    private func octagram(_ c: CGPoint, _ r: CGFloat) -> Path {
        var p = Path()
        p.addPath(polygon(c, r, 4, 0))
        p.addPath(polygon(c, r, 4, .pi / 4))
        return p
    }
}

extension View {
    /// خلفية خضراء منقوشة للترويسات.
    func sunnahPatternedBackground(radius: CGFloat = Sunnah.Radius.hero) -> some View {
        self.background {
            ZStack {
                LinearGradient(colors: [Sunnah.Colors.primary, Sunnah.Colors.primaryStrong], startPoint: .topLeading, endPoint: .bottomTrailing)
                SunnahStarPattern()
                    .mask(LinearGradient(colors: [.white, .white.opacity(0.35)], startPoint: .trailing, endPoint: .leading))
                RadialGradient(colors: [Color.white.opacity(0.16), .clear], center: .topTrailing, startRadius: 0, endRadius: 220)
            }
            .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.55), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
        }
    }
}
