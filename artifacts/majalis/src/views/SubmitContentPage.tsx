import { useEffect, useState, type FormEvent } from "react";
import { GraduationCap } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { AppBackButton } from "@/components/common/AppBackButton";
import { FieldLabel } from "@/components/design-system/FormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import "@/styles/pages/submit-content.css";

const CONTENT_TYPES = ["درس", "فائدة", "معلومة", "سؤال لعبة", "فكرة"] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

type Status = "idle" | "loading" | "success" | "error";

export default function SubmitContentPage() {
  const [contentType, setContentType] = useState<ContentType>("درس");

  useEffect(() => {
    applyPageSeo({
      path: "/submit",
      title: "أضف محتوى | سُنّة",
      description: "شارك في إثراء سُنّة، أرسل درساً أو فائدة أو سؤالاً وساهم في نشر العلم الشرعي.",
      keywords: ["إضافة محتوى", "مشاركة علمية", "إرسال درس", "نشر العلم", "سُنّة"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "إضافة محتوى — سُنّة",
          url: "https://www.ssunnah.com/submit",
          description: "أرسل درساً أو فائدة أو سؤالاً وشارك في إثراء سُنّة",
          about: { "@type": "Thing", name: "نشر العلم الشرعي والمشاركة المجتمعية" },
        },
      ],
    });
  }, []);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contentType, title, content: details, author }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus("success");
        setMessage(json.message || "شكراً! ينتظر موافقة المشرف.");
        setTitle("");
        setDetails("");
        setAuthor("");
      } else {
        setStatus("error");
        setMessage(json.message || "حدث خطأ، حاول مرة أخرى.");
      }
    } catch {
      setStatus("error");
      setMessage("تعذر الاتصال، حاول مرة أخرى.");
    }
  };

  return (
    <div className="scp-page">
      <div className="scp-back-row">
        <AppBackButton variant="inline" fallbackHref="/" className="scp-back-link" label="← الرئيسية" />
      </div>

      <h1 className="scp-title">أضف محتوى</h1>
      <p className="scp-subtitle">يصل مقترحك للأدمن لمراجعته قبل النشر.</p>

      <Button
        type="button"
        variant="ghost"
        className="scp-banner"
        onClick={() => setContentType("درس")}
      >
        <div className="scp-banner__emoji" aria-hidden="true"><GraduationCap size={32} strokeWidth={1.4} /></div>
        <div>
          <p className="scp-banner__heading">أضف درساً علمياً</p>
          <p className="scp-banner__desc">شارك درساً، محاضرة، أو موضوعاً علمياً مفيداً</p>
        </div>
      </Button>

      {status === "success" && (
        <div role="status" className="scp-feedback scp-feedback--success">{message}</div>
      )}

      {status === "error" && (
        <div role="alert" className="scp-feedback scp-feedback--error">{message}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="scp-label">
          <FieldLabel>نوع المحتوى</FieldLabel>
          <Select
            value={contentType}
            onValueChange={(v) => setContentType(v as ContentType)}
          >
            <SelectTrigger
              name="content-type"
              className="scp-input min-h-11 text-base"
              aria-label="نوع المحتوى"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="scp-label scp-label--mt">
          عنوان الموضوع
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            maxLength={500}
            aria-label="اكتب عنواناً مختصراً للموضوع" placeholder="اكتب عنواناً مختصراً للموضوع"
            className="scp-input"
          />
        </label>

        <label className="scp-label scp-label--mt">
          التفاصيل
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            minLength={3}
            maxLength={8000}
            rows={6}
            aria-label="اكتب التفاصيل هنا" placeholder="اكتب التفاصيل هنا..."
            className="scp-input scp-input--textarea"
          />
        </label>

        <label className="scp-label scp-label--mt scp-label--mb">
          اسمك (اختياري)
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={200}
            aria-label="للنسب الصحيح" placeholder="للنسب الصحيح"
            className="scp-input"
          />
        </label>

        <Button
          type="submit"
          variant="primary"
          loading={status === "loading"}
          disabled={status === "loading"}
          className={`scp-submit-btn${status === "loading" ? " is-loading" : ""}`}
        >
          {status === "loading" ? "إرسال…" : "إرسال المقترح"}
        </Button>
      </form>
    </div>
  );
}
