import SwiftUI

struct UlumQuranItem: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let title: String
    let subtitle: String?
    let body: String?
    let tags: [String]
}

/// /ulum-quran — علوم القرآن مجمّعة بالتبويب كما في الموقع (ثوابت UlumQuranView.tsx بلا إضافة نص).
struct UlumQuranListView: View {
    let items: [UlumQuranItem]
    private var tabs: [String] { var seen = Set<String>(); return items.compactMap(\.tags.first).filter { seen.insert($0).inserted } }

    var body: some View {
        List {
            ForEach(tabs, id: \.self) { tab in
                Section(tab) {
                    ForEach(items.filter { $0.tags.first == tab }) { i in
                        SunnahNavigationLink { UlumQuranDetailView(item: i) } label: { SunnahListRow(title: i.title, subtitle: i.subtitle) }
                            .sunnahRowChrome()
                    }
                }
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }
}

struct UlumQuranDetailView: View {
    let item: UlumQuranItem
    var body: some View {
        QuranDocView(
            title: item.title,
            paragraphs: [item.subtitle, item.body].compactMap { $0 }.flatMap { $0.components(separatedBy: "\n\n") }.filter { !$0.isEmpty },
            sources: ["علوم القرآن — \(item.tags.first ?? "")"]
        )
    }
}

enum WorshipHubLinks {
    /// مركز العبادة القرآنية: تركيب لشاشات قائمة (المواقيت وتنبيهات الصلاة من المحرك كما هي، بلا حساب جديد).
    static let all = [
        SectionLink(id: "prayer", title: "مواقيت الصلاة", route: "/prayer-times"),
        SectionLink(id: "adhan", title: "إعدادات تنبيهات الصلاة", route: "/notification-settings"),
        SectionLink(id: "hifz-loop", title: "مشغّل التحفيظ (تكرار A-B)", route: "/quran/hifz-loop"),
        SectionLink(id: "offline", title: "التلاوة دون اتصال", route: "/quran/offline-player"),
        SectionLink(id: "adhkar", title: "الأذكار", route: "/adhkar"),
        SectionLink(id: "qibla", title: "القبلة", route: "/qibla"),
    ]
}
