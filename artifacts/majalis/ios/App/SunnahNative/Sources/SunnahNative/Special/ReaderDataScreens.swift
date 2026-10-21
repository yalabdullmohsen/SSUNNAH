import SwiftUI

/// شاشات قراءة من ملفات بيانات مصدَّرة: الأربعون النووية، الوصايا النبوية، الأدعية. النصوص تُعرض كما وردت في الملف بلا تعديل.
enum ReaderData {
    struct Arbaeen: Decodable, Sendable { let id: Int; let title: String; let text: String; var explanation: String?; var benefits: String?; var source: String? }
    struct Kabira: Decodable, Sendable { let id: Int; let title: String; let text: String; var source: String?; var benefit: String?; var category: String? }
    struct Khasisa: Decodable, Sendable { let name: String; let wasiyya: String; var source: String? }
    struct Ummah: Decodable, Sendable { let title: String; let text: String; var ref: String? }
    struct Amal: Decodable, Sendable { let text: String }
    struct Wasaya: Decodable, Sendable { var kabira: [Kabira] = []; var khasisa: [Khasisa] = []; var ummah: [Ummah] = []; var amal: [Amal] = [] }
    struct Dua: Decodable, Sendable {
        let id: String; let title: String; let arabic: String
        var transliteration: String?; var meaning: String?; var source: String?; var category: String?; var occasion: String?; var virtue: String?
    }
    struct Duas: Decodable, Sendable { var categories: [String] = []; var duas: [Dua] = [] }

    enum WasayaGroup: String, CaseIterable, Identifiable {
        case kabira, khasisa, ummah, amal
        var id: String { rawValue }
        var label: String {
            switch self {
            case .kabira: "الوصايا الكبرى"
            case .khasisa: "وصايا خاصة بأفراد"
            case .ummah: "للأمة عامة"
            case .amal: "كيف تطبِّق؟"
            }
        }
    }

    static let allCategory = "الكل"

    private static func join(_ parts: [(String, String?)]) -> String? {
        let lines = parts.compactMap { label, value -> String? in
            guard let v = value?.trimmingCharacters(in: .whitespacesAndNewlines), !v.isEmpty else { return nil }
            return label.isEmpty ? v : "\(label): \(v)"
        }
        return lines.isEmpty ? nil : lines.joined(separator: "\n\n")
    }

    static func arbaeen(_ rows: [Arbaeen]) -> [ContentItem] {
        rows.sorted { $0.id < $1.id }.map {
            ContentItem(id: String($0.id), title: $0.title, subtitle: "الحديث \($0.id)",
                        body: join([("", $0.text), ("الشرح", $0.explanation), ("الفوائد", $0.benefits), ("المصدر", $0.source)]))
        }
    }

    static func wasaya(_ file: Wasaya, group: WasayaGroup) -> [ContentItem] {
        switch group {
        case .kabira:
            return file.kabira.map { ContentItem(id: "kabira-\($0.id)", title: $0.title, subtitle: $0.category, body: join([("", $0.text), ("الفائدة", $0.benefit), ("المصدر", $0.source)])) }
        case .khasisa:
            return file.khasisa.enumerated().map { ContentItem(id: "khasisa-\($0.offset)", title: $0.element.name, body: join([("", $0.element.wasiyya), ("المصدر", $0.element.source)])) }
        case .ummah:
            return file.ummah.enumerated().map { ContentItem(id: "ummah-\($0.offset)", title: $0.element.title, body: join([("", $0.element.text), ("المصدر", $0.element.ref)])) }
        case .amal:
            return file.amal.enumerated().map { ContentItem(id: "amal-\($0.offset)", title: $0.element.text) }
        }
    }

    static func duas(_ file: Duas, category: String) -> [ContentItem] {
        file.duas.filter { category == allCategory || $0.category == category }.map {
            ContentItem(id: $0.id, title: $0.title, subtitle: $0.category,
                        body: join([("", $0.arabic), ("النطق", $0.transliteration), ("المعنى", $0.meaning), ("المناسبة", $0.occasion), ("الفضل", $0.virtue), ("المصدر", $0.source)]),
                        tags: [])
        }
    }

    static func categories(_ file: Duas) -> [String] {
        let list = file.categories.filter { $0 != allCategory }
        return [allCategory] + list
    }
}

struct ReaderChipPicker: View {
    let options: [(id: String, label: String)]
    @Binding var selection: String
    var body: some View {
        SunnahChipBar(options: options.map { .init(id: $0.id, title: $0.label) }, selection: $selection)
    }
}

struct WasayaNabawiyyaView: View {
    let file: ReaderData.Wasaya
    @State private var group = ReaderData.WasayaGroup.kabira.rawValue
    var body: some View {
        let selected = ReaderData.WasayaGroup(rawValue: group) ?? .kabira
        VStack(spacing: Sunnah.Spacing.s2) {
            ReaderChipPicker(options: ReaderData.WasayaGroup.allCases.map { ($0.rawValue, $0.label) }, selection: $group)
            LibraryInlineItemsView(items: ReaderData.wasaya(file, group: selected)).id(group)
        }
    }
}

struct DuasView: View {
    let file: ReaderData.Duas
    @State private var category = ReaderData.allCategory
    var body: some View {
        VStack(spacing: Sunnah.Spacing.s2) {
            ReaderChipPicker(options: ReaderData.categories(file).map { ($0, $0) }, selection: $category)
            LibraryInlineItemsView(items: ReaderData.duas(file, category: category)).id(category)
        }
    }
}

enum ReaderDataScreens {
    static let arbaeen = ContentSource.bundled(name: "arbaeen-nawawi", subdirectory: "Data/hadith")
    static let wasaya = ContentSource.bundled(name: "wasaya-nabawiyya", subdirectory: "Data/hadith")
    static let duas = ContentSource.bundled(name: "duas", subdirectory: "Data/adhkar")

    static func arbaeenList() -> some View {
        LibraryLoadedView(source: arbaeen, adapt: { ReaderData.arbaeen($0) }) { (items: [ContentItem]) in
            SearchTemplate(items: items, detailBase: "/arbaeen-nawawi", browseWhenEmpty: true)
        }.sunnahNavTitle("الأربعون النووية")
    }

    static func arbaeenDetail(id: String) -> some View {
        LibraryLoadedView(source: arbaeen, adapt: { (rows: [ReaderData.Arbaeen]) in ReaderData.arbaeen(rows).first { $0.id == id } }) { (item: ContentItem?) in
            if let item { ArticleTemplate(item: item) } else { EmptyStateView() }
        }.sunnahNavTitle("الأربعون النووية")
    }

    static func wasayaScreen() -> some View {
        LibraryLoadedView(source: wasaya, adapt: { (f: ReaderData.Wasaya) in f }) { WasayaNabawiyyaView(file: $0) }
            .sunnahNavTitle("الوصايا النبوية")
    }

    static func duasScreen() -> some View {
        LibraryLoadedView(source: duas, adapt: { (f: ReaderData.Duas) in f }) { DuasView(file: $0) }
            .sunnahNavTitle("الأدعية")
    }
}
