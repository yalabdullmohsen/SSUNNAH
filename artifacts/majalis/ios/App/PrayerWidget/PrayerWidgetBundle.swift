import WidgetKit
import SwiftUI

@main
struct PrayerWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerTimesWidget()
        NextPrayerWidget()
        PreviousPrayerWidget()
        PreviousNextPrayerWidget()
        MorningPrayerWidget()
        EveningPrayerWidget()
        AllPrayerTimesWidget()
        PrayerHijriWidget()
        HijriDateWidget()
        DualDateWidget()
        TodayDateWidget()
        RamadanCountdownWidget()
        MorningAdhkarWidget()
        EveningAdhkarWidget()
        TimeAwareAdhkarWidget()
        RotatingAdhkarWidget()
        QuranAyahWidget()
        MushafContinueWidget()
        MushafBookmarkWidget()
        CustomContentStaticWidget()
    }
}
