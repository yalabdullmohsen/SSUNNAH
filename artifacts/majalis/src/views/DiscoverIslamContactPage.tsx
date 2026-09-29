import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui-common";
import { applyPageSeo } from "@/lib/seo";
import { STATUS } from "@/lib/ui-copy";
import { useLanguage } from "@/components/LanguageProvider";
import { submitDawahContactRequest, CONTACT_RELIGIONS, type ReligionCode } from "@/lib/dawah-service";
import { DiscoverIslamShell } from "@/components/discover-islam/DiscoverIslamShell";
import { DetailScreen } from "@/components/design-system/screens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "@/components/design-system/FormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DiscoverIslamContactPage() {
  const { lang } = useLanguage();
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "no_preference">("no_preference");
  const [religion, setReligion] = useState<ReligionCode | "other_religion" | "no_specific" | "prefer_not_to_say">("prefer_not_to_say");
  const [country, setCountry] = useState("");
  const [topic, setTopic] = useState("");
  const [contactMethod, setContactMethod] = useState("email");
  const [contactValue, setContactValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; trackingCode?: string; error?: string } | null>(null);

  useEffect(() => {
    applyPageSeo({
      path: "/discover-islam/contact",
      title: "تواصل سرّي مع داعية | التعريف بالإسلام",
      description: "نموذج آمن للتواصل مع داعٍ أو داعية — بياناتك لا تُعرض لأحد.",
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !contactValue.trim() || !consent) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await submitDawahContactRequest({
        name: isAnonymous ? undefined : name,
        isAnonymous,
        lang,
        preferredDaeeGender: gender,
        religiousBackground: religion,
        country: country || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        topic,
        contactMethod,
        contactValue,
        privacyConsent: consent,
      });
      setResult(r);
    } finally {
      setBusy(false);
    }
  };

  if (result?.ok) {
    return (
      <DiscoverIslamShell detail>
        <PageHeader eyebrow="التعريف بالإسلام" title="تم استلام طلبك" />
        <div className="dii-block dii-block--accent dii-answer-card">
          <p>تم استلام طلبك. سيتواصل معك أحد الدعاة على الوسيلة التي اخترتها. رمز المتابعة:</p>
          <p className="dii-tracking-code">{result.trackingCode}</p>
          <p className="page-desc">احتفظ بهذا الرمز إن احتجت للاستفسار عن حالة طلبك لاحقًا.</p>
        </div>
      </DiscoverIslamShell>
    );
  }

  return (
    <DetailScreen compose="mark">
    <DiscoverIslamShell detail>
      <PageHeader eyebrow="التعريف بالإسلام" title="تواصل سرّي مع داعية" subtitle="بياناتك تُستخدَم فقط للتواصل معك، ولا تُعرض لأي طرف آخر أبدًا." />

      <form onSubmit={onSubmit} className="dii-contact-form dii-block dii-block--muted">
        <label className="dii-checkbox-label">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          أفضّل عدم كتابة اسمي
        </label>

        {!isAnonymous && (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم (اختياري)"
            className="adm-input text-base"
            autoComplete="name"
          />
        )}

        <div>
          <FieldLabel>تفضيل جنس الداعية</FieldLabel>
          <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
            <SelectTrigger className="adm-input min-h-11 text-base" aria-label="تفضيل جنس الداعية">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_preference">لا تفضيل لجنس الداعية</SelectItem>
              <SelectItem value="male">أفضّل التحدث مع داعية</SelectItem>
              <SelectItem value="female">أفضّل التحدث مع داعية (امرأة)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>الخلفية الدينية</FieldLabel>
          <Select value={religion} onValueChange={(v) => setReligion(v as typeof religion)}>
            <SelectTrigger className="adm-input min-h-11 text-base" aria-label="الخلفية الدينية">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_RELIGIONS.map((r) => (
                <SelectItem key={r.code} value={r.code}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="الدولة (اختياري)"
          className="adm-input text-base"
          autoComplete="country-name"
        />

        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="ما الذي تودّ التحدث عنه؟"
          required
          rows={4}
          className="adm-input text-base"
        />

        <div className="dii-contact-method-row">
          <div>
            <FieldLabel>وسيلة التواصل</FieldLabel>
            <Select value={contactMethod} onValueChange={setContactMethod}>
              <SelectTrigger className="adm-input min-h-11 text-base" aria-label="وسيلة التواصل">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">البريد الإلكتروني</SelectItem>
                <SelectItem value="whatsapp">واتساب</SelectItem>
                <SelectItem value="phone">هاتف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder="بيانات التواصل"
            required
            dir="ltr"
            className="adm-input text-base"
            autoComplete="email"
          />
        </div>

        <label className="dii-checkbox-label">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          أوافق على استخدام بياناتي فقط لغرض التواصل معي في هذا الطلب.
        </label>

        {result && !result.ok && <p className="dii-form-error">{result.error === "consent_required" ? "الموافقة على سياسة الخصوصية مطلوبة." : STATUS.networkError}</p>}

        <Button type="submit" disabled={busy} className="asp-run-btn" aria-busy={busy} variant="primary">
          {busy ? "إرسال…" : "إرسال الطلب"}
        </Button>
      </form>
    </DiscoverIslamShell>
  
    </DetailScreen>
  );
}
