import SwiftUI
import CoreLocation

/// القبلة: اتجاه الكعبة بالدائرة العظمى من موقع المحرك المرسَل، مع بوصلة الساعة. عرض فقط.
@MainActor
final class QiblaModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var heading: Double?
    private let mgr = CLLocationManager()
    override init() { super.init(); mgr.delegate = self }
    func start() {
        mgr.requestWhenInUseAuthorization()
        if CLLocationManager.headingAvailable() { mgr.startUpdatingHeading() }
    }
    func stop() { mgr.stopUpdatingHeading() }
    nonisolated func locationManager(_ m: CLLocationManager, didUpdateHeading h: CLHeading) {
        let v = h.trueHeading >= 0 ? h.trueHeading : h.magneticHeading
        Task { @MainActor in self.heading = v }
    }

    static let kaaba = (lat: 21.4225, lon: 39.8262)
    /// السمت الابتدائي بالدرجات من الشمال.
    static func bearing(lat: Double, lon: Double) -> Double {
        let φ1 = lat * .pi / 180, φ2 = kaaba.lat * .pi / 180, Δλ = (kaaba.lon - lon) * .pi / 180
        let y = sin(Δλ) * cos(φ2)
        let x = cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(Δλ)
        return (atan2(y, x) * 180 / .pi + 360).truncatingRemainder(dividingBy: 360)
    }
}

struct QiblaView: View {
    @EnvironmentObject private var store: WatchStore
    @StateObject private var model = QiblaModel()

    var body: some View {
        if let p = store.payload, let lat = p.latitude, let lon = p.longitude {
            let q = QiblaModel.bearing(lat: lat, lon: lon)
            let rotation = q - (model.heading ?? 0)
            VStack(spacing: 4) {
                ZStack {
                    Circle().stroke(WatchTheme.raised, lineWidth: 4)
                    Image(systemName: "location.north.fill")
                        .font(.system(size: 44)).foregroundStyle(WatchTheme.gold)
                        .rotationEffect(.degrees(rotation))
                        .animation(.easeOut(duration: 0.2), value: rotation)
                }
                .frame(width: 100, height: 100)
                Text(model.heading == nil ? "القبلة \(Int(q))° من الشمال" : "اتجاه القبلة")
                    .font(.footnote).foregroundStyle(WatchTheme.textPrimary)
                Text(p.locationLabel).font(.caption2).foregroundStyle(WatchTheme.textSecondary)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("القبلة")
            .accessibilityValue("\(Int(q)) درجة من الشمال")
            .onAppear { model.start() }
            .onDisappear { model.stop() }
        } else {
            WatchEmptyState()
        }
    }
}
