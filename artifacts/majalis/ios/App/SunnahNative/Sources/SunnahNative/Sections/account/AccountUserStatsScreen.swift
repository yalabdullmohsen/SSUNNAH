import SwiftUI

/// صفوف Supabase التي تبني إحصاءات المستخدم (كما في user-profile-service).
struct AccountBookmarkRow: Decodable, Sendable { let id: AccountAnyID; let contentType: String?
    enum CodingKeys: String, CodingKey { case id; case contentType = "content_type" } }
struct AccountAchievementRow: Decodable, Sendable { let achievementKey: String; let title: String?; let earnedAt: String?
    enum CodingKeys: String, CodingKey { case title; case achievementKey = "achievement_key"; case earnedAt = "earned_at" } }
struct AccountRegistrationRow: Decodable, Sendable { let lessonId: AccountAnyID?
    enum CodingKeys: String, CodingKey { case lessonId = "lesson_id" } }
struct AccountResumeRow: Decodable, Sendable, Identifiable {
    struct Position: Decodable, Sendable { let pct: Double?; let section: String? }
    let contentType: String
    let contentId: AccountAnyID
    let contentTitle: String
    let contentURL: String
    let position: Position?
    var id: String { contentType + "-" + contentId.value }
    enum CodingKeys: String, CodingKey {
        case position
        case contentType = "content_type", contentId = "content_id", contentTitle = "content_title", contentURL = "content_url"
    }
}

/// معرّف نصي أو رقمي.
struct AccountAnyID: Decodable, Hashable, Sendable {
    let value: String
    init(_ value: String) { self.value = value }
    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let i = try? c.decode(Int.self) { value = String(i) } else { value = try c.decode(String.self) }
    }
}

/// المستوى ونقاط الخبرة (مطابق لـ lib/user-badges.ts).
struct AccountUserLevel: Equatable {
    let level: Int
    let title: String
    let xp: Int
    let nextLevelXp: Int

    static let thresholds = [0, 500, 1_500, 3_000, 6_000]
    static let titles = ["طالب مبتدئ", "طالب علم", "حافظ", "طالب جاد", "مجاز"]

    static func xp(completedLessons: Int, booksRead: Int, streakDays: Int, tasbihLifetime: Int, savedItems: Int, badgesEarned: Int, recitationVerses: Int = 0) -> Int {
        completedLessons * 100 + booksRead * 200 + min(streakDays, 365) * 10 + (tasbihLifetime / 100) * 2
            + savedItems * 5 + badgesEarned * 50 + recitationVerses * 3
    }

    init(xp: Int) {
        var level = 0
        for i in 1..<Self.thresholds.count {
            if xp >= Self.thresholds[i] { level = i } else { break }
        }
        self.level = level + 1
        self.title = Self.titles[level]
        self.xp = xp
        self.nextLevelXp = Self.thresholds[min(level + 1, Self.thresholds.count - 1)]
    }

    var fraction: Double { nextLevelXp > 0 ? min(1, Double(xp) / Double(nextLevelXp)) : 1 }
}

struct AccountUserStats: Equatable {
    var completedLessons = 0
    var booksRead = 0
    var savedItems = 0
    var streakDays = 0
    var tasbihToday = 0
    var tasbihLifetime = 0
    var earnedKeys: [String] = []

    init() {}

    init(bookmarks: [AccountBookmarkRow], achievements: [AccountAchievementRow], registrations: [AccountRegistrationRow]) {
        completedLessons = registrations.count
        savedItems = bookmarks.count
        booksRead = bookmarks.filter { $0.contentType == "book" }.count
        earnedKeys = achievements.map(\.achievementKey)
    }

    var level: AccountUserLevel {
        AccountUserLevel(xp: AccountUserLevel.xp(completedLessons: completedLessons, booksRead: booksRead, streakDays: streakDays,
                                                 tasbihLifetime: tasbihLifetime, savedItems: savedItems, badgesEarned: earnedKeys.count))
    }
}

/// /stats — إحصائياتي: المستوى والإحصاءات والشارات و«تابع من حيث توقفت» لحساب المستخدم.
struct AccountUserStatsScreen: View {
    @Environment(\.contentLoader) private var loader
    @Environment(\.platform) private var platform
    @Environment(\.openRoute) private var openRoute
    @State private var session: AccountSession?
    @State private var phase: AccountLoadPhase<(AccountUserStats, [AccountResumeRow])> = .loading

    private static let resumeTypeLabel = ["lesson": "درس", "book": "كتاب", "article": "مقال", "path": "مسار", "hadith": "حديث", "fatwa": "فتوى"]

    var body: some View {
        Group {
            if case .ready = phase, session == nil {
                loginPrompt
            } else {
                switch phase {
                case .loading: LoadingStateView()
                case .failed: ErrorStateView { Task { await load() } }
                case .ready(let value): content(value.0, resume: value.1)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .navigationTitle("إحصائياتي")
        .task { await load() }
    }

    private var loginPrompt: some View {
        VStack(spacing: Sunnah.Spacing.s4) {
            Image(systemName: "lock").font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
            Text("سجّل الدخول لعرض ملفك الشخصي وإنجازاتك.").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                .multilineTextAlignment(.center)
            SunnahButton("تسجيل الدخول", style: .secondary) { openRoute("/login?next=/profile") }
        }
        .padding(Sunnah.Spacing.pageX)
    }

    private func content(_ stats: AccountUserStats, resume: [AccountResumeRow]) -> some View {
        let level = stats.level
        let earned = Set(stats.earnedKeys)
        let name = session?.displayName ?? "المستخدم"
        return ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "ملفك الشخصي", title: "أهلاً، \(name)", subtitle: "إنجازاتك ومستواك وتقدمك في سُنّة.")

                SunnahCard {
                    HStack(spacing: Sunnah.Spacing.s3) {
                        Text(String(name.prefix(1))).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textOnPrimary)
                            .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                            .background(Sunnah.Colors.primary, in: Circle()).accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                            Text(name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            SunnahChip(level.title)
                        }
                        Spacer(minLength: Sunnah.Spacing.s2)
                        VStack(spacing: Sunnah.Spacing.s1) {
                            Text("\(stats.streakDays)").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                            Text("يوم متواصل").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                }

                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        HStack {
                            Text(level.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer()
                            Text("\(level.xp.formatted()) / \(level.nextLevelXp.formatted()) XP").font(Sunnah.Typography.tag)
                                .foregroundStyle(Sunnah.Colors.textSecondary).monospacedDigit()
                        }
                        AccountProgressBar(fraction: level.fraction)
                        HStack {
                            Text("المستوى \(level.level)")
                            Spacer()
                            Text("\(Int((level.fraction * 100).rounded()))٪")
                        }
                        .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }

                Text("إحصاءاتك").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                AccountTileGrid(items: [
                    AccountStatCard(value: "\(stats.streakDays)", label: "أيام متواصلة", sub: nil),
                    AccountStatCard(value: "\(stats.completedLessons)", label: "دروس مكتملة", sub: nil),
                    AccountStatCard(value: "\(stats.booksRead)", label: "كتب مقروءة", sub: nil),
                    AccountStatCard(value: stats.tasbihToday.formatted(), label: "تسبيحات اليوم", sub: "\(stats.tasbihLifetime.formatted()) إجمالي"),
                    AccountStatCard(value: "\(stats.savedItems)", label: "محفوظات", sub: nil),
                    AccountStatCard(value: "\(stats.earnedKeys.count)", label: "شارات محرزة", sub: "من \(AccountTexts.badges.count)")
                ]) { AccountStatTile(value: $0.value, label: $0.label, sub: $0.sub) }

                if !resume.isEmpty {
                    AccountSectionCard(title: "تابع من حيث توقفت") {
                        ForEach(resume) { item in
                            Button { openRoute(item.contentURL) } label: {
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                    SunnahListRow(title: item.contentTitle,
                                                  subtitle: [Self.resumeTypeLabel[item.contentType] ?? item.contentType, item.position?.section]
                                                    .compactMap { $0 }.joined(separator: " · "))
                                    if let pct = item.position?.pct { AccountProgressBar(fraction: pct / 100) }
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                AccountSectionCard(title: "الإنجازات والشارات") {
                    Text("\(stats.earnedKeys.count) من \(AccountTexts.badges.count) شارة محرزة")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    ForEach(badgeGroups, id: \.0) { category, defs in
                        Text(AccountBadgeDef.categoryLabels[category] ?? category).font(Sunnah.Typography.cardTitle)
                            .foregroundStyle(Sunnah.Colors.textPrimary)
                        AccountTileGrid(items: defs) { def in
                            let isEarned = earned.contains(def.key)
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                Image(systemName: isEarned ? "rosette" : "lock").foregroundStyle(isEarned ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                                    .accessibilityHidden(true)
                                Text(def.title).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                                if !isEarned {
                                    Text(def.description).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(Sunnah.Spacing.s3)
                            .background(isEarned ? Sunnah.Colors.primarySoft : Sunnah.Colors.surface2, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                            .accessibilityElement(children: .combine)
                            .accessibilityLabel("\(def.title)، \(def.description)")
                        }
                    }
                }

                AccountSectionCard(title: "روابط الملف") {
                    AccountLinkRow(title: "الدروس", path: "/lessons")
                    AccountLinkRow(title: "البطاقات", path: "/my-learning#flashcards")
                    AccountLinkRow(title: "التسبيح", path: "/tasbih")
                    AccountLinkRow(title: "الأذكار", path: "/adhkar")
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
    }

    /// الشارات مجمّعة بالفئة بترتيب ظهورها الأول (كما في BadgeGrid).
    private var badgeGroups: [(String, [AccountBadgeDef])] {
        var order: [String] = []
        var groups: [String: [AccountBadgeDef]] = [:]
        for b in AccountTexts.badges {
            if groups[b.category] == nil { order.append(b.category) }
            groups[b.category, default: []].append(b)
        }
        return order.map { ($0, groups[$0] ?? []) }
    }

    @MainActor private func load() async {
        phase = .loading
        let current = AccountSession.read(from: platform.auth)
        session = current
        guard let session = current else { phase = .ready((AccountUserStats(), [])); return }
        do {
            async let bookmarks = loader.load([AccountBookmarkRow].self, from: AccountEndpoints.bookmarks(userId: session.userId))
            async let achievements = loader.load([AccountAchievementRow].self, from: AccountEndpoints.achievements(userId: session.userId))
            async let registrations = loader.load([AccountRegistrationRow].self, from: AccountEndpoints.completedLessons(userId: session.userId))
            let stats = try await AccountUserStats(bookmarks: bookmarks, achievements: achievements, registrations: registrations)
            let resume = (try? await loader.load([AccountResumeRow].self, from: AccountEndpoints.resume(userId: session.userId))) ?? []
            phase = .ready((stats, resume))
        } catch {
            phase = .failed
        }
    }
}
