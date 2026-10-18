import SwiftUI
import SunnahPrayer

/// صف ذكر موثَّق كما في عقد البيانات (`Data/adhkar/verified-adhkar.json`، حقول snake_case) — يُقرأ كما هو.
public struct AdhkarItem: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let categoryId: String
    public let text: String
    public let repeatCount: Int
    public var narrator: String?
    public var sourceName: String?
    public var grade: String?
    public var reference: String?

    enum CodingKeys: String, CodingKey {
        case id, text, narrator, grade, reference
        case categoryId = "category_id"
        case repeatCount = "repeat_count"
        case sourceName = "source_name"
    }
}

/// عنوان تصنيف كما في ADHKAR_CATEGORIES بالموقع (حرفيًا، من `Data/adhkar/categories.json`).
struct AdhkarCategoryTitle: Decodable, Sendable { let id: String; let name: String }

public struct AdhkarCategory: Identifiable, Hashable, Sendable {
    public let id: String
    public let items: [AdhkarItem]
}

/// الأذكار: المجموعات ثم أذكار المجموعة بعدّاد لمس لكل ذكر. الفارغ (لا موثَّق بعد) حالة صريحة.
public struct AdhkarScreen: ScreenTemplate {
    public static let id = "adhkar"
    public static let title = "الأذكار"
    public static let source = ContentSource.bundled(name: "verified-adhkar", subdirectory: "Data/adhkar")

    let categories: [AdhkarCategory]
    @Environment(\.contentLoader) private var loader
    @State private var titles: [String: String] = [:]
    public init(content: [AdhkarItem]) {
        var order: [String] = []
        var grouped: [String: [AdhkarItem]] = [:]
        for item in content {
            if grouped[item.categoryId] == nil { order.append(item.categoryId) }
            grouped[item.categoryId, default: []].append(item)
        }
        categories = order.map { AdhkarCategory(id: $0, items: grouped[$0] ?? []) }
    }

    @State private var selected = ""

    public var body: some View {
        if categories.isEmpty {
            EmptyStateView(title: "الأذكار قيد التوثيق")
                .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
        } else {
            let current = categories.first(where: { $0.id == selected }) ?? categories[0]
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    SunnahPageTitle("الأذكار")
                    SunnahChipBar(options: categories.map { .init(id: $0.id, title: titles[$0.id] ?? Self.fallbackTitle) },
                                  selection: Binding(get: { current.id }, set: { selected = $0 }))
                    AdhkarListView(items: current.items).id(current.id)
                    SunnahContentFooter(title: "أذكار", id: "adhkar", section: "الأذكار", inset: false)
                }
                .padding(.bottom, 96)
            }
            .background(Sunnah.Colors.bg)
            .sunnahRootChrome()
            .environment(\.layoutDirection, .rightToLeft)
            .sunnahReadableWidth()
            .task {
                let rows: [AdhkarCategoryTitle]? = try? await loader.load(from: .bundled(name: "categories", subdirectory: "Data/adhkar"))
                titles = Dictionary((rows ?? []).map { ($0.id, $0.name) }, uniquingKeysWith: { a, _ in a })
            }
        }
    }

    /// لا يُعرض معرّف خام أبدًا؛ التصنيف بلا عنوان في الموقع يظهر بهذا الاسم العام.
    static let fallbackTitle = "أذكار"
}

/// أذكار تصنيف واحد (النموذج ٢): بطاقة خضراء للذكر الحالي ← عدّاد دائري ← إعادة/التالي. النص والمصدر والعدد من البيانات كما هي.
struct AdhkarListView: View {
    let items: [AdhkarItem]
    @State private var index = 0
    @State private var done: [String: Int] = [:]

    private func digits(_ n: Int) -> String { PrayerTimeFormat.arabicDigits(String(n)) }

    var body: some View {
        let item = items[min(index, items.count - 1)]
        let taps = done[item.id, default: 0]
        let complete = taps >= item.repeatCount
        VStack(spacing: 14) {
            SunnahHeroCard {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("\(digits(index + 1)) من \(digits(items.count))").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                        Spacer()
                        Text("التكرار \(digits(item.repeatCount))").font(AppearancePrefs.ui(.extraBold, 12, .caption)).foregroundStyle(Sunnah.Colors.goldInk)
                            .padding(.horizontal, 12).padding(.vertical, 4).background(Sunnah.Colors.heroGold, in: Capsule())
                    }
                    SunnahArabicText(item.text, style: .body).foregroundStyle(.white)
                    if let source = item.sourceName ?? item.reference {
                        Text(source).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                    }
                }
            }
            .accessibilityIdentifier("adhkar.card")
            Button { if !complete { done[item.id] = taps + 1 } } label: {
                ZStack {
                    Circle().stroke(Sunnah.Colors.primarySoft, lineWidth: 10)
                    Circle().trim(from: 0, to: CGFloat(min(taps, item.repeatCount)) / CGFloat(max(item.repeatCount, 1)))
                        .stroke(Sunnah.Colors.primary, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .rotationEffect(.degrees(90)).scaleEffect(x: -1, y: 1)
                    VStack(spacing: 2) {
                        if complete {
                            Image(systemName: "checkmark").font(.system(size: 40, weight: .heavy)).foregroundStyle(Sunnah.Colors.primary)
                        } else {
                            Text(digits(item.repeatCount - taps)).font(.system(size: 52, weight: .heavy, design: .rounded)).foregroundStyle(Sunnah.Colors.primary)
                        }
                        Text(complete ? "تمّ" : "المتبقي · اضغط للعدّ").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
                .frame(width: 176, height: 176)
            }
            .buttonStyle(.plain).sunnahPressable()
            .accessibilityLabel("العدّاد \(taps) من \(item.repeatCount)").accessibilityIdentifier("adhkar.counter")
            HStack(spacing: 14) {
                control("إعادة", "arrow.counterclockwise", filled: false) { done[item.id] = 0 }
                control(index + 1 < items.count ? "التالي" : "من البداية", "chevron.left", filled: true) {
                    index = index + 1 < items.count ? index + 1 : 0
                }
            }
            .padding(.horizontal, Sunnah.Spacing.pageX)
        }
    }

    private func control(_ title: String, _ symbol: String, filled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: symbol).font(.system(size: 14, weight: .bold))
                Text(title).font(AppearancePrefs.ui(.extraBold, 15, .body))
            }
            .foregroundStyle(filled ? Color.white : Sunnah.Colors.primary)
            .frame(maxWidth: .infinity, minHeight: 52)
            .background(filled ? Sunnah.Colors.primary : Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(filled ? Color.clear : Sunnah.Colors.border, lineWidth: 1))
        }
        .buttonStyle(.plain).sunnahPressable()
    }
}
