import SwiftUI
import SunnahPrayer

/// طور العد في وضع المسجد (مطابق لـ prayer-phase في الويب): خلال 30 دقيقة بعد دخول الوقت يُعرض «مضى على دخول وقت…».
enum AccountPrayerPhase: Equatable {
    case countdown(prayer: Prayer, at: Date, remaining: TimeInterval)
    case elapsed(prayer: Prayer, since: TimeInterval, next: Prayer?, nextIn: TimeInterval?)

    static let elapsedWindow: TimeInterval = 30 * 60

    /// `slots` مواقيت مرتبة (من المحرك فقط)؛ الشروق مستبعد.
    static func resolve(now: Date, slots: [(prayer: Prayer, time: Date)]) -> AccountPrayerPhase? {
        let obligatory = slots.filter { $0.prayer.isObligatory }.sorted { $0.time < $1.time }
        let next = obligatory.first { $0.time > now }
        if let last = obligatory.last(where: { $0.time <= now }), now.timeIntervalSince(last.time) < elapsedWindow {
            return .elapsed(prayer: last.prayer, since: now.timeIntervalSince(last.time),
                            next: next?.prayer, nextIn: next.map { $0.time.timeIntervalSince(now) })
        }
        guard let next else { return nil }
        return .countdown(prayer: next.prayer, at: next.time, remaining: next.time.timeIntervalSince(now))
    }
}

/// /mosque-mode — عد تنازلي للصلاة القادمة مع تذكير بالصمت واختصارات المسجد.
struct AccountMosqueModeScreen: View {
    @StateObject private var store = PrayerPreferencesStore()
    @Environment(\.openRoute) private var openRoute
    @State private var silenceAlert = !AccountMosqueModeScreen.silenceShown

    /// يُعرض التذكير مرة في كل تشغيل للتطبيق (مقابل sessionStorage في الويب).
    private static var silenceShown = false

    private static let quickLinks: [(path: String, icon: String, label: String)] = [
        ("/quran-hub", "book.closed", "القرآن الكريم"),
        ("/adhkar", "arrow.triangle.2.circlepath", "الأذكار"),
        ("/qibla", "safari", "القبلة"),
        ("/prayer-times", "building.columns", "مواقيت الصلاة"),
        ("/tasbih", "arrow.triangle.2.circlepath", "التسبيح"),
        ("/hadith", "scroll", "حديث يومي")
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s4) {
                if silenceAlert {
                    SunnahCard {
                        HStack(spacing: Sunnah.Spacing.s3) {
                            Image(systemName: "speaker.slash").foregroundStyle(Sunnah.Colors.primary).accessibilityHidden(true)
                            Text("تذكّر إيقاف صوت هاتفك داخل المسجد").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer(minLength: Sunnah.Spacing.s2)
                            Button { silenceAlert = false } label: { Image(systemName: "checkmark").frame(minWidth: Sunnah.Spacing.touch, minHeight: Sunnah.Spacing.touch) }
                                .foregroundStyle(Sunnah.Colors.primary).accessibilityLabel("إغلاق التنبيه")
                        }
                    }
                }

                HStack {
                    Label("وضع المسجد", systemImage: "building.columns").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    Spacer()
                    Button { openRoute("/") } label: { Image(systemName: "xmark").frame(minWidth: Sunnah.Spacing.touch, minHeight: Sunnah.Spacing.touch) }
                        .foregroundStyle(Sunnah.Colors.textSecondary).accessibilityLabel("الخروج من وضع المسجد")
                }

                TimelineView(.periodic(from: .now, by: 1)) { ctx in prayerBox(now: ctx.date) }

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s3), count: 3), spacing: Sunnah.Spacing.s3) {
                    ForEach(Self.quickLinks, id: \.path) { link in
                        Button { openRoute(link.path) } label: {
                            SunnahCard {
                                VStack(spacing: Sunnah.Spacing.s2) {
                                    Image(systemName: link.icon).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                                        .accessibilityHidden(true)
                                    Text(link.label).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                                        .multilineTextAlignment(.center)
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("وضع المسجد")
        .onAppear { Self.silenceShown = true }
    }

    @ViewBuilder
    private func prayerBox(now: Date) -> some View {
        let prefs = store.preferences
        let slots = PrayerCalculator.days(for: prefs.location, from: now.addingTimeInterval(-86_400), count: 3, settings: prefs.settings)
            .flatMap(\.ordered)
        SunnahCard {
            VStack(spacing: Sunnah.Spacing.s2) {
                switch AccountPrayerPhase.resolve(now: now, slots: slots) {
                case let .elapsed(prayer, since, _, nextIn)?:
                    Text("مضى على دخول وقت \(prayer.nameAr)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(ArabicCount.label(Int(since / 60), one: "دقيقة واحدة", two: "دقيقتان", few: "دقائق", many: "دقيقة", genitive: "دقيقة")).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.primary)
                        .monospacedDigit()
                    if let nextIn {
                        Text("الصلاة التالية بعد \(PrayerTimeFormat.countdown(nextIn))")
                            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).monospacedDigit()
                    }
                case let .countdown(prayer, at, remaining)?:
                    Text("الصلاة القادمة").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(prayer.nameAr).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(remaining > 0 ? AccountMosqueModeScreen.countdown(remaining).arabicIndicDigits : "حان الآن")
                        .font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.primary).monospacedDigit()
                    Text(PrayerTimeFormat.clock(at, in: prefs.location.timeZone))
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                case nil:
                    Text("تحديث مواقيت الصلاة…").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            .frame(maxWidth: .infinity)
        }
        .accessibilityElement(children: .combine)
    }

    /// أرقام عربية-هندية للعرض فقط، كما في MosqueModePage على الموقع وكبقية عدّادات الصلاة (PrayerTimeFormat).
    /// س:د:ث، أو د:ث إن قلّ عن ساعة (مطابق لـ formatCountdown في الويب).
    static func countdown(_ interval: TimeInterval) -> String {
        let s = max(0, Int(interval))
        let (h, m, sec) = (s / 3600, s % 3600 / 60, s % 60)
        return h > 0 ? String(format: "%02d:%02d:%02d", h, m, sec) : String(format: "%02d:%02d", m, sec)
    }
}

private extension String {
    var arabicIndicDigits: String {
        String(unicodeScalars.map { s in
            (48...57).contains(s.value) ? Character(Unicode.Scalar(0x0660 + s.value - 48)!) : Character(s)
        })
    }
}
