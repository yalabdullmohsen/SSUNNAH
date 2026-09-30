/**
 * إرشاد أول استخدام خفيف داخل المصحف — لا يغطي النص بصورة مزعجة، قابل للتجاوز،
 * يُخزَّن اكتماله محليًا، ويدعم لوحة المفاتيح وreduced motion.
 */
import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mushaf-reading-coach-v1";

const TIPS = [
  {
    title: "اسحب للتقليب",
    body: "اسحب فوق الصفحة أو استخدم الأسهم للانتقال بين الصفحات.",
  },
  {
    title: "انقر لإظهار الأدوات",
    body: "نقرة على مساحة فارغة تُظهر أو تخفي شريط الأدوات.",
  },
  {
    title: "اضغط آية للإجراءات",
    body: "اختيار آية يفتح التفسير والتلاوة والعلامة.",
  },
  {
    title: "العلامات",
    body: "احفظ موضعك وراجع علاماتك من قائمة المزيد.",
  },
] as const;

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "done";
  } catch {
    return true;
  }
}

function persistDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    /* private mode */
  }
}

type Props = {
  /** لا تُظهر أثناء الشيتات أو القوائم المتداخلة */
  blocked?: boolean;
};

export function MushafReadingCoach({ blocked = false }: Props) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (blocked) return;
    if (isDismissed()) return;
    const t = window.setTimeout(() => setOpen(true), 480);
    return () => window.clearTimeout(t);
  }, [blocked]);

  const finish = useCallback(() => {
    persistDismissed();
    setOpen(false);
  }, []);

  const next = useCallback(() => {
    if (step >= TIPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }, [finish, step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish, open]);

  if (!open || blocked) return null;

  const tip = TIPS[step] ?? TIPS[0];

  return (
    <div
      className="nm-reading-coach"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-testid="mushaf-reading-coach"
    >
      <p className="nm-reading-coach__eyebrow">دليل سريع</p>
      <h2 id={titleId} className="nm-reading-coach__title">
        {tip.title}
      </h2>
      <p className="nm-reading-coach__body">{tip.body}</p>
      <div className="nm-reading-coach__actions">
        <Button type="button" variant="ghost" size="small" onClick={finish} aria-label="تخطي الدليل">
          تخطي
        </Button>
        <Button
          type="button"
          variant="primary"
          size="small"
          onClick={next}
          aria-label={step >= TIPS.length - 1 ? "إنهاء الدليل" : "التالي"}
        >
          {step >= TIPS.length - 1 ? "فهمت" : "التالي"}
        </Button>
      </div>
      <p className="nm-reading-coach__progress" aria-hidden="true">
        {step + 1}/{TIPS.length}
      </p>
    </div>
  );
}

/** للاختبارات — إعادة فتح الدليل */
export function resetMushafReadingCoachForTests(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
