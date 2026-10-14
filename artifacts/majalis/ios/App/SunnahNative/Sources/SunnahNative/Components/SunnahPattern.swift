import SwiftUI

/// نقش نجمة ثمانية (رُبعَي مربع متداخلين) يتكرر؛ يُستعمل بشفافية 10–14% في الترويسات والبطاقات المميزة فقط.
public struct SunnahStarPattern: View {
    let tile: CGFloat; let opacity: Double
    public init(tile: CGFloat = 44, opacity: Double = 0.12) { self.tile = tile; self.opacity = opacity }
    public var body: some View {
        Canvas { ctx, size in
            let color = Color.white.opacity(opacity)
            var y: CGFloat = 0
            while y < size.height + tile {
                var x: CGFloat = 0
                while x < size.width + tile {
                    ctx.stroke(star(center: CGPoint(x: x + tile / 2, y: y + tile / 2), r: tile * 0.36), with: .color(color), lineWidth: 1)
                    x += tile
                }
                y += tile
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
    private func star(center c: CGPoint, r: CGFloat) -> Path {
        var p = Path()
        for k in 0..<2 {
            for i in 0..<4 {
                let a = (Double(i) * .pi / 2) + (k == 1 ? .pi / 4 : 0)
                let pt = CGPoint(x: c.x + r * CGFloat(cos(a)), y: c.y + r * CGFloat(sin(a)))
                i == 0 ? p.move(to: pt) : p.addLine(to: pt)
            }
            p.closeSubpath()
        }
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
            }
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
        }
    }
}
