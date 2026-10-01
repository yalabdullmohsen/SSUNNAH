import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { FormLabel, FieldError, FormActions } from "@/components/design-system/FormFields";
import { useAuth } from "@/components/AuthProvider";
import { navigateTo } from "@/lib/navigation-intent";
import { decideSubmission, listSubmissions } from "../../data/admin-v3-api";
import { can, resolveGovernanceRole } from "../../permissions";
import { emitAdminV3AuditEvent } from "../../audit-events";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFlash,
  AdminLoadGate,
  AdminPageHeader,
  AdminPagination,
  AdminPermissionDenied,
  AdminSearchInput,
  AdminStatusBadge,
  useDebouncedValue,
} from "../../ui/primitives";

type Row = {
  id: string;
  type?: string;
  title?: string;
  content?: string;
  author?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

/** Official FINAL-2 queue facets — single inbox, no duplicate surfaces. */
const QUEUES = [
  { id: "pending", label: "قيد المراجعة" },
  { id: "assigned_to_me", label: "مُسند إليّ" },
  { id: "urgent", label: "عاجل" },
  { id: "scientific", label: "علمي" },
  { id: "editorial", label: "تحريري" },
  { id: "approved", label: "مقبول" },
  { id: "rejected", label: "مرفوض" },
  { id: "published", label: "منشور" },
  { id: "archived", label: "مؤرشف" },
] as const;

type QueueId = (typeof QUEUES)[number]["id"];

function parseQueue(raw: string | null): QueueId {
  const v = String(raw || "pending");
  return (QUEUES.some((q) => q.id === v) ? v : "pending") as QueueId;
}

function dedupeRows(rows: Row[]): Row[] {
  const seen = new Set<string>();
  const out: Row[] = [];
  for (const row of rows) {
    const id = String(row.id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
}

const URGENT_MS = 7 * 24 * 60 * 60 * 1000;

export function ReviewInboxPage() {
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const canRead = can(role, "content.read") || can(role, "review.approve") || can(role, "review.editorial");
  const canApprove = can(role, "review.approve") || can(role, "publish") || can(role, "content.*");
  const canReject = can(role, "review.reject") || can(role, "content.moderate") || can(role, "review.editorial");

  const search = useSearch();
  const params = useMemo(() => {
    const s = search.startsWith("?") ? search.slice(1) : search;
    return new URLSearchParams(s);
  }, [search]);

  const [queue, setQueue] = useState<QueueId>(() => parseQueue(params.get("queue")));
  const [type, setType] = useState(() => params.get("type") || "");
  const [q, setQ] = useState(() => params.get("q") || "");
  const dq = useDebouncedValue(q);
  const [page, setPage] = useState(() => Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1));
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [queueNote, setQueueNote] = useState<string | null>(null);

  // Persist filters + page in URL (shareable, reload-safe) via navigation-intent state mode
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("queue", queue);
    if (type) next.set("type", type);
    if (dq) next.set("q", dq);
    if (page > 1) next.set("page", String(page));
    const qs = next.toString();
    const target = qs ? `/admin/v3/reviews?${qs}` : "/admin/v3/reviews";
    navigateTo(target, { mode: "state" });
  }, [queue, type, dq, page]);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      setQueueNote(null);
      try {
        if (queue === "assigned_to_me") {
          // No assignee column in submissions — honest empty until schema OWNER_ACTION
          setRows([]);
          setTotal(0);
          setQueueNote("إسناد المراجعات غير مفعّل في المخطط الحالي — طابور «مُسند إليّ» جاهز واجهياً ويحتاج عمود assignee (OWNER_ACTION).");
          return;
        }
        const res = await listSubmissions(
          {
            queue,
            type: type || undefined,
            q: dq || undefined,
            page,
            pageSize: 20,
          },
          signal,
        );
        let next = dedupeRows((res.data || []) as Row[]);
        if (queue === "urgent") {
          const cutoff = Date.now() - URGENT_MS;
          next = next.filter((r) => {
            const t = r.created_at ? new Date(r.created_at).getTime() : 0;
            return t > 0 && t <= cutoff;
          });
          setQueueNote("العاجل = قيد المراجعة أقدم من ٧ أيام.");
        }
        setRows(next);
        setTotal(queue === "urgent" ? next.length : res.total || 0);
      } catch (e) {
        const err = e as { userMessageAr?: string; status?: number; correlationId?: string };
        setError(
          `${err.userMessageAr || "تعذّر تحميل صندوق المراجعة."}${
            err.correlationId ? ` [${err.correlationId}]` : ""
          }`,
        );
      } finally {
        setLoading(false);
      }
    },
    [queue, type, dq, page],
  );

  useEffect(() => {
    if (!canRead) return;
    const ac = new AbortController();
    void load(ac.signal);
    emitAdminV3AuditEvent("admin.center.view", "/admin/v3/reviews", { center: "reviews", queue, type });
    return () => ac.abort();
  }, [load, canRead, queue, type]);

  if (!canRead) return <AdminPermissionDenied permission="content.read" />;

  const pageCount = Math.max(1, Math.ceil(total / 20));

  const runApprove = async () => {
    if (!selected || !canApprove || busy) return;
    if (selected.status !== "pending") {
      setError("لا يمكن اعتماد عنصر غير قيد المراجعة.");
      return;
    }
    setBusy(true);
    try {
      await decideSubmission({
        id: selected.id,
        action: "approve",
        expectedUpdatedAt: selected.updated_at,
      });
      setFlash(`تمت الموافقة على «${selected.title || selected.id}».`);
      setSelected(null);
      await load();
    } catch (e) {
      const err = e as { userMessageAr?: string };
      setError(err.userMessageAr || "فشل الاعتماد.");
    } finally {
      setBusy(false);
    }
  };

  const runReject = async () => {
    if (!selected || !canReject || busy) return;
    if (selected.status !== "pending") {
      setError("لا يمكن رفض عنصر غير قيد المراجعة.");
      return;
    }
    if (rejectReason.trim().length < 3) {
      setRejectError("سبب الرفض مطلوب (٣ أحرف على الأقل).");
      return;
    }
    setRejectError(null);
    setBusy(true);
    try {
      await decideSubmission({
        id: selected.id,
        action: "reject",
        reason: rejectReason,
        expectedUpdatedAt: selected.updated_at,
      });
      setFlash(`تم رفض «${selected.title || selected.id}».`);
      setRejectOpen(false);
      setRejectReason("");
      setSelected(null);
      await load();
    } catch (e) {
      const err = e as { userMessageAr?: string };
      setError(err.userMessageAr || "فشل الرفض.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="av3-domain" data-testid="admin-v3-review-inbox">
      <AdminPageHeader
        title="صندوق المراجعة الموحّد"
        description="طابور رسمي واحد للمراجعات — بدون تكرار عناصر أو اعتماد/رفض مزدوج."
        badge="FINAL-2"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "المراجعات" },
        ]}
        actions={
          <Button asChild variant="secondary">
            <Link href="/admin?section=submissions">Legacy مساهمات</Link>
          </Button>
        }
      />

      {flash ? <AdminFlash>{flash}</AdminFlash> : null}
      {queueNote ? (
        <p className="av3-muted" role="status">
          {queueNote}
        </p>
      ) : null}

      <div className="av3-queue-tabs" role="tablist" aria-label="طوابير المراجعة">
        {QUEUES.map((item) => (
          <Button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={queue === item.id}
            variant={queue === item.id ? "primary" : "secondary"}
            data-queue={item.id}
            onClick={() => {
              setQueue(item.id);
              setPage(1);
              setSelected(null);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <AdminSearchInput value={q} onChange={setQ} label="بحث في العنوان أو المرسل" />
        <label className="av3-field">
          <span className="av3-sr-only">النوع</span>
          <select
            aria-label="النوع"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">كل الأنواع</option>
            <option value="درس">درس</option>
            <option value="فائدة">فائدة</option>
            <option value="سؤال لعبة">سؤال لعبة</option>
            <option value="معلومة">معلومة</option>
            <option value="فكرة">فكرة</option>
          </select>
        </label>
      </AdminFilterBar>

      <AdminLoadGate loading={loading} error={error} onRetry={() => void load()}>
        <div className="av3-split">
          <AdminDataTable
            rowKey={(r) => String(r.id)}
            rows={rows as unknown as Record<string, unknown>[]}
            emptyTitle="لا عناصر في هذا الطابور"
            columns={[
              { key: "type", label: "النوع" },
              { key: "title", label: "العنوان" },
              { key: "author", label: "المرسل" },
              {
                key: "status",
                label: "الحالة",
                render: (r) => <AdminStatusBadge status={String(r.status || "")} />,
              },
              {
                key: "created_at",
                label: "التاريخ",
                render: (r) =>
                  r.created_at ? new Date(String(r.created_at)).toLocaleString("ar") : "—",
              },
              {
                key: "actions",
                label: "عرض",
                render: (r) => (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setSelected(r as unknown as Row)}
                  >
                    تفاصيل
                  </Button>
                ),
              },
            ]}
          />
          <AdminPagination page={page} pageCount={pageCount} onChange={setPage} />

          {selected ? (
            <aside className="av3-detail" aria-label="تفاصيل العنصر">
              <h2>{selected.title || "بدون عنوان"}</h2>
              <p className="av3-muted">
                {selected.type} · {selected.author || "مجهول"} ·{" "}
                <AdminStatusBadge status={selected.status} />
              </p>
              <pre className="av3-detail__body">{selected.content || "—"}</pre>
              <FormActions className="av3-form__actions av3-form__actions--split">
                <Button type="button" variant="secondary" onClick={() => setSelected(null)}>
                  إغلاق
                </Button>
                <div className="av3-form__actions-danger">
                  {canReject && selected.status === "pending" ? (
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => setRejectOpen(true)}
                    >
                      رفض
                    </Button>
                  ) : null}
                  {canApprove && selected.status === "pending" ? (
                    <Button
                      type="button"
                      variant="primary"
                      disabled={busy}
                      loading={busy}
                      onClick={() => void runApprove()}
                    >
                      موافقة ونشر
                    </Button>
                  ) : null}
                </div>
              </FormActions>
            </aside>
          ) : null}
        </div>
      </AdminLoadGate>

      {rejectOpen ? (
        <div className="av3-dialog-backdrop" role="presentation">
          <div className="av3-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reject-title">
            <h2 id="reject-title">رفض المقترح</h2>
            <p>أدخل سبب الرفض لـ «{selected?.title || ""}».</p>
            <FormLabel htmlFor="reject-reason">سبب الرفض</FormLabel>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectError) setRejectError(null);
              }}
              rows={3}
              required
              aria-invalid={Boolean(rejectError) || undefined}
              aria-describedby={rejectError ? "reject-reason-error" : undefined}
            />
            <FieldError id="reject-reason-error">{rejectError}</FieldError>
            <FormActions className="av3-dialog__actions">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setRejectOpen(false);
                  setRejectError(null);
                }}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                loading={busy}
                onClick={() => void runReject()}
              >
                تأكيد الرفض
              </Button>
            </FormActions>
          </div>
        </div>
      ) : null}

      <section className="av3-legacy-block" aria-label="مسارات توافق">
        <h3>
          مسارات توافق <span className="av3-badge av3-badge--legacy">LEGACY_KEEP</span>
        </h3>
        <p className="av3-muted">
          الصندوق الرسمي هو <Link href="/admin/v3/reviews">/admin/v3/reviews</Link>. المسارات التالية
          تبقى لأدوات متخصصة (صوت/أتمتة) حتى اكتمال تكافؤها.
        </p>
        <ul className="av3-legacy-links">
          <li>
            <Link href="/admin/review-hub">Review Hub (صوت) — LEGACY_KEEP</Link>
          </li>
          <li>
            <Link href="/admin/review-center">Review Center (أتمتة) — LEGACY_KEEP</Link>
          </li>
          <li>
            <Link href="/admin?section=submissions">Legacy submissions — alias إلى نفس API</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
