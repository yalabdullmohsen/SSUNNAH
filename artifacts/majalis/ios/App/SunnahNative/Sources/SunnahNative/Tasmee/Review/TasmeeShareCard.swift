import SwiftUI

/// صورة التقرير القابلة للمشاركة: النسبة والآيات والكلمات الخاطئة في مواضعها. لا صوت ولا نص مسجَّل ولا بيانات شخصية.
struct TasmeeShareCard: View {
    let record: TasmeeSessionRecord
    let surahName: String
    static let maxAyahs = 8

    private var percent: Int { Int((record.accuracy * 100).rounded()) }

    /// أخطاء كل آية مرتبة بموضع الكلمة: «الكلمة ٣ ← الصواب: …».
    static func lines(_ record: TasmeeSessionRecord, ayah: Int) -> [String] {
        record.errors(inAyah: ayah).sorted { $0.wordIndex < $1.wordIndex }.map { e in
            "الكلمة \((e.wordIndex + 1).arabicDigits): " + (e.expected.map { "الصواب «\($0)»" } ?? TasmeeReportFormat.label(e.kind))
        }
    }

    var body: some View {
        VStack(spacing: Sunnah.Spacing.s4) {
            Text("سُنّة · تقرير تسميع").font(AppearancePrefs.ui(.bold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.textSecondary)
            Text("\(surahName)، الآيات \(record.fromAyah.arabicDigits) إلى \(record.toAyah.arabicDigits)")
                .font(AppearancePrefs.ui(.extraBold, 18, .headline)).foregroundStyle(Sunnah.Colors.textPrimary).multilineTextAlignment(.center)
            SunnahProgressRing(value: record.accuracy, lineWidth: 12, size: 132) {
                Text("\(percent.arabicDigits)٪").font(AppearancePrefs.ui(.extraBold, 30, .title)).foregroundStyle(Sunnah.Colors.primary)
            }
            HStack(alignment: .top) {
                SunnahStatCell(record.count(.wrong).arabicDigits, "خاطئة")
                SunnahStatCell(record.count(.skipped).arabicDigits, "متروكة")
                SunnahStatCell(record.count(.extra).arabicDigits, "زائدة")
            }
            if record.weakAyahs.isEmpty {
                Text("أحسنت — لا أخطاء في هذه الجلسة.").font(AppearancePrefs.ui(.bold, 16, .body)).foregroundStyle(Sunnah.Colors.primary)
            } else {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    ForEach(Array(record.weakAyahs.prefix(Self.maxAyahs)), id: \.self) { a in
                        VStack(alignment: .leading, spacing: 2) {
                            Text("الآية \(a.arabicDigits)").font(AppearancePrefs.ui(.extraBold, 15, .subheadline)).foregroundStyle(Sunnah.Colors.textPrimary)
                            ForEach(Array(Self.lines(record, ayah: a).prefix(4).enumerated()), id: \.offset) { _, l in
                                Text(l).font(AppearancePrefs.ui(.regular, 14, .footnote)).foregroundStyle(Sunnah.Colors.danger)
                            }
                        }
                    }
                    if record.weakAyahs.count > Self.maxAyahs {
                        Text("و\((record.weakAyahs.count - Self.maxAyahs).arabicDigits) آيات أخرى").font(AppearancePrefs.ui(.regular, 13, .caption))
                            .foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(Sunnah.Spacing.s5)
        .frame(width: 360)
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }

    @MainActor static func render(record: TasmeeSessionRecord, surahName: String, scheme: ColorScheme = .light) -> Image? {
        let r = ImageRenderer(content: TasmeeShareCard(record: record, surahName: surahName).environment(\.colorScheme, scheme))
        r.scale = 3
        return r.uiImage.map { Image(uiImage: $0) }
    }
}

/// زر مشاركة التقرير: يرسم الصورة مرة ثم يعرض ShareLink بنمط SunnahButton.
struct TasmeeShareButton: View {
    let record: TasmeeSessionRecord
    let surahName: String
    @State private var image: Image?
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        Group {
            if let image {
                ShareLink(item: image, preview: SharePreview("تقرير تسميع · \(surahName)", image: image)) {
                    Text("شارك التقرير").frame(maxWidth: .infinity)
                }
                .buttonStyle(SunnahButtonStyle(.outline))
                .accessibilityIdentifier("tasmee.report.share")
            }
        }
        .task { image = TasmeeShareCard.render(record: record, surahName: surahName, scheme: scheme) }
    }
}
