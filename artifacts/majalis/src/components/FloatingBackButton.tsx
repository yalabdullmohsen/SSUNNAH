/**
 * GlobalBackControlHost — مصدر حقيقة واحد لزر الرجوع العام في سُنّة.
 * الإزاحات/الكيبورد/المشغّل من FloatingLayerManager فقط.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AppBackButton } from "@/components/common/AppBackButton";
import { BACK_CONTROL_SIZE_PX, BACK_CONTROL_GAP_PX } from "@/lib/global-back-layout";
import {
  applyFloatingLayerCssVars,
  getFloatingBottomOffset,
  installFloatingLayerSync,
  shouldSuppressBackgroundFloating,
} from "@/lib/floating-layer-manager";
import { hasInPageBackChrome, isImmersiveChromePath } from "@/lib/immersive-chrome";
import { normalizeNavPath } from "@/lib/navigation-back";
import "@/styles/sunnah-identity-chrome-nav.css";

function syncBackLayoutVars(host: HTMLElement | null) {
  if (typeof window === "undefined") return;
  applyFloatingLayerCssVars();
  const bottom = getFloatingBottomOffset("floating-back");
  const contentClearance = bottom + BACK_CONTROL_SIZE_PX + BACK_CONTROL_GAP_PX;
  document.documentElement.style.setProperty("--global-back-bottom", `${bottom}px`);
  document.documentElement.style.setProperty("--global-back-clearance", `${contentClearance}px`);
  document.documentElement.style.setProperty("--global-back-top", `0px`);
  document.documentElement.style.setProperty("--global-back-top-clearance", `0px`);
  document.documentElement.style.setProperty("--global-back-size", `${BACK_CONTROL_SIZE_PX}px`);
  document.documentElement.setAttribute("data-global-back-host", "1");
  document.documentElement.setAttribute("data-global-back-edge", "bottom");
  document.documentElement.setAttribute("data-global-back-visible", "1");
  if (host) {
    host.style.bottom = `${bottom}px`;
    host.style.top = "auto";
  }
}

/** المضيف الوحيد لزر الرجوع العام — أسفل يمين ظاهر دائمًا */
export function GlobalBackControlHost() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const path = normalizeNavPath(location);
  const hideOnHome = path === "/";
  const hideOnMushaf = isImmersiveChromePath(path);
  /** تبويب صلاة رئيسي — لا Floating Back (كان مصدر CLS ≈0.055 على الإنتاج) */
  const hideOnPrayer =
    path === "/prayer-times" || path.startsWith("/prayer-times/");
  const hideOnAdhanSettings =
    path === "/adhan-settings" || path.startsWith("/adhan-settings/");
  /** صفحات قانونية بلا AppBack داخلي — إخفاء العائم صراحة (متوافق مع عقد AppBackButton) */
  const hideOnLegalSupport = path === "/support" || path === "/contact";
  /** Rule 6: prefer in-page AppBackButton — suppress unified floating host when page chrome owns back */
  const hideOnInPageAppBack = hasInPageBackChrome(path);
  const routeHide =
    hideOnHome ||
    hideOnMushaf ||
    hideOnPrayer ||
    hideOnAdhanSettings ||
    hideOnLegalSupport ||
    hideOnInPageAppBack;
  const [modalHide, setModalHide] = useState(false);
  /** Safety net: any mounted in-page AppBack (not the bar FAB) suppresses the host */
  const [domInPageBack, setDomInPageBack] = useState(false);
  const hideBack = routeHide || modalHide || domInPageBack;

  useEffect(() => installFloatingLayerSync(), []);

  useLayoutEffect(() => {
    if (routeHide) {
      document.documentElement.style.setProperty("--global-back-clearance", `0px`);
      document.documentElement.removeAttribute("data-global-back-visible");
      setDomInPageBack(false);
      return;
    }
    let raf = 0;
    const sync = () => {
      const inPage = Boolean(
        document.querySelector('[data-app-back="1"]:not([data-fixed-back-bar="1"])'),
      );
      setDomInPageBack(inPage);
      const suppress = shouldSuppressBackgroundFloating();
      setModalHide(suppress);
      if (suppress || inPage) {
        document.documentElement.removeAttribute("data-global-back-visible");
        document.documentElement.style.setProperty("--global-back-clearance", `0px`);
        return;
      }
      syncBackLayoutVars(hostRef.current);
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };
    sync();
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "class",
        "data-audio-dock",
        "data-quran-mini-player",
        "data-floating-suppress",
        "style",
      ],
    });
    /* childList محدود على body فقط (بلا attributes) + جدولة rAF — لا polling */
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      mo.disconnect();
    };
  }, [routeHide]);

  useEffect(() => {
    if (hideBack) {
      document.documentElement.removeAttribute("data-global-back-visible");
      return;
    }
    document.documentElement.setAttribute("data-global-back-visible", "1");
  }, [hideBack, path]);

  if (hideBack) return null;

  return (
    <div
      ref={hostRef}
      className="global-back-control-host"
      data-global-back-control-host="1"
      data-testid="global-back-control-host"
      data-edge="bottom"
      data-visible="1"
    >
      <AppBackButton
        variant="bar"
        autoHideFloating={false}
        label="رجوع"
        aria-label="رجوع"
        className="global-back-control-host__btn"
      />
    </div>
  );
}

/** توافق مع الاسم السابق */
export function FloatingBackButton() {
  return <GlobalBackControlHost />;
}

export { FloatingBackButton as GlobalBackButton };
export { AppBackButton } from "@/components/common/AppBackButton";

/** الدائري العلوي القديم معطّل — البديل: Back FAB سفلي موحّد */
export const FLOATING_BACK_DISABLED = true as const;
export const FIXED_BACK_BAR_ENABLED = true as const;
export const UNIFIED_BACK_FAB_ENABLED = true as const;
export const GLOBAL_BACK_CONTROL_HOST = true as const;
