import WidgetKit
import SwiftUI

@main
struct PrayerWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerTimesWidget()
        if #available(iOS 17.0, *) { PrayerStyledWidget() }
        AllPrayerTimesWidget()
        HijriDateWidget()
        RamadanCountdownWidget()
        TimeAwareAdhkarWidget()
        RotatingAdhkarWidget()
        AdhkarStreakWidget()
        QuranAyahWidget()
        MushafContinueWidget()
        if #available(iOS 18.0, *) {
            SunnahPrayerControl()
            SunnahAdhkarControl()
            SunnahMushafControl()
        }
    }
}
