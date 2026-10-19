import SwiftUI

/// رابط ذكي من فصل إلى قسمه (آية/حديث/علَم/مكان) عبر المسارات الموجودة.
struct SeriesLink: Hashable, Identifiable {
    enum Kind: String { case verse, hadith, person, place
        var symbol: String { switch self { case .verse: return "book"; case .hadith: return "text.quote"; case .person: return "person"; case .place: return "mappin.and.ellipse" } }
        var title: String { switch self { case .verse: return "آية"; case .hadith: return "حديث"; case .person: return "علَم"; case .place: return "مكان" } }
    }
    let kind: Kind; let title: String; let route: String
    var id: String { route + "|" + title }
}

/// فصل واحد في سلسلة: عنوان + فترة + نص (فقرات أو Markdown) + أحداث رئيسة كخط زمني + روابط «مرتبط».
struct SeriesChapter: Identifiable, Hashable {
    let id: String; let title: String
    var period: String? = nil
    var paragraphs: [String] = []
    var markdown: String? = nil
    var events: [String] = []
    var related: [SeriesLink] = []
    var sources: [SourceRef] = []
}

/// آخر فصل مقروء لكل سلسلة (للمتابعة).
enum SeriesProgress {
    static func key(_ series: String) -> String { "series.last.\(series)" }
    static func last(_ series: String) -> String? { UserDefaults.standard.string(forKey: key(series)) }
    static func save(_ series: String, _ id: String) { UserDefaults.standard.set(id, forKey: key(series)) }
}

/// روابط ذكية: الأعلام المسمّاة في نص الفصل → أقسامها (الأسماء من القائمة التي تمرّرها الشاشة).
enum SeriesRelated {
    static func people(in text: String, from known: [(name: String, route: String)], limit: Int = 6) -> [SeriesLink] {
        var out: [SeriesLink] = []
        for k in known where text.contains(k.name) && !out.contains(where: { $0.route == k.route }) {
            out.append(SeriesLink(kind: .person, title: k.name, route: k.route))
            if out.count == limit { break }
        }
        return out
    }
    /// أقسام التطبيق التي يُذكر موضوعها في النص (أماكن/صحابة/أنبياء/حديث): رابط لكل قسم مرة واحدة عند ورود أحد كلماته.
    static func sections(in text: String) -> [SeriesLink] {
        let table: [(SeriesLink.Kind, String, String, [String])] = [
            (.place, "المعالم الإسلامية", "/islamic-landmarks", ["مكة", "المدينة", "الكعبة", "الطائف", "بدر", "أحد", "تبوك", "الحبشة", "القدس"]),
            (.person, "الصحابة", "/sahabah", ["أبو بكر", "عمر", "عثمان", "خديجة", "حمزة", "بلال", "الصحابة"]),
            (.person, "قصص الأنبياء", "/prophets", ["إبراهيم", "إسماعيل", "موسى", "عيسى", "نوح", "يوسف", "آدم"]),
            (.hadith, "الأحاديث", "/hadith", ["حديث", "قال رسول الله", "قال النبي"]),
        ]
        return table.compactMap { k, title, route, words in
            words.contains { text.contains($0) } ? SeriesLink(kind: k, title: title, route: route) : nil
        }
    }
    static func verses(_ refs: [String]) -> [SeriesLink] {
        refs.compactMap { r in SunnahAyahRange.mushafPath(r).map { SeriesLink(kind: .verse, title: SunnahAyahRange.display(r), route: $0) } }
    }
}

/// قائمة عرض موحّدة للقارئ (بديل صف الأزرار ٤/ع/القمر): زر واحد يفتح لوحة بحجم الخط ووضع الليل. القيمتان مشتركتان مع ArticleTemplate.
struct SunnahReaderDisplayMenu: View {
    @AppStorage("reader.sizeStep") private var sizeStep = 0
    @AppStorage("reader.night") private var night = false
    @State private var open = false
    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Button { Sunnah.Haptics.select(); withAnimation(.easeOut(duration: 0.2)) { open.toggle() } } label: {
                HStack(spacing: Sunnah.Spacing.s2) {
                    Image(systemName: "textformat.size")
                    Text("العرض").font(AppearancePrefs.ui(.bold, 13, .footnote))
                }
                .foregroundStyle(Sunnah.Colors.primary).padding(.horizontal, 16).frame(minHeight: 44)
                .background(Sunnah.Colors.surface, in: Capsule())
                .overlay(Capsule().stroke(Sunnah.Colors.border, lineWidth: 1))
            }
            .buttonStyle(.plain).accessibilityLabel("إعدادات العرض").accessibilityValue(open ? "مفتوحة" : "مغلقة")
            .accessibilityIdentifier("series.display")
            if open {
                VStack(spacing: Sunnah.Spacing.s3) {
                    HStack {
                        Text("حجم الخط").font(AppearancePrefs.ui(.bold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.textPrimary)
                        Spacer()
                        stepButton("minus", "تصغير الخط") { sizeStep = max(-2, sizeStep - 1) }
                        Text(sizeStep.arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary).frame(minWidth: 28)
                        stepButton("plus", "تكبير الخط") { sizeStep = min(4, sizeStep + 1) }
                    }
                    Divider().overlay(Sunnah.Colors.border)
                    Button { Sunnah.Haptics.select(); night.toggle() } label: {
                        HStack {
                            Text("وضع الليل").font(AppearancePrefs.ui(.bold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer()
                            Image(systemName: night ? "moon.fill" : "moon").foregroundStyle(Sunnah.Colors.primary).frame(width: 44, height: 44)
                        }
                    }
                    .buttonStyle(.plain).accessibilityLabel(night ? "إيقاف وضع الليل" : "تشغيل وضع الليل")
                }
                .padding(Sunnah.Spacing.s4)
                .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
                .transition(.opacity)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func stepButton(_ symbol: String, _ label: String, _ action: @escaping () -> Void) -> some View {
        Button { Sunnah.Haptics.select(); action() } label: {
            Image(systemName: symbol).font(.system(size: 15, weight: .bold)).foregroundStyle(Sunnah.Colors.primary)
                .frame(width: 44, height: 44).background(Sunnah.Colors.primarySoft, in: Circle())
        }
        .buttonStyle(.plain).accessibilityLabel(label)
    }
}

/// القارئ المتسلسل المشترك (السيرة، قصص الأنبياء، الشروح، الدروس): فصل بعد فصل بلا عودة للقائمة؛ سحب أفقي أو بطاقتا «التالي/السابق»،
/// شريط تقدّم، متابعة من آخر فصل، روابط «مرتبط»، وقائمة عرض واحدة بلا صف أزرار في الرأس.
struct SunnahSeriesReader: View {
    let seriesID: String
    let seriesTitle: String
    let chapters: [SeriesChapter]
    /// false حين تضع الشاشة شريطها العلوي بنفسها (شريط شرائح الشروح مثلًا).
    var chrome = true
    /// محتوى خاص بالفصل قبل النص (رسم) وبعده (آيات من المصحف، بطاقات).
    var lead: ((SeriesChapter) -> AnyView)? = nil
    var extra: ((SeriesChapter) -> AnyView)? = nil
    @State private var index: Int
    @State private var forward = true
    @AppStorage("reader.sizeStep") private var sizeStep = 0
    @AppStorage("reader.night") private var night = false
    @Environment(\.dynamicTypeSize) private var systemSize
    @Environment(\.openRoute) private var openRoute

    init(seriesID: String, seriesTitle: String, chapters: [SeriesChapter], start: Int? = nil, chrome: Bool = true,
         lead: ((SeriesChapter) -> AnyView)? = nil, extra: ((SeriesChapter) -> AnyView)? = nil) {
        self.seriesID = seriesID; self.seriesTitle = seriesTitle; self.chapters = chapters
        self.chrome = chrome; self.lead = lead; self.extra = extra
        let resumed = SeriesProgress.last(seriesID).flatMap { id in chapters.firstIndex { $0.id == id } }
        _index = State(initialValue: max(0, min(chapters.count - 1, start ?? resumed ?? 0)))
    }

    private var chapter: SeriesChapter { chapters[index] }
    private var size: DynamicTypeSize {
        let all = DynamicTypeSize.allCases
        let i = all.firstIndex(of: systemSize) ?? 0
        return all[max(0, min(all.count - 1, i + sizeStep))]
    }

    var body: some View {
        Group {
            if chapters.isEmpty { SectionEmptyStateFallback() } else { reader }
        }
        .background(Sunnah.Colors.bg)
        .modifier(OptionalSubChrome(on: chrome))
        .environment(\.layoutDirection, .rightToLeft)
        .preferredColorScheme(night ? .dark : nil)
        .sunnahReadableWidth()
        .accessibilityIdentifier("series.reader")
    }

    private var reader: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                    header.id("top")
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s5) {
                        if let lead { lead(chapter) }
                        body_(chapter)
                        if let extra { extra(chapter) }
                        if !chapter.events.isEmpty { timeline(chapter.events) }
                        if !chapter.related.isEmpty { relatedSection(chapter.related) }
                        navCards(proxy)
                        SunnahContentFooter(title: chapter.title, id: chapter.id, section: seriesTitle, sources: chapter.sources, inset: false)
                    }
                    .id(chapter.id)
                    .transition(.asymmetric(insertion: .move(edge: forward ? .leading : .trailing).combined(with: .opacity), removal: .opacity))
                }
                .padding(.horizontal, Sunnah.Spacing.pageX).padding(.bottom, 96)
            }
            .dynamicTypeSize(size)
            .simultaneousGesture(DragGesture(minimumDistance: 28).onEnded { g in
                guard abs(g.translation.width) > 70, abs(g.translation.width) > abs(g.translation.height) * 1.6 else { return }
                // RTL: السحب من اليسار إلى اليمين = التالي (كتقليب الكتاب العربي)
                go(g.translation.width > 0 ? 1 : -1, proxy)
            })
            .onAppear { SeriesProgress.save(seriesID, chapter.id) }
        }
    }

    private func go(_ delta: Int, _ proxy: ScrollViewProxy) {
        let n = index + delta
        guard chapters.indices.contains(n) else { return }
        Sunnah.Haptics.select()
        forward = delta > 0
        withAnimation(.easeInOut(duration: 0.25)) { index = n }
        SeriesProgress.save(seriesID, chapters[n].id)
        proxy.scrollTo("top", anchor: .top)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            SunnahPageTitle(chapter.title).padding(.horizontal, -Sunnah.Spacing.pageX)
            HStack(spacing: Sunnah.Spacing.s2) {
                if let p = chapter.period, !p.isEmpty { SunnahChip(p) }
                Text("\(seriesTitle) · الفصل \((index + 1).arabicDigits) من \(chapters.count.arabicDigits)")
                    .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            progressBar
            SunnahReaderDisplayMenu()
        }
    }

    private var progressBar: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                Capsule().fill(Sunnah.Colors.primarySoft)
                Capsule().fill(Sunnah.Colors.primary).frame(width: g.size.width * CGFloat(index + 1) / CGFloat(max(chapters.count, 1)))
            }
        }
        .frame(height: 6)
        .accessibilityElement().accessibilityLabel("تقدّم \(seriesTitle)")
        .accessibilityValue("\((index + 1).arabicDigits) من \(chapters.count.arabicDigits)")
        .accessibilityIdentifier("series.progress")
    }

    @ViewBuilder private func body_(_ c: SeriesChapter) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            if let md = c.markdown, !md.isEmpty {
                ForEach(SunnahMarkdown.sections(md)) { SunnahSectionView(section: $0, key: c.id, style: .reading) }
            }
            ForEach(Array(c.paragraphs.enumerated()), id: \.offset) { _, para in
                if para.hasPrefix("## ") {   // عنوان فرعي داخل الفصل
                    Text(String(para.dropFirst(3)).arabicDigits).font(AppearancePrefs.ui(.extraBold, 18, .headline)).foregroundStyle(Sunnah.Colors.primary).padding(.top, Sunnah.Spacing.s2)
                } else if para.hasPrefix("### ") {
                    Text(String(para.dropFirst(4)).arabicDigits).font(AppearancePrefs.ui(.extraBold, 16, .subheadline)).foregroundStyle(Sunnah.Colors.textPrimary)
                } else if para.hasPrefix("> ") {   // سطر المصدر
                    Text(String(para.dropFirst(2)).arabicDigits).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                } else {
                    SunnahArabicText(para, style: .reading).foregroundStyle(Sunnah.Colors.textPrimary)
                }
            }
        }
    }

    private func timeline(_ events: [String]) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("أبرز الأحداث").font(AppearancePrefs.ui(.extraBold, 17, .headline)).foregroundStyle(Sunnah.Colors.primary).padding(.bottom, Sunnah.Spacing.s3)
            ForEach(Array(events.enumerated()), id: \.offset) { i, e in
                HStack(alignment: .top, spacing: Sunnah.Spacing.s3) {
                    VStack(spacing: 0) {
                        Circle().fill(Sunnah.Colors.primary).frame(width: 10, height: 10).padding(.top, 7)
                        Rectangle().fill(Sunnah.Colors.border).frame(width: 2).opacity(i == events.count - 1 ? 0 : 1)
                    }
                    SunnahArabicText(e, style: .body).foregroundStyle(Sunnah.Colors.textPrimary).padding(.bottom, Sunnah.Spacing.s3)
                }
            }
        }
        .accessibilityIdentifier("series.timeline")
    }

    private func relatedSection(_ links: [SeriesLink]) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Text("مرتبط").font(AppearancePrefs.ui(.extraBold, 17, .headline)).foregroundStyle(Sunnah.Colors.primary)
            ForEach(links) { l in
                Button { Sunnah.Haptics.select(); openRoute(l.route) } label: {
                    HStack(spacing: Sunnah.Spacing.s3) {
                        Image(systemName: l.kind.symbol).foregroundStyle(Sunnah.Colors.primary).frame(width: 28)
                        Text(l.title.arabicDigits).font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                        Spacer(minLength: 0)
                        Text(l.kind.title).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        Image(systemName: "chevron.left").font(.system(size: 12, weight: .semibold)).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    .padding(.horizontal, Sunnah.Spacing.s4).frame(minHeight: 52)
                    .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
                }
                .buttonStyle(.plain).sunnahPressable().accessibilityIdentifier("series.related")
            }
        }
    }

    private func navCards(_ proxy: ScrollViewProxy) -> some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            if index < chapters.count - 1 { NavCard(kind: "التالي", title: chapters[index + 1].title, icon: "chevron.left", next: true) { go(1, proxy) }.accessibilityIdentifier("series.next") }
            if index > 0 { NavCard(kind: "السابق", title: chapters[index - 1].title, icon: "chevron.right", next: false) { go(-1, proxy) }.accessibilityIdentifier("series.previous") }
        }
    }
}

/// بطاقتا «التالي/السابق» أسفل الفصل (تحملان عنوان الفصل المجاور).
private struct NavCard: View {
    let kind: String, title: String, icon: String, next: Bool; let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: Sunnah.Spacing.s3) {
                if !next { Image(systemName: icon).foregroundStyle(Sunnah.Colors.primary) }
                VStack(alignment: .leading, spacing: 2) {
                    Text(kind).font(Sunnah.Typography.tag).foregroundStyle(next ? Sunnah.Colors.heroGold : Sunnah.Colors.textSecondary)
                    Text(title.arabicDigits).font(AppearancePrefs.ui(.extraBold, 16, .body)).foregroundStyle(next ? Color.white : Sunnah.Colors.textPrimary).multilineTextAlignment(.leading)
                }
                Spacer(minLength: 0)
                if next { Image(systemName: icon).foregroundStyle(Color.white) }
            }
            .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, minHeight: 64)
            .background(next ? Sunnah.Colors.primaryStrong : Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(next ? Color.clear : Sunnah.Colors.border, lineWidth: 1))
        }
        .buttonStyle(.plain).sunnahPressable()
        .accessibilityLabel("\(kind): \(title)")
    }
}

private struct SectionEmptyStateFallback: View {
    var body: some View { EmptyStateView(title: "لا فصول بعد") }
}

private struct OptionalSubChrome: ViewModifier {
    let on: Bool
    @ViewBuilder func body(content: Content) -> some View { if on { content.sunnahSubChrome() } else { content } }
}
