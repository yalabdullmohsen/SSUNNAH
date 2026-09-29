import { useEffect, useMemo, useState, startTransition } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/design-system/AppCard";
import { FormLabel, SearchInput } from "@/components/design-system/FormFields";
import { StatusCard } from "@/components/design-system/SurfacePrimitives";
import { emitAdminV3AuditEvent, listAdminV3AuditEvents } from "../audit-events";
import { resolveAdminV3Center, type AdminV3CenterId } from "../nav";
import { AdminV3Empty, AdminV3ErrorState, AdminV3Loading } from "../states";
import {
  ADMIN_V3_CENTERS,
  filterCenterTools,
  uniqueTags,
  type AdminV3ToolItem,
} from "./catalog";

const PAGE_SIZE = 8;

function ToolCard({
  tool,
  onOpen,
}: {
  tool: AdminV3ToolItem;
  onOpen: (tool: AdminV3ToolItem) => void;
}) {
  return (
    <AppCard className="av3-tool-card" data-ss-surface="admin-tool">
      <h3 className="av3-tool-card__title">{tool.title}</h3>
      <p className="av3-tool-card__desc">{tool.description}</p>
      <div className="av3-tool-card__tags">
        {tool.tags.map((t) => (
          <span key={t} className="av3-chip">
            {t}
          </span>
        ))}
      </div>
      <Button asChild variant="primary">
        <Link href={tool.href} onClick={() => onOpen(tool)}>
          فتح
        </Link>
      </Button>
    </AppCard>
  );
}

function AuditCenter() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(t);
  }, []);
  if (!ready) return <AdminV3Loading />;
  const events = listAdminV3AuditEvents().slice().reverse();
  return (
    <div className="av3-center">
      <header className="av3-center__head">
        <h1>سجل التدقيق</h1>
        <p className="av3-dash__sub">
          أحداث واجهة Admin v3 المحلية. لا يغيّر الصلاحيات أو RLS.
        </p>
        <p className="av3-perm" aria-label="الصلاحيات المطلوبة">
          صلاحيات: admin.read · audit.read
        </p>
      </header>
      {events.length === 0 ? (
        <AdminV3Empty title="لا أحداث بعد" body="تنقّل داخل اللوحة لتسجيل أحداث." />
      ) : (
        <ul className="av3-audit-list">
          {events.map((e) => (
            <li key={`${e.at}-${e.type}-${e.path}`}>
              <time dateTime={e.at}>{e.at}</time>
              <code>{e.type}</code>
              <span>{e.path}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminV3CenterWorkspace() {
  const [location] = useLocation();
  const centerMeta = resolveAdminV3Center(location);
  const centerId = centerMeta.id as AdminV3CenterId;
  const def =
    centerId !== "overview"
      ? ADMIN_V3_CENTERS[centerId as Exclude<AdminV3CenterId, "overview">]
      : null;

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("الكل");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const tools = def?.tools ?? [];
  const tags = useMemo(() => uniqueTags(tools), [tools]);
  const filtered = useMemo(
    () => filterCenterTools(tools, query, tag),
    [tools, query, tag],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setStatus("loading");
    setPage(1);
    setQuery("");
    setTag("الكل");
    setSuccessMsg(null);
    emitAdminV3AuditEvent("admin.center.view", location, { center: centerId });
    const t = window.setTimeout(() => setStatus("ready"), 0);
    return () => window.clearTimeout(t);
  }, [location, centerId]);

  if (centerId === "overview") return null;
  const wantsAudit =
    /\/admin\/v3\/audit(?:\/|$)/.test(location.split("?")[0] || "") ||
    /(?:^|[?&])view=audit(?:&|$)/.test(location.includes("?") ? location.slice(location.indexOf("?")) : "");
  if (wantsAudit) return <AuditCenter />;
  if (!def) return <AdminV3ErrorState message="مركز غير معروف." />;
  if (status === "loading") return <AdminV3Loading />;
  if (status === "error") {
    return <AdminV3ErrorState onRetry={() => setStatus("ready")} />;
  }

  const onOpen = (tool: AdminV3ToolItem) => {
    emitAdminV3AuditEvent("admin.legacy.open", tool.href, {
      center: def.id,
      tool: tool.id,
    });
    setSuccessMsg(`تم فتح «${tool.title}» عبر المسار السابق.`);
  };

  return (
    <div className="av3-center">
      <header className="av3-center__head">
        <h1>{def.title}</h1>
        <p className="av3-dash__sub">{def.summary}</p>
        <p className="av3-perm" aria-label="الصلاحيات المطلوبة">
          صلاحيات العرض: {def.permissions.join(" · ")}
        </p>
      </header>

      {successMsg ? (
        <StatusCard className="av3-success" role="status">
          {successMsg}
        </StatusCard>
      ) : null}

      <div className="av3-center__toolbar">
        <FormLabel className="av3-sr-only" htmlFor="av3-center-search">
          بحث في أدوات المركز
        </FormLabel>
        <SearchInput
          id="av3-center-search"
          className="av3-center__search"
          value={query}
          placeholder="بحث في الأدوات…"
          onClear={query ? () => {
            startTransition(() => {
              setQuery("");
              setPage(1);
            });
          } : undefined}
          onChange={(e) => {
            const v = e.target.value;
            startTransition(() => {
              setQuery(v);
              setPage(1);
            });
          }}
        />
        <div className="av3-center__filters" role="group" aria-label="تصفية الوسوم">
          {tags.map((t) => (
            <Button
              type="button"
              key={t}
              variant={tag === t ? "primary" : "secondary"}
              size="small"
              className={`av3-chip-btn${tag === t ? " is-active" : ""}`}
              onClick={() => {
                startTransition(() => {
                  setTag(t);
                  setPage(1);
                });
              }}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <p className="av3-center__count" aria-live="polite">
        {filtered.length === 0
          ? "لا نتائج"
          : `${pageItems.length} من ${filtered.length} · صفحة ${safePage}/${pageCount}`}
      </p>

      {filtered.length === 0 ? (
        <AdminV3Empty
          title="لا أدوات مطابقة"
          body="عدّل البحث أو امسح التصفية."
          ctaLabel="مسح التصفية"
          onCtaClick={() => {
            setQuery("");
            setTag("الكل");
            setPage(1);
          }}
        />
      ) : (
        <div className="av3-tool-grid">
          {pageItems.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <nav className="av3-pager" aria-label="تصفح الصفحات">
          <Button
            type="button"
            variant="secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            السابق
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={safePage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            التالي
          </Button>
        </nav>
      ) : null}

      {centerMeta.legacyHref ? (
        <p className="av3-center__legacy">
          مدخل سريع للمسار السابق:{" "}
          <Link href={centerMeta.legacyHref} className="av3-legacy-link">
            {centerMeta.legacyHref}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
