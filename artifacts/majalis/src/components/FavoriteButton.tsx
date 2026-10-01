import { useEffect, useState } from "react";
import {
  isLocalBookmarked,
  toggleLocalBookmark,
} from "@/lib/local-bookmarks";
import { Button } from "@/components/ui/button";

type Props = {
  contentType: string;
  contentId: string;
  title?: string;
  className?: string;
  compact?: boolean;
};

async function loadSupabase() {
  const { supabase } = await import("@/lib/supabase");
  return supabase;
}

export function FavoriteButton({
  contentType,
  contentId,
  title,
  className = "",
  compact = false,
}: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"local" | "cloud">("local");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const local = isLocalBookmarked(contentType, contentId);
      if (!cancelled) setBookmarked(local);

      /* زائر بلا جلسة ظاهرة: لا تحمّل supabase مع بطاقات الرئيسية */
      try {
        const hasToken = (() => {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes("-auth-token") || key.endsWith("auth-token"))) return true;
          }
          return false;
        })();
        if (!hasToken) {
          if (!cancelled) setMode("local");
          return;
        }
      } catch {
        if (!cancelled) setMode("local");
        return;
      }

      const supabase = await loadSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setMode("local");
        return;
      }
      if (!cancelled) setMode("cloud");
      const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .maybeSingle();
      if (!cancelled) setBookmarked(Boolean(data) || local);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [contentType, contentId]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = await loadSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const next = toggleLocalBookmark({
          contentType,
          contentId,
          title,
          href: `${window.location.pathname}${window.location.search}`,
        });
        setBookmarked(next);
        setMode("local");
        return;
      }

      setMode("cloud");
      const previous = bookmarked;
      setBookmarked(!previous);
      try {
        if (previous) {
          const { error } = await supabase
            .from("bookmarks")
            .delete()
            .match({ user_id: user.id, content_type: contentType, content_id: contentId });
          if (error) throw error;
          if (isLocalBookmarked(contentType, contentId)) {
            toggleLocalBookmark({ contentType, contentId });
          }
        } else {
          const { error } = await supabase.from("bookmarks").insert({
            user_id: user.id,
            content_type: contentType,
            content_id: contentId,
            title: title ?? null,
          });
          if (error) throw error;
        }
      } catch {
        setBookmarked(previous);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant={bookmarked ? "secondary" : "outline"}
      size="small"
      onClick={toggle}
      disabled={busy}
      loading={busy}
      className={`favorite-btn mj-pressable${bookmarked ? " favorite-btn--active" : ""}${compact ? " favorite-btn--compact" : ""} ${className}`.trim()}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      title={mode === "local" ? "يُحفظ على هذا الجهاز" : "يُحفظ في حسابك"}
    >
      {bookmarked ? (compact ? "محفوظ" : "في المفضلة") : compact ? "حفظ" : "إضافة للمفضلة"}
    </Button>
  );
}

export default FavoriteButton;
