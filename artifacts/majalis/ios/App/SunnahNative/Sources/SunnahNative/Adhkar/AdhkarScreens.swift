import SwiftUI

/// قائمة فئات الأذكار الأصلية؛ تعمل دون اتصال من الحزمة المضمَّنة.
public struct AdhkarCategoriesScreen: View {
    private let bundle: AdhkarBundle
    private let onOpen: (String) -> Void

    public init(bundle: AdhkarBundle = .shared, onOpen: @escaping (String) -> Void) {
        self.bundle = bundle
        self.onOpen = onOpen
    }

    public var body: some View {
        List(bundle.categories) { category in
            Button { onOpen(AdhkarRoute.path(slug: category.slug)) } label: {
                VStack(alignment: .leading, spacing: 4) {
                    Text(category.name).font(.headline)
                    Text(category.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                .padding(.vertical, 4)
            }
            .foregroundStyle(.primary)
        }
        .navigationTitle("الأذكار")
        .navigationBarTitleDisplayMode(.inline)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

/// أذكار فئة واحدة بعدّاد تنازلي لكل ذكر (لا يُحفظ بين الجلسات).
public struct AdhkarListScreen: View {
    private let category: AdhkarBundle.Category
    private let items: [AdhkarBundle.Item]
    @State private var remaining: [String: Int] = [:]

    public init(category: AdhkarBundle.Category, bundle: AdhkarBundle = .shared) {
        self.category = category
        self.items = bundle.items(in: category)
    }

    public var body: some View {
        List(items) { item in
            let left = remaining[item.id] ?? item.count
            Button {
                if left > 0 { remaining[item.id] = left - 1 }
            } label: {
                VStack(alignment: .leading, spacing: 8) {
                    Text(item.text)
                        .font(.title3)
                        .lineSpacing(6)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text([item.source, item.grade, item.reference].compactMap { $0 }.joined(separator: " · "))
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    HStack {
                        Spacer()
                        Text(left == 0 ? "تمّ" : "\(Self.number(left)) / \(Self.number(item.count))")
                            .font(.callout.monospacedDigit().bold())
                            .foregroundStyle(left == 0 ? Color.green : Color.accentColor)
                    }
                }
                .padding(.vertical, 6)
                .opacity(left == 0 ? 0.6 : 1)
            }
            .foregroundStyle(.primary)
            .accessibilityHint(left == 0 ? "اكتمل العدد" : "اضغط للعدّ، المتبقي \(Self.number(left))")
        }
        .navigationTitle(category.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if !remaining.isEmpty {
                Button("إعادة") { remaining = [:] }
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    private static func number(_ value: Int) -> String {
        let f = NumberFormatter()
        f.locale = Locale(identifier: "ar@numbers=arab")
        return f.string(from: NSNumber(value: value)) ?? "\(value)"
    }
}
