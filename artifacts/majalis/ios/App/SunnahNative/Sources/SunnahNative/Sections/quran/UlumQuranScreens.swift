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
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(tabs, id: \.self) { tab in
                    SunnahSectionLabel(tab)
                    SunnahNavTileGrid(items.filter { $0.tags.first == tab }, idPrefix: "ulum", padded: false,
                                      tile: { SunnahTileItem(id: $0.id, title: $0.title, subtitle: $0.subtitle, symbol: "book.closed") }) { UlumQuranDetailView(item: $0) }
                }
            }
            .padding(.horizontal, Sunnah.Spacing.s4)
        }
        .background(Sunnah.Colors.bg)
    }
}

struct UlumQuranDetailView: View {
    let item: UlumQuranItem
    var body: some View {
        QuranDocView(
            title: item.title,
            paragraphs: [item.subtitle, item.body].compactMap { $0 }.flatMap { $0.components(separatedBy: "\n\n") }.filter { !$0.isEmpty },
            sources: ["علوم القرآن — \(item.tags.first ?? "")"],
            reportID: item.id, reportSection: item.tags.first ?? "علوم القرآن"
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
