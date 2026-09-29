import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FormLabel, FieldError, FormActions } from "@/components/design-system/FormFields";
import { useAuth } from "@/components/AuthProvider";
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

export function ReviewInboxPage() {
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const canRead = can(role, "content.read") || can(role, "review.approve") || can(role, "review.editorial");
  const canApprove = can(role, "review.approve") || can(role, "publish") || can(role, "content.*");
  const canReject = can(role, "review.reject") || can(role, "content.moderate") || can(role, "review.editorial");

  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q);
  const [page, setPage] = useState(1);
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

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await listSubmissions(
          { status, type: type || undefined, q: dq || undefined, page, pageSize: 20 },
          signal,
        );
        setRows((res.data || []) as Row[]);
        setTotal(res.total || 0);
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
    [status, type, dq, page],
  );

  useEffect(() => {
    if (!canRead) return;
    const ac = new AbortController();
    void load(ac.signal);
    emitAdminV3AuditEvent("admin.center.view", "/admin/v3/reviews", { center: "reviews", status, type });
    return () => ac.abort();
  }, [load, canRead, status, type]);

  if (!canRead) return <AdminPermissionDenied permission="content.read" />;

  const pageCount = Math.max(1, Math.ceil(total / 20));

  const runApprove = async () => {
    if (!selected || !canApprove || busy) return;
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
    <div className="av3-domain">
      <AdminPageHeader
        title="صندوق المراجعة"
        description="مراجعة مقترحات المجتمع بعمليات أصلية — الموافقة تنشر المحتوى حسب نوعه."
        badge="أصلي"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "المراجعات" },
        ]}
        actions={
          <Button asChild variant="secondary">
            <Link href="/admin?section=submissions">المسار السابق</Link>
          </Button>
        }
      />

      {flash ? <AdminFlash>{flash}</AdminFlash> : null}

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <AdminSearchInput value={q} onChange={setQ} label="بحث في العنوان أو المرسل" />
        <label className="av3-field">
          <span className="av3-sr-only">الحالة</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="pending">قيد المراجعة</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        </label>
        <label className="av3-field">
          <span className="av3-sr-only">النوع</span>
          <select
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
            emptyTitle="لا عناصر في صندوق المراجعة"
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
          أدوات إضافية <span className="av3-badge av3-badge--legacy">Legacy</span>
        </h3>
        <ul className="av3-legacy-links">
          <li>
            <Link href="/admin/review-hub">مركز المراجعة</Link>
          </li>
          <li>
            <Link href="/admin/review-center">مراجعة الأتمتة</Link>
          </li>
          <li>
            <Link href="/admin?section=reports">البلاغات</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
