import SwiftUI

/// نقش شعار «سُنّة» (الزليج) — مأخوذ من ملف الشعار المعتمد (viewBox 200). يُستعمل متفرّقًا بشفافية منخفضة.
struct SunnahMotifShape: Shape {
    enum Layer { case body, gold, core }
    let layer: Layer
    private static let data: [Layer: String] = [
        .body: "M100.00 52.00 L113.01 68.59 L133.94 66.06 L131.41 86.99 L148.00 100.00 L131.41 113.01 L133.94 133.94 L113.01 131.41 L100.00 148.00 L86.99 131.41 L66.06 133.94 L68.59 113.01 L52.00 100.00 L68.59 86.99 L66.06 66.06 L86.99 68.59 Z M188.00 100.00 L170.00 118.00 L152.00 100.00 L170.00 82.00 Z M162.23 162.23 L136.77 162.23 L136.77 136.77 L162.23 136.77 Z M100.00 188.00 L82.00 170.00 L100.00 152.00 L118.00 170.00 Z M37.77 162.23 L37.77 136.77 L63.23 136.77 L63.23 162.23 Z M12.00 100.00 L30.00 82.00 L48.00 100.00 L30.00 118.00 Z M37.77 37.77 L63.23 37.77 L63.23 63.23 L37.77 63.23 Z M100.00 12.00 L118.00 30.00 L100.00 48.00 L82.00 30.00 Z M162.23 37.77 L162.23 63.23 L136.77 63.23 L136.77 37.77 Z",
        .gold: "M157.28 111.73 L160.82 120.19 L169.28 123.73 L160.82 127.26 L157.28 135.73 L153.74 127.26 L145.28 123.73 L153.74 120.19 Z M132.21 148.80 L128.73 157.28 L132.21 165.77 L123.73 162.28 L115.24 165.77 L118.73 157.28 L115.24 148.80 L123.73 152.28 Z M88.27 157.28 L79.81 160.82 L76.27 169.28 L72.74 160.82 L64.27 157.28 L72.74 153.74 L76.27 145.28 L79.81 153.74 Z M51.20 132.21 L42.72 128.73 L34.23 132.21 L37.72 123.73 L34.23 115.24 L42.72 118.73 L51.20 115.24 L47.72 123.73 Z M42.72 88.27 L39.18 79.81 L30.72 76.27 L39.18 72.74 L42.72 64.27 L46.26 72.74 L54.72 76.27 L46.26 79.81 Z M67.79 51.20 L71.27 42.72 L67.79 34.23 L76.27 37.72 L84.76 34.23 L81.27 42.72 L84.76 51.20 L76.27 47.72 Z M111.73 42.72 L120.19 39.18 L123.73 30.72 L127.26 39.18 L135.73 42.72 L127.26 46.26 L123.73 54.72 L120.19 46.26 Z M148.80 67.79 L157.28 71.27 L165.77 67.79 L162.28 76.27 L165.77 84.76 L157.28 81.27 L148.80 84.76 L152.28 76.27 Z",
        .core: "M100.00 76.00 L103.83 90.76 L116.97 83.03 L109.24 96.17 L124.00 100.00 L109.24 103.83 L116.97 116.97 L103.83 109.24 L100.00 124.00 L96.17 109.24 L83.03 116.97 L90.76 103.83 L76.00 100.00 L90.76 96.17 L83.03 83.03 L96.17 90.76 Z",
    ]
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let s = min(rect.width, rect.height) / 200
        let tokens = (Self.data[layer] ?? "").split(whereSeparator: { $0 == " " })
        var i = 0
        func pt(_ x: Substring, _ y: Substring) -> CGPoint {
            CGPoint(x: rect.minX + CGFloat(Double(x) ?? 0) * s, y: rect.minY + CGFloat(Double(y) ?? 0) * s)
        }
        while i < tokens.count {
            let t = tokens[i]
            if t == "Z" { p.closeSubpath(); i += 1; continue }
            let cmd = t.first!
            var x = t.dropFirst(); var next = i + 1
            if x.isEmpty { x = tokens[next]; next += 1 }
            let y = tokens[next]; next += 1
            cmd == "M" ? p.move(to: pt(x, y)) : p.addLine(to: pt(x, y))
            i = next
        }
        return p
    }
}

public struct SunnahMotif: View {
    let size: CGFloat; let tint: Color; let accent: Color; let opacity: Double
    public init(size: CGFloat = 120, tint: Color = Sunnah.Colors.primary, accent: Color = Sunnah.Colors.goldDeco, opacity: Double = 0.10) {
        self.size = size; self.tint = tint; self.accent = accent; self.opacity = opacity
    }
    public var body: some View {
        ZStack {
            SunnahMotifShape(layer: .body).fill(tint, style: FillStyle(eoFill: true))
            SunnahMotifShape(layer: .gold).fill(accent, style: FillStyle(eoFill: true))
        }
        .frame(width: size, height: size)
        .opacity(opacity)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}

extension View {
    /// شعار «سُنّة» كنقش خلفي متفرّق في الزاوية (للشاشات والبطاقات المميزة).
    func sunnahMotifCorner(size: CGFloat = 150, alignment: Alignment = .topTrailing, tint: Color = Sunnah.Colors.primary, opacity: Double = 0.08) -> some View {
        self.background(alignment: alignment) {
            SunnahMotif(size: size, tint: tint, opacity: opacity).offset(x: alignment == .topTrailing ? size * 0.3 : -size * 0.3, y: (alignment == .bottomLeading || alignment == .bottomTrailing ? 1 : -1) * size * 0.25)
        }
    }
}
