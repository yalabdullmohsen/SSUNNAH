import SwiftUI
import WidgetKit
private struct SnapFamilyKey: EnvironmentKey { static let defaultValue: WidgetFamily = .systemSmall }
extension EnvironmentValues { var snapFamily: WidgetFamily { get { self[SnapFamilyKey.self] } set { self[SnapFamilyKey.self] = newValue } } }
