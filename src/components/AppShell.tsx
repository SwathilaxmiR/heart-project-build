import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Newspaper, Map as MapIcon, Building2, Smartphone } from "lucide-react";
import { useLang } from "./LanguageContext";

const tabs = [
  { to: "/", label: { en: "Alerts", ta: "எச்சரிக்கைகள்" }, icon: Bell },
  { to: "/news", label: { en: "Kovai Today", ta: "கோவை இன்று" }, icon: Newspaper },
  { to: "/map", label: { en: "Map", ta: "வரைபடம்" }, icon: MapIcon },
  { to: "/ward", label: { en: "My Ward", ta: "என் வார்டு" }, icon: Building2 },
  { to: "/subscribe", label: { en: "Subscribe", ta: "சந்தா" }, icon: Smartphone },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLang();
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="text-[15px] font-medium">
            Civic<span className="text-primary">Pulse</span>
            <span className="text-muted-foreground"> · Coimbatore</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-live pulse-dot" />
            Updated 4 min ago
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setLang("en")}
            className={`text-[11px] px-2 py-1 rounded border border-border ${
              lang === "en" ? "bg-secondary font-medium" : "bg-transparent text-muted-foreground"
            }`}
          >EN</button>
          <button
            onClick={() => setLang("ta")}
            className={`text-[11px] px-2 py-1 rounded border border-border ${
              lang === "ta" ? "bg-secondary font-medium" : "bg-transparent text-muted-foreground"
            }`}
          >தமிழ்</button>
        </div>
      </header>

      <nav className="flex border-b border-border bg-card overflow-x-auto sticky top-[45px] z-20">
        {tabs.map((t) => {
          const active =
            t.to === "/" ? location.pathname === "/" : location.pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? "text-primary border-primary font-medium"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label[lang]}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground text-center">
        CivicPulse Coimbatore · Aggregating CCMC, TANGEDCO, news & community sources
      </footer>
    </div>
  );
}