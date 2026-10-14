import Foundation

/// نص النسخ والمشاركة: النص العثماني الحرفي من بيانات Tanzil (لا غليفات QPC ولا رموز الاستعمال الخاص)
/// بصيغة «﴿…﴾ [الكهف: 1]» بأرقام لاتينية.
public enum MushafShare {
    /// اسم السورة بلا «سورة» ولا تشكيل: «سُورَةُ الكَهۡفِ» → «الكهف».
    static func plainSurahName(_ name: String) -> String {
        let bare = String(String.UnicodeScalarView(name.unicodeScalars.filter { !CharacterSet.nonBaseCharacters.contains($0) && $0.value != 0x0640 }))
        return bare.hasPrefix("سورة ") ? String(bare.dropFirst(5)) : bare
    }

    /// المرجع «الكهف: 1».
    public static func reference(_ ayah: String, index: MushafIndex) -> String {
        let p = ayah.split(separator: ":").map(String.init)
        guard p.count == 2, let id = Int(p[0]) else { return ayah }
        let name = index.surahs.first { $0.id == id }.map { plainSurahName($0.name) } ?? ""
        return "\(name): \(p[1])"
    }

    /// «﴿نص الآية﴾ [السورة: رقم]»؛ nil إن لم يتوفر نص الآية (فلا نسخ نص ناقص).
    public static func text(ayah: String, index: MushafIndex, search: MushafSearch?) -> String? {
        guard let t = search?.ayahText(ayah) else { return nil }
        return "﴿\(t)﴾ [\(reference(ayah, index: index))]"
    }
}

/// مسار تفسير آية: `/tafsir/{سورة}:{آية}`.
enum TafsirAyahRoute {
    static func parse(_ path: String) -> (surah: Int, ayah: Int)? {
        let comps = path.split(whereSeparator: { $0 == "?" || $0 == "#" }).first.map(String.init)?.split(separator: "/").map(String.init) ?? []
        guard comps.count == 2, comps[0] == "tafsir" else { return nil }
        let p = comps[1].split(separator: ":").compactMap { Int($0) }
        guard p.count == 2, (1...114).contains(p[0]), p[1] >= 1 else { return nil }
        return (p[0], p[1])
    }
}
