import SwiftUI

/// زر الميكروفون العائم + شاشة الموافقة + بطاقة التقرير، فوق المصحف (لا يغطي النص: ركن سفلي صغير فوق شريط التبويب).
struct MushafTasmeeOverlay: View {
    @ObservedObject var tasmee: MushafTasmeeController
    let onTap: () -> Void
    @Environment(\.openURL) private var openURL
    @State private var dragBase = CGSize.zero
    @GestureState private var drag = CGSize.zero

    var body: some View {
        VStack(spacing: Sunnah.Spacing.s2) {
            if let h = tasmee.hint, tasmee.phase == .listening {
                Text(h).font(Sunnah.Typography.secondary).padding(.horizontal, 12).padding(.vertical, 6)
                    .background(Capsule().fill(Sunnah.Colors.bg.opacity(0.92)))
            }
            if case .failed(let m) = tasmee.phase {
                Text(m).font(Sunnah.Typography.secondary).padding(.horizontal, 12).padding(.vertical, 6)
                    .background(Capsule().fill(Sunnah.Colors.bg.opacity(0.92)))
            }
            if let r = tasmee.repeatStatus, tasmee.phase == .listening {
                Text(r).font(Sunnah.Typography.secondary).padding(.horizontal, 12).padding(.vertical, 6)
                    .background(Capsule().fill(Sunnah.Colors.bg.opacity(0.92)))
                    .accessibilityIdentifier("mushaf.tasmee.repeat")
            }
            if tasmee.offersHint, tasmee.phase == .listening {
                Button { tasmee.requestHint() } label: {
                    Label("تلميح", systemImage: "lightbulb.fill").font(Sunnah.Typography.secondary)
                        .padding(.horizontal, 12).padding(.vertical, 6)
                        .background(Capsule().fill(Sunnah.Colors.bg.opacity(0.92)))
                        .foregroundStyle(Sunnah.Colors.primary)
                }
                .accessibilityIdentifier("mushaf.tasmee.hint")
            }
            if tasmee.phase == .listening { TasmeeWaveform(level: tasmee.level) }
            HStack(spacing: Sunnah.Spacing.s2) {
                if tasmee.isActive || tasmee.phase == .needsMic {
                    Button { tasmee.hideVerses.toggle() } label: {
                        Image(systemName: tasmee.hideVerses ? "eye.slash.fill" : "eye.fill").font(.system(size: 17, weight: .semibold))
                            .frame(width: 44, height: 44).background(Circle().fill(Sunnah.Colors.bg.opacity(0.92)))
                            .foregroundStyle(Sunnah.Colors.primary)
                    }
                    .accessibilityLabel(tasmee.hideVerses ? "إظهار الآيات" : "إخفاء الآيات")
                    .accessibilityIdentifier("mushaf.tasmee.hide")
                    Button { tasmee.hapticsOn.toggle() } label: {
                        Image(systemName: tasmee.hapticsOn ? "waveform" : "waveform.slash").font(.system(size: 17, weight: .semibold))
                            .frame(width: 44, height: 44).background(Circle().fill(Sunnah.Colors.bg.opacity(0.92)))
                            .foregroundStyle(Sunnah.Colors.primary)
                    }
                    .accessibilityLabel(tasmee.hapticsOn ? "إيقاف الاهتزاز" : "تشغيل الاهتزاز")
                    .accessibilityIdentifier("mushaf.tasmee.haptics")
                    Button { tasmee.soundOn.toggle() } label: {
                        Image(systemName: tasmee.soundOn ? "speaker.wave.2.fill" : "speaker.slash.fill").font(.system(size: 17, weight: .semibold))
                            .frame(width: 44, height: 44).background(Circle().fill(Sunnah.Colors.bg.opacity(0.92)))
                            .foregroundStyle(Sunnah.Colors.primary)
                    }
                    .accessibilityLabel(tasmee.soundOn ? "إيقاف صوت التنبيه" : "تشغيل صوت التنبيه")
                    .accessibilityIdentifier("mushaf.tasmee.sound")
                }
                Button(action: onTap) {
                    ZStack {
                        Circle().fill(tasmee.phase == .listening ? Color(red: 0.69, green: 0.21, blue: 0.17) : Sunnah.Colors.primary)   // أحمر ثابت داكن: الأيقونة بيضاء فيبقى التباين ≥3:1 في الوضعين
                        switch tasmee.phase {
                        case .preparing, .downloading: ProgressView().tint(.white)
                        default: Image(systemName: tasmee.phase == .listening ? "stop.fill" : "mic.fill").font(.system(size: 20, weight: .semibold)).foregroundStyle(.white)
                        }
                    }
                    .frame(width: 56, height: 56).shadow(color: .black.opacity(0.18), radius: 6, y: 2)
                }
                .accessibilityLabel(tasmee.phase == .listening ? "إنهاء التسميع" : "ابدأ التسميع")
                .accessibilityIdentifier("mushaf.tasmee.mic")
            }
        }
        .offset(x: dragBase.width + drag.width, y: dragBase.height + drag.height)
        .simultaneousGesture(
            DragGesture(minimumDistance: 12)
                .updating($drag) { v, st, _ in st = v.translation }
                .onEnded { v in dragBase.width += v.translation.width; dragBase.height += v.translation.height })
        .environment(\.layoutDirection, .rightToLeft)
    }
}

/// موجة الميكروفون الحية: أعمدة تتبع مستوى RMS الفعلي (كل عمود يحمل مستوى أقدم، فتنساب من اليمين لليسار).
struct TasmeeWaveform: View {
    let level: Float
    @State private var history = Array(repeating: Float(0), count: 15)

    var body: some View {
        HStack(alignment: .center, spacing: 3) {
            ForEach(history.indices, id: \.self) { i in
                Capsule().fill(Sunnah.Colors.primary.opacity(0.85))
                    .frame(width: 3, height: 4 + CGFloat(history[i]) * 24)
            }
        }
        .frame(height: 28)
        .padding(.horizontal, 12).padding(.vertical, 4)
        .background(Capsule().fill(Sunnah.Colors.bg.opacity(0.92)))
        .onChange(of: level) { v in withAnimation(.linear(duration: 0.08)) { history.removeFirst(); history.append(v) } }
        .accessibilityHidden(true)
    }
}

/// شاشة الموافقة قبل أول تنزيل: الحجم، Wi-Fi فقط، ونص الميكروفون الواضح.
struct MushafTasmeeConsent: View {
    @ObservedObject var tasmee: MushafTasmeeController

    private var sizeText: String {
        guard let b = tasmee.modelBytes else { return "حجم النموذج غير معروف" }
        return Sunnah.digits(ByteCountFormatter.string(fromByteCount: b, countStyle: .file))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            Text("التسميع على جهازك").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Label("يُنزَّل نموذج التعرّف على التلاوة مرة واحدة (\(sizeText)) عبر Wi-Fi فقط.", systemImage: "wifi")
                    Label("نموذج مفتوح الرخصة (Apache-2.0) يعمل على جهازك بلا إنترنت بعد التنزيل.", systemImage: "cpu")
                    Label("سيُطلب إذن الميكروفون بعد التنزيل لتسجيل تلاوتك. تُعالج التلاوة على جهازك فقط ولا تُرسل ولا تُحفظ.", systemImage: "mic")
                }
                .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            if case .downloading(let p) = tasmee.phase {
                ProgressView(value: p).tint(Sunnah.Colors.primary)
                Text("جارٍ التنزيل…").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            } else {
                SunnahButton("تنزيل والمتابعة") { Task { await tasmee.confirmDownload() } }
                SunnahButton("ليس الآن", style: .secondary) { tasmee.cancelConsent() }
            }
        }
        .padding(Sunnah.Spacing.pageX)
        .environment(\.layoutDirection, .rightToLeft)
        .background(Sunnah.Colors.bg)
    }
}

/// تقرير نهاية الجلسة بالبطاقة الموحّدة.
struct MushafTasmeeReport: View {
    let report: TasmeeSessionReport
    let onDone: () -> Void

    private var accuracy: Int { report.total == 0 ? 0 : Int((Double(report.correct) / Double(report.total) * 100).rounded()) }

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            Text("تقرير التسميع").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    Text(Sunnah.digits("\(accuracy)٪")).font(.system(size: 44, weight: .bold, design: .rounded)).foregroundStyle(Sunnah.Colors.primary)
                        .accessibilityLabel("نسبة الصحة \(accuracy) بالمئة")
                    row("كلمات صحيحة", report.correct, "checkmark.circle.fill", Sunnah.Colors.primary)
                    row("أخطاء", report.wrong, "xmark.circle.fill", Sunnah.Colors.danger)
                    row("كلمات متجاوزة", report.skipped, "exclamationmark.triangle.fill", .orange)
                    Text(Sunnah.digits("من أصل \(report.total) كلمة")).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            SunnahButton("تم", action: onDone)
        }
        .padding(Sunnah.Spacing.pageX)
        .environment(\.layoutDirection, .rightToLeft)
        .background(Sunnah.Colors.bg)
    }

    private func row(_ title: String, _ n: Int, _ symbol: String, _ color: Color) -> some View {
        HStack {
            Image(systemName: symbol).foregroundStyle(color)
            Text(title).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
            Spacer()
            Text(Sunnah.digits("\(n)")).font(Sunnah.Typography.body.weight(.bold)).foregroundStyle(Sunnah.Colors.textPrimary)
        }
        .accessibilityElement(children: .combine)
    }
}

/// يجمع طبقات التسميع (الزر العائم، الموافقة، التقرير، متابعة الصفحة) في مُعدِّل واحد.
struct MushafTasmeeHost: ViewModifier {
    @ObservedObject var box: MushafTasmeeBox
    let engine: RecitationEngineControlling?
    @Binding var current: Int
    let surahName: (Int) -> String

    private var consentBinding: Binding<Bool> {
        Binding(get: { switch box.controller?.phase { case .consent, .downloading: return true; default: return false } },
                set: { if !$0 { box.controller?.cancelConsent() } })
    }
    private var reportBinding: Binding<Bool> {
        Binding(get: { if case .finished = box.controller?.phase { return true } else { return false } },
                set: { if !$0 { box.controller?.dismissReport() } })
    }

    func body(content: Content) -> some View {
        content
            .sunnahSheet(isPresented: Binding(get: { box.controller?.showModeSheet ?? false }, set: { box.controller?.showModeSheet = $0 })) {
                if let t = box.controller { TasmeeModeSheet { t.startWith($0) }.presentationDetents([.large]) }
            }
            .sunnahSheet(isPresented: consentBinding) {
                if let t = box.controller { MushafTasmeeConsent(tasmee: t).presentationDetents([.medium]) }
            }
            .sunnahSheet(isPresented: reportBinding) {
                if let t = box.controller, case .finished(let r) = t.phase {
                    if let rec = t.lastRecord {
                        TasmeeReportScreen(record: rec, surahName: surahName(rec.surah)) { _ in t.dismissReport() }
                    } else {
                        MushafTasmeeReport(report: r) { t.dismissReport() }.presentationDetents([.medium])
                    }
                }
            }
            .task(id: engine.map(ObjectIdentifier.init)) { box.attach(engine) }   // المنصّة تُبنى بعد أول إطار: المحرك يصل متأخرًا (task يلتقط القيمة الجديدة، onChange يلتقط القديمة)
            .onChange(of: box.controller?.followPage) { p in
                if let p, p != current { current = p }
            }
    }
}
