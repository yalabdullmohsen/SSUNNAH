import WidgetKit
import SwiftUI

@main
struct PrayerWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerTimesWidget()
        CurrentPrayerWidget()
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
        IslamicEventWidget()
        MorningAdhkarWidget()
        EveningAdhkarWidget()
        TimeAwareAdhkarWidget()
        RotatingAdhkarWidget()
        AdhkarStreakWidget()
        QuranAyahWidget()
        QuranDailyGoalWidget()
        MushafContinueWidget()
        MushafBookmarkWidget()
        MushafProgressWidget()
        MushafQuickOpenWidget()
        CustomContentStaticWidget()
        DailyHadithWidget()
        DailyFaidahWidget()
        DailyDuaWidget()
        TodayInSunnahWidget()
        TodayActionsWidget()
        SpiritualDayWidget()
        if #available(iOS 18.0, *) {
            SunnahPrayerControl()
            SunnahAdhkarControl()
            SunnahMushafControl()
        }
    }
}
