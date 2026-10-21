import SwiftUI

/// زر إجراء دائري (44pt) بتسمية تحته؛ المفعّل بخلفية الأخضر الناعم.
struct MushafCircleAction: View {
    let symbol: String, label: String, id: String
    var on = false
    var action: () -> Void
    var body: some View {
        Button(action: { Sunnah.Haptics.select(); action() }) {
            VStack(spacing: Sunnah.Spacing.s1) {
                Image(systemName: symbol).font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(on ? Sunnah.Colors.primaryStrong : Sunnah.Colors.primary)
                    .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                    .background(Circle().fill(on ? Sunnah.Colors.goldSoft : Sunnah.Colors.primarySoft))
                Text(label).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                    .lineLimit(1).minimumScaleFactor(0.7)
            }
            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label).accessibilityIdentifier(id)
    }
}

/// شريط إجراءات الآية: الأهم ظاهر (تفسير، استماع، علامة، حفظ) والباقي (نسخ، مشاركة، صورة) في «المزيد».
struct MushafAyahActionBar: View {
    let text: String?
    let reference: String
    let marked: Bool
    let hifzDone: Bool
    let tafsir: () -> Void
    let listen: () -> Void
    let mark: () -> Void
    let hifz: () -> Void
    let copy: (String) -> Void

    var body: some View {
        HStack(alignment: .top, spacing: Sunnah.Spacing.s2) {
            MushafCircleAction(symbol: "text.book.closed", label: "تفسير", id: "mushaf.sheet.tafsir", action: tafsir)
            MushafCircleAction(symbol: "headphones", label: "استماع", id: "mushaf.sheet.reciters", action: listen)
            MushafCircleAction(symbol: marked ? "bookmark.fill" : "bookmark", label: "علامة", id: "mushaf.sheet.mark", on: marked, action: mark)
            MushafCircleAction(symbol: hifzDone ? "checkmark.circle.fill" : "checkmark.circle", label: "حفظ", id: "mushaf.sheet.hifz", on: hifzDone, action: hifz)
            if let text { more(text) }
        }
        .dynamicTypeSize(...DynamicTypeSize.xxxLarge)
    }

    private func more(_ text: String) -> some View {
        Menu {
            Button { copy(text) } label: { Label("نسخ", systemImage: "doc.on.doc") }.accessibilityIdentifier("mushaf.sheet.copy")
            ShareLink(item: text) { Label("مشاركة", systemImage: "square.and.arrow.up") }.accessibilityIdentifier("mushaf.sheet.share")
            #if os(iOS)
            if let img = MushafAyahShareCard.image(text: text, reference: reference) {
                ShareLink(item: img, preview: SharePreview(reference, image: img)) { Label("صورة", systemImage: "photo") }
                    .accessibilityIdentifier("mushaf.sheet.shareImage")
            }
            #endif
        } label: {
            VStack(spacing: Sunnah.Spacing.s1) {
                Image(systemName: "ellipsis").font(.system(size: 18, weight: .semibold)).foregroundStyle(Sunnah.Colors.primary)
                    .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                    .background(Circle().fill(Sunnah.Colors.primarySoft))
                Text("المزيد").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary).lineLimit(1).minimumScaleFactor(0.7)
            }
            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch)
        }
        .accessibilityLabel("المزيد").accessibilityIdentifier("mushaf.sheet.more")
    }
}
