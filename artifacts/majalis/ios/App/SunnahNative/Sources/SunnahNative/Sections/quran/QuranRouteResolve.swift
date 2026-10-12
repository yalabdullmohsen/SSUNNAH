import SwiftUI

/// مسارات التفاصيل ذات المعاملات في القرآن: /quran-hub/tajweed/:chapter و/quran/people/:slug و/quran/surah-stories/:number، و/hifz-path/c/:category و/hifz-path/p/:slug و/hifz-path/p/:slug/u/:unitId.
/// تُستشار من `SunnahApp.resolve` قبل المولَّد؛ المعرّف المجهول = «قيد التوثيق» لا عنصرًا نائبًا.
extension QuranSection {
    @MainActor public static func resolve(path: String) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        func id(_ i: Int) -> String { c[i].removingPercentEncoding ?? c[i] }
        switch (c.count, c.first) {
        case (3, "quran-hub") where c[1] == "tajweed":
            let key = id(2)
            return AnyView(QuranBundledLoader(name: "tajweed", isEmpty: { (f: TajweedFile) in f.chapters.isEmpty }) { (f: TajweedFile) in
                if let ch = f.chapters.first(where: { $0.id == key }) { TajweedChapterView(chapter: ch).quranTitle(ch.title) }
                else { EmptyStateView(title: pendingTitle) }
            })
        case (3, "quran") where c[1] == "people":
            let key = id(2)
            return AnyView(QuranPeopleLoader { people in
                if let p = people.first(where: { $0.slug == key }) { QuranPersonView(person: p, surahNames: surahNames()).quranTitle(p.nameAr) }
                else { EmptyStateView(title: pendingTitle) }
            })
        case (3, "quran") where c[1] == "surah-stories":
            let key = Int(id(2))
            return AnyView(QuranBundledLoader(name: "surah-stories", isEmpty: { (s: [SurahStory]) in s.isEmpty }) { (s: [SurahStory]) in
                if let st = s.first(where: { $0.number == key }) { SurahStoryView(story: st).quranTitle(st.name) }
                else { EmptyStateView(title: pendingTitle) }
            })
        case (3, "hifz-path") where c[1] == "c":
            let key = id(2)
            return AnyView(hifzLoader { paths in
                let rows = paths.filter { $0.category == key }
                if rows.isEmpty { EmptyStateView(title: pendingTitle) }
                else { HifzPathsListView(paths: rows).quranTitle(PublishedAdapters.hifzCategories[key] ?? key) }
            })
        case (3, "hifz-path") where c[1] == "p", (5, "hifz-path") where c[1] == "p" && c[3] == "u":
            let slug = id(2), unitId = c.count == 5 ? id(4) : nil
            return AnyView(hifzLoader { paths in
                if let p = paths.first(where: { $0.slug == slug }) {
                    if let uid = unitId {
                        if let u = p.units.first(where: { $0.id == uid }) { HifzUnitView(unit: u, surahNames: surahNames()).quranTitle(u.title) }
                        else { EmptyStateView(title: pendingTitle) }
                    } else { HifzPathView(path: p) }
                } else { EmptyStateView(title: pendingTitle) }
            })
        default:
            return nil
        }
    }

    @MainActor private static func hifzLoader<V: View>(@ViewBuilder _ content: @escaping ([HifzPath]) -> V) -> some View {
        QuranBundledLoader(name: "hifz-paths", isEmpty: { (p: [HifzPath]) in p.isEmpty }, content: content)
    }
}

extension View {
    /// عنوان صغير موحّد لكل شاشات القرآن (بدل خلطٍ بين الكبير والمضمَّن).
    func quranTitle(_ title: String) -> some View {
        #if os(iOS)
        navigationTitle(title).navigationBarTitleDisplayMode(.inline)
        #else
        navigationTitle(title)
        #endif
    }
}
