import SwiftUI

#if DEBUG
/// لقطات التدقيق فقط (Debug): `-tasmeeSnapshotView reminder|share` يعرض ورقة التذكير (مفتاح مفعّل + صف الوقت ±١٥ د) أو بطاقة المشاركة
/// ببيانات ثابتة معروفة، بلا لمس التخزين ولا الجدولة. لا أثر في Release.
struct TasmeeSnapshotScreen: View {
    let kind: String
    @State private var on = true
    @State private var minutes = 315   // ٠٥:١٥ ص

    static var requested: String? {
        guard let k = UserDefaults.standard.string(forKey: "tasmeeSnapshotView"), ["reminder", "share"].contains(k) else { return nil }
        return k
    }

    static let sample = TasmeeSessionRecord(
        id: UUID(uuidString: "00000000-0000-0000-0000-000000000001")!, startedAt: Date(timeIntervalSince1970: 1_760_000_000),
        durationSec: 300, mode: .recite, surah: 1, fromAyah: 1, toAyah: 7, totalWords: 29,
        events: [
            TasmeeSessionEvent(surah: 1, ayah: 2, wordIndex: 2, kind: .wrong, said: "الرحمن", expected: "رَبِّ"),
            TasmeeSessionEvent(surah: 1, ayah: 4, wordIndex: 1, kind: .skipped, expected: "يَوْمِ"),
            TasmeeSessionEvent(surah: 1, ayah: 6, wordIndex: 0, kind: .extra, said: "اهدنا"),
        ])

    var body: some View {
        Group {
            if kind == "share" {
                TasmeeShareCard(record: Self.sample, surahName: "الفاتحة").padding(.top, 60).frame(maxHeight: .infinity, alignment: .top)
            } else {
                TasmeeReminderSheet(on: $on, minutes: $minutes)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg.ignoresSafeArea())
        .environment(\.layoutDirection, .rightToLeft)
        .accessibilityIdentifier(ScreenState.ready)
        .task { SnapshotReadiness().begin(route: "/tasmee-snapshot/\(kind)") }
    }
}
#endif
