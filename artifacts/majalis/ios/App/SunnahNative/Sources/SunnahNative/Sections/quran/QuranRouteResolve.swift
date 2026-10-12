import SwiftUI

/// مسارات التفاصيل ذات المعاملات في القرآن: /quran-hub/tajweed/:chapter و/quran/people/:slug و/quran/surah-stories/:number.
/// تُستشار من `SunnahApp.resolve` قبل المولَّد؛ المعرّف المجهول = «قيد التوثيق» لا عنصرًا نائبًا.
extension QuranSection {
    @MainActor public static func resolve(path: String) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        func id(_ i: Int) -> String { c[i].removingPercentEncoding ?? c[i] }
        switch (c.count, c.first) {
        case (3, "quran-hub") where c[1] == "tajweed":
            let key = id(2)
            return AnyView(QuranBundledLoader(name: "tajweed", isEmpty: { (f: TajweedFile) in f.chapters.isEmpty }) { (f: TajweedFile) in
                if let ch = f.chapters.first(where: { $0.id == key }) { TajweedChapterView(chapter: ch).navigationTitle(ch.title) }
                else { EmptyStateView(title: pendingTitle) }
            })
        case (3, "quran") where c[1] == "people":
            let key = id(2)
            return AnyView(QuranPeopleLoader { people in
                if let p = people.first(where: { $0.slug == key }) { QuranPersonView(person: p, surahNames: surahNames()).navigationTitle(p.nameAr) }
                else { EmptyStateView(title: pendingTitle) }
            })
        case (3, "quran") where c[1] == "surah-stories":
            let key = Int(id(2))
            return AnyView(QuranBundledLoader(name: "surah-stories", isEmpty: { (s: [SurahStory]) in s.isEmpty }) { (s: [SurahStory]) in
                if let st = s.first(where: { $0.number == key }) { SurahStoryView(story: st).navigationTitle(st.name) }
                else { EmptyStateView(title: pendingTitle) }
            })
        default:
            return nil
        }
    }
}
