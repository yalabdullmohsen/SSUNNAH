import SwiftUI

/// تبويبات /shamael كما تُصدَّر حرفيًا في sirah/shamail.json. أبواب khalq/khuluq/sira فيها hadiths،
/// وأبواب mahabbah فيها text؛ الحقول المتغيّرة اختيارية فيُفك الشكلان معًا بلا إضافة درجة أو مصدر.
public struct ShamailHadith: Codable, Hashable, Sendable {
    public let text: String
    public let rawi: String?
    public let source: String?
}

public struct ShamailBab: Codable, Hashable, Sendable {
    public let id: String?
    public let title: String
    public let icon: String?
    public let hadiths: [ShamailHadith]?
    public let text: String?
    public let source: String?
    public let rawi: String?
}

public struct ShamailTab: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let abwab: [ShamailBab]
}

public struct ShamailView: View {
    public let tabs: [ShamailTab]
    @State private var selected: String?

    public init(tabs: [ShamailTab]) {
        self.tabs = tabs
    }

    public static func tabs(fromJSON data: Data) -> [ShamailTab] {
        (try? JSONDecoder().decode([ShamailTab].self, from: data)) ?? []
    }

    public var body: some View {
        Group {
            if tabs.isEmpty {
                SectionEmptyState(title: "لا توجد مواد منشورة بعد", message: "ستظهر الشمائل هنا فور توفّر بياناتها.")
            } else {
                let current = tabs.first { $0.id == selected } ?? tabs[0]
                VStack(spacing: 0) {
                    Picker("القسم", selection: Binding(get: { current.id }, set: { selected = $0 })) {
                        ForEach(tabs) { Text($0.label).tag($0.id) }
                    }
                    .pickerStyle(.segmented)
                    .padding(Sunnah.Spacing.pageX)
                    ScrollView {
                        LazyVStack(spacing: Sunnah.Spacing.s3) {
                            ForEach(Array(current.abwab.enumerated()), id: \.offset) { _, bab in
                                SunnahCard {
                                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                        Text(bab.title).font(Sunnah.Typography.cardTitle)
                                            .foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                                        if let t = bab.text { Text(t).font(Sunnah.Typography.hadith).foregroundStyle(Sunnah.Colors.textPrimary) }
                                        ForEach(Array((bab.hadiths ?? []).enumerated()), id: \.offset) { _, h in
                                            Text(h.text).font(Sunnah.Typography.hadith).foregroundStyle(Sunnah.Colors.textPrimary)
                                            if let r = h.rawi { Text(r).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
                                        }
                                    }
                                }
                            }
                        }.padding(.horizontal, Sunnah.Spacing.pageX).padding(.bottom, Sunnah.Spacing.pageX)
                    }
                }
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }
}
