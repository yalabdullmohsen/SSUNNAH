/**
 * اختبار التكامل على المحاكي (Debug/TestFlight فقط): ملف صوتي مسجَّل يمر عبر محرك Swift الحقيقي بدل الميكروفون،
 * وتُسجَّل علامات كلمات الصفحة كما تظهر في DOM بترتيب حدوثها ثم تُكتب نتيجةً (علامات فقط، لا صوت).
 * يُشغَّل من scripts/tasmee-sim-integration.sh بوسائط الإطلاق؛ بلا وسائط — أو في App Store حيث الدوال غير مجمَّعة — لا يفعل شيئًا.
 */
import { useEffect, useRef, useState } from "react";
import { isTasmeeDiagnosticsAllowed, tasmeeNative, type TasmeeFeedConfig } from "@/lib/tasmee/engine-plugin";
import type { ModelPhase } from "./useTasmeeModel";
import type { TasmeeLiveStats } from "./useTasmeeEngine";

/** ما تقرؤه النتيجة من الطبقة: إحصاءات لوحة القياس، وعدد التنبيهات (اهتزاز/نغمة) المُطلقة فعلًا. */
export type FeedProbe = { stats: TasmeeLiveStats; alertsFired: number };

async function feedConfig(): Promise<TasmeeFeedConfig | null> {
  if (!(await isTasmeeDiagnosticsAllowed())) return null;
  const c = await tasmeeNative.getFeedConfig().catch(() => null);
  return c?.enabled && c.file && c.page > 0 ? c : null;
}

/** عند الإقلاع: يفتح صفحة التغذية في القارئ. */
export async function openFeedPageIfConfigured(): Promise<void> {
  const c = await feedConfig();
  if (!c) return;
  window.history.pushState({}, "", `/mushaf/page/${c.page}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export type FeedMarkEvent = { tMs: number; index: number; text: string; state: string };

const MARKED = new Set(["ok", "wrong", "skipped"]);

function pageWords(article: HTMLElement): HTMLElement[] {
  return Array.from(article.querySelectorAll<HTMLElement>(".nm-line .nm-word")).filter((el) => !el.classList.contains("nm-word--end"));
}

type Options = {
  pageNumber: number;
  probeRef: { current: FeedProbe };
  modelPhase: ModelPhase;
  download: () => void;
  /** وضع التسميع + بدء التسجيل */
  begin: () => void;
  end: () => void;
};

/** يعيد اسم ملف التغذية لتمريره إلى `engine.start` (undefined = الميكروفون). */
export function useTasmeeFeedHarness({ pageNumber, probeRef, modelPhase, download, begin, end }: Options): string | undefined {
  const [cfg, setCfg] = useState<TasmeeFeedConfig | null>(null);
  const stepRef = useRef<"idle" | "downloading" | "running">("idle");
  const cbRef = useRef({ download, begin, end });
  cbRef.current = { download, begin, end };

  useEffect(() => {
    let alive = true;
    void feedConfig().then((c) => alive && c?.page === pageNumber && setCfg(c));
    return () => {
      alive = false;
    };
  }, [pageNumber]);

  useEffect(() => {
    if (!cfg) return;
    if ((modelPhase === "missing" || modelPhase === "paused") && stepRef.current === "idle") {
      stepRef.current = "downloading";
      cbRef.current.download();
    }
    if (modelPhase !== "ready" || stepRef.current === "running") return;
    const article = document.querySelector<HTMLElement>(`article.nm-page[data-page="${cfg.page}"]`);
    if (!article) return;
    stepRef.current = "running";
    const t0 = performance.now();
    const events: FeedMarkEvent[] = [];
    const last = new Map<HTMLElement, string>();
    const obs = new MutationObserver((muts) => {
      const words = pageWords(article);
      for (const m of muts) {
        const el = m.target as HTMLElement;
        const state = el.getAttribute("data-tasmee") ?? "";
        if (!MARKED.has(state) || last.get(el) === state) continue;
        last.set(el, state);
        events.push({ tMs: Math.round(performance.now() - t0), index: words.indexOf(el), text: el.textContent ?? "", state });
      }
    });
    obs.observe(article, { subtree: true, attributes: true, attributeFilter: ["data-tasmee"] });
    cbRef.current.begin();
    const stopAt = window.setTimeout(() => cbRef.current.end(), (cfg.seconds + 12) * 1000);
    const writeAt = window.setTimeout(() => {
      obs.disconnect();
      const words = pageWords(article);
      const result = {
        page: cfg.page,
        file: cfg.file,
        seconds: cfg.seconds,
        words: words.map((el) => el.textContent ?? ""),
        events,
        final: words.map((el) => el.getAttribute("data-tasmee") ?? ""),
        alertsFired: probeRef.current.alertsFired,
        stats: probeRef.current.stats,
      };
      void tasmeeNative.writeFeedResult(JSON.stringify(result));
    }, (cfg.seconds + 14) * 1000);
    return () => {
      obs.disconnect();
      window.clearTimeout(stopAt);
      window.clearTimeout(writeAt);
    };
  }, [cfg, modelPhase, probeRef]);

  return cfg?.file;
}
