import SwiftUI

/// /lessons و/lessons/archive: الدروس الجارية أو المؤرشفة من نفس المصدر (تقسيم LearnLessonArchive).
struct LearnLessonsScreen: View {
    let archived: Bool

    var body: some View {
        LearnLoadHost(LearnSources.lessons) { (lessons: [LearnLesson]) in
            let split = LearnLessonArchive.split(lessons)
            LearnLessonList(lessons: archived ? split.archived : split.active,
                            emptyTitle: archived ? "لا دروس مؤرشفة" : "لا دروس قائمة حاليًا")
        }
        .sunnahNavTitle(archived ? "أرشيف الدروس" : "الدروس")
    }
}

struct LearnLessonList: View {
    @Environment(\.openRoute) private var openRoute
    let lessons: [LearnLesson]; let emptyTitle: String

    var body: some View {
        LearnList(items: lessons, emptyTitle: emptyTitle) { lesson in
            Button { openRoute("/lessons/" + lesson.id) } label: {
                SunnahListRow(title: lesson.title, subtitle: lesson.listSubtitle)
            }
            .buttonStyle(.plain)
        }
    }
}

/// /lessons/:id — بطاقة الدرس: الشيخ، الموعد، المكان، الوصف، وروابط البث والكتاب والخريطة.
struct LearnLessonDetailScreen: View {
    let id: String

    var body: some View {
        LearnLoadHost(LearnSources.lessons) { (lessons: [LearnLesson]) in
            if let lesson = lessons.first(where: { $0.id == id }) {
                LearnLessonDetail(lesson: lesson)
            } else {
                EmptyStateView(title: "الدرس غير موجود")
            }
        }
    }
}

struct LearnLessonDetail: View {
    let lesson: LearnLesson
    var body: some View {
        LearnDetailPage(title: lesson.title) {
            if let category = lesson.category, !category.isEmpty { SunnahChip(category) }
            SunnahInfoGrid([
                SunnahInfoItem(icon: "person", label: "الشيخ", value: lesson.speakerName),
                SunnahInfoItem(icon: "calendar", label: "الموعد", value: lesson.scheduleLine),
                SunnahInfoItem(icon: "mappin.and.ellipse", label: "المكان", value: lesson.placeLine),
                SunnahInfoItem(icon: "person.2", label: "الحضور", value: lesson.audience),
                SunnahInfoItem(icon: "video", label: "طريقة الحضور", value: lesson.delivery),
            ])
            if let d = lesson.description, !d.isEmpty {
                SunnahSectionedMarkdown(d, key: "lesson-\(lesson.id)", style: .body)
            }
            SunnahActionRow {
                LearnExternalLink(title: "البث المباشر", urlString: lesson.liveURL)
                LearnExternalLink(title: "الكتاب المشروح", urlString: lesson.bookURL)
                LearnExternalLink(title: "الموقع على الخريطة", urlString: lesson.mapsURL)
            }
        }
    }
}

/// /kuwait-lessons — مشايخ الكويت المتحقَّق منهم من drosq8.com، وكل بطاقة تفتح صفحتهم هناك (كما في الويب).
struct LearnKuwaitLessonsScreen: View {
    var body: some View {
        LearnLoadHost(LearnSources.kuwaitSheikhs) { (sheikhs: [LearnKuwaitSheikh]) in
            if sheikhs.isEmpty { EmptyStateView() } else {
                ScrollView {
                    LazyVStack(spacing: Sunnah.Spacing.s3) {
                        ForEach(sheikhs) { sheikh in
                            SunnahCard {
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                    Text(sheikh.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                    if let s = sheikh.specialty { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                                    LearnExternalLink(title: "دروسه على دروس الكويت", urlString: sheikh.drosq8Url)
                                }
                            }
                        }
                    }
                    .padding(Sunnah.Spacing.pageX)
                }
            }
        }
        .sunnahNavTitle("دروس الكويت")
    }
}
