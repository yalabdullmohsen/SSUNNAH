import SwiftUI

/// المسبحة: عدّاد لمس بأهداف شائعة، يُحفظ محليًا (UserDefaults) ولا يحتاج محتوى شرعيًا.
struct TasbihView: View {
    @AppStorage("sunnah.tasbih.count") private var count = 0
    @AppStorage("sunnah.tasbih.target") private var target = 33
    private let targets = [33, 99, 100, 1000]

    var body: some View {
        VStack(spacing: Sunnah.Spacing.s6) {
            Picker("الهدف", selection: $target) {
                ForEach(targets, id: \.self) { Text("\($0)").tag($0) }
            }.pickerStyle(.segmented)

            Button {
                count += 1
                #if canImport(UIKit)
                UIImpactFeedbackGenerator(style: count % target == 0 ? .heavy : .light).impactOccurred()
                #endif
            } label: {
                VStack(spacing: Sunnah.Spacing.s2) {
                    Text("\(count)").font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text("\(count % target) / \(target)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity, minHeight: 220)
                .background(Sunnah.Colors.surface, in: Circle())
                .overlay(Circle().stroke(Sunnah.Colors.primary, lineWidth: 2))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("تسبيحة، العدد \(count)")

            Button("إعادة العدّ", role: .destructive) { count = 0 }
        }
        .padding(Sunnah.Spacing.pageX)
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Sunnah.Colors.bg)
        .navigationTitle("المسبحة")
    }
}

public enum AdhkarExtraScreens {
    @MainActor
    public static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "tasbih") { TasbihView() }
        registry.registerView(id: "daily-wird") { DailyWirdView() }
        registry.registerView(id: "duas") { ReaderDataScreens.duasScreen() }
        // أدعية القرآن وورد وسنن يومية: لا بيانات موثَّقة في العقد، وتنبيهات الصلاة تتبع الإشعارات.
        for (id, title) in [("duas-quran", "أدعية القرآن"), ("sunan-yawmiyya", "السنن اليومية"),
                            ("adhan-help", "مساعدة تنبيهات الصلاة")] {
            registry.registerView(id: id) { ContentPendingView(message: "المحتوى قيد التوثيق").navigationTitle(title) }
        }
    }
}
