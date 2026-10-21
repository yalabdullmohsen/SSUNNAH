import SwiftUI

struct TilawaReciter: Decodable, Identifiable, Hashable, Sendable { let id: String; let nameAr: String; let order: Int }

/// /quran-hub/tilawa — القرّاء المُحقَّقون؛ الصوت من surah-reciters.json بالمعرّف نفسه، ولا نص قرآني هنا.
struct TilawaListView: View {
    let reciters: [TilawaReciter]
    var body: some View {
        ScrollView { LazyVStack(spacing: 0) {
            SunnahNavTileGrid(reciters.sorted { $0.order < $1.order }, idPrefix: "tilawa", padded: false,
                              tile: { SunnahTileItem(id: "\($0.id)", title: $0.nameAr, subtitle: "تلاوة كاملة بصوته", symbol: "waveform") }) { TilawaSurahListView(reciter: $0) }
        }.padding(.horizontal, Sunnah.Spacing.s4) }
        .background(Sunnah.Colors.bg)
    }
}

private struct SurahNo: Identifiable { let id: Int }

struct TilawaSurahListView: View {
    let reciter: TilawaReciter
    var surahNames: [Int: String] = QuranSection.surahNames()
    var audio: SurahReciter? { SurahReciter.bundled().first { $0.id == reciter.id } }
    var body: some View {
        Group {
            if let audio {
                ScrollView { LazyVStack(spacing: 0) {
                    SunnahNavTileGrid((1...114).map { SurahNo(id: $0) }, idPrefix: "tilawa.surah", padded: false,
                                      tile: { SunnahTileItem(id: "\($0.id)", title: surahNames[$0.id] ?? "سورة \($0.id)", subtitle: "سورة رقم \($0.id)", symbol: "play.circle") }) { s in
                        let n = s.id
                        AudioPlayerTemplate(item: ContentItem(id: "\(reciter.id)-\(n)", title: surahNames[n] ?? "سورة \(n)", subtitle: reciter.nameAr, audioURL: audio.surahURL(n)))
                            .quranTitle(surahNames[n] ?? "سورة \(n)")
                    }
                }.padding(.horizontal, Sunnah.Spacing.s4) }
            } else { EmptyStateView(title: "لا صوت متاح لهذا القارئ") }
        }
        .background(Sunnah.Colors.bg).quranTitle(reciter.nameAr)
    }
}

struct QuranCircle: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let name: String
    let sheikh_name: String?
    let level: String?
    let track: String?
    let mode: String?
    let meeting_link: String?
    let location: String?
    let schedule_days: [String]?
    let schedule_time: String?
    let capacity: Int?
    let enrolled_count: Int?
    let description: String?
    let contact_info: String?
    let registration_url: String?
    let website_url: String?
    let governorate: String?

    private enum CodingKeys: String, CodingKey {
        case id, name, sheikh_name, level, track, mode, meeting_link, location, schedule_days, schedule_time, capacity, enrolled_count, description, contact_info, registration_url, website_url, governorate
    }
    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        if let s = try? c.decode(String.self, forKey: .id) { id = s } else { id = String((try? c.decode(Int.self, forKey: .id)) ?? 0) }
        name = try c.decode(String.self, forKey: .name)
        sheikh_name = try? c.decodeIfPresent(String.self, forKey: .sheikh_name)
        level = try? c.decodeIfPresent(String.self, forKey: .level)
        track = try? c.decodeIfPresent(String.self, forKey: .track)
        mode = try? c.decodeIfPresent(String.self, forKey: .mode)
        meeting_link = try? c.decodeIfPresent(String.self, forKey: .meeting_link)
        location = try? c.decodeIfPresent(String.self, forKey: .location)
        schedule_days = try? c.decodeIfPresent([String].self, forKey: .schedule_days)
        schedule_time = try? c.decodeIfPresent(String.self, forKey: .schedule_time)
        capacity = try? c.decodeIfPresent(Int.self, forKey: .capacity)
        enrolled_count = try? c.decodeIfPresent(Int.self, forKey: .enrolled_count)
        description = try? c.decodeIfPresent(String.self, forKey: .description)
        contact_info = try? c.decodeIfPresent(String.self, forKey: .contact_info)
        registration_url = try? c.decodeIfPresent(String.self, forKey: .registration_url)
        website_url = try? c.decodeIfPresent(String.self, forKey: .website_url)
        governorate = try? c.decodeIfPresent(String.self, forKey: .governorate)
    }

    var facts: [(String, String)] {
        [("الشيخ", sheikh_name), ("المستوى", level), ("المسار", track), ("النمط", mode), ("المكان", location), ("المحافظة", governorate),
         ("الأيام", schedule_days.map { $0.joined(separator: "، ") }), ("الوقت", schedule_time),
         ("المقاعد", capacity.map { c in "\(enrolled_count ?? 0) / \(c)" }), ("التواصل", contact_info)]
            .compactMap { k, v in (v?.isEmpty == false) ? (k, v!) : nil }
    }
    var links: [(String, URL)] {
        [("التسجيل", registration_url), ("الموقع", website_url), ("رابط اللقاء", meeting_link)]
            .compactMap { k, v in v.flatMap { URL(string: $0) }.map { (k, $0) } }
    }
}

/// /quran-circles — حلقات التحفيظ المعتمدة والنشطة كما يعرضها الموقع.
struct QuranCirclesListView: View {
    let circles: [QuranCircle]
    var body: some View {
        ScrollView { LazyVStack(spacing: 0) {
            SunnahNavTileGrid(circles, idPrefix: "circle", padded: false,
                              tile: { SunnahTileItem(id: $0.id, title: $0.name, subtitle: $0.sheikh_name, symbol: "person.2") }) { QuranCircleDetailView(circle: $0) }
        }.padding(.horizontal, Sunnah.Spacing.s4) }
        .background(Sunnah.Colors.bg)
    }
}

struct QuranCircleDetailView: View {
    let circle: QuranCircle
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
            DetailHero(title: circle.name)
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                if let d = circle.description, !d.isEmpty { Text(d).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                ForEach(circle.facts, id: \.0) { k, v in
                    HStack(alignment: .top) {
                        Text(k).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        Spacer()
                        Text(v).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    }
                }
                ForEach(circle.links, id: \.0) { k, u in Link(k, destination: u).font(Sunnah.Typography.body) }
            }
            .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .background(Sunnah.Colors.bg).heroTitledNavigation(circle.name)
    }
}
