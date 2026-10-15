import Foundation

/// يحوّل صفحة المصحف إلى موضع قابل للنشر للويدجت (سورة الصفحة وأول آية فيها) دون لمس محرك المصحف.
public enum MushafPositionPublisher {
    /// أول آية تبدأ في الصفحة (الأصغر سورةً ثم آيةً) من جدول `ayahPage` الموجود.
    public static func firstAyah(onPage page: Int, index: MushafIndex) -> (surah: Int, ayah: Int)? {
        var best: (surah: Int, ayah: Int)?
        for (key, p) in index.ayahPage where p == page {
            let c = key.split(separator: ":").compactMap { Int($0) }
            guard c.count == 2 else { continue }
            if best == nil || (c[0], c[1]) < (best!.surah, best!.ayah) { best = (c[0], c[1]) }
        }
        return best
    }

    @discardableResult
    public static func publish(page: Int, index: MushafIndex, to port: SharedDataPublishing) -> Bool {
        let p = Mushaf.clamp(page)
        let first = firstAyah(onPage: p, index: index)
        let surah = first.flatMap { f in index.surahs.first { $0.id == f.surah } } ?? index.surah(onPage: p)
        return port.publishMushafPosition(page: p, surahNumber: surah?.id, surahName: surah?.name, ayahNumber: first?.ayah)
    }
}
