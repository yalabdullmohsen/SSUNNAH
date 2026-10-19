import SwiftUI

#if os(iOS)
/// بطاقة مشاركة الآية كصورة: نص الآية نفسه الذي يُنسخ (بلا تعديل) بخط Amiri على ورق فاتح، والمرجع أسفله.
struct MushafAyahShareCard: View {
    let text: String
    let reference: String

    var body: some View {
        VStack(spacing: 16) {
            Text(text)
                .font(Sunnah.Typography.quran).foregroundStyle(Color.black)
                .multilineTextAlignment(.center).lineSpacing(10)
                .fixedSize(horizontal: false, vertical: true)
            Text(reference).font(AppearancePrefs.ui(.bold, 15, .footnote)).foregroundStyle(Color.black.opacity(0.6))
        }
        .padding(28).frame(width: 360)
        .background(Color(red: 0.98, green: 0.96, blue: 0.91))
        .environment(\.layoutDirection, .rightToLeft)
        .environment(\.colorScheme, .light)
    }

    /// صورة بدقة 3x؛ nil إن تعذّر الرسم.
    @MainActor static func image(text: String, reference: String) -> Image? {
        let r = ImageRenderer(content: MushafAyahShareCard(text: text, reference: reference))
        r.scale = 3
        return r.uiImage.map(Image.init(uiImage:))
    }
}
#endif
