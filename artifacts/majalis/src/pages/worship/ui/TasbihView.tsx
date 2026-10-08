import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Notice, PageHero, SegmentedTabs, StatGrid, StatTile, TextField } from "@/design-system";
import { formatNumber } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import { TasbeehCounter } from "@/components/reading/TasbeehCounter";
import { setTaskProgress } from "@/lib/daily-progress";
import { applyPageSeo } from "@/lib/seo";
import { ShareButtons } from "@/components/ContentActions";
import { SectionQuiz } from "@/components/ui/SectionQuiz";
import { useDialogKeyboard } from "@/hooks/useDialogKeyboard";
import "@/styles/pages/tasbih.css";
import {
  computeStreakDays,
  computeTasbeehStats,
  DEFAULT_TASBEEH_AWRAD,
  loadTasbeehFromAccount,
  mergeTasbeehAwrad,
  readTasbeehAwrad,
  syncTasbeehToAccount,
  writeTasbeehAwrad,
  type TasbeehWird,
} from "@/lib/tasbeeh-storage";

import { SITE_URL } from "@/lib/site-config";
const MAX_CUSTOM_TARGET = 99999;

function writeAwrad(items: TasbeehWird[]) {
  writeTasbeehAwrad(items);
  const total = items.reduce((sum, item) => sum + (item.lifetimeTotal || 0), 0);
  setTaskProgress("tasbih", total);
}

export default function TasbihPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [items, setItems] = useState<TasbeehWird[]>(() => readTasbeehAwrad());
  const [activeId, setActiveId] = useState(() => readTasbeehAwrad()[0]?.id || DEFAULT_TASBEEH_AWRAD[0].id);
  const [newPhrase, setNewPhrase] = useState("");
  const [newTarget, setNewTarget] = useState(33);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const closeConfirm = useCallback(() => setConfirmDelete(false), []);
  useDialogKeyboard(confirmDelete, confirmRef, closeConfirm, {
    initialFocusRef: confirmCancelRef,
    returnFocusRef: actionsRef,
  });

  const active = items.find((item) => item.id === activeId) || items[0];

  useEffect(() => {
    applyPageSeo({
      path: "/tasbih",
      title: "التسبيح الرقمي | سُنّة",
      description: "عداد التسبيح الرقمي مع أوراد قابلة للتخصيص، سبّح بحمد الله واذكر الله في أي وقت مع متابعة تقدمك اليومي.",
      keywords: ["تسبيح", "ذكر الله", "عداد تسبيح", "أوراد", "أذكار"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "عداد التسبيح الرقمي",
          url: `${SITE_URL}/tasbih`,
          description: "عداد تسبيح رقمي مع أوراد قابلة للتخصيص لذكر الله في أي وقت",
          applicationCategory: "LifestyleApplication",
          inLanguage: "ar",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      ],
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadTasbeehFromAccount().then((remote) => {
      if (!remote) return;
      const merged = mergeTasbeehAwrad(readTasbeehAwrad(), remote);
      setItems(merged);
      writeAwrad(merged);
      setSyncNote("تمت مزامنة الأوراد من حسابك");
    });
  }, [isLoggedIn]);

  const aggregateStats = useMemo(() => {
    let today = 0;
    let week = 0;
    let month = 0;
    let total = 0;
    for (const item of items) {
      const s = computeTasbeehStats(item);
      today += s.today;
      week += s.week;
      month += s.month;
      total += s.total;
    }
    const streak = computeStreakDays(items);
    return { today, week, month, total, streak };
  }, [items]);

  const updateItems = useCallback((next: TasbeehWird[]) => {
    setItems(next);
    writeAwrad(next);
    if (isLoggedIn) {
      syncTasbeehToAccount(next).then((r) => {
        if (r.ok) setSyncNote("تم حفظ التقدم في حسابك");
      });
    }
  }, [isLoggedIn]);

  const onWirdChange = useCallback((next: TasbeehWird) => {
    updateItems(items.map((w) => (w.id === next.id ? next : w)));
  }, [items, updateItems]);

  const addWird = () => {
    const phrase = newPhrase.trim();
    if (!phrase) return;
    const item: TasbeehWird = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      phrase,
      target: Math.max(1, Math.min(MAX_CUSTOM_TARGET, newTarget)),
      count: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dailyHistory: {},
      lifetimeTotal: 0,
    };
    updateItems([...items, item]);
    setActiveId(item.id);
    setNewPhrase("");
    setNewTarget(33);
  };

  const deleteActive = () => {
    if (!active || items.length <= 1) return;
    const next = items.filter((item) => item.id !== active.id);
    updateItems(next);
    setActiveId(next[0].id);
    setConfirmDelete(false);
  };

  const activeStats = active ? computeTasbeehStats(active) : null;

  return (
    <div className="sn-screen" data-testid="tasbih-screen">
      <div className="sn-container sn-container-below-bar sn-stack sn-stack--lg">
        <PageHero tag="الأذكار" title="عداد التسبيح" description="عدّ بلا حد أقصى، اختر هدفك، مع حفظ تلقائي." />

        {aggregateStats.total === 0 ? (
          <Notice>ابدأ وردك الأول — لم يُسجَّل تسبيح بعد.</Notice>
        ) : (
          <StatGrid>
            <StatTile label="اليوم" value={formatNumber(aggregateStats.today)} />
            <StatTile label="الأسبوع" value={formatNumber(aggregateStats.week)} />
            <StatTile label="الشهر" value={formatNumber(aggregateStats.month)} />
            <StatTile label="الإجمالي" value={formatNumber(aggregateStats.total)} />
          </StatGrid>
        )}
        {aggregateStats.streak > 0 ? <Notice tone="success">{`التتابع: ${formatNumber(aggregateStats.streak)}\u00A0يومًا`}</Notice> : null}

        <SegmentedTabs
          label="اختر الورد"
          value={active?.id ?? ""}
          onChange={setActiveId}
          options={items.map((item) => ({ value: item.id, label: item.phrase }))}
        />

        {active && (
          <Card id="tasbih-wird-panel" role="tabpanel" className="sn-stack">
            <TasbeehCounter
              storageId={`wird-${active.id}`}
              target={active.target}
              label={active.phrase}
              wird={active}
              onWirdChange={onWirdChange}
            />
            {activeStats && (
              <p className="sn-t-secondary">
                {`هذا الورد — اليوم: ${formatNumber(activeStats.today)}\u00A0·\u00A0الأسبوع: ${formatNumber(activeStats.week)}\u00A0·\u00A0الشهر: ${formatNumber(activeStats.month)}`}
              </p>
            )}
            <div ref={actionsRef}>
              {confirmDelete ? (
                <div ref={confirmRef} className="sn-stack" role="alertdialog" aria-labelledby="tasbih-delete-title" aria-describedby="tasbih-delete-desc">
                  <p id="tasbih-delete-title"><strong>تأكيد الحذف</strong></p>
                  <p id="tasbih-delete-desc" className="sn-t-secondary">هل تريد حذف هذا الورد نهائيًا؟</p>
                  <Button variant="destructive" block onClick={deleteActive}>تأكيد الحذف</Button>
                  <Button ref={confirmCancelRef} variant="secondary" block onClick={closeConfirm}>إلغاء</Button>
                </div>
              ) : (
                <Button variant="destructive" block onClick={() => setConfirmDelete(true)} disabled={items.length <= 1}>
                  حذف الورد
                </Button>
              )}
            </div>
          </Card>
        )}

        <Card className="sn-stack">
          <h2 className="sn-t-title3">إضافة ورد جديد</h2>
          <TextField
            id="tasbih-new-phrase"
            label="نص الورد"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            placeholder="مثال: لا حول ولا قوة إلا بالله"
            onKeyDown={(e) => e.key === "Enter" && addWird()}
          />
          <TextField
            id="tasbih-new-target"
            label="الهدف اليومي"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_CUSTOM_TARGET}
            value={newTarget}
            onChange={(e) => setNewTarget(Number(e.target.value))}
          />
          <Button variant="primary" block onClick={addWird}>إضافة</Button>
        </Card>

        <p className="sn-t-secondary" role="status" aria-live="polite">
          {syncNote ? `${syncNote} · ` : null}
          {authLoading
            ? "…"
            : isLoggedIn
              ? "يُحفظ محليًا ويُزامَن مع حسابك عند التحديث."
              : "يُحفظ في هذا الجهاز. سجّل الدخول للمزامنة مع حسابك."}
        </p>

        <ShareButtons title="التسبيح الرقمي — سُنّة" url={`${SITE_URL}/tasbih`} />
        <SectionQuiz sectionId="akhlaq" title="اختبر معلوماتك في الأذكار والأخلاق" count={4} />
      </div>
    </div>
  );
}
