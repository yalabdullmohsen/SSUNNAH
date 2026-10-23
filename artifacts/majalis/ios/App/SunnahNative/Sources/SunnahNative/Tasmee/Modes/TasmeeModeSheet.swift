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
        .safeAreaInset(edge: .bottom) {
            // «ابدأ» مثبّت دائمًا ظاهر دون تمرير.
            SunnahButton("ابدأ") { options.save(defaults); onStart(options) }
                .padding(.horizontal, Sunnah.Spacing.pageX)
                .padding(.vertical, Sunnah.Spacing.s3)
                .background(Sunnah.Colors.bg)
                .accessibilityIdentifier("tasmee.mode.start")
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }

    private func stepButton(_ icon: String, _ label: String, _ enabled: Bool, _ action: @escaping () -> Void) -> some View {
        Button { Sunnah.Haptics.select(); action() } label: {
            Image(systemName: icon).font(.body.weight(.bold)).foregroundStyle(enabled ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                .frame(width: 44, height: 44)
                .background(Sunnah.Colors.surface, in: Circle()).overlay(Circle().stroke(Sunnah.Colors.border, lineWidth: Sunnah.Spacing.hairline))
        }
        .buttonStyle(.plain).disabled(!enabled).accessibilityLabel(label)
    }

    var content: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            Text("اختر وضع التسميع").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .padding(.horizontal, Sunnah.Spacing.pageX)
            VStack(spacing: Sunnah.Spacing.s2) {
                ForEach(TasmeeMode.allCases, id: \.self) { m in
                    Button { Sunnah.Haptics.select(); options.mode = m } label: {
                        TasmeeModeRow(mode: m, selected: options.mode == m)
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
                    HStack(spacing: Sunnah.Spacing.s2) {
                        stepButton("chevron.down", "أنقص", options.repeatTarget > TasmeeModeOptions.repeatRange.lowerBound) { options.repeatTarget -= 1 }
                        stepButton("chevron.up", "زد", options.repeatTarget < TasmeeModeOptions.repeatRange.upperBound) { options.repeatTarget += 1 }
                    }
                    .accessibilityElement(children: .contain)
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
            }
            VStack(spacing: Sunnah.Spacing.s1) {
                SunnahSwitch("إخفاء أرقام الآيات", isOn: $options.hideAyahNumbers)
                    .disabled(options.mode == .exam || (options.mode == .graded && options.level == .page))
                    .accessibilityHint(options.effectiveHideNumbers && !options.hideAyahNumbers ? "مخفية تلقائيًا في هذا الوضع" : "")
                SunnahSwitch("اهتزاز عند الخطأ", isOn: $options.haptics)
                SunnahSwitch("صوت تنبيه", isOn: $options.sound)
            }
            .padding(.horizontal, Sunnah.Spacing.pageX)
        }
    }
}

/// بطاقة وضع قابلة للاختيار بشكل «سُنّة»: أيقونة + عنوان + وصف كامل، وحد أخضر وعلامة عند الاختيار.
struct TasmeeModeRow: View {
    let mode: TasmeeMode
    let selected: Bool

    @Environment(\.dynamicTypeSize) private var typeSize
    @ScaledMetric(relativeTo: .title3) private var iconWidth: CGFloat = 28

    private var icon: some View {
        Image(systemName: mode.icon).font(.title3).foregroundStyle(selected ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
            .frame(width: iconWidth).accessibilityHidden(true)
    }
    private var texts: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
            Text(mode.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
            Text(mode.summary).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
    private var check: some View {
        Image(systemName: selected ? "checkmark.circle.fill" : "circle")
            .foregroundStyle(selected ? Sunnah.Colors.primary : Sunnah.Colors.border).accessibilityHidden(true)
    }

    var body: some View {
        Group {
            if typeSize.isAccessibilitySize {
                // الخط الكبير: الأيقونة والعلامة فوق النص بدل اقتسام العرض فلا يتداخلان مع العنوان.
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    HStack { icon; Spacer(minLength: 0); check }
                    texts
                }
            } else {
                HStack(alignment: .top, spacing: Sunnah.Spacing.s3) {
                    icon
                    texts
                    Spacer(minLength: 0)
                    check
                }
            }
        }
        .padding(Sunnah.Spacing.s4)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous)
            .stroke(selected ? Sunnah.Colors.primary : Sunnah.Colors.border, lineWidth: selected ? 2 : Sunnah.Spacing.hairline))
        .accessibilityElement(children: .combine)
    }
}
