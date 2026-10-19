import SwiftUI

/// شاشات تعرض ما تعرضه صفحات الموقع حرفيًا من نصوص مضمَّنة (مُصدَّرة في `Data/*` بلا تعديل) أو من جدول عام.
enum SiteContent {
    struct Duas: Decodable, Sendable { var categories: [String] = []; var duas: [Dua] = [] }
    struct Dua: Decodable, Sendable { let id: String; let arabic: String; var ref: String?; var name: String?; var category: [String] = []; var context: String? }
    struct Sunan: Decodable, Sendable { var categories: [String] = []; var sunan: [Sunna] = [] }
    struct Sunna: Decodable, Sendable { let id: String; let title: String; var category: String?; var time: String?; var text: String?; var source: String?; var howTo: String? }
    struct Help: Decodable, Sendable { var sections: [HelpSection] = [] }
    struct HelpSection: Decodable, Sendable { let id: String; let title: String; var body: String? }
    struct Science: Decodable, Sendable { var categories: [String] = []; var terms: [Term] = [] }
    struct Term: Decodable, Sendable { let id: String; let term: String; var category: String?; var grade: String?; var definition: String?; var example: String?; var note: String? }
    struct Lessons: Decodable, Sendable { var sections: [LessonSection] = [] }
    struct LessonSection: Decodable, Sendable { let id: String; let title: String; var lessons: [Lesson] = [] }
    struct Lesson: Decodable, Sendable { let id: String; let title: String; var summary: String?; var body: String? }
    /// صفوف جدول `arbaeen_love_of_allah` المنشورة كما صدّرها ن1 (مصفوفة أو كائن يحوي `rows`/`items`/`data`)؛ المعرّف نص أو رقم.
    struct Love: Decodable, Sendable {
        let id: String; var order_number: Int?; let title: String; var hadith_text: String?; var source: String?
        var hadith_number: String?; var grade: String?; var verified_by: String?
        private enum K: String, CodingKey { case id, order_number, title, hadith_text, source, hadith_number, grade, verified_by }
        init(from decoder: Decoder) throws {
            let c = try decoder.container(keyedBy: K.self)
            if let s = try? c.decode(String.self, forKey: .id) { id = s } else { id = String((try? c.decode(Int.self, forKey: .id)) ?? 0) }
            order_number = try? c.decode(Int.self, forKey: .order_number)
            title = (try? c.decode(String.self, forKey: .title)) ?? ""
            hadith_text = try? c.decode(String.self, forKey: .hadith_text)
            source = try? c.decode(String.self, forKey: .source)
            if let s = try? c.decode(String.self, forKey: .hadith_number) { hadith_number = s } else { hadith_number = (try? c.decode(Int.self, forKey: .hadith_number)).map(String.init) }
            grade = try? c.decode(String.self, forKey: .grade)
            verified_by = try? c.decode(String.self, forKey: .verified_by)
        }
    }
    struct LoveFile: Decodable, Sendable {
        let rows: [Love]
        private enum K: String, CodingKey { case rows, items, data }
        init(from decoder: Decoder) throws {
            if let list = try? [Love](from: decoder) { rows = list; return }
            let c = try decoder.container(keyedBy: K.self)
            if let r = try? c.decode([Love].self, forKey: .rows) { rows = r }
            else if let r = try? c.decode([Love].self, forKey: .items) { rows = r }
            else { rows = try c.decode([Love].self, forKey: .data) }
        }
    }

    static let all = "الكل"

    static func join(_ parts: [(String, String?)]) -> String? {
        let lines = parts.compactMap { label, v -> String? in
            guard let v = v?.trimmingCharacters(in: .whitespacesAndNewlines), !v.isEmpty else { return nil }
            return label.isEmpty ? v : "\(label) — \(v)"
        }
        return lines.isEmpty ? nil : lines.joined(separator: "\n\n")
    }

    static func gradeLabel(_ g: String?) -> String? {
        switch g { case "accepted": "مقبول"; case "rejected": "مردود"; case nil: nil; default: "محايد" }
    }

    static func duas(_ f: Duas, _ cat: String) -> [ContentItem] {
        f.duas.filter { cat == all || $0.category.contains(cat) }.map {
            ContentItem(id: $0.id, title: $0.name ?? $0.arabic, subtitle: $0.ref, body: join([("", $0.arabic), ("السياق والفائدة", $0.context)]))
        }
    }

    static func sunan(_ f: Sunan, _ cat: String) -> [ContentItem] {
        f.sunan.filter { cat == all || $0.category == cat }.map {
            ContentItem(id: $0.id, title: $0.title, subtitle: $0.time, body: join([("", $0.text), ("المصدر", $0.source), ("كيف؟", $0.howTo)]))
        }
    }

    static func terms(_ f: Science, _ cat: String) -> [ContentItem] {
        f.terms.filter { cat == all || $0.category == cat }.map {
            ContentItem(id: $0.id, title: $0.term, subtitle: gradeLabel($0.grade),
                        body: join([("تعريف", $0.definition), ("تنبيه علمي", $0.note), ("مثال", $0.example)]))
        }
    }

    static func lessons(_ s: LessonSection) -> [ContentItem] {
        s.lessons.map { ContentItem(id: $0.id, title: $0.title, subtitle: $0.summary, body: join([("", $0.summary), ("", $0.body)])) }
    }

    static func love(_ rows: [Love]) -> [ContentItem] {
        rows.sorted { ($0.order_number ?? .max) < ($1.order_number ?? .max) }.map { r in
            var src = r.source ?? ""
            if let n = r.hadith_number, !src.isEmpty { src += " — رقم \(n)" }
            var parts = [src]
            if let g = r.grade { parts.append("درجة الحديث: \(g)") }
            if let v = r.verified_by { parts.append("راجعه: \(v)") }
            let meta = parts.filter { !$0.isEmpty }.joined(separator: " · ")
            return ContentItem(id: r.id, title: (r.order_number.map { "\($0). " } ?? "") + r.title, body: join([("", r.hadith_text), ("", meta)]))
        }
    }
}

private struct ChipItemsView: View {
    let categories: [String]
    let items: (String) -> [ContentItem]
    @State private var selected = SiteContent.all
    var body: some View {
        VStack(spacing: Sunnah.Spacing.s2) {
            ReaderChipPicker(options: categories.map { ($0, $0) }, selection: $selected)
            LibraryInlineItemsView(items: items(selected)).id(selected)
        }
    }
}

/// «المتون الحديثية وأحاديث الأحكام»: الأربعون النووية متاحة، وبقية المتون غير منشورة بانتظار مصدر موثوق (كما في الموقع).
private struct HadithBooksAndRulingsView: View {
    var body: some View {
        SunnahRowStack {
            Text("الأربعون النووية متاحة بمادتها المعتمدة؛ ولا يُنشر متن أو حكم على حديث في بقية الكتب حتى اعتماد مصدر موثوق ومراجعة علمية.")
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s2)
            SunnahNavigationLink { ReaderDataScreens.arbaeenList() } label: {
                SunnahListRow(title: "الأربعون النووية", subtitle: "42 حديثاً")
            }.sunnahStackRow()
            ForEach([("عمدة الأحكام", "جمع الإمام عبد الغني المقدسي للأحاديث المتفق عليها بين البخاري ومسلم في الأحكام الفقهية."),
                     ("بلوغ المرام", "جمع الحافظ ابن حجر العسقلاني لأحاديث الأحكام مع بيان درجتها، من أشهر مراجع فقه الحديث."),
                     ("المنتقى من أخبار المصطفى ﷺ", "جمع مجد الدين ابن تيمية (جدّ شيخ الإسلام) لأحاديث الأحكام مرتّبة على أبواب الفقه.")], id: \.0) { t, d in
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                    Text(t).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(d).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text("غير منشور بعد — بانتظار مصدر موثوق").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                }.sunnahStackRow().opacity(0.7).accessibilityElement(children: .combine)
            }
        }
    }
}

enum SiteContentScreens {
    /// الكلمة المحجوبة في نصوص المصدر (مكتوبة بالمعرّفات كي لا تظهر حرفيًا في الشيفرة): U+0623 U+0630 U+0627 U+0646.
    static let retiredWord = "\u{0623}\u{0630}\u{0627}\u{0646}"

    @MainActor
    static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "duas-quran") {
            LibraryLoadedView(source: .bundled(name: "duas-quran", subdirectory: "Data/adhkar"), adapt: { (f: SiteContent.Duas) in f }) { f in
                ChipItemsView(categories: f.categories.isEmpty ? [SiteContent.all] : f.categories) { SiteContent.duas(f, $0) }
            }.sunnahNavTitle("أدعية القرآن")
        }
        registry.registerView(id: "sunan-yawmiyya") {
            LibraryLoadedView(source: .bundled(name: "sunan-yawmiyya", subdirectory: "Data/adhkar"), adapt: { (f: SiteContent.Sunan) in f }) { f in
                ChipItemsView(categories: f.categories.isEmpty ? [SiteContent.all] : f.categories) { SiteContent.sunan(f, $0) }
            }.sunnahNavTitle("السنن اليومية")
        }
        registry.registerView(id: "adhan-help") {
            LibraryLoadedView(source: .bundled(name: "adhan-help", subdirectory: "Data/adhkar"), adapt: { (f: SiteContent.Help) in
                // لا أذان في التطبيق (قرار المالك): تُحذف أقسام المصدر التي تذكر صوت الأذان أو اختياره.
                f.sections.filter { !$0.title.contains(Self.retiredWord) && !($0.body ?? "").contains(Self.retiredWord) }
                    .map { ContentItem(id: $0.id, title: $0.title, body: $0.body) }
            }) { LibraryInlineItemsView(items: $0) }.sunnahNavTitle("مساعدة تنبيهات الصلاة")
        }
        registry.registerView(id: "hadith-science") {
            LibraryLoadedView(source: .bundled(name: "hadith-science", subdirectory: "Data/hadith"), adapt: { (f: SiteContent.Science) in f }) { f in
                ChipItemsView(categories: f.categories.isEmpty ? [SiteContent.all] : f.categories) { SiteContent.terms(f, $0) }
            }.sunnahNavTitle("علم مصطلح الحديث")
        }
        registry.registerView(id: "sunnah-studies") { lessonScreen(file: "sunnah-studies", dir: "Data/hadith", title: "جوامع الكلم والسنن اليومية") }
        registry.registerView(id: "dalail-nubuwwah") { lessonScreen(file: "dalail-nubuwwah", dir: "Data/sirah", title: "دلائل النبوة") }
        registry.registerView(id: "hadith.arbaeen-love-of-allah") {
            ArbaeenLoveView().bodyTitledNavigation()
        }
        registry.registerView(id: "hadith.books-and-rulings") { HadithBooksAndRulingsView().sunnahNavTitle("المتون الحديثية وأحاديث الأحكام") }
    }

    @MainActor
    private static func lessonScreen(file: String, dir: String, title: String) -> some View {
        LibraryLoadedView(source: .bundled(name: file, subdirectory: dir), adapt: { (f: SiteContent.Lessons) in f.sections }) { sections in
            LessonSectionsView(sections: sections)
        }.sunnahNavTitle(title)
    }
}

private struct LessonSectionsView: View {
    let sections: [SiteContent.LessonSection]
    @State private var selected = ""
    var body: some View {
        let id = selected.isEmpty ? (sections.first?.id ?? "") : selected
        VStack(spacing: Sunnah.Spacing.s2) {
            ReaderChipPicker(options: sections.map { ($0.id, $0.title) }, selection: $selected)
            LibraryInlineItemsView(items: sections.first { $0.id == id }.map(SiteContent.lessons) ?? []).id(id)
        }
    }
}

private struct ArbaeenLoveView: View {
    static let title = "الأربعون في محبة رب العالمين"
    private static let intro = "مجموعة قيد الاستكمال من الأحاديث النبوية الموثقة في محبة الله لعباده ومحبة العبد لربه — لا يُنشر أي حديث إلا بعد مراجعة عالِم شرعي فعلي."
    private var hasExport: Bool { Bundle.main.url(forResource: "arbaeen-love-of-allah", withExtension: "json", subdirectory: "Data/hadith") != nil }

    var body: some View {
        VStack(alignment: .trailing, spacing: 16) {
            SunnahArabicText(Self.title, style: .body).fontWeight(.bold).foregroundStyle(Sunnah.Colors.textPrimary)
                .multilineTextAlignment(.trailing).frame(maxWidth: .infinity, alignment: .trailing).padding(.horizontal, 16)
            SunnahArabicText(Self.intro, style: .body).foregroundStyle(Sunnah.Colors.textSecondary)
                .multilineTextAlignment(.trailing).frame(maxWidth: .infinity, alignment: .trailing).padding(.horizontal, 16)
            if hasExport {
                LibraryLoadedView(source: .bundled(name: "arbaeen-love-of-allah", subdirectory: "Data/hadith"),
                                  adapt: { (f: SiteContent.LoveFile) in SiteContent.love(f.rows) }) { items in
                    if items.isEmpty { EmptyStateView(title: "لا يتوفر محتوى هنا الآن.") } else { LibraryInlineItemsView(items: items) }
                }
            } else {
                EmptyStateView(title: "لا يتوفر محتوى هنا الآن.")
                Spacer(minLength: 0)
            }
        }
        .padding(.top, 16)
        .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
    }
}
