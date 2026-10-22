import SwiftUI

/// تقرير نهاية الجلسة: بطاقة نتيجة بحلقة نسبة متحركة، وتفصيل الأخطاء بالآية، وزر واحد لإعادة الآيات الضعيفة.
public struct TasmeeReportScreen: View {
    let record: TasmeeSessionRecord
    let surahName: String
    let onReplayWeak: ([Int]) -> Void
    @State private var shown = 0.0
    var instant = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public init(record: TasmeeSessionRecord, surahName: String, onReplayWeak: @escaping ([Int]) -> Void) {
        self.record = record; self.surahName = surahName; self.onReplayWeak = onReplayWeak
    }

    private var percent: Int { Int((record.accuracy * 100).rounded()) }

    public var body: some View {
        SunnahPage("تقرير الجلسة") { content }
        .onAppear { animateRing() }
        .onChange(of: record.accuracy) { _ in animateRing() }
    }

    private func animateRing() {
        if reduceMotion { shown = record.accuracy }
        else { withAnimation(.easeOut(duration: 0.9)) { shown = record.accuracy } }
    }

    /// محتوى الصفحة بلا إطار التمرير (للّقطات والاختبارات). `instant` يعرض الحلقة مكتملة بلا حركة.
    @ViewBuilder var content: some View {
            resultCard
            if !record.weakAyahs.isEmpty {
                ForEach(record.weakAyahs, id: \.self) { ayahCard($0) }
                SunnahButton("أعد الآيات الضعيفة") { onReplayWeak(record.weakAyahs) }
                    .padding(.horizontal, Sunnah.Spacing.pageX)
            } else {
                SunnahCard { Text("أحسنت — لا أخطاء في هذه الجلسة.").font(AppearancePrefs.ui(.bold, 16, .body))
                    .foregroundStyle(Sunnah.Colors.textPrimary) }.padding(.horizontal, Sunnah.Spacing.pageX)
            }
    }

    private var resultCard: some View {
        SunnahCard {
            VStack(spacing: 16) {
                Text("\(surahName)، الآيات \(record.fromAyah.arabicDigits) إلى \(record.toAyah.arabicDigits)")
                    .font(AppearancePrefs.ui(.bold, 15, .subheadline)).foregroundStyle(Sunnah.Colors.textSecondary)
                SunnahProgressRing(value: instant ? record.accuracy : shown, lineWidth: 12, size: 132) {
                    Text("\(percent.arabicDigits)٪").font(AppearancePrefs.ui(.extraBold, 30, .title)).foregroundStyle(Sunnah.Colors.primary)
                        .minimumScaleFactor(0.6).lineLimit(1)
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("نسبة الصحة \(percent.arabicDigits) بالمئة")
                HStack(alignment: .top) {
                    SunnahStatCell(record.count(.wrong).arabicDigits, "خاطئة")
                    SunnahStatCell(record.count(.skipped).arabicDigits, "متروكة")
                    SunnahStatCell(record.count(.extra).arabicDigits, "زائدة")
                    SunnahStatCell(TasmeeReportFormat.duration(record.durationSec), "المدة")
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    private func ayahCard(_ ayah: Int) -> some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: 8) {
                Text("الآية \(ayah.arabicDigits)").font(AppearancePrefs.ui(.extraBold, 16, .headline))
                    .foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                if record.events.contains(where: { $0.ayah == ayah && $0.usedPeek }) {
                    Text("نظرتَ إلى الآية أثناء التسميع").font(AppearancePrefs.ui(.regular, 15, .body))
                        .foregroundStyle(Sunnah.Colors.textSecondary)
                }
                ForEach(Array(record.errors(inAyah: ayah).enumerated()), id: \.offset) { _, e in
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(TasmeeReportFormat.label(e.kind)).font(AppearancePrefs.ui(.bold, 12, .caption))
                            .foregroundStyle(Sunnah.Colors.danger)
                        Text(TasmeeReportFormat.detail(e)).font(AppearancePrefs.ui(.regular, 15, .body))
                            .foregroundStyle(Sunnah.Colors.textPrimary)
                        Spacer(minLength: 0)
                    }
                    .accessibilityElement(children: .combine)
                }
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}

/// صياغة نصوص التقرير (منفصلة لتُختبر).
public enum TasmeeReportFormat {
    public static func duration(_ sec: Double) -> String {
        let s = max(0, Int(sec.rounded()))
        return Sunnah.digits(String(format: "%d:%02d", s / 60, s % 60))
    }
    public static func label(_ k: TasmeeEventKind) -> String {
        switch k {
        case .wrong: return "خاطئة"
        case .skipped: return "متروكة"
        case .extra: return "زائدة"
        case .tashkeelMaybe: return "تشكيل (محتمل)"
        case .correct: return "صحيحة"
        }
    }
    /// «قلتَ: X، الصواب: Y» بما يتوفر.
    public static func detail(_ e: TasmeeSessionEvent) -> String {
        switch (e.said, e.expected) {
        case let (s?, x?): return "قلتَ: \(s)، الصواب: \(x)"
        case let (nil, x?): return "الصواب: \(x)"
        case let (s?, nil): return "قلتَ: \(s)"
        default: return "الكلمة \((e.wordIndex + 1).arabicDigits)"
        }
    }
}
