import SwiftUI

/// دليل التسميع: بطاقات تعريفية عند أول تشغيل وصفحة مرجعية. لا يذكر إلا ما هو مدموج فعلًا في التطبيق.
public struct TasmeeGuideCard: Identifiable, Equatable, Sendable {
    public let id: String
    public let icon: String
    public let title: String
    public let body: String
}

public enum TasmeeGuide {
    /// البطاقات الأربع لأول تشغيل.
    public static let introCards: [TasmeeGuideCard] = [
        .init(id: "ondevice", icon: "lock.shield", title: "على جهازك",
              body: "يُنزَّل نموذج التعرّف على التلاوة مرة واحدة ثم يعمل بلا إنترنت. تُعالج تلاوتك على جهازك فقط ولا تُرسل ولا تُحفظ."),
        .init(id: "modes", icon: "slider.horizontal.3", title: "اختر وضعك",
              body: "تتبّع التلاوة، أو التسميع من الحفظ، أو المتدرّج، أو الاختبار، أو التكرار. يُحفظ آخر اختيار لك."),
        .init(id: "recite", icon: "mic", title: "اقرأ بصوتك",
              body: "اضغط «ابدأ» ثم اقرأ من الصفحة. تُعلَّم الكلمة الحالية وتظهر الكلمات المخفية حين تُقال صحيحة."),
        .init(id: "report", icon: "doc.text.magnifyingglass", title: "تقرير الجلسة",
              body: "عند الإنهاء ترى نسبتك والآيات التي تعثّرت فيها لتعيد مراجعتها."),
    ]

    /// صفحة الدليل: قسم لكل وضع، ثم الإعدادات والخصوصية.
    public static let sections: [TasmeeGuideCard] = [
        .init(id: "follow", icon: TasmeeMode.follow.icon, title: TasmeeMode.follow.title,
              body: "النص ظاهر وتتبعك الكلمة المميّزة وأنت تقرأ، ويُعلَّم الخطأ فور وقوعه."),
        .init(id: "recite", icon: TasmeeMode.recite.icon, title: TasmeeMode.recite.title,
              body: "الآيات مخفية، وتظهر كل كلمة حين تُقال صحيحة. مناسب لاختبار حفظك."),
        .init(id: "graded", icon: TasmeeMode.graded.icon, title: TasmeeMode.graded.title,
              body: "تختار مستوى الإخفاء من أول حرف حتى الصفحة كاملة، وتتدرّج مع حفظك."),
        .init(id: "exam", icon: TasmeeMode.exam.icon, title: TasmeeMode.exam.title,
              body: "بداية عشوائية في النطاق الذي تختاره، بلا تلميحات، ونتيجتها بالدرجة."),
        .init(id: "repeat", icon: TasmeeMode.repeat.icon, title: TasmeeMode.repeat.title,
              body: "تعيد الآية حتى تقرأها صحيحة عدة مرات متتالية، وتحدّد العدد بنفسك."),
        .init(id: "options", icon: "switch.2", title: "الإعدادات في ورقة الأوضاع",
              body: "إخفاء أرقام الآيات، والاهتزاز عند الخطأ، وصوت التنبيه. كلٌّ منها قابل للتشغيل والإيقاف."),
        .init(id: "privacy", icon: "lock.shield", title: "الخصوصية",
              body: "النموذج مفتوح الرخصة (Apache-2.0) ويعمل على جهازك. الميكروفون يُستخدم أثناء الجلسة فقط."),
    ]

    public static let seenKey = "tasmee.guide.introSeen"
    public static func introSeen(_ d: UserDefaults = .standard) -> Bool { d.bool(forKey: seenKey) }
    public static func markIntroSeen(_ d: UserDefaults = .standard) { d.set(true, forKey: seenKey) }
}

/// البطاقات التعريفية لأول تشغيل (صفحات أفقية بمؤشر، تتخطّى أو تنتهي فتُسجَّل كمقروءة).
public struct TasmeeIntroCardsView: View {
    @State private var index = 0
    private let cards = TasmeeGuide.introCards
    private let onDone: () -> Void
    public init(onDone: @escaping () -> Void) { self.onDone = onDone }

    private var isLast: Bool { index == cards.count - 1 }

    private func page(_ c: TasmeeGuideCard) -> some View {
        VStack(spacing: Sunnah.Spacing.s4) {
            Image(systemName: c.icon).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.primary)
                .frame(width: Sunnah.Spacing.touch * 2, height: Sunnah.Spacing.touch * 2)
                .background(Sunnah.Colors.primarySoft, in: Circle()).accessibilityHidden(true)
            Text(c.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .accessibilityAddTraits(.isHeader)
            Text(c.body).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
                .multilineTextAlignment(.center).fixedSize(horizontal: false, vertical: true)
        }
        .padding(Sunnah.Spacing.s4)
    }

    public var body: some View { layout { pager } }

    /// للقطات فقط: ImageRenderer لا يرسم TabView، فتُعرض الصفحة المختارة مباشرة.
    func snapshot(page i: Int) -> some View { layout { page(cards[i]) } }

    private var pager: some View {
        TabView(selection: $index) {
            ForEach(Array(cards.enumerated()), id: \.element.id) { i, c in page(c).tag(i) }
        }
        #if os(iOS)
        .tabViewStyle(.page(indexDisplayMode: .never))
        #endif
    }

    private func layout<P: View>(@ViewBuilder _ pager: () -> P) -> some View {
        VStack(spacing: Sunnah.Spacing.s5) {
            pager()
            Text("\(index + 1) / \(cards.count)".arabicDigits).font(Sunnah.Typography.tag)
                .foregroundStyle(Sunnah.Colors.textSecondary).monospacedDigit().accessibilityHidden(true)
            SunnahActionRow {
                SunnahButton("تخطّي", style: .secondary) { onDone() }
                SunnahButton(isLast ? "فهمت" : "التالي") {
                    if isLast { onDone() } else { sunnahAnimate { index += 1 } }
                }
            }
        }
        .padding(Sunnah.Spacing.pageX)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

/// صفحة «دليل التسميع».
public struct TasmeeGuideView: View {
    public init() {}
    public var body: some View {
        ScrollView { content }
            .background(Sunnah.Colors.bg)
            .environment(\.layoutDirection, .rightToLeft)
    }

    /// المحتوى بلا ScrollView (للقطات: ImageRenderer لا يرسم ScrollView).
    var content: some View {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text("دليل التسميع").font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                ForEach(TasmeeGuide.sections) { s in
                    SunnahCard {
                        HStack(alignment: .top, spacing: Sunnah.Spacing.s3) {
                            Image(systemName: s.icon).font(.title3).foregroundStyle(Sunnah.Colors.primary)
                                .frame(width: Sunnah.Spacing.s6).accessibilityHidden(true)
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                Text(s.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                Text(s.body).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .accessibilityElement(children: .combine)
                }
            }
            .padding(Sunnah.Spacing.pageX)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Sunnah.Colors.bg)
    }
}
