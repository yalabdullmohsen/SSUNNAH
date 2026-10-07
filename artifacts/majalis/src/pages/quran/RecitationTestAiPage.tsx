/**
 * اختبار التلاوة بالذكاء الاصطناعي — أخطاء الحفظ (الكلمات) فقط.
 * التدفق: اختيار سورة/مقطع ← تسجيل ← تفريغ على الخادم ← مطابقة مع نص المصحف بعد التطبيع ← نتيجة ملوّنة بنصوص.
 * لا يقيّم أحكام التجويد. لا يُخزَّن التسجيل بعد المعالجة.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { Button, Card, ListGroup, Notice, SectionHeader } from "@/design-system";
import { fetchSurahDetail, getSurahList } from "@/lib/quran-api";
import { resolveCanonicalAyahHref } from "@/lib/quran-navigation/href";
import { toArabicIndicDigits } from "@/lib/numerals";
import { compareRecitation, type ExpectedAyah, type RecitationComparison, type WordStatus } from "@/lib/recitation-test/align";
import {
  isRecordingSupported,
  MIN_RECORDING_MS,
  startRecording,
  type RecorderSession,
  type RecordingResult,
} from "@/lib/recitation-test/recorder";
import { AsrError, checkAsrAvailability, transcribeRecitation, type AsrAvailability } from "@/lib/recitation-test/api";

const PATH = "/quran/recitation-test-ai";
/** حدّ مقطع الاختبار: يكفي ≤45 ثانية تلاوة. */
const MAX_AYAHS = 10;

type Phase = "idle" | "recording" | "processing" | "result" | "error";

const STATUS_LABEL: Record<WordStatus, string> = {
  correct: "صحيحة",
  missing: "ناقصة",
  substituted: "مبدّلة",
};

/** نمط الكلمة بحسب الحالة — رموز نظام التصميم، والحالة تُكتب نصًّا أيضًا (لا اعتماد على اللون وحده). */
const STATUS_STYLE: Record<WordStatus, React.CSSProperties> = {
  correct: {},
  missing: { color: "var(--sn-danger)", textDecoration: "line-through" },
  substituted: { color: "var(--sn-warning)", textDecoration: "underline wavy" },
};

const INPUT_STYLE: React.CSSProperties = { width: "100%" };

/** نص المصحف بخط القرآن المركزي. */
const QURAN_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-quran)",
  fontSize: "var(--sn-fs-title3)",
  lineHeight: 2.2,
  margin: 0,
};

export default function RecitationTestAiPage() {
  const surahs = useMemo(() => getSurahList(), []);
  const [surah, setSurah] = useState(1);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(7);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AsrAvailability | null>(null);
  const [result, setResult] = useState<RecitationComparison | null>(null);
  const [showText, setShowText] = useState(false);
  const session = useRef<RecorderSession | null>(null);

  const meta = surahs[surah - 1];
  const maxAyah = meta?.ayahs ?? 7;

  useEffect(() => {
    applyPageSeo({
      path: PATH,
      title: "اختبار التلاوة بالذكاء الاصطناعي | سُنّة",
      description: "سمِّع ما حفظتَ من المصحف وقارنه بالنص: كلمات صحيحة وناقصة وزائدة ومبدّلة. لا يقيّم أحكام التجويد.",
      robots: "noindex, follow",
    });
    void checkAsrAvailability().then(setAvailability);
    return () => session.current?.cancel();
  }, []);

  const clampRange = useCallback(
    (nextFrom: number, nextTo: number) => {
      const f = Math.max(1, Math.min(maxAyah, Math.floor(nextFrom) || 1));
      const t = Math.max(f, Math.min(maxAyah, f + MAX_AYAHS - 1, Math.floor(nextTo) || f));
      setFrom(f);
      setTo(t);
    },
    [maxAyah],
  );

  const onSurahChange = (n: number) => {
    setSurah(n);
    const ayahs = surahs[n - 1]?.ayahs ?? 7;
    setFrom(1);
    setTo(Math.min(ayahs, MAX_AYAHS));
    setResult(null);
    setPhase("idle");
  };

  const finish = useCallback(
    async (rec: RecordingResult) => {
      session.current = null;
      if (rec.durationMs < MIN_RECORDING_MS) {
        setPhase("error");
        setMessage("التسجيل قصير جدًا. سمِّع المقطع كاملًا ثم أوقف التسجيل.");
        return;
      }
      setPhase("processing");
      try {
        const detail = await fetchSurahDetail(surah);
        const ayahs: ExpectedAyah[] = detail.ayahs
          .filter((a) => a.numberInSurah >= from && a.numberInSurah <= to)
          .map((a) => ({ ayah: a.numberInSurah, text: a.text }));
        const transcript = await transcribeRecitation(rec);
        // التسجيل أُتلف هنا: لا مرجع له بعد هذه النقطة (rec خارج النطاق)
        if (!transcript.trim()) {
          setPhase("error");
          setMessage("لم يُسمع كلام واضح. اقترب من الميكروفون وأعد المحاولة في مكان هادئ.");
          return;
        }
        setResult(compareRecitation(surah, ayahs, transcript));
        setPhase("result");
      } catch (e) {
        setPhase("error");
        setMessage(e instanceof AsrError || e instanceof Error ? e.message : "حدث خطأ غير متوقع.");
      }
    },
    [surah, from, to],
  );

  const start = async () => {
    setMessage(null);
    setResult(null);
    try {
      session.current = await startRecording((rec) => void finish(rec));
      setPhase("recording");
    } catch (e) {
      const name = (e as { name?: string })?.name;
      setPhase("error");
      setMessage(
        name === "NotAllowedError" || name === "SecurityError"
          ? "لم يُسمح بالميكروفون. فعّله من إعدادات الجهاز (الإعدادات ← سُنّة ← الميكروفون) ثم أعد المحاولة."
          : name === "NotFoundError"
            ? "لم نجد ميكروفونًا في هذا الجهاز."
            : "تعذّر بدء التسجيل.",
      );
    }
  };

  const stop = async () => {
    const s = session.current;
    if (!s) return;
    try {
      const rec = await s.stop();
      await finish(rec);
    } catch {
      /* أُلغي */
    }
  };

  const reset = () => {
    session.current?.cancel();
    session.current = null;
    setPhase("idle");
    setResult(null);
    setMessage(null);
  };

  const supported = isRecordingSupported();
  const unavailable = availability === "unconfigured";

  return (
    <div className="sn-screen" data-testid="recitation-test-screen">
      <div className="sn-container sn-stack sn-stack--lg" dir="rtl">
        <SectionHeader title="اختبار التلاوة" />
        <p className="sn-t-secondary">سمِّع ما حفظتَ ثم قارنه بنص المصحف كلمةً كلمة.</p>

        <Notice tone="info">
          يكشف أخطاء <strong>الحفظ</strong> فقط: كلمات ناقصة أو زائدة أو مبدّلة. <strong>لا يقيّم أحكام التجويد</strong> ولا مخارج
          الحروف ولا المدود. النتيجة مساعدة للمراجعة وتتأثر بجودة الصوت — وليست حكمًا نهائيًا.
        </Notice>

        <Card variant="standard">
          <div className="sn-stack" aria-label="اختيار المقطع" role="group">
            <div className="sn-field">
              <label htmlFor="rt-surah" className="sn-field__label">السورة</label>
              <select
                id="rt-surah"
                className="sn-field__input"
                style={INPUT_STYLE}
                value={surah}
                onChange={(e) => onSurahChange(Number(e.target.value))}
                disabled={phase === "recording" || phase === "processing"}
              >
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {toArabicIndicDigits(s.number)} · {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sn-row">
              <div className="sn-field" style={{ flex: 1 }}>
                <label htmlFor="rt-from" className="sn-field__label">من الآية</label>
                <input
                  id="rt-from"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxAyah}
                  className="sn-field__input"
                  style={INPUT_STYLE}
                  value={from}
                  onChange={(e) => clampRange(Number(e.target.value), to)}
                  disabled={phase === "recording" || phase === "processing"}
                />
              </div>
              <div className="sn-field" style={{ flex: 1 }}>
                <label htmlFor="rt-to" className="sn-field__label">إلى الآية</label>
                <input
                  id="rt-to"
                  type="number"
                  inputMode="numeric"
                  min={from}
                  max={Math.min(maxAyah, from + MAX_AYAHS - 1)}
                  className="sn-field__input"
                  style={INPUT_STYLE}
                  value={to}
                  onChange={(e) => clampRange(from, Number(e.target.value))}
                  disabled={phase === "recording" || phase === "processing"}
                />
              </div>
            </div>
            <p className="sn-t-footnote sn-t-secondary">
              الحدّ {toArabicIndicDigits(MAX_AYAHS)} آيات في المرة الواحدة، والتسجيل حتى ٤٥ ثانية.
            </p>
            <label className="sn-t-footnote">
              <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} /> إظهار نص المقطع أثناء
              التسجيل (للقراءة لا للحفظ)
            </label>
          </div>
        </Card>

        {showText && phase !== "result" ? <ExpectedPreview surah={surah} from={from} to={to} /> : null}

        {!supported ? (
          <Notice tone="danger">التسجيل غير مدعوم في هذا المتصفح. افتح الصفحة في Safari أو Chrome حديث، أو من تطبيق سُنّة.</Notice>
        ) : unavailable ? (
          <Notice tone="info">
            خدمة التعرّف الصوتي غير مفعّلة بعد. يمكنك في الأثناء استخدام «مسار الحفظ» و«حلقة الحفظ الصوتية».
          </Notice>
        ) : availability === "offline" ? (
          <Notice tone="info">اختبار التلاوة يحتاج اتصالًا بالإنترنت لتفريغ الصوت.</Notice>
        ) : null}

        <div className="sn-row">
          {phase === "recording" ? (
            <Button variant="primary" block onClick={() => void stop()}>
              إيقاف وتحليل
            </Button>
          ) : (
            <Button
              variant="primary"
              block
              icon="tilawa"
              onClick={() => void start()}
              disabled={!supported || unavailable || phase === "processing"}
            >
              {phase === "result" || phase === "error" ? "تسجيل جديد" : "ابدأ التسجيل"}
            </Button>
          )}
          {(phase === "result" || phase === "error" || phase === "recording") && (
            <Button variant="secondary" onClick={reset}>
              إعادة
            </Button>
          )}
        </div>

        <p role="status" aria-live="polite" className="sn-t-footnote">
          {phase === "recording" ? "جارٍ التسجيل… سمِّع المقطع ثم اضغط «إيقاف وتحليل»." : null}
          {phase === "processing" ? "جارٍ تحليل التلاوة…" : null}
        </p>

        {phase === "error" && message ? <Notice tone="danger">{message}</Notice> : null}

        {phase === "result" && result ? <ResultView surah={surah} result={result} /> : null}

        <p className="sn-t-footnote sn-t-secondary">
          الخصوصية: يُرسَل التسجيل مرة واحدة للتفريغ ولا يُخزَّن بعد المعالجة (لا على جهازك ولا على الخادم)، ولا نحتفظ بالنص
          المفرَّغ.
        </p>
        <ListGroup>
          <Link href="/hifz-path" className="sn-row-item sn-pressable">
            <span className="sn-row-item__body"><span className="sn-row-item__title">مسار الحفظ</span></span>
          </Link>
          <Link href="/quran/hifz-loop" className="sn-row-item sn-pressable">
            <span className="sn-row-item__body"><span className="sn-row-item__title">حلقة الحفظ الصوتية</span></span>
          </Link>
        </ListGroup>
      </div>
    </div>
  );
}

function ExpectedPreview({ surah, from, to }: { surah: number; from: number; to: number }) {
  const [ayahs, setAyahs] = useState<ExpectedAyah[]>([]);
  useEffect(() => {
    let live = true;
    void fetchSurahDetail(surah).then((d) => {
      if (!live) return;
      setAyahs(d.ayahs.filter((a) => a.numberInSurah >= from && a.numberInSurah <= to).map((a) => ({ ayah: a.numberInSurah, text: a.text })));
    });
    return () => {
      live = false;
    };
  }, [surah, from, to]);
  return (
    <Card variant="standard">
      <p style={QURAN_STYLE}>{ayahs.map((a) => `${a.text} ﴿${toArabicIndicDigits(a.ayah)}﴾`).join(" ")}</p>
    </Card>
  );
}

function ResultView({ surah, result }: { surah: number; result: RecitationComparison }) {
  const { counts } = result;
  return (
    <section className="sn-stack" aria-label="نتيجة الاختبار">
      <SectionHeader title={`النتيجة: ${toArabicIndicDigits(result.accuracy)}٪ من الكلمات صحيحة`} />
      <Card variant="standard">
        <ul className="sn-stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          <li>صحيحة: {toArabicIndicDigits(counts.correct)}</li>
          <li>ناقصة: {toArabicIndicDigits(counts.missing)}</li>
          <li>مبدّلة: {toArabicIndicDigits(counts.substituted)}</li>
          <li>زائدة: {toArabicIndicDigits(counts.extra)}</li>
        </ul>
      </Card>

      <Card variant="standard">
        <p style={QURAN_STYLE} aria-label="النص مع التقييم">
          {result.words.map((w, i) => {
            const extrasHere = result.extras.filter((e) => e.afterWord === i);
            return (
              <span key={`${w.ayah}-${i}`}>
                {extrasHere.map((e, k) => (
                  <span key={`x${k}`} style={{ color: "var(--sn-text-tertiary)", fontStyle: "italic" }} title="كلمة زائدة نطقتَها">
                    {" +"}
                    {e.text}{" "}
                  </span>
                ))}
                <span
                  style={STATUS_STYLE[w.status]}
                  title={w.status === "substituted" && w.heard ? `سُمعت: ${w.heard}` : STATUS_LABEL[w.status]}
                >
                  {w.text}
                  {w.status !== "correct" ? <sup className="sn-t-footnote"> {STATUS_LABEL[w.status]}</sup> : null}
                </span>{" "}
              </span>
            );
          })}
          {result.extras
            .filter((e) => e.afterWord >= result.words.length)
            .map((e, k) => (
              <span key={`tail${k}`} style={{ color: "var(--sn-text-tertiary)", fontStyle: "italic" }}>
                {" +"}
                {e.text}{" "}
              </span>
            ))}
        </p>
      </Card>

      {result.ayahsWithErrors.length ? (
        <>
          <SectionHeader title="آيات تحتاج مراجعة — انتقل إليها في المصحف" />
          <ListGroup>
            {result.ayahsWithErrors.map((a) => (
              <Link
                key={a}
                href={resolveCanonicalAyahHref(surah, a, "other", { returnTo: PATH })}
                className="sn-row-item sn-pressable"
              >
                <span className="sn-row-item__body">
                  <span className="sn-row-item__title">الآية {toArabicIndicDigits(a)}</span>
                </span>
              </Link>
            ))}
          </ListGroup>
        </>
      ) : (
        <Notice tone="success">ما شاء الله — لم تُرصد أخطاء حفظ في هذا المقطع (وهذا لا يعني سلامة التجويد).</Notice>
      )}
    </section>
  );
}
