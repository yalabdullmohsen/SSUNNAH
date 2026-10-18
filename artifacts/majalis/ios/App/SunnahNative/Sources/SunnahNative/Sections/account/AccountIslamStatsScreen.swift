import SwiftUI

/// /islam-stats — «الإسلام في أرقام»: تبويبا «الإسلام في العالم» و«الحضارة الإسلامية» بنصوص IslamStatsPage حرفيًا.
/// بقرار المالك (المرجع ROUTE_TEMPLATE_MAP/FEATURE_PARITY): تبويب «الدلالات الكونية» خارج المسارات المبقاة فلا يُبنى،
/// وتبويب «القرآن الكريم» لا يُنقل هنا بل يُربط بمساره المبقى /quran-hub/numbers (قسم القرآن لـن3).
struct AccountIslamStatsScreen: View {
    private enum Tab: String, CaseIterable, Identifiable {
        case global = "الإسلام في العالم", history = "الحضارة الإسلامية"
        var id: String { rawValue }
    }

    @State private var tab: Tab = .global
    @State private var search = ""

    private var timeline: [AccountTimelineItem] {
        AccountTexts.historyTimeline.filter { AccountSearch.matches([$0.year, $0.event, $0.note], search) }
    }
    private var achievements: [AccountStatCard] {
        AccountTexts.historyAchievements.filter { AccountSearch.matches([$0.value, $0.label, $0.sub], search) }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "إنفوجرافيك تفاعلي", title: "الإسلام في أرقام",
                              subtitle: "حقائق وإحصاءات عن الإسلام مع ذكر مصدر كل رقم وسنته — من انتشاره في العالم إلى القرآن وإسهامات الحضارة الإسلامية")
                Picker("التبويب", selection: $tab) {
                    ForEach(Tab.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)

                switch tab {
                case .global:
                    AccountTileGrid(items: AccountTexts.globalStats) { AccountStatTile(value: $0.value, label: $0.label, sub: $0.sub) }
                    AccountSectionCard(title: "أكبر الدول الإسلامية سكاناً (مليون نسمة)") {
                        ForEach(AccountTexts.populationBars) { bar in
                            HStack(spacing: Sunnah.Spacing.s3) {
                                Text(bar.label).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                                    .frame(minWidth: Sunnah.Spacing.touch * 2, alignment: .leading)
                                AccountProgressBar(fraction: bar.fraction)
                                Text("\(Int(bar.value))\(bar.unit)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                                    .monospacedDigit()
                            }
                            .accessibilityElement(children: .combine)
                        }
                        Text("المصدر: مركز بيو للأبحاث، بيانات المشهد الديني العالمي 2020م المنشورة في 2025م")
                            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                case .history:
                    AccountSearchField(placeholder: "ابحث في الحضارة الإسلامية...", text: $search)
                    AccountTileGrid(items: achievements) { AccountStatTile(value: $0.value, label: $0.label, sub: $0.sub) }
                    AccountSectionCard(title: "خط زمني للحضارة الإسلامية") {
                        if timeline.isEmpty { EmptyStateView() }
                        ForEach(timeline) { item in
                            HStack(alignment: .firstTextBaseline, spacing: Sunnah.Spacing.s3) {
                                Text(item.year).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary)
                                    .frame(minWidth: Sunnah.Spacing.touch * 2, alignment: .leading)
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                    Text(item.event).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                                    if let note = item.note {
                                        Text(note).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                                    }
                                }
                            }
                            .accessibilityElement(children: .combine)
                        }
                    }
                }
                AccountLinkRow(title: "القرآن الكريم في أرقام", path: "/quran-hub/numbers")
                AccountShareRow(title: "الإسلام في أرقام — سُنّة", path: "/islam-stats")
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("الإسلام في أرقام")
    }
}
