import SwiftUI

/// رسوم متجهية أصلية مجرّدة لمراحل «خلق الإنسان» (SwiftUI Shapes فقط): بلا صور حقيقية ولا وجوه ولا قياسات.
/// مسجَّلة في docs/native/ASSETS_LICENSES.md («رسم أصلي»).
struct ExplainerArt: View {
    let stageID: String
    private let ink = Sunnah.Colors.primary

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16).fill(ink.opacity(0.08))
            art.padding(Sunnah.Spacing.s4)
        }
        .accessibilityHidden(true)
    }

    @ViewBuilder private var art: some View {
        if stageID.hasSuffix("1-clay") {
            Capsule().fill(ink.opacity(0.55)).frame(width: 120, height: 56)
        } else if stageID.hasSuffix("2-nutfa") {
            ZStack { Circle().stroke(ink, lineWidth: 2).frame(width: 110); Circle().fill(ink.opacity(0.6)).frame(width: 18) }
        } else if stageID.hasSuffix("3-alaqa") {
            ZStack { Circle().stroke(ink.opacity(0.5), lineWidth: 2).frame(width: 110); Capsule().fill(ink).frame(width: 26, height: 14) }
        } else if stageID.hasSuffix("4-mudgha") {
            RoundedRectangle(cornerRadius: 22).fill(ink.opacity(0.6)).frame(width: 84, height: 64)
        } else if stageID.hasSuffix("5-bones") {
            HStack(spacing: 6) { ForEach(0..<5, id: \.self) { _ in Capsule().stroke(ink, lineWidth: 2).frame(width: 14, height: 76) } }
        } else if stageID.hasSuffix("6-ruh") {
            ZStack { Circle().fill(ink.opacity(0.2)).frame(width: 120); Circle().fill(ink).frame(width: 20) }
        } else if stageID.hasSuffix("7-birth") {
            Circle().stroke(ink, lineWidth: 3).frame(width: 78)
        } else {
            HStack(alignment: .bottom, spacing: 24) { ForEach([36, 60, 48], id: \.self) { h in Capsule().fill(ink.opacity(0.6)).frame(width: 20, height: CGFloat(h)) } }
        }
    }
}
