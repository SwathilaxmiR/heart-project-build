import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/components/LanguageContext";
import { Bell, Map as MapIcon, Newspaper, ArrowRight } from "lucide-react";
import { DoodleBackdrop } from "@/components/DoodleBackdrop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KovaiToday — Hyperlocal pulse of Coimbatore" },
      { name: "description", content: "Live civic alerts, news and weather for Coimbatore. Subscribe and never miss a power cut, water cut or road closure in your ward." },
      { property: "og:title", content: "KovaiToday" },
      { property: "og:description", content: "Hyperlocal pulse of Coimbatore." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, lang, setLang } = useLang();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <DoodleBackdrop />
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="text-lg font-semibold">
          Kovai<span className="text-primary">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 mr-2">
            <button onClick={() => setLang("en")} className={`text-[11px] px-2 py-1 rounded border border-border ${lang === "en" ? "bg-secondary font-medium" : "text-muted-foreground"}`}>EN</button>
            <button onClick={() => setLang("ta")} className={`text-[11px] px-2 py-1 rounded border border-border ${lang === "ta" ? "bg-secondary font-medium" : "text-muted-foreground"}`}>தமிழ்</button>
          </div>
          <Link to="/auth" className="text-[13px] px-3 py-1.5 rounded-md border border-border hover:bg-secondary">
            {t("sign_in")}
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-10 pb-20 text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {t("landing_tag")}
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold leading-tight">
          {lang === "ta" ? (
            <>கோவையின் <span className="text-primary">துடிப்பு</span>, ஒரு இடத்தில்.</>
          ) : (
            <>Coimbatore's <span className="text-primary">pulse</span>, in one place.</>
          )}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          {t("landing_hero")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
            {t("get_started")} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border hover:bg-secondary">
            {t("sign_in")}
          </Link>
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-3 text-left">
          <div className="bg-card/80 backdrop-blur border border-border rounded-lg p-4">
            <Bell className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-medium">{t("alerts")}</h3>
            <p className="text-[12px] text-muted-foreground mt-1">{lang === "ta" ? "உங்கள் வார்டுக்கான நேரடி எச்சரிக்கைகள்." : "Live power, water and traffic alerts for your ward."}</p>
          </div>
          <div className="bg-card/80 backdrop-blur border border-border rounded-lg p-4">
            <Newspaper className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-medium">{t("news_feed")}</h3>
            <p className="text-[12px] text-muted-foreground mt-1">{lang === "ta" ? "தினமும் கோவை செய்திகள் ஒரே இடத்தில்." : "All Coimbatore newspapers, deduplicated."}</p>
          </div>
          <div className="bg-card/80 backdrop-blur border border-border rounded-lg p-4">
            <MapIcon className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-medium">{t("map")}</h3>
            <p className="text-[12px] text-muted-foreground mt-1">{lang === "ta" ? "ஒவ்வொரு பகுதியின் நேரடி நிலை." : "See what's happening across every ward live."}</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center text-[11px] text-muted-foreground pb-6">
        {t("footer")}
      </footer>
    </div>
  );
}