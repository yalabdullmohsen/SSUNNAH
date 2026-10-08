import SwiftUI

/// تنسيق الوقت بمنطقة الموقع لا بمنطقة الجهاز.
public enum PrayerTimeFormat {
    /// أرقام عربية صراحةً؛ لا تتبع افتراض «ar» المتغيّر بين إصدارات النظام.
    static let locale = Locale(identifier: "ar@numbers=arab")

    public static func clock(_ date: Date, in timeZone: TimeZone) -> String {
        let f = DateFormatter()
        f.locale = locale
        f.timeZone = timeZone
        f.setLocalizedDateFormatFromTemplate("hmm")
        return f.string(from: date)
    }

    /// المتبقي بصيغة س:د:ث.
    public static func countdown(_ interval: TimeInterval) -> String {
        let total = max(0, Int(interval.rounded(.down)))
        let f = NumberFormatter()
        f.locale = locale
        f.minimumIntegerDigits = 2
        let parts = [total / 3600, total % 3600 / 60, total % 60].map { f.string(from: NSNumber(value: $0)) ?? "\($0)" }
        return parts.joined(separator: ":")
    }
}

/// شاشة المواقيت الأصلية: تحسب محليًا فتعمل دون اتصال.
public struct PrayerTimesScreen: View {
    @StateObject private var store: PrayerPreferencesStore
    @State private var showCityPicker = false
    @State private var locating = false
    @State private var locateError: String?

    @MainActor
    public init(store: @autoclosure @escaping () -> PrayerPreferencesStore) {
        _store = StateObject(wrappedValue: store())
    }

    @MainActor
    public init() {
        self.init(store: PrayerPreferencesStore())
    }

    public var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            content(now: context.date)
        }
        .navigationTitle("مواقيت الصلاة")
        .sheet(isPresented: $showCityPicker) {
            CityPickerView(store: store, onUseDeviceLocation: refreshDeviceLocation)
        }
        .task { if store.preferences.usesDeviceLocation { refreshDeviceLocation() } }
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private func content(now: Date) -> some View {
        let prefs = store.preferences
        let tz = prefs.location.timeZone
        let today = PrayerCalculator.times(for: prefs.location, on: now, settings: prefs.settings)
        let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings)
        List {
            if let next {
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("الصلاة القادمة: \(next.prayer.nameAr)").font(.headline)
                        Text(PrayerTimeFormat.countdown(next.time.timeIntervalSince(now)))
                            .font(.system(.largeTitle, design: .rounded).monospacedDigit())
                            .accessibilityLabel("متبقٍّ \(PrayerTimeFormat.countdown(next.time.timeIntervalSince(now)))")
                    }
                    .padding(.vertical, 4)
                }
            }
            Section {
                if let today {
                    ForEach(today.ordered, id: \.prayer) { item in
                        HStack {
                            Text(item.prayer.nameAr)
                                .fontWeight(item.time == next?.time ? .bold : .regular)
                            Spacer()
                            Text(PrayerTimeFormat.clock(item.time, in: tz)).monospacedDigit()
                        }
                        .foregroundStyle(item.prayer.isObligatory ? .primary : .secondary)
                        .accessibilityElement(children: .combine)
                    }
                } else {
                    Text("تعذّر حساب المواقيت لهذا الموقع")
                }
            } header: {
                Text(today?.dayKey ?? "")
            }
            Section("الموقع") {
                Button {
                    showCityPicker = true
                } label: {
                    HStack {
                        Label(prefs.location.label, systemImage: prefs.usesDeviceLocation ? "location.fill" : "building.2")
                        Spacer()
                        if locating { ProgressView() }
                    }
                }
                if let locateError { Text(locateError).font(.footnote).foregroundStyle(.secondary) }
            }
            Section("طريقة الحساب") {
                Picker("الطريقة", selection: $store.preferences.settings.method) {
                    ForEach(PrayerMethod.allCases, id: \.self) { Text($0.nameAr).tag($0) }
                }
                Picker("العصر", selection: $store.preferences.settings.madhab) {
                    Text("الجمهور (المثل)").tag(PrayerMadhab.shafi)
                    Text("الحنفي (المثلان)").tag(PrayerMadhab.hanafi)
                }
            }
        }
    }

    private func refreshDeviceLocation() {
        guard !locating else { return }
        locating = true
        locateError = nil
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

/// اختيار المدينة: بحث في المدن المضمّنة دون اتصال، أو موقع الجهاز.
struct CityPickerView: View {
    @ObservedObject var store: PrayerPreferencesStore
    let onUseDeviceLocation: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                Button {
                    onUseDeviceLocation()
                    dismiss()
                } label: {
                    Label("استخدام موقعي الحالي", systemImage: "location")
                }
                ForEach(ReferenceCities.search(query), id: \.label) { city in
                    Button {
                        store.preferences.location = city
                        store.preferences.usesDeviceLocation = false
                        dismiss()
                    } label: {
                        HStack {
                            Text(city.label).foregroundStyle(.primary)
                            Spacer()
                            if !store.preferences.usesDeviceLocation && store.preferences.location == city {
                                Image(systemName: "checkmark").accessibilityLabel("المختارة")
                            }
                        }
                    }
                }
            }
            .searchable(text: $query, prompt: "ابحث عن مدينة")
            .navigationTitle("اختر المدينة")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("إغلاق") { dismiss() } }
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }
}

extension PrayerMethod {
    /// الأسماء كما في إعدادات الويب.
    public var nameAr: String {
        switch self {
        case .kuwait: return "الكويت"
        case .ummAlQura: return "أم القرى"
        case .muslimWorldLeague: return "رابطة العالم الإسلامي"
        case .egyptian: return "الهيئة المصرية"
        case .northAmerica: return "أمريكا الشمالية (ISNA)"
        case .karachi: return "كراتشي"
        case .dubai: return "دبي"
        case .turkey: return "تركيا (ديانت)"
        case .qatar: return "قطر"
        case .singapore: return "سنغافورة"
        case .tehran: return "طهران"
        case .franceUOIF: return "فرنسا (UOIF)"
        case .moonsightingCommittee: return "لجنة رؤية الهلال"
        }
    }
}
