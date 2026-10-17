import SwiftUI
import os
#if os(macOS)
import AppKit
#endif

/// صفحة مصحف واحدة: 15 سطرًا بخط QPC الخاص بالصفحة. اللمس على كلمة يحدّد آيتها.
public struct MushafPageView: View {
    let repo: MushafRepository
    let index: MushafIndex
    let number: Int
    @Binding var selectedAyah: String?
    var onLongPress: ((String) -> Void)? = nil
    /// الإيماءات وتسميات إمكانية الوصول على الصفحة الحالية فقط: على الجارتين تكلّف عقد إيماءات لكل كلمة (≈450 عقدة) تُبطئ التقليب.
    var interactive = true
    @State private var page: MushafPage?
    @State private var family: String?
    @State private var failed = false
    /// حجم غليف نهاية الآية نسبةً إلى خط النص (يُصغَّر الغليف كله: الزخرفة والقرص معًا)، موحَّد لكل الشاشات.
    static let endMarkScale: CGFloat = 0.9
    /// قطر قرص نهاية الآية بوحدة em من حجم غليف النهاية (لا خط النص)؛ حبر الحلقة ≈0.80em عرضًا فالقرص داخلها كليًا.
    static let ayahDiscEm: CGFloat = 0.78
    /// إزاحة القرص للأسفل (em) ليتمركز مع حبر الحلقة داخل الخط لا مع صندوق النص.
    static let ayahDiscDropEm: CGFloat = 0.07

    public init(repo: MushafRepository, index: MushafIndex, number: Int, selectedAyah: Binding<String?>, onLongPress: ((String) -> Void)? = nil, interactive: Bool = true) {
        self.repo = repo; self.index = index; self.number = number; _selectedAyah = selectedAyah; self.onLongPress = onLongPress; self.interactive = interactive
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
            do { family = try repo.ensureFont(page: number); page = try repo.page(number); Logger(subsystem: "com.yousef.majlisilm", category: "mushaf-perf").notice("MUSHAF_PERF page_ready \(number)") } catch { failed = true }
        }
    }

    @ViewBuilder
    private func content(_ page: MushafPage, family: String, size: CGSize) -> some View {
        // التوزيع من بيانات تخطيط QPC (أنواع الأسطر) عبر MushafPageLayout؛ الهامش الجانبي ≈3% من العرض (هندسة المرجع 402×874).
        let _ = repo.noteRenderSize(size)
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
            BasmalaView(repo: repo, fontSize: MushafMetrics.basmalaFontSize(width: width))
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case "l":
            let words = row.w ?? []
            let gap = layout.gaps[i] ?? layout.fontSize * MushafMetrics.naturalGapEm
            // تظليل متصل: شريط واحد لكل مقطع متتالٍ من كلمات الآية المحددة (حواف ناعمة عند الطرفين فقط، يمتد نصف الفجوة فلا فراغ بين الكلمات).
            let runs: [[(k: Int, w: MushafWord)]] = words.enumerated().reduce(into: []) { acc, e in
                if let last = acc.last?.last, last.w.v == e.element.v { acc[acc.count - 1].append((e.offset, e.element)) } else { acc.append([(e.offset, e.element)]) }
            }
            HStack(spacing: gap) {
                ForEach(Array(runs.enumerated()), id: \.offset) { _, run in
                    HStack(spacing: gap) {
                        ForEach(run, id: \.k) { item in
                            let k = item.k, w = item.w
                            Group {
                                if w.isAyahEnd { MushafEndMark(glyph: w.c, family: family, fontSize: layout.fontSize, diameter: layout.discs[i]?[k]) }
                                else { Text(w.c).lineLimit(1).fixedSize().font(.custom(family, fixedSize: layout.fontSize)).foregroundStyle(Sunnah.Colors.textPrimary) }
                            }
                                .padding(.leading, w.isAyahEnd ? layout.endPads[i]?[k]?.lead ?? 0 : 0)
                                .padding(.trailing, w.isAyahEnd ? layout.endPads[i]?[k]?.trail ?? 0 : 0)
                                .padding(.vertical, 1)
                                .contentShape(Rectangle())
                                .gesture(
                                    LongPressGesture(minimumDuration: 0.4).onEnded { _ in selectedAyah = w.v; onLongPress?(w.v) }
                                        .exclusively(before: TapGesture().onEnded { selectedAyah = selectedAyah == w.v ? nil : w.v }),
                                    including: interactive ? .all : .none)
                                .accessibilityLabel(w.isAyahEnd ? "آية \(w.v)" : "")
                        }
                    }
                    .background {
                        if let v = run.first?.w.v, selectedAyah == v {
                            MushafSoftBand(roundRight: true, roundLeft: true, radius: layout.fontSize * 0.28).fill(Sunnah.Colors.primarySoft)
                                .padding(.horizontal, -gap / 2)
                        }
                    }
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
    @StateObject private var chromeHide = ChromeAutoHide()
    @Environment(\.accessibilityVoiceOverEnabled) private var voiceOver
    @State private var sheetHeight: CGFloat = 0
    @State private var pageSize = CGSize(width: 402, height: 874)
    @Environment(\.openRoute) private var openRoute

    public init(repo: MushafRepository, index: MushafIndex, search: MushafSearch?, store: MushafStore, startPage: Int? = nil, initialSelection: String? = nil) {
        self.repo = repo; self.index = index; self.search = search; self.store = store
        _current = State(initialValue: Mushaf.clamp(startPage ?? store.lastPage))
        _selected = State(initialValue: initialSelection)
    }

    public var body: some View {
        GeometryReader { geo in
            let h = geo.size.height, w = MushafPageLayout.canvasWidth(container: geo.size)
            let plan = avoidancePlan(height: h)
            ZStack(alignment: .top) {
                Color.clear.onAppear { pageSize = CGSize(width: w, height: h) }
                Sunnah.Colors.mushafPaper
                Group {
                #if os(iOS)
                MushafPager(current: $current, count: Mushaf.pageCount, renderKey: AnyHashable("\(selected ?? "")|\(current)")) { n in
                    MushafPageView(repo: repo, index: index, number: n, selectedAyah: $selected, onLongPress: { _ in Sunnah.Haptics.select() }, interactive: n == current)
                }
                #else
                TabView(selection: $current) {
                    ForEach(Mushaf.pagerWindow(around: current), id: \.self) { n in
                        Group {
                            if Mushaf.rendersPage(n, current: current) { MushafPageView(repo: repo, index: index, number: n, selectedAyah: $selected, onLongPress: { _ in Sunnah.Haptics.select() }, interactive: n == current) }
                            else { Color.clear }
                        }.tag(n)
                    }
                }
                #if os(iOS)
                .tabViewStyle(.page(indexDisplayMode: .never))
                #endif
                #endif
                }
                .environment(\.layoutDirection, .rightToLeft)
                .ignoresSafeArea()
                .clipped()
                pageHeader.padding(.horizontal, w * 0.032).position(x: w / 2, y: h * MushafPageLayout.headerCenter)
                pageCartouche.padding(.horizontal, w * 0.04).position(x: w / 2, y: h * MushafPageLayout.footerCenter)
                if chromeHide.visible { chrome.transition(.opacity) }
            }
            .frame(width: w, height: h)
            // القائمة السفلية لا تقطع نص الصفحة: تُصغَّر الصفحة كاملة (تحويل بصري بلا تغيير التخطيط) لتبقى فوق القائمة.
            // القاعدة: لا يتقاطع مستطيل الآية المحددة (كل أسطرها) مع البطاقة؛ تُزاح الصفحة أو تُنقل البطاقة للأعلى أو تُصغَّر عند الضرورة (SheetAvoidance).
            .scaleEffect(plan.scale, anchor: .top)
            .offset(y: plan.dy)
            .animation(Sunnah.Motion.reduced ? nil : .easeInOut(duration: 0.28), value: selected)
            .animation(Sunnah.Motion.reduced ? nil : .easeInOut(duration: 0.28), value: sheetHeight)
            .contentShape(Rectangle())
            .onTapGesture { chromeHide.tapEmpty() }
            .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged { _ in chromeHide.touch() })
        }
        .ignoresSafeArea()
        .background(Sunnah.Colors.mushafPaper.ignoresSafeArea())
        .immersiveReader(revealed: false)
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
        .overlay(alignment: avoidancePlan(height: pageSize.height).sheetOnTop ? .top : .bottom) { if let sel = selected { selectionSheet(sel) } }
        .onChange(of: selected) { sel in
            if sel == nil { sheetHeight = 0 }
            chromeHide.pin(sel != nil)
        }
        .onChange(of: voiceOver) { chromeHide.alwaysVisible = $0 }
        .onAppear { chromeHide.alwaysVisible = voiceOver; chromeHide.pin(selected != nil) }
        .onDisappear { chromeHide.cancel() }
        .sheet(isPresented: $showIndex) {
            MushafIndexView(index: index, search: search, store: store) { page in current = page; showIndex = false }
        }
        .onChange(of: current) { p in selected = nil; store.visit(page: p); repo.prefetch(around: p, size: pageSize) }
        .task {
            store.visit(page: current); repo.prefetch(around: current, size: pageSize)
            #if DEBUG
            // لقطات التدقيق فقط: `-snapshotSelectAyah 37:130` يحدّد الآية كأن المستخدم لمسها (يُظهر التظليل وبطاقة الآية).
            if let a = UserDefaults.standard.string(forKey: "snapshotSelectAyah"), !a.isEmpty { selected = a }
            #endif
            #if (DEBUG || MUSHAF_PROBE) && canImport(UIKit)
            MushafFlipProbe.runIfRequested(start: current) { current = $0 }
            #endif
        }
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
        .onTapGesture { sunnahAnimate { chromeHide.tapEmpty() } }
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

    /// الخطة الحالية لتجنّب البطاقة: مستطيل الآية من أسطر الصفحة الجارية وارتفاع البطاقة الفعلي مع الحافة الآمنة.
    private func avoidancePlan(height h: CGFloat) -> SheetAvoidance.Plan {
        guard let sel = selected, sheetHeight > 0, let page = try? repo.page(current) else { return .none }
        let m = MushafPageLayout.metrics(for: page, height: Double(h))
        let idx = m.rows.enumerated().compactMap { i, r in r.w?.contains { $0.v == sel } == true ? i : nil }
        guard let span = SheetAvoidance.ayahSpan(rowIndices: idx, top: CGFloat(m.top), rowHeight: CGFloat(m.rowHeight)) else { return .none }
        return SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: sheetHeight + Self.bottomSafeInset)
    }

    static var bottomSafeInset: CGFloat {
        #if os(iOS)
        let w = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap(\.windows).first { $0.isKeyWindow }
        return w?.safeAreaInsets.bottom ?? 0
        #else
        return 0
        #endif
    }

    private func reference(_ ayah: String) -> String { MushafShare.reference(ayah, index: index) }

    /// النص العثماني الحرفي من البيانات؛ nil يعطّل النسخ والمشاركة بدل نسخ نص ناقص.
    private func shareText(_ ayah: String) -> String? { MushafShare.text(ayah: ayah, index: index, search: search) }

    private func copy(_ text: String) {
        #if os(iOS)
        UIPasteboard.general.string = text
        #else
        NSPasteboard.general.clearContents(); NSPasteboard.general.setString(text, forType: .string)
        #endif
    }

    private func selectionSheet(_ ayah: String) -> some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            HStack(spacing: Sunnah.Spacing.s3) {
                Text(reference(ayah)).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer()
                SunnahButton("إغلاق", style: .outline) { selected = nil }
            }
            // الآية كاملة بخط المصحف (تمتد على سطور/صفحتين) داخل تمرير محدود الارتفاع فلا تطول القائمة بلا حد.
            ScrollView {
                MushafAyahText(ayah: ayah, repo: repo, size: 22, collapseAbove: .max, paper: false, plainText: shareText(ayah))
            }
            .frame(maxHeight: min(pageSize.height * 0.28, 230))
            .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: Sunnah.Spacing.s3) {
                if let text = shareText(ayah) {
                    Button { copy(text) } label: { Label("نسخ", systemImage: "doc.on.doc") }
                    ShareLink(item: text) { Label("مشاركة", systemImage: "square.and.arrow.up") }
                }
                Button { openRoute("/tafsir/\(ayah)") } label: { Label("تفسير", systemImage: "text.book.closed") }
                Button { openRoute("/quran/offline-player") } label: { Label("القراء", systemImage: "headphones") }
                Button { store.toggleBookmark(ayah: ayah, page: current) } label: { Label(isMarked ? "إزالة العلامة" : "علامة", systemImage: isMarked ? "bookmark.fill" : "bookmark") }
                Spacer(minLength: 0)
            }
            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.mushafInk)
            .labelStyle(.titleAndIcon)
            .lineLimit(1).minimumScaleFactor(0.8)   // أزرار البطاقة لا تلتفّ حرفًا حرفًا على الشاشات الضيقة
        }
        .padding(Sunnah.Spacing.s4)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.6), lineWidth: 1))
        .shadow(color: .black.opacity(0.12), radius: 16, y: 6)
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.bottom, Sunnah.Spacing.s3)
        .background(GeometryReader { g in Color.clear.preference(key: MushafSheetHeightKey.self, value: g.size.height) })
        .onPreferenceChange(MushafSheetHeightKey.self) { sheetHeight = $0 + Sunnah.Spacing.s3 }
        .transition(.move(edge: avoidancePlan(height: pageSize.height).sheetOnTop ? .top : .bottom).combined(with: .opacity))
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

private struct MushafSheetHeightKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = max(value, nextValue()) }
}

/// شريط تظليل بحواف ناعمة عند طرفي المقطع فقط (الأطراف الملتصقة بكلمة محددة مجاورة تبقى مستقيمة فيتصل التظليل).
private struct MushafSoftBand: Shape {
    var roundRight: Bool, roundLeft: Bool, radius: CGFloat
    func path(in r: CGRect) -> Path {
        let k = min(radius, r.height / 2, r.width / 2)
        let tr = roundRight ? k : 0, br = roundRight ? k : 0, tl = roundLeft ? k : 0, bl = roundLeft ? k : 0
        var p = Path()
        p.move(to: CGPoint(x: r.minX + tl, y: r.minY))
        p.addLine(to: CGPoint(x: r.maxX - tr, y: r.minY))
        if tr > 0 { p.addArc(center: CGPoint(x: r.maxX - tr, y: r.minY + tr), radius: tr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false) }
        p.addLine(to: CGPoint(x: r.maxX, y: r.maxY - br))
        if br > 0 { p.addArc(center: CGPoint(x: r.maxX - br, y: r.maxY - br), radius: br, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false) }
        p.addLine(to: CGPoint(x: r.minX + bl, y: r.maxY))
        if bl > 0 { p.addArc(center: CGPoint(x: r.minX + bl, y: r.maxY - bl), radius: bl, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false) }
        p.addLine(to: CGPoint(x: r.minX, y: r.minY + tl))
        if tl > 0 { p.addArc(center: CGPoint(x: r.minX + tl, y: r.minY + tl), radius: tl, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false) }
        p.closeSubpath()
        return p
    }
}
