import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useLang } from "@/components/LanguageContext";
import { DoodleBackdrop } from "@/components/DoodleBackdrop";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — KovaiToday" },
      { name: "description", content: "Sign in to KovaiToday to get hyperlocal Coimbatore alerts." },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.8 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLang();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already signed in, jump straight in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/alerts", replace: true });
    });
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/alerts", replace: true });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/alerts` },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/alerts", replace: true });
        } else {
          // Email confirmation required — fall back to password sign-in attempt.
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            toast.success("Account created. Check your email to confirm, then sign in.");
            setMode("signin");
          } else {
            navigate({ to: "/alerts", replace: true });
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/alerts", replace: true });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <DoodleBackdrop />
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="text-lg font-semibold">
          Kovai<span className="text-primary">Today</span>
        </Link>
        <div className="flex gap-1">
          <button onClick={() => setLang("en")} className={`text-[11px] px-2 py-1 rounded border border-border ${lang === "en" ? "bg-secondary font-medium" : "text-muted-foreground"}`}>EN</button>
          <button onClick={() => setLang("ta")} className={`text-[11px] px-2 py-1 rounded border border-border ${lang === "ta" ? "bg-secondary font-medium" : "text-muted-foreground"}`}>தமிழ்</button>
        </div>
      </header>
      <main className="relative z-10 flex items-center justify-center px-4 pt-6 pb-16">
        <div className="w-full max-w-sm bg-card/90 backdrop-blur border border-border rounded-xl p-6 shadow-xl">
          <h1 className="text-xl font-semibold text-center">
            {mode === "signin" ? t("sign_in") : t("sign_up")}
          </h1>
          <p className="text-[12px] text-muted-foreground text-center mt-1">{t("landing_tag")}</p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="mt-5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-secondary text-[13px] font-medium disabled:opacity-60"
          >
            <GoogleIcon /> {t("continue_with_google")}
          </button>

          <div className="my-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> {t("or")} <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-2.5">
            <label className="block text-[12px]">
              <span className="text-muted-foreground">{t("email")}</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-2.5 py-2 border border-border rounded bg-background text-[13px]" />
            </label>
            <label className="block text-[12px]">
              <span className="text-muted-foreground">{t("password")}</span>
              <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-2.5 py-2 border border-border rounded bg-background text-[13px]" />
            </label>
            <button disabled={loading} className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-60">
              {loading ? t("loading") : (mode === "signin" ? t("sign_in") : t("sign_up"))}
            </button>
          </form>

          <p className="mt-4 text-center text-[12px] text-muted-foreground">
            {mode === "signin" ? t("need_account") : t("already_have")}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline">
              {mode === "signin" ? t("sign_up") : t("sign_in")}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}