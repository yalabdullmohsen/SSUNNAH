import SwiftUI

/// صفحة مصحف واحدة: 15 سطرًا بخط QPC الخاص بالصفحة. اللمس على كلمة يحدّد آيتها.
public struct MushafPageView: View {
    let repo: MushafRepository
    let index: MushafIndex
    let number: Int
    @Binding var selectedAyah: String?
    @State private var page: MushafPage?
    @State private var family: String?
    @State private var failed = false

    public init(repo: MushafRepository, index: MushafIndex, number: Int, selectedAyah: Binding<String?>) {
        self.repo = repo; self.index = index; self.number = number; _selectedAyah = selectedAyah
        if let family = try? repo.ensureFont(page: number), let page = try? repo.page(number) {
            _page = State(initialValue: page); _family = State(initialValue: family)
        }
    }

    public var body: some View {
        GeometryReader { geo in
            if let page, let family {
                content(page, family: family, size: geo.size)
            } else if failed {
                StateMessage(text: "تعذّر تحميل الصفحة \(number)").screenState(.error)
            } else {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity).screenState(.loading)
            }
        }
        .ignoresSafeArea()
        .task(id: number) {
            guard page == nil else { return }
            do { family = try repo.ensureFont(page: number); page = try repo.page(number) } catch { failed = true }
        }
    }

    @ViewBuilder
    private func content(_ page: MushafPage, family: String, size: CGSize) -> some View {
        // التوزيع من بيانات تخطيط QPC (أنواع الأسطر) عبر MushafPageLayout؛ الهامش الجانبي ≈3% من العرض (هندسة المرجع 402×874).
        let pl = repo.pageLayout(page, family: family, size: size)
        let inset = pl.inset, width = pl.width, m = pl.m, layout = pl.layout
        let rows = m.rows, rowH = CGFloat(m.rowHeight)
        VStack(spacing: 0) {
            ForEach(Array(rows.enumerated()), id: \.offset) { i, row in
                rowView(row, layout: layout, family: family, index: i, width: width).frame(height: rowH)
            }
        }
        .frame(height: rowH * CGFloat(rows.count))
        .padding(.horizontal, inset)
        .padding(.top, CGFloat(m.top))
        .frame(maxHeight: .infinity, alignment: .top)
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private func rowView(_ row: MushafRow, layout: MushafMetrics.Layout, family: String, index i: Int, width: CGFloat) -> some View {
        switch row.k {
        case "h":
            let name = self.index.surahs.first { $0.id == row.s }?.name ?? ""
            SurahBanner(surah: row.s ?? 0, name: name, repo: repo).padding(.vertical, 1)
        case "b":
            BasmalaView(repo: repo, fontSize: layout.fontSize)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case "l":
            let words = row.w ?? []
            let gap = layout.gaps[i] ?? layout.fontSize * MushafMetrics.naturalGapEm
            HStack(spacing: gap) {
                ForEach(Array(words.enumerated()), id: \.offset) { _, w in
                    Text(w.c)
                        .lineLimit(1)
                        .fixedSize()
                    .font(.custom(family, fixedSize: layout.fontSize))
                        .foregroundStyle(w.isAyahEnd ? Sunnah.Colors.mushafIvory : Sunnah.Colors.textPrimary)
                        .background {
                            // قرص أخضر خلف رمز نهاية الآية (الرمز نفسه من خط QPC بلا تغيير): حلقته ورقمه عاجيان كالمرجع.
                            if w.isAyahEnd { Circle().fill(Sunnah.Colors.mushafAccent).aspectRatio(1, contentMode: .fit) }
                        }
                        .padding(.vertical, 1)
                        .background(selectedAyah == w.v ? Sunnah.Colors.primarySoft : .clear)
                        .onTapGesture { selectedAyah = selectedAyah == w.v ? nil : w.v }
                        .accessibilityLabel(w.isAyahEnd ? "آية \(w.v)" : "")
                }
            }
            .frame(maxWidth: layout.gaps[i] == nil ? nil : width)
            .frame(maxWidth: .infinity)
        default:
            Color.clear
        }
    }
}

struct StateMessage: View {
    let text: String
    var body: some View {
        Text(text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

/// القارئ: تمرير الصفحات، شريط علوي (سورة/جزء/صفحة)، فهرس وبحث وعلامات، ومتابعة آخر موضع.
public struct MushafReaderView: View {
    let repo: MushafRepository
    let index: MushafIndex
    let search: MushafSearch?
    @ObservedObject var store: MushafStore
    @State private var current: Int
    @State private var selected: String?
    @State private var showIndex = false
    @State private var showChrome = false
    @State private var pageSize = CGSize(width: 402, height: 874)
    @Environment(\.openRoute) private var openRoute

    public init(repo: MushafRepository, index: MushafIndex, search: MushafSearch?, store: MushafStore, startPage: Int? = nil) {
        self.repo = repo; self.index = index; self.search = search; self.store = store
        _current = State(initialValue: Mushaf.clamp(startPage ?? store.lastPage))
    }

    public var body: some View {
        GeometryReader { geo in
            let w = geo.size.width, h = geo.size.height
            ZStack(alignment: .top) {
                Color.clear.onAppear { pageSize = geo.size }
                Sunnah.Colors.mushafPaper
                TabView(selection: $current) {
                    ForEach(1...Mushaf.pageCount, id: \.self) { n in
                        Group {
                            if abs(n - current) <= 1 { MushafPageView(repo: repo, index: index, number: n, selectedAyah: $selected) }
                            else { Color.clear }
                        }.tag(n)
                    }
                }
                #if os(iOS)
                .tabViewStyle(.page(indexDisplayMode: .never))
                #endif
                .environment(\.layoutDirection, .rightToLeft)
                .ignoresSafeArea()
                .clipped()
                pageHeader.padding(.horizontal, w * 0.032).position(x: w / 2, y: h * MushafPageLayout.headerCenter)
                pageCartouche.padding(.horizontal, w * 0.04).position(x: w / 2, y: h * MushafPageLayout.footerCenter)
                if showChrome { chrome.transition(.opacity) }
            }
            .frame(width: w, height: h)
        }
        .ignoresSafeArea()
        .background(Sunnah.Colors.mushafPaper.ignoresSafeArea())
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
        .overlay(alignment: .bottom) { if let sel = selected { selectionSheet(sel) } }
        .sheet(isPresented: $showIndex) {
            MushafIndexView(index: index, search: search, store: store) { page in current = page; showIndex = false }
        }
        .onChange(of: current) { p in selected = nil; store.visit(page: p); repo.prefetch(around: p, size: pageSize) }
        .task { store.visit(page: current); repo.prefetch(around: current, size: pageSize) }
        .environment(\.layoutDirection, .rightToLeft)
    }

    /// سطر الرأس كما في المرجع: «الجزء N» يمينًا واسم السورة (عند أول الصفحة) يسارًا؛ اللمس يُظهر/يُخفي أدوات القارئ.
    private var pageHeader: some View {
        HStack {
            Text("الجزء \(Self.arabicDigits(index.juz(onPage: current)))")
            Spacer()
            Text(topSurahName(on: current))
        }
        .font(Sunnah.Typography.secondary)
        .foregroundStyle(Sunnah.Colors.mushafAccent)
        .contentShape(Rectangle())
        .onTapGesture { sunnahAnimate { showChrome.toggle() } }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isButton)
        .accessibilityHint("يُظهر أدوات القارئ")
        .accessibilityIdentifier("mushaf.header")
    }

    /// أدوات القارئ (فهرس، علامة، خروج) مخفيّة افتراضيًا ليبقى المصحف غامرًا كما في المرجع.
    private var chrome: some View {
        HStack(spacing: Sunnah.Spacing.s4) {
            Button { openRoute("/") } label: { Image(systemName: "xmark") }.accessibilityLabel("إغلاق المصحف")
            Spacer()
            Button { showIndex = true } label: { Image(systemName: "list.bullet") }.accessibilityLabel("الفهرس والبحث")
            Button {
                let ayah = selected ?? firstAyah(on: current)
                if let ayah { store.toggleBookmark(ayah: ayah, page: current) }
            } label: { Image(systemName: isMarked ? "bookmark.fill" : "bookmark") }.accessibilityLabel("علامة")
        }
        .font(.system(size: 18, weight: .semibold))
        .foregroundStyle(Sunnah.Colors.mushafInk)
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.vertical, Sunnah.Spacing.s3)
        .background(Sunnah.Colors.mushafIvory, in: Capsule())
        .overlay(Capsule().stroke(Sunnah.Colors.mushafGoldBrown, lineWidth: 1))
        .padding(.horizontal, Sunnah.Spacing.s4)
        .padding(.top, 54)
        .accessibilityIdentifier("mushaf.chrome")
    }

    /// خرطوشة رقم الصفحة أسفل يمين الصفحة (خارج شبكة الأسطر فلا يتغيّر مقاس الخط ولا توزيع الكلمات).
    private var pageCartouche: some View {
        HStack {
            PageCartouche(text: Self.arabicDigits(current))
                .accessibilityLabel("صفحة \(current)")
                .accessibilityIdentifier("mushaf.pageNumber")
            Spacer()
            Text("الحزب \(Self.arabicDigits(hizb(on: current)))")
                .font(Sunnah.Typography.secondary)
                .foregroundStyle(Sunnah.Colors.mushafAccent)
                .accessibilityIdentifier("mushaf.hizb")
        }
    }

    static func arabicDigits(_ n: Int) -> String {
        let d = Array("٠١٢٣٤٥٦٧٨٩"); return String(String(n).compactMap { $0.wholeNumberValue.map { d[$0] } })
    }

    /// السورة الجارية في أعلى الصفحة (آية أول سطر)، لا آخر سورة تبدأ فيها.
    /// الحزب الجاري = حزب أول آية في الصفحة (أرباع Tanzil)؛ احتياطًا من فهرس الأجزاء إن تعذّرت الآية.
    private func hizb(on page: Int) -> Int {
        firstAyah(on: page).flatMap(HizbQuarters.hizb(ayahID:)) ?? 1
    }

    private func topSurahName(on page: Int) -> String {
        if let v = firstAyah(on: page), let id = Int(v.split(separator: ":").first ?? ""),
           let s = index.surahs.first(where: { $0.id == id }) { return s.name }
        return index.surah(onPage: page)?.name ?? ""
    }

    private func selectionSheet(_ ayah: String) -> some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            Text("آية \(ayah)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            Spacer()
            SunnahButton(isMarked ? "إزالة العلامة" : "علامة", style: .secondary) { store.toggleBookmark(ayah: ayah, page: current) }
            SunnahButton("إغلاق", style: .outline) { selected = nil }
        }
        .padding(Sunnah.Spacing.s4)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.6), lineWidth: 1))
        .shadow(color: .black.opacity(0.12), radius: 16, y: 6)
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.bottom, Sunnah.Spacing.s3)
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .accessibilityIdentifier("mushaf.selection")
    }

    private var isMarked: Bool { (selected ?? firstAyah(on: current)).map(store.isBookmarked) ?? false }

    private func firstAyah(on page: Int) -> String? {
        (try? repo.page(page))?.rows.compactMap { $0.w?.first?.v }.first
    }
}

/// الفهرس: السور، الأجزاء، العلامات، والبحث في نص القرآن.
public struct MushafIndexView: View {
    enum Tab: String, CaseIterable { case surahs = "السور", juz = "الأجزاء", marks = "العلامات", search = "بحث" }
    let index: MushafIndex
    let search: MushafSearch?
    @ObservedObject var store: MushafStore
    let open: (Int) -> Void
    @State private var tab: Tab = .surahs
    @State private var query = ""

    public init(index: MushafIndex, search: MushafSearch?, store: MushafStore, open: @escaping (Int) -> Void) {
        self.index = index; self.search = search; self.store = store; self.open = open
    }

    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s2) {
            SunnahSegmented(Tab.allCases.map { ($0, $0.rawValue) }, selection: $tab)
                .padding(.horizontal, Sunnah.Spacing.s4).padding(.top, Sunnah.Spacing.s4)
            switch tab {
            case .surahs:
                List(index.surahs) { s in
                    Button { open(s.firstPage) } label: {
                        HStack { Text("\(s.id). \(s.name)"); Spacer(); Text("صفحة \(s.firstPage)").foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                    .sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            case .juz:
                List(Array(index.juzStart.enumerated()), id: \.offset) { i, p in
                    Button { open(p) } label: { HStack { Text("الجزء \(i + 1)"); Spacer(); Text("صفحة \(p)").foregroundStyle(Sunnah.Colors.textSecondary) } }
                    .sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            case .marks:
                if store.bookmarks.isEmpty { StateMessage(text: "لا علامات بعد") }
                else {
                    List(store.bookmarks) { b in
                        Button { open(b.page) } label: { HStack { Text("آية \(b.ayah)"); Spacer(); Text("صفحة \(b.page)").foregroundStyle(Sunnah.Colors.textSecondary) } }
                        .sunnahRowChrome()
                    }
                    .listStyle(.plain).scrollContentBackground(.hidden)
                }
            case .search:
                TextField("ابحث في القرآن", text: $query).font(Sunnah.Typography.body)
                    .padding(Sunnah.Spacing.s3).background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card))
                    .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card).stroke(Sunnah.Colors.surface2, lineWidth: 1))
                    .padding(.horizontal, Sunnah.Spacing.s4)
                let hits = search?.search(query) ?? []
                List(hits) { h in
                    Button { open(h.page) } label: {
                        VStack(alignment: .leading) { Text(h.text).lineLimit(2); Text("آية \(h.ayah) · صفحة \(h.page)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                    .sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahMotifCorner(size: 220, alignment: .bottomLeading, opacity: 0.06)
        .background(Sunnah.Colors.bg)
    }
}
