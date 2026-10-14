import SwiftUI
import CoreLocation
import SunnahPrayer

/// رياضيات القبلة (مطابقة لـ lib/qibla-math.ts): الكعبة 21.4225°N، 39.8262°E.
enum AccountQiblaMath {
    static let kaabaLatitude = 21.4225
    static let kaabaLongitude = 39.8262
    static let alignToleranceDegrees = 2.5
    static let accuracyWarnDegrees = 15.0

    /// أقصر فرق زاوي بإشارة في (−180، 180].
    static func shortestDelta(from a: Double, to b: Double) -> Double {
        var d = (b - a + 540).truncatingRemainder(dividingBy: 360)
        if d < 0 { d += 360 }
        return d - 180
    }

    static func angularDistance(_ a: Double, _ b: Double) -> Double { abs(shortestDelta(from: a, to: b)) }

    /// اتجاه القبلة بالدرجات من الشمال الحقيقي مع عقارب الساعة.
    static func bearing(latitude: Double, longitude: Double) -> Double {
        let p1 = latitude * .pi / 180, p2 = kaabaLatitude * .pi / 180
        let dl = (kaabaLongitude - longitude) * .pi / 180
        let y = sin(dl) * cos(p2)
        let x = cos(p1) * sin(p2) - sin(p1) * cos(p2) * cos(dl)
        let deg = atan2(y, x) * 180 / .pi
        return (deg + 360).truncatingRemainder(dividingBy: 360)
    }

    /// مسافة الدائرة العظمى إلى الكعبة بالكيلومتر.
    static func distanceKm(latitude: Double, longitude: Double) -> Double {
        let r = 6371.0
        let dp = (kaabaLatitude - latitude) * .pi / 180
        let dl = (kaabaLongitude - longitude) * .pi / 180
        let p1 = latitude * .pi / 180, p2 = kaabaLatitude * .pi / 180
        let a = pow(sin(dp / 2), 2) + cos(p1) * cos(p2) * pow(sin(dl / 2), 2)
        return r * 2 * atan2(sqrt(a), sqrt(1 - a))
    }

    /// مرشح تمرير منخفض دائري لتهدئة اهتزاز البوصلة.
    static func lowPass(previous: Double?, next: Double, alpha: Double = 0.18) -> Double {
        guard let previous else { return next }
        let a = min(1, max(0.01, alpha))
        var v = (previous + a * shortestDelta(from: previous, to: next)).truncatingRemainder(dividingBy: 360)
        if v < 0 { v += 360 }
        return v
    }

    static func isAligned(bearing: Double, heading: Double, tolerance: Double = alignToleranceDegrees) -> Bool {
        angularDistance(bearing, heading) <= tolerance
    }

    static func coordinateLabel(latitude: Double, longitude: Double) -> String {
        String(format: "%.4f°، %.4f°", latitude, longitude)
    }
}

/// آخر موقع للقبلة (مدينة أو GPS) — محلي على الجهاز.
struct AccountQiblaPlace: Codable, Equatable {
    var latitude: Double
    var longitude: Double
    var label: String
    var fromDevice: Bool

    static let key = "sunnah.qibla.place.v1"

    static func read(_ defaults: UserDefaults = .standard) -> AccountQiblaPlace? {
        defaults.data(forKey: key).flatMap { try? JSONDecoder().decode(AccountQiblaPlace.self, from: $0) }
    }

    func save(_ defaults: UserDefaults = .standard) {
        if let data = try? JSONEncoder().encode(self) { defaults.set(data, forKey: Self.key) }
    }
}

/// مستشعر الاتجاه (المغناطيسي/الحقيقي) عبر CoreLocation.
@MainActor
final class AccountHeadingProvider: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var heading: Double?
    @Published private(set) var accuracy: Double?
    let isAvailable: Bool
    private let manager = CLLocationManager()

    override init() {
        #if os(iOS)
        isAvailable = CLLocationManager.headingAvailable()
        #else
        isAvailable = false
        #endif
        super.init()
        manager.delegate = self
    }

    func start() {
        #if os(iOS)
        guard isAvailable else { return }
        manager.headingFilter = 1
        manager.startUpdatingHeading()
        #endif
    }

    func stop() {
        #if os(iOS)
        manager.stopUpdatingHeading()
        #endif
    }

    #if os(iOS)
    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        let raw = newHeading.trueHeading >= 0 ? newHeading.trueHeading : newHeading.magneticHeading
        let acc = newHeading.headingAccuracy
        Task { @MainActor in
            self.heading = AccountQiblaMath.lowPass(previous: self.heading, next: raw)
            self.accuracy = acc >= 0 ? acc : nil
        }
    }

    nonisolated func locationManagerShouldDisplayHeadingCalibration(_ manager: CLLocationManager) -> Bool { false }
    #endif
}

/// /qibla — اتجاه القبلة: موقع محفوظ أو مدينة يدوية أو GPS بطلب المستخدم، وبوصلة من مستشعر الجهاز.
struct AccountQiblaScreen: View {
    @StateObject private var compass = AccountHeadingProvider()
    @State private var place: AccountQiblaPlace? = AccountQiblaPlace.read()
    @State private var selectedCity = AccountQiblaPlace.read().flatMap { p in AccountTexts.qiblaCities.first { $0.name == p.label }?.name }
        ?? AccountTexts.qiblaCities[0].name
    @State private var manualMode = AccountQiblaPlace.read() == nil
    @State private var error = ""
    @State private var locating = false
    @State private var calibrationDismissed = false

    private var bearing: Double? { place.map { AccountQiblaMath.bearing(latitude: $0.latitude, longitude: $0.longitude) } }
    private var aligned: Bool {
        guard let bearing, let heading = compass.heading else { return false }
        return AccountQiblaMath.isAligned(bearing: bearing, heading: heading)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "الأدوات", title: "اتجاه القبلة", subtitle: "وجّه الجهاز حتى يشير السهم إلى الكعبة المشرفة.")

                if manualMode { manualSection }

                if let bearing, let place {
                    AccountQiblaDial(bearing: bearing, heading: compass.heading, aligned: aligned)
                        .frame(maxWidth: .infinity)
                    if aligned {
                        notice("✓ أنت متجه نحو القبلة", tone: Sunnah.Colors.primary)
                    }
                    let distance = AccountQiblaMath.distanceKm(latitude: place.latitude, longitude: place.longitude)
                    AccountTileGrid(items: tiles(bearing: bearing, distance: distance)) { AccountStatTile(value: $0.value, label: $0.label) }
                    Text([place.label,
                          AccountQiblaMath.coordinateLabel(latitude: place.latitude, longitude: place.longitude),
                          compass.accuracy.map { "دقة البوصلة ≈ \(Int($0.rounded()))°" } ?? ""]
                        .filter { !$0.isEmpty }.joined(separator: " · "))
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    if compass.heading == nil {
                        Text("على الجوال: وجّه الهاتف في الاتجاه الذي يشير فيه السهم.")
                            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    if !manualMode {
                        SunnahButton("تغيير المدينة", style: .secondary) { manualMode = true }
                    }
                } else if !manualMode {
                    notice("حدد موقعك لحساب اتجاه القبلة.", tone: Sunnah.Colors.textSecondary)
                    SunnahButton("استخدم موقعي", style: .secondary) { Task { await useDeviceLocation() } }
                }
                AccountShareRow(title: "اتجاه القبلة — سُنّة", path: "/qibla")
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("اتجاه القبلة")
        .onAppear { compass.start() }
        .onDisappear { compass.stop() }
        .sheet(isPresented: Binding(
            get: { (compass.accuracy ?? 0) > AccountQiblaMath.accuracyWarnDegrees && !calibrationDismissed },
            set: { if !$0 { calibrationDismissed = true } }
        )) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                Text("معايرة البوصلة").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Text("دقة المستشعر منخفضة. حرّك الهاتف على شكل الرقم «8» في الهواء عدة مرات بعيدًا عن المعادن والمغناطيس، ثم أعد المحاولة.")
                    .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                SunnahButton("حسنًا", style: .secondary) { calibrationDismissed = true }
            }
            .padding(Sunnah.Spacing.s6)
            .presentationDetents([.medium])
        }
    }

    private var manualSection: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            if !error.isEmpty { notice(error, tone: Sunnah.Colors.danger) }
            Picker("اختر مدينتك", selection: $selectedCity) {
                ForEach(AccountTexts.qiblaCities) { Text($0.name).tag($0.name) }
            }
            .pickerStyle(.menu)
            .tint(Sunnah.Colors.primary)
            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch, alignment: .leading)
            SunnahButton("احسب القبلة") { applyCity() }
            SunnahButton(locating ? "جارٍ تحديد الموقع…" : "استخدم موقعي", style: .secondary) { Task { await useDeviceLocation() } }
                .disabled(locating)
        }
    }

    private struct Tile: Identifiable { let value: String; let label: String; var id: String { label } }

    private func tiles(bearing: Double, distance: Double) -> [Tile] {
        var out = [Tile(value: "\(Int(bearing.rounded()))°", label: "الاتجاه من الشمال"),
                   Tile(value: "\(Int(distance.rounded()).formatted())\u{00A0}كم", label: "المسافة إلى الكعبة")]
        if let heading = compass.heading {
            out.append(Tile(value: String(format: "%.1f°", AccountQiblaMath.angularDistance(bearing, heading)), label: "الانحراف"))
        }
        return out
    }

    private func notice(_ text: String, tone: Color) -> some View {
        SunnahCard { Text(text).font(Sunnah.Typography.body).foregroundStyle(tone) }
    }

    private func applyCity() {
        guard let city = AccountTexts.qiblaCities.first(where: { $0.name == selectedCity }) else { return }
        let p = AccountQiblaPlace(latitude: city.latitude, longitude: city.longitude, label: city.name, fromDevice: false)
        p.save()
        place = p
        error = ""
        manualMode = false
    }

    @MainActor private func useDeviceLocation() async {
        locating = true
        defer { locating = false }
        do {
            let loc = try await DeviceLocator().currentLocation()
            let p = AccountQiblaPlace(latitude: loc.latitude, longitude: loc.longitude, label: "موقعك الحالي", fromDevice: true)
            p.save()
            place = p
            error = ""
            manualMode = false
        } catch {
            self.error = "لم يُمنح إذن تحديد الموقع. اختر مدينتك يدوياً:"
            manualMode = true
        }
    }
}

/// قرص البوصلة: الحلقة تدور عكس اتجاه الجهاز، والسهم يشير إلى القبلة.
struct AccountQiblaDial: View {
    let bearing: Double
    let heading: Double?
    let aligned: Bool

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height)
            let head = heading ?? 0
            ZStack {
                Circle().fill(Sunnah.Colors.primarySoft)
                Circle().stroke(aligned ? Sunnah.Colors.primary : Sunnah.Colors.surface2,
                                lineWidth: aligned ? Sunnah.Spacing.s1 : Sunnah.Spacing.hairline * 2)
                ZStack {
                    ForEach(0..<72, id: \.self) { i in
                        let major = i % 18 == 0, medium = i % 6 == 0 && !major
                        Capsule()
                            .fill(Sunnah.Colors.textSecondary.opacity(major ? 0.6 : medium ? 0.35 : 0.18))
                            .frame(width: Sunnah.Spacing.hairline * (major ? 2 : 1), height: side * (major ? 0.06 : medium ? 0.04 : 0.025))
                            .offset(y: -side * 0.44)
                            .rotationEffect(.degrees(Double(i) * 5))
                    }
                    ForEach(Array(["ش", "ق", "ج", "غ"].enumerated()), id: \.offset) { index, letter in
                        Text(letter).font(Sunnah.Typography.tag)
                            .foregroundStyle(index == 0 ? Sunnah.Colors.danger : Sunnah.Colors.textSecondary)
                            .rotationEffect(.degrees(-Double(index) * 90 + head))
                            .offset(y: -side * 0.36)
                            .rotationEffect(.degrees(Double(index) * 90))
                    }
                }
                .rotationEffect(.degrees(-head))
                Image(systemName: "location.north.fill")
                    .resizable().scaledToFit()
                    .frame(width: side * 0.16, height: side * 0.5)
                    .foregroundStyle(aligned ? Sunnah.Colors.primaryStrong : Sunnah.Colors.primary)
                    .rotationEffect(.degrees(bearing - head))
                Circle().fill(Sunnah.Colors.surface).frame(width: side * 0.05, height: side * 0.05)
            }
            .frame(width: side, height: side)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .aspectRatio(1, contentMode: .fit)
        .animation(Sunnah.Motion.reduced ? nil : .easeOut(duration: 0.15), value: heading)
        .accessibilityElement()
        .accessibilityLabel("بوصلة القبلة، الزاوية \(Int(bearing.rounded())) درجة")
    }
}
