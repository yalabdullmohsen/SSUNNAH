import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { ADMIN_ACCESS_DENIED_MESSAGE, mapAuthError } from "@/lib/auth-messages";
import { hasUnrestrictedAdminAccess, isOwnerAuthUser, resolveUserEmail } from "@/lib/owner-config";
import { isSupabaseConfigured } from "@/lib/supabase-config";
import { bootstrapSupabaseFromServer } from "@/lib/supabase-bootstrap";
import {
  resetPasswordForEmail,
  resendSignupConfirmation,
  supabase,
} from "@/lib/supabase";
import { logSupabaseError } from "@/lib/supabase-config";
import { preloadRoute } from "@/lib/lazy-with-retry";
import { Loading } from "@/components/ui-common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel, FieldError, ContentTabs } from "@/components/design-system";
import { PasswordPolicyChecklist } from "@/components/auth/PasswordPolicyChecklist";
import { applyPageSeo } from "@/lib/seo";
import { canSubmitForm } from "@/lib/form-rate-limit";
import { sanitizeAuthNext } from "@/lib/auth-redirect";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MISMATCH_AR,
  PASSWORD_POLICY_HINT_AR,
  validatePassword,
} from "@/lib/password-policy";
import "@/styles/pages/auth.css";
import "@/styles/sunnah-identity-forms-filters.css";

type AuthTab = "login" | "register" | "forgot";

function canAccessAdminUser(current: Awaited<ReturnType<typeof import("@/lib/supabase").getCurrentUser>>) {
  if (!current) return false;
  return (
    current.is_owner === true ||
    isOwnerAuthUser(current, current.profile) ||
    hasUnrestrictedAdminAccess({
      email: resolveUserEmail(current),
      profile: current.profile,
      governanceRole: current.governance_role,
    }) ||
    current.governance_role === "super_admin" ||
    current.profile?.role === "admin" ||
    current.profile?.role === "super_admin" ||
    current.profile?.is_owner === true
  );
}

function getNextPath() {
  if (typeof window === "undefined") return "/";
  const params = new URLSearchParams(window.location.search);
  return sanitizeAuthNext(params.get("next"));
}

function isAdminLogin(nextPath: string) {
  return nextPath.startsWith("/admin");
}

function resolveInitialTab(pathname: string): AuthTab {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/register" || p.startsWith("/auth/register")) return "register";
  if (typeof window !== "undefined") {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "register") return "register";
    if (tab === "forgot") return "forgot";
  }
  return "login";
}

/**
 * الانتقال بين /login و/register يخفي الصفحة لحظيًا أثناء تبديل المسار فيُسقط المتصفح التركيز
 * إلى body. نعيده إلى التبويب المختار ما دام لم ينتقل المستخدم لعنصر آخر (WCAG 2.4.3).
 */
function keepAuthTabFocus(tab: "login" | "register"): void {
  let frames = 0;
  const step = () => {
    const el = document.getElementById(`login-tab-${tab}`);
    const active = document.activeElement;
    if (el && (active === null || active === document.body)) el.focus({ preventScroll: true });
    if (frames++ < 45) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

export default function LoginPage() {
  const [location, navigate] = useLocation();
  const [tab, setTab] = useState<AuthTab>(() => resolveInitialTab(location));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(isSupabaseConfigured());
  const [resetSent, setResetSent] = useState(false);
  /** بريد بانتظار التأكيد بعد signup بلا session */
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendNote, setResendNote] = useState("");

  const { login, register, logout, refreshUser, isAdmin, isLoggedIn, loading: authLoading } = useAuth();
  const nextPath = useMemo(() => getNextPath(), [location]);
  const adminLogin = isAdminLogin(nextPath);
  const authEnabled = authReady;

  useEffect(() => {
    const next = resolveInitialTab(location);
    setTab((prev) => (prev === "forgot" && next === "login" ? prev : next));
  }, [location]);

  useEffect(() => {
    const isRegister = tab === "register";
    applyPageSeo({
      path: isRegister ? "/register" : "/login",
      title: isRegister
        ? "إنشاء حساب | سُنّة"
        : tab === "forgot"
          ? "استعادة كلمة المرور | سُنّة"
          : "تسجيل الدخول | سُنّة",
      description: isRegister
        ? "إنشاء حساب في سُنّة."
        : "تسجيل الدخول إلى سُنّة.",
      keywords: isRegister ? ["إنشاء حساب", "تسجيل", "سُنّة"] : ["تسجيل دخول", "سُنّة"],
      robots: "noindex, follow",
    });
  }, [tab]);

  useEffect(() => {
    if (authReady) return;
    void bootstrapSupabaseFromServer().then((ok) => setAuthReady(ok || isSupabaseConfigured()));
  }, [authReady]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) return;
    if (pendingConfirmEmail) return;
    if (adminLogin && isAdmin) {
      navigate(nextPath);
      return;
    }
    if (!adminLogin) navigate(nextPath);
  }, [authLoading, isLoggedIn, isAdmin, navigate, nextPath, adminLogin, pendingConfirmEmail]);

  const switchTab = (next: AuthTab) => {
    setError("");
    setSuccess("");
    setDenied(false);
    setResetSent(false);
    setPendingConfirmEmail(null);
    setResendNote("");
    setTab(next);
    if (adminLogin) return;
    if (next === "register") {
      navigate(nextPath !== "/" ? `/register?next=${encodeURIComponent(nextPath)}` : "/register");
    } else if (next === "login") {
      navigate(nextPath !== "/" ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
    }
    if (next === "login" || next === "register") keepAuthTabFocus(next);
  };

  const validateRegister = (): string | null => {
    if (fullName.trim().length < 2) return "يرجى إدخال الاسم (حرفان على الأقل).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "البريد غير صحيح";
    const policyError = validatePassword(password);
    if (policyError) return policyError;
    if (password !== confirmPassword) return PASSWORD_MISMATCH_AR;
    return null;
  };

  const validateLogin = (): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "البريد غير صحيح";
    if (!password) return "أدخل كلمة المرور";
    return null;
  };

  const handleResendConfirmation = async () => {
    if (!pendingConfirmEmail) return;
    if (!canSubmitForm("auth-resend-confirm", 8000)) {
      setResendNote("انتظر لحظات ثم أعد المحاولة.");
      return;
    }
    setResendLoading(true);
    setResendNote("");
    setError("");
    try {
      const { error: resendError } = await resendSignupConfirmation(pendingConfirmEmail);
      if (resendError) throw resendError;
      setResendNote("أُعيد إرسال رسالة التأكيد. راجع بريدك.");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmitForm("auth-account", 2500)) {
      setError("انتظر لحظات ثم أعد المحاولة.");
      return;
    }
    if (!authEnabled) {
      setError(mapAuthError(null));
      return;
    }

    setError("");
    setSuccess("");
    setDenied(false);
    setLoading(true);

    try {
      if (tab === "forgot") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          setError("البريد غير صحيح");
          return;
        }
        const { error: resetError } = await resetPasswordForEmail(email.trim());
        if (resetError) throw resetError;
        setResetSent(true);
        return;
      }

      if (tab === "register") {
        const validationError = validateRegister();
        if (validationError) {
          setError(validationError);
          return;
        }
        const { data, error: signUpError } = await register(email.trim(), password, fullName.trim());
        if (signUpError) throw signUpError;

        const userId = data?.user?.id;
        if (userId) {
          const { error: profileError } = await supabase.from("profiles").upsert(
            { id: userId, full_name: fullName.trim(), email: email.trim(), role: "user" },
            { onConflict: "id" },
          );
          if (profileError) {
            logSupabaseError("auth:register-profile-upsert", profileError, { userId });
          }
        }

        if (data?.session) {
          setSuccess("تم إنشاء حسابك بنجاح.");
          navigate(nextPath || "/");
          return;
        }
        setPendingConfirmEmail(email.trim());
        return;
      }

      const loginValidation = validateLogin();
      if (loginValidation) {
        setError(loginValidation);
        return;
      }

      const { error: signInError } = await login(email.trim(), password);
      if (signInError) throw signInError;

      const current = await refreshUser();
      if (adminLogin) {
        if (canAccessAdminUser(current)) {
          preloadRoute(() => import("@/views/AdminPage"));
          navigate(nextPath);
          return;
        }
        await logout();
        setDenied(true);
        setError(ADMIN_ACCESS_DENIED_MESSAGE);
        return;
      }

      navigate(nextPath);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !authReady) {
    return (
      <div className="login-page" dir="rtl">
        <Loading />
      </div>
    );
  }

  const title =
    tab === "forgot"
      ? "استعادة كلمة المرور"
      : adminLogin
        ? "دخول المسؤول"
        : null;

  if (pendingConfirmEmail) {
    return (
      <div className="login-page" dir="rtl">
        <div className="login-card" data-testid="signup-confirm-pending">
          <header className="login-card__header">
            <div className="login-app-icon" aria-hidden="true">
              <img
                src="/brand/icon-1024.png"
                alt=""
                className="login-app-icon__img"
                loading="eager"
                decoding="async"
                width={56}
                height={56}
              />
            </div>
            <p className="login-card__brand">سُنّة</p>
            <h1 className="login-card__title">تم إنشاء الحساب</h1>
          </header>

          {error ? (
            <FieldError id="auth-form-error" className="login-alert login-alert--error">
              {error}
            </FieldError>
          ) : null}

          <div className="signup-confirm" role="status">
            <p className="signup-confirm__lead">✅ تم إنشاء الحساب</p>
            <p className="signup-confirm__mail">
              📩 تم إرسال رسالة تأكيد إلى{" "}
              <strong dir="ltr">{pendingConfirmEmail}</strong>
            </p>
            <ol className="signup-confirm__steps">
              <li>افتح البريد</li>
              <li>اضغط رابط التفعيل</li>
              <li>ثم سجّل الدخول</li>
            </ol>
            {resendNote ? (
              <p className="login-alert login-alert--success" role="status">
                {resendNote}
              </p>
            ) : null}
            <Button
              type="button"
              variant="primary"
              className="login-submit"
              loading={resendLoading}
              disabled={resendLoading}
              onClick={() => void handleResendConfirmation()}
              data-testid="signup-resend-confirmation"
            >
              إعادة إرسال بريد التفعيل
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="small"
              className="login-text-btn"
              onClick={() => switchTab("login")}
            >
              الانتقال لتسجيل الدخول
            </Button>
          </div>

          <div className="login-actions">
            <Link href="/" className="login-guest-link">
              المتابعة كزائر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page" dir="rtl">
      <div className="login-card">
        <header className="login-card__header">
          <div className="login-app-icon" aria-hidden="true">
            <img
              src="/brand/icon-1024.png"
              alt=""
              className="login-app-icon__img"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width={56}
              height={56}
            />
          </div>
          <p className="login-card__brand">سُنّة</p>
          {title ? <h1 className="login-card__title">{title}</h1> : null}
        </header>

        {!adminLogin && tab !== "forgot" ? (
          <ContentTabs
            className="login-tabs"
            ariaLabel="وضع الحساب"
            idPrefix="login"
            variant="pill"
            value={tab === "register" ? "register" : "login"}
            onChange={(id) => switchTab(id as "login" | "register")}
            items={[
              { id: "login", label: "تسجيل الدخول" },
              { id: "register", label: "إنشاء حساب" },
            ]}
          />
        ) : null}

        {/* لوحة التبويب النشط — هدف aria-controls لـ ContentTabs (login-panel-*) */}
        <div
          {...(!adminLogin && tab !== "forgot"
            ? {
                role: "tabpanel",
                id: `login-panel-${tab === "register" ? "register" : "login"}`,
                "aria-labelledby": `login-tab-${tab === "register" ? "register" : "login"}`,
              }
            : {})}
        >
        {!authEnabled && (
          <FieldError id="auth-form-config-error" className="login-alert login-alert--error">
            {mapAuthError(null)}
          </FieldError>
        )}

        {error ? (
          <FieldError id="auth-form-error" className="login-alert login-alert--error">
            {error}
          </FieldError>
        ) : null}

        {denied ? (
          <p className="login-alert login-alert--warn" role="status">
            {ADMIN_ACCESS_DENIED_MESSAGE}
          </p>
        ) : null}

        {success ? (
          <p className="login-alert login-alert--success" role="status">
            {success}
          </p>
        ) : null}

        {resetSent ? (
          <p className="login-alert login-alert--success" role="status">
            إن وُجد حساب بهذا البريد فستصلك رسالة لإعادة تعيين كلمة المرور.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="login-form"
            noValidate
            aria-describedby={error ? "auth-form-error" : !authEnabled ? "auth-form-config-error" : undefined}
          >
            {tab === "register" ? (
              <div className="login-field">
                <FormLabel htmlFor="auth-name">الاسم</FormLabel>
                <Input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  placeholder="اسمك الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  minLength={2}
                  disabled={loading || !authEnabled}
                  className="min-h-11 text-base"
                  aria-describedby={error ? "auth-form-error" : undefined}
                />
              </div>
            ) : null}

            <div className="login-field">
              <FormLabel htmlFor="auth-email">البريد الإلكتروني</FormLabel>
              <Input
                id="auth-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || !authEnabled}
                className="min-h-11 text-base"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "auth-form-error" : !authEnabled ? "auth-form-config-error" : undefined}
              />
            </div>

            {tab !== "forgot" ? (
              <div className="login-field">
                <FormLabel htmlFor="auth-password">كلمة المرور</FormLabel>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete={tab === "register" ? "new-password" : "current-password"}
                  placeholder={tab === "register" ? PASSWORD_POLICY_HINT_AR : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={tab === "register" ? PASSWORD_MIN_LENGTH : undefined}
                  disabled={loading || !authEnabled}
                  className="min-h-11 text-base"
                  aria-describedby={error ? "auth-form-error" : undefined}
                />
                {tab === "register" ? <PasswordPolicyChecklist password={password} /> : null}
              </div>
            ) : null}

            {tab === "register" ? (
              <div className="login-field">
                <FormLabel htmlFor="auth-confirm">تأكيد كلمة المرور</FormLabel>
                <Input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  disabled={loading || !authEnabled}
                  className="min-h-11 text-base"
                  aria-describedby={error ? "auth-form-error" : undefined}
                />
              </div>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="login-submit"
              loading={loading}
              disabled={loading || !authEnabled}
            >
              {tab === "register"
                ? "إنشاء حساب"
                : tab === "forgot"
                  ? "إرسال رابط الاستعادة"
                  : "تسجيل الدخول"}
            </Button>
          </form>
        )}
        </div>

        {!adminLogin && tab === "login" && authEnabled ? (
          <Button
            type="button"
            variant="ghost"
            size="small"
            className="login-text-btn"
            onClick={() => switchTab("forgot")}
          >
            نسيت كلمة المرور؟
          </Button>
        ) : null}

        {tab === "forgot" ? (
          <Button type="button" variant="ghost" size="small" className="login-text-btn" onClick={() => switchTab("login")}>
            العودة لتسجيل الدخول
          </Button>
        ) : null}

        {!adminLogin ? (
          <div className="login-actions">
            <Link href="/" className="login-guest-link">
              المتابعة كزائر
            </Link>
          </div>
        ) : (
          <div className="login-actions">
            <Link href="/" className="login-text-btn">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
