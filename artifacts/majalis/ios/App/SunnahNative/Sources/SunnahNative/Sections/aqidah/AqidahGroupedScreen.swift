import SwiftUI

/// وصف صفحة مجموعات: معرّفها في السجل، وعنوانها الظاهر، واسم ملفها في `Data/aqidah`.
public protocol AqidahGroupedPage {
    static var id: String { get }
    static var title: String { get }
    static var file: String { get }
}

/// صفحة مجموعات (أكورديون الويب أو تبويباته): بحث عربي، ثم مجموعات بعناوين، وكل عنصر يتمدد لنصّه وإحالته.
/// تخدم: أدب الطلب، الأخلاق، علامات الساعة، أمراض القلوب، حكم السلف، الجنة والنار، الملائكة، الرقائق،
/// موضوعات الإيمان، موضوعات التزكية، الأسرة والمجتمع، وكيف أصبح مسلمًا.
public struct AqidahGroupedScreen<Page: AqidahGroupedPage>: ScreenTemplate {
    public static var id: String { Page.id }
    public static var title: String { Page.title }
    public static var source: ContentSource { AqidahContent.source(Page.file) }

    let groups: [AqidahGroup]
    @State private var query = ""
    @State private var expanded: Set<String> = []

    public init(content: [AqidahGroup]) { groups = AqidahContent.accepted(content) }

    public var body: some View {
        let shown = AqidahContent.filter(groups, query: query)
        Group {
            if groups.isEmpty {
                EmptyStateView()
            } else if shown.isEmpty {
                EmptyStateView(title: "لا نتائج مطابقة")
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                        ForEach(shown) { group in
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                                if shown.count > 1 || groups.count > 1 {
                                    Text(group.title).font(Sunnah.Typography.sectionTitle)
                                        .foregroundStyle(Sunnah.Colors.textPrimary)
                                        .accessibilityAddTraits(.isHeader)
                                }
                                ForEach(group.entries) { entry in
                                    row(entry, key: group.id + "/" + entry.id)
                                }
                            }
                        }
                    }
                    .padding(Sunnah.Spacing.pageX)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahSearchable(text: $query, prompt: "ابحث في الصفحة")
    }

    private func hint(expandable: Bool, open: Bool) -> String {
        guard expandable else { return "" }
        return open ? "يطوي النص" : "يعرض النص"
    }

    private func row(_ entry: AqidahEntry, key: String) -> some View {
        let open = expanded.contains(key)
        let expandable = entry.body != nil || entry.reference != nil
        return SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                Button {
                    guard expandable else { return }
                    if open { expanded.remove(key) } else { expanded.insert(key) }
                } label: {
                    HStack(alignment: .top, spacing: Sunnah.Spacing.s3) {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                            Text(entry.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            if let s = entry.summary, !(open && entry.body == s) {
                                Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                            }
                        }
                        Spacer(minLength: Sunnah.Spacing.s2)
                        if expandable {
                            Image(systemName: open ? "chevron.up" : "chevron.down")
                                .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                    .frame(minHeight: Sunnah.Spacing.touch)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityHint(hint(expandable: expandable, open: open))
                if open {
                    if let b = entry.body { AqidahParagraphs(text: b) }
                    if let r = entry.reference {
                        Text(r).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
            }
        }
    }
}

// MARK: صفحات المجموعات — المعرّف = مسار الويب (بالنقطة بدل الشرطة المائلة)، كما في AqidahScreens المولَّد.

public enum AqidahAdabTalabIlmPage: AqidahGroupedPage { public static let id = "adab-talab-ilm", title = "آداب طالب العلم", file = "adab-talab-ilm" }
public enum AqidahAkhlaqPage: AqidahGroupedPage { public static let id = "akhlaq", title = "الأخلاق الإسلامية", file = "akhlaq" }
public enum AqidahAlamatSaahPage: AqidahGroupedPage { public static let id = "alamat-saah", title = "علامات الساعة", file = "alamat-saah" }
public enum AqidahAmradQalbiyyaPage: AqidahGroupedPage { public static let id = "amrad-qalbiyya", title = "الأمراض القلبية", file = "amrad-qalbiyya" }
public enum AqidahHikamSalafPage: AqidahGroupedPage { public static let id = "hikam-salaf", title = "حِكَم السلف الصالح", file = "hikam-salaf" }
public enum AqidahJannaNaarPage: AqidahGroupedPage { public static let id = "janna-naar", title = "الجنة والنار", file = "janna-naar" }
public enum AqidahMalaikaPage: AqidahGroupedPage { public static let id = "malaika", title = "الملائكة في الإسلام", file = "malaika" }
public enum AqidahRaqaiqPage: AqidahGroupedPage { public static let id = "raqaiq", title = "الرقائق والزهد", file = "raqaiq" }
public enum AqidahImanTopicsPage: AqidahGroupedPage { public static let id = "iman-topics", title = "الإيمان بالله وعالم الغيب", file = "iman-topics" }
public enum AqidahTazkiyaTopicsPage: AqidahGroupedPage { public static let id = "tazkiya-topics", title = "الأخلاق والأمراض والأسئلة الكبرى", file = "tazkiya-topics" }
public enum AqidahUsraMujtamaPage: AqidahGroupedPage { public static let id = "usra-mujtama", title = "العلاقات والأسرة والمسؤولية", file = "usra-mujtama" }
public enum AqidahHowToConvertPage: AqidahGroupedPage { public static let id = "discover-islam.how-to-convert", title = "كيف أصبح مسلمًا؟", file = "discover-islam-how-to-convert" }
