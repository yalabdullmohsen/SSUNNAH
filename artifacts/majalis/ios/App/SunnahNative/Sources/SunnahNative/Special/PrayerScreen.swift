import SwiftUI
import SunnahPrayer

/// شاشة المواقيت (النموذج ٢): بطاقة خضراء ← الأوقات الست في بطاقة واحدة مع تنبيه لكل صلاة ← القبلة وطريقة الحساب.
/// الحساب والجدولة من محرك SunnahPrayer كما هما؛ هنا عرض فقط وحفظ خيار التنبيه عبر المخزن الموجود.
public struct PrayerScreen: View {
    @StateObject private var store = PrayerPreferencesStore()
    @State private var options = PrayerNotificationOptions.read()
    @State private var showCityPicker = false
    @State private var locating = false
    @State private var locateError: String?
    @Environment(\.openRoute) private var openRoute
    public init() {}

    public var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { ctx in
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    SunnahPageTitle("الصلاة")
                    hero(now: ctx.date)
                    timesCard(now: ctx.date)
                    HStack(spacing: 14) { qiblaTile; locationTile }.padding(.horizontal, Sunnah.Spacing.pageX)
                    methodGroup
                    if let locateError {
                        Text(locateError).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                            .padding(.horizontal, Sunnah.Spacing.pageX)
                    }
                    SunnahContentFooter(title: "الصلاة", id: "prayer", section: "الصلاة", inset: false)
                }
                .padding(.bottom, 96)
            }
        }
        .background(Sunnah.Colors.bg)
        .sunnahRootChrome()
        .fullScreenCover(isPresented: $showCityPicker) { CityPickerView(store: store, onUseDeviceLocation: refreshDeviceLocation) }
        .task { if store.preferences.usesDeviceLocation { refreshDeviceLocation() } }
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahReadableWidth()
    }

    private func hero(now: Date) -> some View {
        let prefs = store.preferences
        let zone = prefs.location.timeZone
        let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings)
        return SunnahHeroCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                if let next {
                    // عند أحجام الخط الكبيرة (AX) لا يتسع العمودان جنبًا لجنب فيتّسع الـHStack خارج الشاشة؛ نرصّهما رأسيًا
                    ViewThatFits(in: .horizontal) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("الصلاة القادمة").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                                Text(next.prayer.nameAr).font(AppearancePrefs.ui(.extraBold, 40, .largeTitle)).foregroundStyle(.white)
                            }
                            Spacer(minLength: 8)
                            VStack(alignment: .trailing, spacing: 6) {
                                Text(PrayerTimeFormat.clock(next.time, in: zone)).font(AppearancePrefs.ui(.extraBold, 28, .title)).foregroundStyle(.white)
                                SunnahHeroCapsule(HomeScreen.remaining(next.time.timeIntervalSince(now)))
                            }
                        }
                        VStack(alignment: .leading, spacing: 12) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("الصلاة القادمة").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                            Text(next.prayer.nameAr).font(AppearancePrefs.ui(.extraBold, 40, .largeTitle)).foregroundStyle(.white)
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            Text(PrayerTimeFormat.clock(next.time, in: zone)).font(AppearancePrefs.ui(.extraBold, 28, .title)).foregroundStyle(.white)
                            SunnahHeroCapsule(HomeScreen.remaining(next.time.timeIntervalSince(now)))
                        }
                        }
                    }
                    Divider().overlay(Color.white.opacity(0.25))
                    HStack(alignment: .firstTextBaseline) {
                        Text(SunnahClockFormat.countdown(next.time.timeIntervalSince(now)))
                            .font(.system(size: 44, weight: .heavy, design: .rounded)).monospacedDigit()
                            .foregroundStyle(Sunnah.Colors.heroGold).minimumScaleFactor(0.6).lineLimit(1)
                            .environment(\.layoutDirection, .leftToRight)
                        Spacer(minLength: 8)
                        Text(HomeScreen.hijriDate(now)).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(.white.opacity(0.85))
                    }
                } else {
                    Text("تعذّر حساب المواقيت لهذا الموقع").font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(.white)
                }
            }
        }
        .accessibilityElement(children: .combine)
    }

    private func timesCard(now: Date) -> some View {
        let prefs = store.preferences
        let zone = prefs.location.timeZone
        let today = PrayerCalculator.times(for: prefs.location, on: now, settings: prefs.settings)
        let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings)
        let symbols: [Prayer: String] = [.fajr: "sunrise", .sunrise: "sun.max", .dhuhr: "sun.max.fill", .asr: "sun.haze", .maghrib: "sunset", .isha: "moon"]
        return VStack(spacing: 10) {
            if let today {
                ForEach(today.ordered, id: \.prayer) { item in
                    let isNext = item.prayer == next?.prayer
                    let past = item.time < now && !isNext
                    HStack(spacing: 12) {
                        SunnahIconTile(symbols[item.prayer] ?? "clock", tone: isNext ? .mint : .gold, size: 40).opacity(past ? 0.55 : 1)
                        Text(item.prayer.nameAr).font(AppearancePrefs.ui(isNext ? .extraBold : .bold, 17, .body))
                            .foregroundStyle(isNext ? Sunnah.Colors.primary : Sunnah.Colors.textPrimary)
                            .lineLimit(1).minimumScaleFactor(0.6).opacity(past ? 0.55 : 1)
                        Spacer(minLength: 4)
                        Text(PrayerTimeFormat.clock(item.time, in: zone)).font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                            .lineLimit(1).minimumScaleFactor(0.6).layoutPriority(1).opacity(past ? 0.55 : 1)
                        if item.prayer.isObligatory {
                            SunnahSwitch(isOn: alertBinding(item.prayer)).accessibilityLabel("تنبيه \(item.prayer.nameAr)")
                                .fixedSize()
                        } else {
                            Color.clear.frame(width: 48, height: 28).accessibilityHidden(true)
                        }
                    }
                    // الصف يحوي أيقونة ومفتاحًا بحجمين ثابتين: سقف الخط يمنع فيضه خارج الشاشة عند AX
                    .dynamicTypeSize(...DynamicTypeSize.accessibility2)
                    .padding(.horizontal, 14).frame(minHeight: 64)
                    .background(isNext ? Sunnah.Colors.primarySoft : Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).stroke(isNext ? Sunnah.Colors.primary : Sunnah.Colors.border, lineWidth: isNext ? 1.5 : 1))
                    .accessibilityElement(children: .contain)
                }
            } else {
                SunnahMessageState(symbol: "location.slash", title: "تعذّر حساب المواقيت لهذا الموقع")
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    private func alertBinding(_ p: Prayer) -> Binding<Bool> {
        Binding(get: { options.enabledPrayers.contains(p) }, set: { on in
            if on { options.enabledPrayers.insert(p) } else { options.enabledPrayers.remove(p) }
            options.save()
            Task { await NativeNotifications.rescheduleAll() }
        })
    }

    private var qiblaTile: some View {
        Button { openRoute("/qibla") } label: { SunnahTile(title: "القبلة", subtitle: "البوصلة", symbol: "location.north.line") }
            .buttonStyle(.plain).sunnahPressable()
    }

    private var locationTile: some View {
        Button { showCityPicker = true } label: {
            SunnahTile(title: "الموقع", subtitle: locating ? "جارٍ التحديد…" : store.preferences.location.label,
                       symbol: store.preferences.usesDeviceLocation ? "location.fill" : "building.2", tone: .gold)
        }.buttonStyle(.plain).sunnahPressable()
    }

    private var methodGroup: some View {
        SunnahSettingsGroup("طريقة الحساب") {
            SunnahSettingsRow("الطريقة", symbol: "function") {
                Menu {
                    ForEach(PrayerMethod.allCases, id: \.self) { m in Button(m.nameAr) { store.preferences.settings.method = m } }
                } label: { menuLabel(store.preferences.settings.method.nameAr) }
            }
            SunnahSettingsRow("العصر", symbol: "sun.haze", isLast: true) {
                Menu {
                    Button("الجمهور (المثل)") { store.preferences.settings.madhab = .shafi }
                    Button("الحنفي (المثلان)") { store.preferences.settings.madhab = .hanafi }
                } label: { menuLabel(store.preferences.settings.madhab == .shafi ? "الجمهور (المثل)" : "الحنفي (المثلان)") }
            }
        }
    }

    private func menuLabel(_ text: String) -> some View {
        HStack(spacing: 6) {
            Text(text).font(AppearancePrefs.ui(.bold, 14, .subheadline))
            Image(systemName: "chevron.up.chevron.down").font(.system(size: 11, weight: .semibold))
        }
        .foregroundStyle(Sunnah.Colors.primary).frame(minHeight: 44)
    }

    private func refreshDeviceLocation() {
        guard !locating else { return }
        locating = true; locateError = nil
        Task {
            defer { locating = false }
            do {
                let location = try await DeviceLocator().currentLocation()
                store.preferences.location = location
                store.preferences.usesDeviceLocation = true
            } catch DeviceLocatorError.denied {
                locateError = "إذن الموقع مرفوض؛ اختر مدينتك من القائمة أو فعّله من الإعدادات."
            } catch {
                locateError = "تعذّر تحديد الموقع الآن؛ تُعرض مواقيت آخر موقع محفوظ."
            }
        }
    }
}
