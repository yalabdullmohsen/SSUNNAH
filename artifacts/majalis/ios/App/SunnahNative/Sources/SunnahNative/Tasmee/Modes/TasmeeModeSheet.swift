import SwiftUI

public extension TasmeeMode {
    var title: String {
        switch self {
        case .follow: "تتبّع التلاوة"
        case .recite: "التسميع من الحفظ"
        case .graded: "التسميع المتدرّج"
        case .exam: "الاختبار"
        case .repeat: "التكرار"
        }
    }
    var summary: String {
        switch self {
        case .follow: "النص ظاهر والكلمة الحالية مميّزة، والخطأ يُعلَّم"
        case .recite: "الآيات مخفية وتظهر الكلمة حين تُقال صحيحة"
        case .graded: "مستويات إخفاء من أول حرف حتى الصفحة كاملة"
        case .exam: "بداية عشوائية في نطاقك، بلا تلميحات، ونتيجة بالدرجة"
        case .repeat: "يعيد الآية حتى تقرأها صحيحة عدة مرات متتالية"
        }
    }
    var icon: String {
        switch self {
        case .follow: "text.line.first.and.arrowtriangle.forward"
        case .recite: "eye.slash"
        case .graded: "slider.horizontal.3"
        case .exam: "checkmark.seal"
        case .repeat: "repeat"
        }
    }
}

public extension TasmeeHideLevel {
    var title: String {
        switch self {
        case .firstLetter: "أول حرف"
        case .alternate: "كلمة وكلمة"
        case .ayahEnd: "آخر الآية"
        case .ayah: "الآية كاملة"
        case .page: "الصفحة كاملة"
        }
    }
}

/// ورقة اختيار وضع التسميع من زر الميكروفون؛ تحفظ آخر اختيار وتُعيده عبر `onStart`.
public struct TasmeeModeSheet: View {
    @State private var options: TasmeeModeOptions
    private let defaults: UserDefaults
    private let onStart: (TasmeeModeOptions) -> Void

    public init(defaults: UserDefaults = .standard, onStart: @escaping (TasmeeModeOptions) -> Void) {
        self.defaults = defaults; self.onStart = onStart
        _options = State(initialValue: TasmeeModeOptions.load(defaults))
    }

    public var body: some View {
        ScrollView {
            content.padding(.vertical, Sunnah.Spacing.s4)
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }

    var content: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            Text("اختر وضع التسميع").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .padding(.horizontal, Sunnah.Spacing.pageX)
            VStack(spacing: 0) {
                ForEach(TasmeeMode.allCases, id: \.self) { m in
                    Button { Sunnah.Haptics.select(); options.mode = m } label: {
                        HStack(spacing: Sunnah.Spacing.s2) {
                            SunnahListRow(title: m.title, subtitle: m.summary, showsChevron: false, icon: m.icon)
                            Image(systemName: options.mode == m ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(options.mode == m ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                        }
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(options.mode == m ? .isSelected : [])
                }
            }
            if options.mode == .graded {
                SunnahChoiceChips(options: TasmeeHideLevel.allCases.map { .init(id: $0, title: $0.title) }, selection: $options.level)
            }
            if options.mode == .repeat {
                HStack {
                    Text("عدد القراءات الصحيحة: \(options.repeatTarget)".arabicDigits).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                    Spacer()
                    Stepper("", value: $options.repeatTarget, in: TasmeeModeOptions.repeatRange).labelsHidden()
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
            }
            VStack(spacing: Sunnah.Spacing.s1) {
                SunnahSwitch("إخفاء أرقام الآيات", isOn: $options.hideAyahNumbers)
                    .disabled(options.mode == .exam || (options.mode == .graded && options.level == .page))
                SunnahSwitch("اهتزاز عند الخطأ", isOn: $options.haptics)
                SunnahSwitch("صوت تنبيه", isOn: $options.sound)
            }
            .padding(.horizontal, Sunnah.Spacing.pageX)
            SunnahButton("ابدأ") { options.save(defaults); onStart(options) }
                .padding(.horizontal, Sunnah.Spacing.pageX)
        }
    }
}
