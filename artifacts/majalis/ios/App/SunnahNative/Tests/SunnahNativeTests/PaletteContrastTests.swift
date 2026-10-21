#if canImport(UIKit)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// تباين نص الألوان الدلالية ≥ 4.5:1 على أسطح التطبيق، فاتحًا وداكنًا.
final class PaletteContrastTests: XCTestCase {
    private func lum(_ c: Color, _ style: UIUserInterfaceStyle) -> CGFloat {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        UIColor(c).resolvedColor(with: UITraitCollection(userInterfaceStyle: style)).getRed(&r, green: &g, blue: &b, alpha: &a)
        func f(_ v: CGFloat) -> CGFloat { v <= 0.03928 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }

    private func ratio(_ a: Color, _ b: Color, _ s: UIUserInterfaceStyle) -> CGFloat {
        let (x, y) = (lum(a, s), lum(b, s))
        return (max(x, y) + 0.05) / (min(x, y) + 0.05)
    }

    func testTextColorsMeetAAOnSurfaces() {
        let C = Sunnah.Colors.self
        let texts: [(String, Color)] = [("textPrimary", C.textPrimary), ("textSecondary", C.textSecondary), ("primary", C.primary),
                                        ("gold", C.gold), ("hifzReview", C.hifzReview), ("danger", C.danger), ("mushafAccent", C.mushafAccent)]
        let surfaces: [(String, Color)] = [("bg", C.bg), ("surface", C.surface), ("surface2", C.surface2), ("primarySoft", C.primarySoft)]
        for (style, name) in [(UIUserInterfaceStyle.light, "light"), (.dark, "dark")] {
            for (tn, t) in texts { for (sn, s) in surfaces {
                XCTAssertGreaterThanOrEqual(ratio(t, s, style), 4.5, "\(tn) على \(sn) (\(name))")
            } }
        }
    }

    func testHeroTagMeetsAAOnHero() {
        for style in [UIUserInterfaceStyle.light, .dark] {
            XCTAssertGreaterThanOrEqual(ratio(Sunnah.Colors.heroGold, Sunnah.Colors.primaryStrong, style), 4.5)
        }
    }
}
#endif
