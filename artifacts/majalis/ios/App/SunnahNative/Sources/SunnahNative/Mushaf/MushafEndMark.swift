import SwiftUI

/// علامة نهاية الآية الموحّدة (صفحة المصحف + MushafAyahText: بحث/علامات/قوائم): غليف QPC مُصغَّر بـ`endMarkScale` مع قرص أخضر
/// قطره أصغر من حلقة الزخرفة فلا أخضر خارج حدّها؛ الحلقة والرقم عاجيان فوق القرص. النص القرآني نفسه بلا أي تعديل.
struct MushafEndMark: View {
    let glyph: String
    let family: String
    let fontSize: CGFloat

    var body: some View {
        let fs = fontSize * MushafPageView.endMarkScale, d = fs * MushafPageView.ayahDiscEm
        Text(glyph)
            .lineLimit(1).fixedSize()
            .font(.custom(family, fixedSize: fs))
            .foregroundStyle(Sunnah.Colors.mushafIvory)
            .background { Circle().fill(Sunnah.Colors.mushafEndDisc).frame(width: d, height: d).offset(y: fs * MushafPageView.ayahDiscDropEm) }
    }
}
