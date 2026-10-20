import SwiftUI
import AVFoundation
import Combine

/// «المختصر الصوتي»: التسجيل الصوتي للمختصر في تفسير القرآن الكريم — إصدار مركز تفسير للدراسات القرآنية،
/// بصوت عبدالله الأسمري وتلاوة صابر عبدالحكم. مجاني، يُبث من نسخة المركز على أرشيف الإنترنت (archive.org/details/Mokhtasr_Asmari)
/// بلا إعادة استضافة ولا تعديل، مع نسبة صريحة للمصدر. سورة لكل ملف (114)؛ تنزيل اختياري للاستماع دون اتصال.
public enum MukhtasarAudio {
    public static let title = "المختصر الصوتي"
    public static let credits = ["التسجيل الصوتي للمختصر في تفسير القرآن الكريم", "إصدار مركز تفسير للدراسات القرآنية", "بصوت: عبدالله الأسمري", "وتلاوة: صابر عبدالحكم"]
    public static let item = "Mokhtasr_Asmari"
    public static let base = URL(string: "https://archive.org/download/Mokhtasr_Asmari")!
    public static let metadata = URL(string: "https://archive.org/metadata/Mokhtasr_Asmari")!

    /// أسماء الملفات كما في نسخة المركز (احتياط)؛ تُحدَّث عند أول اتصال من بيانات الأرشيف الوصفية (المطابقة بأول 3 أرقام).
    static let bundledNames: [Int: String] = {
        let raw = """
        001 Al-Fatihah الفاتحة|002 Al-Baqarah البقرة|003 Al-'Imran آل عمران|004 An-Nisa' النساء|005 Al-Ma'idah المائدة|006 Al-An'am الأنعام|007 Al-A'raf الأعراف|008 Al-Anfal الأنفال|009 At-Taubah التوبة|010 Yunus يونس|011 Hud هود|012 Yusuf يوسف|013 Ar-Ra'd الرعد|014 Ibrahim إبراهيم|015 Al-Hijr الحجر|016 An-Nahl النحل|017 Al-Isra' الإسراء|018 Al-Kahf الكهف|019 Maryam مريم|020 Ta-Ha طه|021 Al-Anbiya' الأنبياء|022 Al-Hajj الحج|023 Al-Mu'minun المؤمنون|024 An-Nur النور|025 Al-Furqan الفرقان|026 Ash-Shu'ara' الشعراء|027 An-Naml النمل|028 Al-Qasas القصص|029 Al-'Ankabut العنكبوت|030 Ar-Rum الروم|031 Luqman لقمان|032 As-Sajdah السجدة|033 Al-Ahzab الأحزاب|034 Saba' سبأ|035 Fatir فاطر|036 Ya-Sin يس|037 As-Saffat الصافات|038 Sad ص|039 Az-Zumar الزمر|040 Ghafir غافر|041 Fussilat فصلت|042 Ash-Shura الشورى|043 Az-Zukhruf الزخرف|044 Ad-Dukhan الدخان|045 Al-Jathiyah الجاثية|046 Al-Ahqaf الأحقاف|047 Muhammad محمد|048 Al-Fath الفتح|049 Al-Hujurat الحجرات|050 Qaf ق|051 Adh-Dhariyat الذاريات|052 At-Tur الطور|053 An-Najm النجم|054 Al-Qamar القمر|055 Ar-Rahman الرحمن|056 Al-Waqi'ah الواقعة|057 Al-Hadid الحديد|058 Al-Mujadilah المجادلة|059 Al-Hashr الحشر|060 Al-Mumtahanah الممتحنة|061 As-Saff الصف|062 Al-Jumu'ah الجمعة|063 Al-Munafiqun المنافقون|064 At-Taghabun التغابن|065 At-Talaq الطلاق|066 At-Tahrim التحريم|067 Al-Mulk الملك|068 Al-Qalam القلم|069 Al-Haqqah الحاقة|070 Al-Ma'arij المعارج|071 Nuh نوح|072 Al-Jinn الجن|073 Al-Muzzammil المزمل|074 Al-Muddaththir المدثر|075 Al-Qiyamah القيامة|076 Al-Insan الإنسان|077 Al-Mursalat المرسلات|078 An-Naba' النبأ|079 An-Nazi'at النازعات|080 'Abasa عبس|081 At-Takwir التكوير|082 Al-Infitar الانفطار|083 Al-Mutaffifin المطففين|084 Al-Inshiqaq الإنشقاق|085 Al-Buruj البروج|086 At-Tariq الطارق|087 Al-A'la الأعلى|088 Al-Ghashiyah الغاشية|089 Al-Fajr الفجر|090 Al-Balad البلد|091 Ash-Shams الشمس|092 Al-Lail الليل|093 Ad-Duha الضحى|094 Ash-Sharh الشرح|095 At-Tin التين|096 Al-'Alaq العلق|097 Al-Qadr القدر|098 Al-Bayyinah البينة|099 Az-Zalzalah الزلزلة|100 Al-'Adiyat العاديات|101 Al-Qari'ah القارعة|102 At-Takathur التكاثر|103 Al-'Asr العصر|104 Al-Humazah الهمزة|105 Al-Fil الفيل|106 Quraish قريش|107 Al-Ma'un الماعون|108 Al-Kauthar الكوثر|109 Al-Kafirun الكافرون|110 An-Nasr النصر|111 Al-Masad المسد|112 Al-Ikhlas الإخلاص|113 Al-Falaq الفلق|114 An-Nas الناس
        """
        return names(fromMp3: raw.split(separator: "|").map { "\($0.trimmingCharacters(in: .whitespacesAndNewlines)).mp3" })
    }()

    /// يطابق أسماء ملفات mp3 بأرقام السور (أول 3 أرقام 001–114؛ مقدمات «000_» تُتجاهل).
    static func names(fromMp3 files: [String]) -> [Int: String] {
        var out: [Int: String] = [:]
        for f in files where f.lowercased().hasSuffix(".mp3") {
            guard let n = Int(f.prefix(3)), (1...114).contains(n), out[n] == nil else { continue }
            out[n] = f
        }
        return out
    }

    private static let namesKey = "mukhtasar.names.v1"
    static var resolvedNames: [Int: String] {
        if let d = UserDefaults.standard.dictionary(forKey: namesKey) as? [String: String] {
            let m = Dictionary(uniqueKeysWithValues: d.compactMap { k, v in Int(k).map { ($0, v) } })
            if m.count == 114 { return m }
        }
        return bundledNames
    }

    /// يحدّث الأسماء من بيانات الأرشيف الوصفية (مرة لكل تشغيل؛ الفشل يُبقي الاحتياط).
    static func refreshNames() async {
        struct Meta: Decodable { struct F: Decodable { let name: String }; let files: [F] }
        guard let (data, resp) = try? await URLSession.shared.data(from: metadata), (resp as? HTTPURLResponse)?.statusCode == 200,
              let meta = try? JSONDecoder().decode(Meta.self, from: data) else { return }
        let m = names(fromMp3: meta.files.map(\.name))
        guard m.count == 114 else { return }
        UserDefaults.standard.set(Dictionary(uniqueKeysWithValues: m.map { (String($0.key), $0.value) }), forKey: namesKey)
    }

    public static func remoteURL(_ surah: Int) -> URL? {
        guard let name = resolvedNames[surah] else { return nil }
        return base.appendingPathComponent(name)
    }

    static var folder: URL {
        let root = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        var dir = root.appendingPathComponent("Mukhtasar", isDirectory: true)
        if !FileManager.default.fileExists(atPath: dir.path) {
            try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            var rv = URLResourceValues(); rv.isExcludedFromBackup = true; try? dir.setResourceValues(rv)
        }
        return dir
    }

    public static func localURL(_ surah: Int) -> URL? {
        let u = folder.appendingPathComponent(String(format: "%03d.mp3", surah))
        return FileManager.default.fileExists(atPath: u.path) ? u : nil
    }

    /// المحلي أولًا ثم البث.
    public static func playableURL(_ surah: Int) -> URL? { localURL(surah) ?? remoteURL(surah) }

    static let juzOrdinals = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر",
                              "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون",
                              "الحادي والعشرون", "الثاني والعشرون", "الثالث والعشرون", "الرابع والعشرون", "الخامس والعشرون", "السادس والعشرون", "السابع والعشرون", "الثامن والعشرون", "التاسع والعشرون", "الثلاثون"]
    static func juzTitle(_ j: Int) -> String { "الجزء " + juzOrdinals[min(max(j, 1), 30) - 1] }

    struct JuzGroup: Identifiable { let juz: Int; var surahs: [MushafSurah]; var id: Int { juz } }

    /// السور مجمّعة بالجزء الذي تبدأ فيه (كما في فهرس المصحف).
    static func groups(_ index: MushafIndex) -> [JuzGroup] {
        var out: [JuzGroup] = []
        for s in index.surahs.sorted(by: { $0.id < $1.id }) {
            let j = index.juz(onPage: s.firstPage)
            if let last = out.last, last.juz == j { out[out.count - 1].surahs.append(s) } else { out.append(JuzGroup(juz: j, surahs: [s])) }
        }
        return out
    }
}

/// تنزيل سور المختصر إلى ملفات (لا ذاكرة: سورة البقرة ≈363 م.ب) بتقدّم لكل سورة، وطابور للتنزيل الجماعي (جزء كامل).
@MainActor
public final class MukhtasarDownloader: NSObject, ObservableObject, URLSessionDownloadDelegate {
    public static let shared = MukhtasarDownloader()
    @Published public private(set) var active: Int?
    @Published public private(set) var progress: Double = 0
    @Published public private(set) var queue: [Int] = []
    @Published public private(set) var failed: Int?
    @Published public private(set) var revision = 0
    private var task: URLSessionDownloadTask?
    private lazy var session: URLSession = URLSession(configuration: .default, delegate: self, delegateQueue: .main)

    public func isDownloaded(_ surah: Int) -> Bool { _ = revision; return MukhtasarAudio.localURL(surah) != nil }

    public func enqueue(_ surahs: [Int]) {
        failed = nil
        for s in surahs where !isDownloaded(s) && active != s && !queue.contains(s) { queue.append(s) }
        next()
    }

    /// تقديم سورة إلى رأس الطابور (تفسير آية طلبها المستخدم الآن): تُنزَّل قبل غيرها.
    public func prioritize(_ surah: Int) {
        failed = nil
        guard !isDownloaded(surah), active != surah else { return }
        queue.removeAll { $0 == surah }; queue.insert(surah, at: 0)
        next()
    }

    /// إيقاف سورة جارية أو إخراجها من الطابور.
    public func cancel(_ surah: Int) {
        queue.removeAll { $0 == surah }
        if active == surah { task?.cancel(); task = nil; active = nil; progress = 0; next() }
    }

    public func remove(_ surah: Int) {
        cancel(surah)
        if let u = MukhtasarAudio.localURL(surah) { try? FileManager.default.removeItem(at: u) }
        revision += 1
    }

    public func totalBytes() -> Int {
        let fm = FileManager.default
        let files = (try? fm.contentsOfDirectory(at: MukhtasarAudio.folder, includingPropertiesForKeys: [.fileSizeKey])) ?? []
        return files.reduce(0) { $0 + ((try? $1.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0) }
    }

    private func next() {
        guard active == nil, !queue.isEmpty else { return }
        let s = queue.removeFirst()
        guard let url = MukhtasarAudio.remoteURL(s) else { next(); return }
        active = s; progress = 0
        task = session.downloadTask(with: url); task?.resume()
    }

    public nonisolated func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didWriteData bytesWritten: Int64, totalBytesWritten: Int64, totalBytesExpectedToWrite: Int64) {
        guard totalBytesExpectedToWrite > 0 else { return }
        let p = Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)
        MainActor.assumeIsolated { self.progress = p }
    }

    public nonisolated func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        // يُنقل الملف قبل عودة الدالة (يحذفه النظام بعدها).
        let status = (downloadTask.response as? HTTPURLResponse)?.statusCode ?? 0
        let tmp = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".mp3")
        let moved = status == 200 && (try? FileManager.default.moveItem(at: location, to: tmp)) != nil
        MainActor.assumeIsolated {
            guard let s = self.active else { return }
            if moved {
                let dest = MukhtasarAudio.folder.appendingPathComponent(String(format: "%03d.mp3", s))
                try? FileManager.default.removeItem(at: dest)
                if (try? FileManager.default.moveItem(at: tmp, to: dest)) == nil { self.failed = s }
            } else { self.failed = s }
            self.revision += 1
        }
    }

    public nonisolated func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        MainActor.assumeIsolated {
            if let e = error as? URLError, e.code == .cancelled { return }
            if error != nil, let s = self.active { self.failed = s }
            self.active = nil; self.task = nil; self.progress = 0
            self.next()
        }
    }
}

/// مشغّل المختصر (بث أو محلي): تشغيل/إيقاف، تقديم/إرجاع 15 ثانية، وتقدّم؛ يبقى حيًّا بين الشاشات.
@MainActor
public final class MukhtasarPlayer: ObservableObject {
    public static let shared = MukhtasarPlayer()
    @Published public private(set) var surah: Int?
    @Published public private(set) var playing = false
    @Published public private(set) var elapsed: Double = 0
    @Published public private(set) var duration: Double = 0
    private var player: AVPlayer?
    private var observer: Any?

    /// الآية الجارية (إن شُغّلت آية بعينها) — يتوقف التشغيل تلقائيًا عند نهاية تفسيرها.
    @Published public private(set) var ayah: Int?

    /// تفسير آية ينتظر تنزيل ملف سورته (التقديم الدقيق يتطلب الملف محليًا: ملفات MP3 متغيرة المعدل لا يُقدَّم فيها بدقة أثناء البث).
    @Published public private(set) var preparing: (surah: Int, ayah: Int)?
    private var downloads: AnyCancellable?
    private var segmentTask: Task<Void, Never>?
    private var statusObs: NSKeyValueObservation?
    private var endTime: Double?
    private var elapsedStart: Double = 0

    /// تشغيل سورة من بداية «مقاصد السورة» (يتخطّى الإعلان الافتتاحي)، أو آية بعينها: من بدء تلاوتها إلى بدء الآية التالية بالضبط.
    /// السبب الجذري لعطل «تحديد آية يشغّل السورة كلها»: كان التقديم يُطلب قبل جاهزية العنصر فيُهمَل ويبدأ من أول الملف،
    /// والبث لا يقدّم بدقة في MP3 متغير المعدل. الآن: الآية من ملف محلي بتوقيت دقيق، والتقديم بعد readyToPlay، والنهاية بـforwardPlaybackEndTime.
    public func play(_ s: Int, ayah a: Int? = nil) {
        if surah == s, ayah == a, let player {
            if let endTime, elapsed >= endTime - 0.3 { restart() } else { player.play(); playing = true }
            return
        }
        if let a, MukhtasarAudio.localURL(s) == nil {
            // تفسير آية والسورة غير منزّلة: يُنزَّل مقطع الآية وحده (طلب HTTP Range بمواضع البايت المولّدة) ثم يُشغَّل محليًا بدقة —
            // كان يُنزَّل ملف السورة كاملًا أولًا (البقرة مئات الميغابايت) فيتأخر التشغيل دقائق (شكوى يوسف 2026-10-20).
            stop()
            preparing = (s, a)
            guard let seg = MukhtasarIndex.segment(surah: s, ayah: a) else { preparing = nil; failedSurah = s; return }
            segmentTask = Task { [weak self] in
                let file = await MukhtasarSegments.fetch(surah: s, ayah: a, seg)
                await MainActor.run {
                    guard let self, let p = self.preparing, p.surah == s, p.ayah == a else { return }
                    self.preparing = nil
                    if let file { self.startSegment(file, surah: s, ayah: a, seg) } else { self.failedSurah = s }
                }
            }
            return
        }
        startItem(s, ayah: a)
    }

    /// تعذّر تجهيز تفسير الآية (لا اتصال مثلًا).
    @Published public private(set) var failedSurah: Int?

    /// تشغيل مقطع آية منزَّل: من بداية الآية داخله (`lead`) إلى نهايتها، بتوقيت دقيق (ملف محلي).
    private func startSegment(_ file: URL, surah s: Int, ayah a: Int, _ seg: MukhtasarIndex.Segment) {
        startItem(s, ayah: a, url: file, range: (seg.lead, seg.length.map { seg.lead + $0 }))
        MukhtasarSegments.prefetchNext(surah: s, after: a)
    }

    private func startItem(_ s: Int, ayah a: Int?, url explicit: URL? = nil, range custom: (start: Double, end: Double?)? = nil) {
        guard let url = explicit ?? MukhtasarAudio.playableURL(s) else { return }
        stop()
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
        try? AVAudioSession.sharedInstance().setActive(true)
        #endif
        let asset = AVURLAsset(url: url, options: url.isFileURL ? [AVURLAssetPreferPreciseDurationAndTimingKey: true] : nil)
        let item = AVPlayerItem(asset: asset)
        let range = custom ?? MukhtasarIndex.range(surah: s, ayah: a)
        if let end = range.end { item.forwardPlaybackEndTime = CMTime(seconds: end, preferredTimescale: 600) }
        let p = AVPlayer(playerItem: item)
        observer = p.addPeriodicTimeObserver(forInterval: CMTime(seconds: 0.5, preferredTimescale: 600), queue: .main) { [weak self] t in
            MainActor.assumeIsolated {
                guard let self else { return }
                self.elapsed = t.seconds
                if let d = self.player?.currentItem?.duration.seconds, d.isFinite { self.duration = d }
                if let e = self.endTime, t.seconds >= e - 0.05 { self.player?.pause(); self.playing = false }
            }
        }
        // التقديم بعد الجاهزية فقط (قبلها يُهمَل)، ثم التشغيل.
        statusObs = item.observe(\.status, options: [.initial, .new]) { [weak self] it, _ in
            guard it.status == .readyToPlay else { return }
            DispatchQueue.main.async { MainActor.assumeIsolated {
                guard let self, self.player === p else { return }
                self.statusObs = nil
                let go = { p.play() }
                if range.start > 0 {
                    p.seek(to: CMTime(seconds: range.start, preferredTimescale: 600), toleranceBefore: .zero, toleranceAfter: .zero) { _ in go() }
                } else { go() }
            } }
        }
        player = p; surah = s; ayah = a; endTime = range.end; elapsed = range.start; elapsedStart = range.start; failedSurah = nil; playing = true
    }

    /// إعادة المقطع الجاري من أوله (نفس الملف والنطاق).
    private func restart() {
        guard let player, let item = player.currentItem else { return }
        let start = max(elapsedStart, 0)
        item.seek(to: CMTime(seconds: start, preferredTimescale: 600), toleranceBefore: .zero, toleranceAfter: .zero) { _ in }
        player.play(); playing = true
    }

    public func toggle() {
        guard let player else { return }
        if playing { player.pause(); playing = false }
        else if let endTime, elapsed >= endTime - 0.3 { restart() }   // انتهى تفسير الآية: إعادة من أولها
        else { player.play(); playing = true }
    }

    public func skip(_ seconds: Double) {
        guard let player else { return }
        let t = max(0, elapsed + seconds)
        player.seek(to: CMTime(seconds: duration > 0 ? min(t, duration) : t, preferredTimescale: 600))
    }

    public func seek(fraction: Double) {
        guard let player, duration > 0 else { return }
        player.seek(to: CMTime(seconds: duration * min(max(fraction, 0), 1), preferredTimescale: 600))
    }

    public func stop() {
        if let observer, let player { player.removeTimeObserver(observer) }
        statusObs = nil; downloads = nil; segmentTask?.cancel(); segmentTask = nil; preparing = nil; endTime = nil
        player?.pause(); player = nil; observer = nil
        surah = nil; ayah = nil; playing = false; elapsed = 0; duration = 0
    }

    static func clock(_ s: Double) -> String {
        guard s.isFinite, s > 0 else { return "٠:٠٠" }
        let t = Int(s), h = t / 3600, m = (t % 3600) / 60, sec = t % 60
        return (h > 0 ? String(format: "%d:%02d:%02d", h, m, sec) : String(format: "%d:%02d", m, sec)).arabicDigits
    }
}

/// شاشة «المختصر الصوتي» داخل المصحف: رأس (اختيار التلاوة • العنوان • إغلاق)، نسبة الإصدار، السور مجمّعة بالأجزاء
/// في بطاقات، شريط أجزاء 1–30 للقفز، وشريط تشغيل سفلي. لا مكوّنات iOS الافتراضية (لا List/sheet/toolbar).
struct MukhtasarAudioView: View {
    let index: MushafIndex
    var startSurah: Int?
    /// آية محددة من المصحف: يُشغَّل تفسيرها هي بالضبط فور الفتح.
    var startAyah: Int? = nil
    let close: () -> Void
    let chooseRecitation: () -> Void
    @ObservedObject private var downloader = MukhtasarDownloader.shared
    @ObservedObject private var player = MukhtasarPlayer.shared

    var body: some View {
        let groups = MukhtasarAudio.groups(index)
        VStack(spacing: 0) {
            header
            ScrollViewReader { proxy in
                // RTL: trailing = اليسار — شريط الأجزاء على الحافة اليسرى كما في المرجع، والمحتوى يفسح له.
                ZStack(alignment: .trailing) {
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                            VStack(spacing: Sunnah.Spacing.s1) {
                                ForEach(MukhtasarAudio.credits, id: \.self) { Text($0) }
                            }
                            .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.gold)
                            .multilineTextAlignment(.center).frame(maxWidth: .infinity)
                            .padding(.vertical, Sunnah.Spacing.s4)
                            ForEach(groups) { g in
                                juzSection(g.juz, g.surahs).id("juz-\(g.juz)")
                            }
                            if let f = downloader.failed {
                                Text("تعذّر تنزيل سورة \(name(f)). تحقّق من الاتصال ثم أعد المحاولة.")
                                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger)
                            }
                            Text("المصدر: مركز تفسير للدراسات القرآنية (نسخة المركز على أرشيف الإنترنت). يُبث كما هو دون تعديل.")
                                .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                                .frame(maxWidth: .infinity).multilineTextAlignment(.center)
                        }
                        .padding(.trailing, 36).padding(.leading, Sunnah.Spacing.s4)
                        .padding(.bottom, player.surah == nil ? Sunnah.Spacing.s6 : 120)
                    }
                    juzRail(groups.map(\.juz)) { j in
                        let target = groups.last(where: { $0.juz <= j })?.juz ?? j
                        sunnahAnimate { proxy.scrollTo("juz-\(target)", anchor: .top) }
                    }
                }
                .onAppear {
                    if let s = startSurah, let g = groups.first(where: { $0.surahs.contains { $0.id == s } }), g.juz > 1 {   // الجزء الأول: يبقى رأس الإصدار ظاهرًا
                        DispatchQueue.main.async { proxy.scrollTo("juz-\(g.juz)", anchor: .top) }
                    }
                }
            }
            if player.surah != nil { playerBar }
        }
        .background(Sunnah.Colors.bg.ignoresSafeArea())
        .environment(\.layoutDirection, .rightToLeft)
        .task {
            await MukhtasarAudio.refreshNames()
            if let s = startSurah, let a = startAyah, MukhtasarIndex.hasAyahs(s) { player.play(s, ayah: a) }
        }
    }

    private func name(_ s: Int) -> String { index.surahs.first { $0.id == s }?.name ?? s.arabicDigits }

    private var header: some View {
        ZStack {
            Text(MukhtasarAudio.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            HStack {
                Button(action: chooseRecitation) {
                    HStack(spacing: Sunnah.Spacing.s1) {
                        Image(systemName: "chevron.right")
                        Text("اختيار التلاوة")
                    }
                    .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.primary)
                    .frame(minHeight: Sunnah.Spacing.touch)
                }
                .buttonStyle(.plain).accessibilityIdentifier("mukhtasar.recitations")
                Spacer()
                Button(action: { close() }) {
                    Image(systemName: "xmark").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textSecondary)
                        .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                        .background(Sunnah.Colors.surface2, in: Circle())
                }
                .buttonStyle(.plain).accessibilityLabel("إغلاق").accessibilityIdentifier("mukhtasar.close")
            }
        }
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.vertical, Sunnah.Spacing.s2)
    }

    private func juzSection(_ juz: Int, _ surahs: [MushafSurah]) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            HStack {
                Text(MukhtasarAudio.juzTitle(juz)).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer()
                Menu {
                    Button { downloader.enqueue(surahs.map(\.id)) } label: { Label("تنزيل سور الجزء", systemImage: "icloud.and.arrow.down") }
                    Button(role: .destructive) { surahs.forEach { downloader.remove($0.id) } } label: { Label("حذف تنزيلات الجزء", systemImage: "trash") }
                } label: {
                    Image(systemName: "ellipsis").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                        .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                }
                .accessibilityLabel("خيارات \(MukhtasarAudio.juzTitle(juz))")
            }
            VStack(spacing: 0) {
                ForEach(Array(surahs.enumerated()), id: \.element.id) { i, s in
                    if i > 0 { Rectangle().fill(Sunnah.Colors.border).frame(height: Sunnah.Spacing.hairline).padding(.horizontal, Sunnah.Spacing.s4) }
                    row(s)
                }
            }
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous))
            .sunnahElevation()
        }
    }

    private func row(_ s: MushafSurah) -> some View {
        let isActive = downloader.active == s.id, queued = downloader.queue.contains(s.id), done = downloader.isDownloaded(s.id)
        let current = player.surah == s.id
        return HStack(spacing: Sunnah.Spacing.s3) {
            Button { current && player.ayah == nil ? player.toggle() : player.play(s.id) } label: {
                HStack(spacing: Sunnah.Spacing.s2) {
                    if current { Image(systemName: player.playing ? "speaker.wave.2.fill" : "pause.fill").foregroundStyle(Sunnah.Colors.primary) }
                    Text("\(s.id.arabicDigits). \(s.name)").font(Sunnah.Typography.body)
                        .foregroundStyle(current ? Sunnah.Colors.primary : Sunnah.Colors.gold)
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, minHeight: 56).contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("استماع لتفسير سورة \(s.name)")
            Button {
                if isActive || queued { downloader.cancel(s.id) } else if done { downloader.remove(s.id) } else { downloader.enqueue([s.id]) }
            } label: {
                ZStack {
                    if isActive {
                        Circle().stroke(Sunnah.Colors.border, lineWidth: 3)
                        Circle().trim(from: 0, to: max(0.02, downloader.progress)).stroke(Sunnah.Colors.primary, style: StrokeStyle(lineWidth: 3, lineCap: .round)).rotationEffect(.degrees(-90))
                        RoundedRectangle(cornerRadius: 2).fill(Sunnah.Colors.primary).frame(width: 10, height: 10)
                    } else if queued {
                        Image(systemName: "clock").foregroundStyle(Sunnah.Colors.textSecondary)
                    } else if done {
                        Image(systemName: "checkmark.circle.fill").foregroundStyle(Sunnah.Colors.primary)
                    } else {
                        Image(systemName: "icloud.and.arrow.down").foregroundStyle(Sunnah.Colors.primary)
                    }
                }
                .font(Sunnah.Typography.sectionTitle)
                .frame(width: 30, height: 30)
                .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isActive ? "إيقاف التنزيل" : queued ? "إلغاء من الطابور" : done ? "حذف التنزيل" : "تنزيل للاستماع دون اتصال")
        }
        .padding(.horizontal, Sunnah.Spacing.s4)
    }

    private func juzRail(_ present: [Int], jump: @escaping (Int) -> Void) -> some View {
        VStack(spacing: 0) {
            ForEach(1...30, id: \.self) { j in
                Button { jump(j) } label: {
                    Text(j.arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary)
                        .frame(width: 28).frame(maxHeight: .infinity)
                }
                .buttonStyle(.plain).accessibilityLabel(MukhtasarAudio.juzTitle(j))
            }
        }
        .frame(maxHeight: 560)
        .padding(.trailing, Sunnah.Spacing.s1)
    }

    private var playerBar: some View {
        VStack(spacing: Sunnah.Spacing.s2) {
            HStack {
                Text(player.ayah.map { "تفسير الآية \($0.arabicDigits) من سورة \(name(player.surah ?? 1))" } ?? "تفسير سورة \(name(player.surah ?? 1))")
                    .font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer()
                Text("\(MukhtasarPlayer.clock(player.elapsed)) / \(MukhtasarPlayer.clock(player.duration))")
                    .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Sunnah.Colors.border)
                    Capsule().fill(Sunnah.Colors.primary).frame(width: g.size.width * (player.duration > 0 ? player.elapsed / player.duration : 0))
                }
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0).onEnded { v in player.seek(fraction: v.location.x / max(g.size.width, 1)) })
            }
            .frame(height: 6)
            .environment(\.layoutDirection, .leftToRight)
            HStack(spacing: Sunnah.Spacing.s6) {
                ctl("gobackward.15", "رجوع 15 ثانية") { player.skip(-15) }
                ctl(player.playing ? "pause.fill" : "play.fill", player.playing ? "إيقاف مؤقت" : "تشغيل") { player.toggle() }
                ctl("goforward.15", "تقديم 15 ثانية") { player.skip(15) }
                ctl("stop.fill", "إيقاف") { player.stop() }
            }
        }
        .padding(Sunnah.Spacing.s4)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
        .sunnahElevation()
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.bottom, Sunnah.Spacing.s2)
    }

    private func ctl(_ symbol: String, _ label: String, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
        }
        .buttonStyle(.plain).accessibilityLabel(label)
    }
}

/// مقاطع الآيات المنزّلة (طلب HTTP Range من ملف السورة على أرشيف الإنترنت) — مخزّنة مؤقتًا لإعادة الاستماع بلا شبكة.
enum MukhtasarSegments {
    static var folder: URL {
        let dir = MukhtasarAudio.folder.appendingPathComponent("segments", isDirectory: true)
        if !FileManager.default.fileExists(atPath: dir.path) { try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true) }
        return dir
    }

    static func file(surah: Int, ayah: Int) -> URL { folder.appendingPathComponent(String(format: "%03d-%03d.mp3", surah, ayah)) }

    /// يعيد ملف المقطع (من الذاكرة المؤقتة أو بتنزيله). يتحقق أن الخادم أعاد المدى نفسه من ملف بالحجم المتوقع (206 + Content-Range)،
    /// وإلا لا يُستعمل (ملف مختلف عن الذي وُلّدت منه المواضع) ⇒ nil.
    static func fetch(surah: Int, ayah: Int, _ seg: MukhtasarIndex.Segment) async -> URL? {
        let dest = file(surah: surah, ayah: ayah)
        if FileManager.default.fileExists(atPath: dest.path) { return dest }
        guard let remote = MukhtasarAudio.remoteURL(surah) else { return nil }
        var req = URLRequest(url: remote, timeoutInterval: 30)
        req.setValue("bytes=\(seg.lo)-\(seg.hi - 1)", forHTTPHeaderField: "Range")
        guard let (data, resp) = try? await URLSession.shared.data(for: req), let http = resp as? HTTPURLResponse,
              http.statusCode == 206, data.count == seg.hi - seg.lo,
              (http.value(forHTTPHeaderField: "Content-Range") ?? "").hasSuffix("/\(seg.size)") else { return nil }
        let tmp = folder.appendingPathComponent(UUID().uuidString + ".part")
        do { try data.write(to: tmp); try? FileManager.default.removeItem(at: dest); try FileManager.default.moveItem(at: tmp, to: dest) }
        catch { try? FileManager.default.removeItem(at: tmp); return nil }
        return dest
    }

    /// تنزيل مقطع الآية التالية في الخلفية فيبدأ فورًا إن انتقل إليها المستخدم.
    static func prefetchNext(surah: Int, after ayah: Int) {
        let next = ayah + 1
        guard let seg = MukhtasarIndex.segment(surah: surah, ayah: next), seg.lo != MukhtasarIndex.segment(surah: surah, ayah: ayah)?.lo else { return }
        Task.detached(priority: .utility) { _ = await fetch(surah: surah, ayah: next, seg) }
    }
}

