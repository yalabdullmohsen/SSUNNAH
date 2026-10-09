#if os(iOS)
import CoreLocation
import SwiftUI

/// يقرأ اتجاه الجهاز (الشمال الحقيقي متى توفّر) دون إذن إضافي.
@MainActor
final class HeadingReader: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var heading: Double?
    @Published private(set) var accuracy: Double?
    let available = CLLocationManager.headingAvailable()
    private let manager = CLLocationManager()

    override init() {
        super.init()
        manager.delegate = self
        manager.headingFilter = 1
    }

    func start() { if available { manager.startUpdatingHeading() } }
    func stop() { manager.stopUpdatingHeading() }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        let raw = newHeading.trueHeading >= 0 ? newHeading.trueHeading : newHeading.magneticHeading
        let acc = newHeading.headingAccuracy
        Task { @MainActor in
            self.heading = QiblaMath.smooth(previous: self.heading, next: raw)
            self.accuracy = acc >= 0 ? acc : nil
        }
    }

    nonisolated func locationManagerShouldDisplayHeadingCalibration(_ manager: CLLocationManager) -> Bool { true }
}

/// شاشة القبلة الأصلية: الاتجاه من الموقع المحفوظ للمواقيت، فتعمل دون اتصال.
public struct QiblaScreen: View {
    @StateObject private var store: PrayerPreferencesStore
    @StateObject private var reader = HeadingReader()

    @MainActor
    public init(store: @autoclosure @escaping () -> PrayerPreferencesStore) {
        _store = StateObject(wrappedValue: store())
    }

    @MainActor
    public init() {
        self.init(store: PrayerPreferencesStore())
    }

    public var body: some View {
        let location = store.preferences.location
        let bearing = QiblaMath.bearing(latitude: location.latitude, longitude: location.longitude)
        let degrees = Int(bearing.rounded())
        List {
            Section {
                VStack(spacing: 16) {
                    compass(bearing: bearing)
                        .frame(width: 240, height: 240)
                        .frame(maxWidth: .infinity)
                    Text(status(bearing: bearing))
                        .font(.headline)
                        .multilineTextAlignment(.center)
                }
                .padding(.vertical, 8)
            }
            Section {
                LabeledContent("اتجاه القبلة", value: "\(Self.number(degrees))° من الشمال")
                LabeledContent("الموقع", value: location.label)
                if let acc = reader.accuracy, acc > QiblaMath.accuracyWarn {
                    Text("دقة البوصلة منخفضة؛ حرّك الجهاز على شكل ٨ وابتعد عن المعادن.")
                        .foregroundStyle(.secondary)
                }
            } footer: {
                Text("الاتجاه محسوب من موقع المواقيت المحفوظ؛ غيّره من شاشة الصلاة.")
            }
        }
        .navigationTitle("القبلة")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { reader.start() }
        .onDisappear { reader.stop() }
        .environment(\.layoutDirection, .rightToLeft)
    }

    private static func number(_ value: Int) -> String {
        let f = NumberFormatter()
        f.locale = PrayerTimeFormat.locale
        return f.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    private func status(bearing: Double) -> String {
        guard reader.available else { return "البوصلة غير متاحة؛ اتجه \(Self.number(Int(bearing.rounded())))° من الشمال." }
        guard let heading = reader.heading else { return "جارٍ قراءة البوصلة…" }
        if QiblaMath.isAligned(heading: heading, bearing: bearing) { return "أنت باتجاه القبلة" }
        let delta = QiblaMath.shortestDelta(from: heading, to: bearing)
        let side = delta > 0 ? "يمينًا" : "يسارًا"
        return "استدر \(side) \(Self.number(Int(abs(delta).rounded())))°"
    }

    @ViewBuilder
    private func compass(bearing: Double) -> some View {
        let heading = reader.heading ?? 0
        let aligned = reader.heading.map { QiblaMath.isAligned(heading: $0, bearing: bearing) } ?? false
        ZStack {
            Circle().strokeBorder(.secondary.opacity(0.4), lineWidth: 2)
            Text("ش").font(.caption.bold())
                .offset(y: -104)
                .rotationEffect(.degrees(-heading))
            Image(systemName: "location.north.fill")
                .resizable().scaledToFit()
                .frame(width: 44, height: 120)
                .foregroundStyle(aligned ? Color.green : Color.accentColor)
                .rotationEffect(.degrees(bearing - heading))
                .animation(.easeOut(duration: 0.2), value: heading)
        }
        // البوصلة اتجاه فيزيائي؛ لا تنعكس مع RTL.
        .environment(\.layoutDirection, .leftToRight)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(status(bearing: bearing))
    }
}
#endif
