import { useEffect, useRef, useState } from "react";
import { NavigationBar } from "@/design-system";
import { Link } from "wouter";
import { Link2, Lock } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader, PageStatusShell } from "@/components/ui-common";
import { ShareButtons } from "@/components/ContentActions";
import { SectionQuiz } from "@/components/ui/SectionQuiz";
import {
  getResearcherProfile,
  saveResearcherProfile,
  SPECIALIZATION_OPTIONS,
  INTEREST_TAGS,
  type ResearcherProfile,
} from "@/lib/researcher-profile-service";
import { applyPageSeo } from "@/lib/seo";
import "@/styles/pages/researcher-profile.css";
import { FieldLabel } from "@/components/design-system/FormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";

const SPEC_NONE = "__none__";

// ─── Interest Tag Toggle ───────────────────────────────────────────────────────

function InterestTag({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={`rp-tag${selected ? " rp-tag--active" : ""}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      {label}
    </Button>
  );
}

// ─── Publication Item ────────────────────────────────────────────────────────

function PublicationInput({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rp-pub-row">
      <input
        type="text"
        className="rp-input"
        placeholder="عنوان البحث أو الكتاب أو المقالة…"
        aria-label="عنوان المنشور"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <IconButton type="button" className="rp-pub-remove" onClick={onRemove} label="حذف">✕</IconButton>
    </div>
  );
}

// ─── Share Banner ─────────────────────────────────────────────────────────────

function ShareBanner({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const url = `${window.location.origin}/researcher/${userId}`;

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const copy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    if (timerRef.current) clearTimeout(timerRef.current);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rp-share-banner">
      <span className="rp-share-banner__label flex items-center gap-1"><Link2 size={14} aria-hidden="true" /> رابط ملفك العام:</span>
      <span className="rp-share-banner__url">{url}</span>
      <Button type="button" variant="primary" className="vault-btn vault-btn--sm vault-btn--primary" onClick={copy}>
        {copied ? "✓ تم النسخ" : "نسخ"}
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResearcherProfilePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Partial<ResearcherProfile>>({
    display_name: "",
    bio: "",
    institution: "",
    specialization: "",
    research_interests: [],
    publications: [],
    is_public: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pubInput, setPubInput] = useState<string[]>([""]);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    applyPageSeo({
      path: "/researcher-profile",
      title: "الملف الشخصي للباحث | سُنّة",
      description: "أنشئ ملفك الشخصي كباحث إسلامي، تخصصاتك واهتماماتك ومنشوراتك العلمية.",
      keywords: ["باحث إسلامي", "ملف أكاديمي", "بحث شرعي", "باحث شرعي"],
      robots: "noindex, follow",
    });
  }, []);

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); }, []);

  useEffect(() => {
    if (!user?.id) return;
    getResearcherProfile(user.id)
      .then((data) => {
        if (data) {
          setProfile(data);
          if (data.publications && data.publications.length > 0) {
            setPubInput([...data.publications, ""]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const toggleInterest = (tag: string) => {
    setProfile((prev) => {
      const cur = prev.research_interests ?? [];
      return {
        ...prev,
        research_interests: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
      };
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const pubs = pubInput.filter((p) => p.trim());
    await saveResearcherProfile(user.id, {
      ...profile,
      publications: pubs,
    });
    setSaving(false);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
  };

  if (authLoading) {
    return (
      <PageStatusShell title="ملف الباحث">
        <div className="profile-loading" aria-busy="true">
          <span className="profile-loading__dot" /><span className="profile-loading__dot" /><span className="profile-loading__dot" />
        </div>
      </PageStatusShell>
    );
  }

  if (!isLoggedIn) {
    return (
      <PageStatusShell title="ملف الباحث" className="page-shell narrow rpr-login-prompt">
        <div className="rpr-login-icon"><Lock size={40} strokeWidth={1.3} aria-hidden="true" /></div>
        <p className="rpr-login-msg">
          سجّل الدخول لإنشاء ملفك البحثي.
        </p>
        <Link href="/login?next=/researcher" className="ss-action-btn ss-action-btn--secondary">تسجيل الدخول</Link>
      </PageStatusShell>
    );
  }

  if (loading) {
    return (
      <PageStatusShell title="ملف الباحث">
        <div className="profile-loading rpr-loading-center" aria-busy="true">
          <span className="profile-loading__dot" /><span className="profile-loading__dot" /><span className="profile-loading__dot" />
        </div>
      </PageStatusShell>
    );
  }

  return (
    <div className="sn-screen">
    <NavigationBar title="ملف الباحث" large={false} />
    <div className="page-shell narrow rp-page" dir="rtl">
      <PageHeader
        eyebrow="البحث العلمي"
        title="ملف الباحث"
        subtitle="أنشئ ملفاً بحثياً يُعرّف بك وباهتماماتك العلمية في الدراسات الإسلامية."
      />

      <div className="rp-form">
        {/* Public toggle */}
        <div className="rp-public-row">
          <label className="rp-public-label">
            <input
              type="checkbox"
              checked={profile.is_public ?? false}
              onChange={(e) => setProfile((p) => ({ ...p, is_public: e.target.checked }))}
            />
            <span>الملف عام (يمكن للآخرين رؤيته)</span>
          </label>
          {profile.is_public && user?.id && <ShareBanner userId={user.id} />}
        </div>

        {/* Basic info */}
        <div className="rp-section">
          <h2 className="rp-section-title">المعلومات الأساسية</h2>

          <label htmlFor="rp-display-name" className="rp-label">الاسم العلمي</label>
          <input
            id="rp-display-name"
            type="text"
            className="rp-input"
            placeholder="الاسم الذي تُعرَّف به في البحث العلمي"
            value={profile.display_name ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
          />

          <label htmlFor="rp-institution" className="rp-label">الجهة / المؤسسة</label>
          <input
            id="rp-institution"
            type="text"
            className="rp-input"
            placeholder="الجامعة أو المعهد أو المركز البحثي"
            value={profile.institution ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, institution: e.target.value }))}
          />

          <FieldLabel htmlFor="rp-specialization" className="rp-label">التخصص</FieldLabel>
          <Select
            value={profile.specialization || SPEC_NONE}
            onValueChange={(v) =>
              setProfile((p) => ({ ...p, specialization: v === SPEC_NONE ? "" : v }))
            }
          >
            <SelectTrigger
              id="rp-specialization"
              className="rp-input rp-select min-h-11 text-base"
              aria-label="التخصص"
            >
              <SelectValue placeholder="اختر تخصصك…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SPEC_NONE}>اختر تخصصك…</SelectItem>
              {SPECIALIZATION_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label htmlFor="rp-bio" className="rp-label">نبذة بحثية</label>
          <textarea
            id="rp-bio"
            className="rp-input rp-textarea"
            placeholder="تعريف موجز بمسارك البحثي وأهدافك العلمية…"
            value={profile.bio ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={4}
          />
        </div>

        {/* Research interests */}
        <div className="rp-section">
          <h2 className="rp-section-title">الاهتمامات البحثية</h2>
          <p className="rp-hint">اختر مجالات اهتمامك البحثي:</p>
          <div className="rp-tags-grid">
            {INTEREST_TAGS.map((tag) => (
              <InterestTag
                key={tag}
                label={tag}
                selected={(profile.research_interests ?? []).includes(tag)}
                onToggle={() => toggleInterest(tag)}
              />
            ))}
          </div>
        </div>

        {/* Publications */}
        <div className="rp-section">
          <h2 className="rp-section-title">الأعمال والأبحاث</h2>
          <p className="rp-hint">أضف عناوين كتبك أو أبحاثك أو مقالاتك المنشورة:</p>
          <div className="rp-pubs-list">
            {pubInput.map((pub, i) => (
              <PublicationInput
                key={i}
                value={pub}
                onChange={(v) => {
                  const next = [...pubInput];
                  next[i] = v;
                  if (i === pubInput.length - 1 && v.trim()) next.push("");
                  setPubInput(next);
                }}
                onRemove={() => {
                  if (pubInput.length === 1) { setPubInput([""]); return; }
                  setPubInput(pubInput.filter((_, idx) => idx !== i));
                }}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="vault-btn vault-btn--ghost rp-add-pub"
            onClick={() => setPubInput((p) => [...p, ""])}
          >
            ＋ إضافة عنوان
          </Button>
        </div>

        {/* Save */}
        <div className="rp-save-row">
          {saved && <span className="rp-saved-msg">✓ تم الحفظ بنجاح</span>}
          <Button
            type="button"
            variant="primary"
            className="vault-btn vault-btn--primary rp-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "حفظ…" : "حفظ الملف"}
          </Button>
        </div>
      </div>
      <div className="twh-share">
        <ShareButtons title="ملف الباحث الشرعي — سُنّة" url="https://www.ssunnah.com/researcher-profile" />
      </div>
      <div className="px-4 pb-6 mt-4">
        <SectionQuiz route="/research" title="اختبر معلوماتك في العلوم الشرعية" count={4} />
      </div>
    </div>
    </div>
  );
}
