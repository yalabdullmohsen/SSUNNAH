import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyFloatingLayerCssVars } from "@/lib/floating-layer-manager";

function isModalOverlayOpen(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(
    document.querySelector(
      [
        '[role="dialog"][data-state="open"]',
        '[data-state="open"][data-radix-dialog-content]',
        '[data-state="open"][data-radix-alert-dialog-content]',
        '[aria-modal="true"]',
      ].join(","),
    ),
  );
}

/**
 * زر صعود صغير واضح المعنى.
 * يظهر بعد تمرير فعلي فقط، يختفي مع Sheet/Dialog، فوق الشريط السفلي بلا تغطية للمحتوى.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      // يظهر بعد تمرير ملحوظ فقط (≥720px) — لا يزاحم المحتوى في أول الشاشة
      const scrolled = window.scrollY > 720;
      setVisible(scrolled && !isModalOverlayOpen());
      applyFloatingLayerCssVars();
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    const mo = new MutationObserver(update);
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-state", "aria-modal", "open"],
    });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      mo.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      className="scroll-to-top"
      data-scroll-to-top="1"
      data-safe-area="1"
      aria-label="إلى الأعلى"
      title="إلى الأعلى"
      onClick={() => {
        const reduce =
          typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
    >
      <ArrowUp size={18} strokeWidth={2.5} aria-hidden="true" className="stt-icon" />
      <span className="stt-label">أعلى</span>
    </Button>
  );
}
