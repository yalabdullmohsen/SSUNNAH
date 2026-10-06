import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { ADMIN_ACCESS_DENIED_MESSAGE, mapAuthError } from "@/lib/auth-messages";
import { hasUnrestrictedAdminAccess, isOwnerAuthUser, resolveUserEmail } from "@/lib/owner-config";
import { isSupabaseConfigured } from "@/lib/supabase-config";
import { bootstrapSupabaseFromServer } from "@/lib/supabase-bootstrap";
import {
  resetPasswordForEmail,
  resendSignupConfirmation,
  signInWithApple,
  supabase,
} from "@/lib/supabase";
import { logSupabaseError } from "@/lib/supabase-config";
import { preloadRoute } from "@/lib/lazy-with-retry";
import { Button, IconButton, Notice, Segmented, SkeletonCard, TextField } from "@/design-system";
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

export default function AuthScreen() {
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


  const handleApple = async () => {
    setError("");
    try {
      const { error: appleError } = await signInWithApple();
      if (appleError) throw appleError;
    } catch (err) {
      setError(mapAuthError(err));
    }
  };

  const shell = (title: string, children: React.ReactNode) => (
    <div className="sn-screen sn-auth" data-testid="auth-screen">
      <div className="sn-container sn-stack sn-stack--lg sn-auth__body">
        <div className="sn-row sn-auth__top">
          <IconButton icon="close" label="إغلاق" tone="tinted" onClick={() => (window.history.length > 1 ? window.history.back() : navigate("/"))} />
        </div>
        <span className="sn-auth-mark" aria-hidden="true">سُنّة</span>
        <h1 className="sn-t-title1 sn-auth__title">{title}</h1>
        {children}
      </div>
    </div>
  );

  if (authLoading || !authReady) {
    return shell("سُنّة", <SkeletonCard />);
  }

  const title = tab === "forgot" ? "استعادة كلمة المرور" : adminLogin ? "دخول المسؤول" : tab === "register" ? "إنشاء حساب" : "تسجيل الدخول";

  if (pendingConfirmEmail) {
    return shell(
      "تم إنشاء الحساب",
      <div className="sn-stack" data-testid="signup-confirm-pending">
        {error ? <Notice tone="danger">{error}</Notice> : null}
        <p className="sn-t-body">أرسلنا رسالة تأكيد إلى <strong dir="ltr">{pendingConfirmEmail}</strong>. افتح البريد، واضغط رابط التفعيل، ثم سجّل الدخول.</p>
        {resendNote ? <Notice tone="success">{resendNote}</Notice> : null}
        <Button variant="primary" size="l" block loading={resendLoading} onClick={() => void handleResendConfirmation()} data-testid="signup-resend-confirmation">إعادة إرسال بريد التفعيل</Button>
        <Button variant="tertiary" block onClick={() => switchTab("login")}>الانتقال لتسجيل الدخول</Button>
      </div>,
    );
  }

  return shell(
    title,
    <div className="sn-stack">
      {!adminLogin && tab !== "forgot" ? (
        <Segmented<"login" | "register"> label="وضع الحساب" value={tab === "register" ? "register" : "login"} onChange={(v) => switchTab(v)} options={[{ value: "login", label: "تسجيل الدخول" }, { value: "register", label: "إنشاء حساب" }]} />
      ) : null}
      {!authEnabled ? <Notice tone="danger">{mapAuthError(null)}</Notice> : null}
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {denied ? <Notice>{ADMIN_ACCESS_DENIED_MESSAGE}</Notice> : null}
      {success ? <Notice tone="success">{success}</Notice> : null}
      {resetSent ? (
        <Notice tone="success">إن وُجد حساب بهذا البريد فستصلك رسالة لإعادة تعيين كلمة المرور.</Notice>
      ) : (
        <form onSubmit={handleSubmit} className="sn-stack" noValidate>
          {tab === "register" ? <TextField id="auth-name" label="الاسم" type="text" autoComplete="name" placeholder="اسمك الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} disabled={loading || !authEnabled} /> : null}
          <TextField id="auth-email" label="البريد الإلكتروني" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading || !authEnabled} dir="ltr" />
          {tab !== "forgot" ? (
            <div className="sn-stack">
              <TextField id="auth-password" label="كلمة المرور" type="password" autoComplete={tab === "register" ? "new-password" : "current-password"} placeholder={tab === "register" ? PASSWORD_POLICY_HINT_AR : "••••••••"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={tab === "register" ? PASSWORD_MIN_LENGTH : undefined} disabled={loading || !authEnabled} dir="ltr" />
              {tab === "register" ? <PasswordPolicyChecklist password={password} /> : null}
            </div>
          ) : null}
          {tab === "register" ? <TextField id="auth-confirm" label="تأكيد كلمة المرور" type="password" autoComplete="new-password" placeholder="أعد إدخال كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={PASSWORD_MIN_LENGTH} disabled={loading || !authEnabled} dir="ltr" /> : null}
          <Button type="submit" variant="primary" size="l" block loading={loading} disabled={loading || !authEnabled}>
            {tab === "register" ? "إنشاء حساب" : tab === "forgot" ? "إرسال رابط الاستعادة" : "تسجيل الدخول"}
          </Button>
        </form>
      )}
      {!adminLogin && tab !== "forgot" && authEnabled ? (
        <>
          <div className="sn-divider">أو</div>
          <Button variant="secondary" size="l" block icon="user" onClick={() => void handleApple()}>تسجيل الدخول بـ Apple</Button>
        </>
      ) : null}
      {!adminLogin && tab === "login" && authEnabled ? <Button variant="tertiary" block onClick={() => switchTab("forgot")}>نسيت كلمة المرور؟</Button> : null}
      {tab === "forgot" ? <Button variant="tertiary" block onClick={() => switchTab("login")}>العودة لتسجيل الدخول</Button> : null}
      <Button variant="tertiary" block onClick={() => navigate("/")}>{adminLogin ? "العودة للصفحة الرئيسية" : "المتابعة كزائر"}</Button>
    </div>,
  );
}
