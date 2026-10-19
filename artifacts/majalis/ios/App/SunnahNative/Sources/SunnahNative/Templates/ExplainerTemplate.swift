import SwiftUI

/// شرح علمي/معجزة/مراحل: فصول متسلسلة في القارئ المشترك `SunnahSeriesReader` (سحب/تالٍ/سابق/تقدّم/متابعة)،
/// وتحت كل مرحلة بطاقة الآيات والمصادر. الآيات عبر `QuranAyahText` فقط، والرسوم أصلية متجهية (docs/native/ASSETS_LICENSES.md).
/// الشريط العلوي تضعه الشاشة المضيفة (شريط الشرائح عند تعدد الشروح).
struct ExplainerTemplate: View {
    let data: ExplainerData
    private let repo = MushafRepository(bundle: .main)

    private var chapters: [SeriesChapter] {
        data.stages.map { SeriesChapter(id: $0.id, title: "المرحلة \($0.order.arabicDigits): \($0.title)", paragraphs: [$0.body]) }
    }
    private var start: Int? {
        #if DEBUG
        let i = UserDefaults.standard.integer(forKey: "snapshotStage")
        if i > 0, i < data.stages.count { return i }
        #endif
        return nil
    }

    var body: some View {
        SunnahSeriesReader(seriesID: "explainer." + data.id, seriesTitle: data.title, chapters: chapters, start: start, chrome: false,
                           lead: { c in AnyView(ExplainerArt(stageID: c.id).frame(height: 180)) },
                           extra: { c in AnyView(stageExtras(c.id)) })
            .accessibilityIdentifier("explainer")
    }

    @ViewBuilder private func stageExtras(_ id: String) -> some View {
        if let stage = data.stages.first(where: { $0.id == id }) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                ForEach(Array((stage.views ?? []).enumerated()), id: \.offset) { _, v in
                    SunnahCard {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            SunnahArabicText(v.text, style: .reading).foregroundStyle(Sunnah.Colors.textPrimary)
                            Text(v.source.display).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                }
                if let repo {
                    ForEach(stage.ayahRef ?? [], id: \.self) { a in
                        if let r = QuranAyahRange(surah: a.surah, from: a.from, to: a.to) {
                            SunnahCard {
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                    QuranAyahText(range: r, repo: repo, paper: false)
                                    if let path = SunnahAyahRange.mushafPath(r.label) {
                                        SunnahValueLink(value: Route.web(path: path)) {
                                            Text(SunnahAyahRange.display(r.label)).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary).frame(minHeight: 44)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                        ForEach(Array((stage.sources ?? []).enumerated()), id: \.offset) { _, s in
                            Text(s.display).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                }
                if let note = data.scopeNote { SunnahArabicText(note, style: .reading).foregroundStyle(Sunnah.Colors.textSecondary) }
            }
        }
    }
}

/// شاشة الشرح: تحمّل `explainers.json` وتعرض الأول الموثَّق (واحد الآن: «مراحل خلق الإنسان»).
struct ExplainerScreen: View {
    var body: some View {
        SirahLoadedView(source: SirahSection.File.explainers, adapt: { (rows: [ExplainerData]) in rows.compactMap(\.displayable) }) { rows in
            ExplainerPicker(rows: rows)
        }
    }
}

/// أكثر من شرح موثَّق ⇒ شريط اختيار أعلى الشاشة؛ شرح واحد ⇒ القالب مباشرة.
private struct ExplainerPicker: View {
    let rows: [ExplainerData]
    @State private var selection = 0

    var body: some View {
        if rows.isEmpty {
            EmptyStateView(title: SirahSection.pendingTitle)
        } else if rows.count == 1 {
            ExplainerTemplate(data: rows[0]).sunnahSubChrome()
        } else {
            ExplainerTemplate(data: rows[min(selection, rows.count - 1)]).id(selection)
            .sunnahSubChrome(accessory: SunnahChipBar(options: rows.indices.map { .init(id: $0, title: rows[$0].title) }, selection: $selection))   // شريط الرجوع المشترك يحجز مكانه فوق الشرائح فلا يغطي زر الرجوع أول شريحة
            #if DEBUG
            .onAppear { if let s = UserDefaults.standard.string(forKey: "snapshotExplainer"), let i = Int(s), rows.indices.contains(i) { selection = i } }
            #endif
        }
    }
}
