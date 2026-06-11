import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Newspaper, Map as MapIcon, Building2, Smartphone, LogOut } from "lucide-react";
import { useLang } from "./LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const tabs = [
  { to: "/alerts", key: "alerts" as const, icon: Bell },
  { to: "/news", key: "news_feed" as const, icon: Newspaper },
  { to: "/map", key: "map" as const, icon: MapIcon },
  { to: "/ward", key: "my_ward" as const, icon: Building2 },
  { to: "/subscribe", key: "subscribe" as const, icon: Smartphone },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Render bare children on public, no-chrome routes
  const path = location.pathname;
  if (path === "/" || path.startsWith("/auth")) {
    return <>{children}</>;
  }

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/alerts" className="text-[15px] font-medium">
            Kovai<span className="text-primary">Today</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-live pulse-dot" />
            {t("updated_ago")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button onClick={() => setLang("en")} className={`text-[11px] px-2 py-1 rounded border border-border ${lang === "en" ? "bg-secondary font-medium" : "bg-transparent text-muted-foreground"}`}>EN</button>
            <button onClick={() => setLang("ta")} className={`text-[11px] px-2 py-1 rounded border border-border ${lang === "ta" ? "bg-secondary font-medium" : "bg-transparent text-muted-foreground"}`}>தமிழ்</button>
          </div>
          <button onClick={signOut} title={t("sign_out")} className="text-[11px] px-2 py-1 rounded border border-border text-muted-foreground hover:bg-secondary inline-flex items-center gap-1">
            <LogOut className="w-3 h-3" /> <span className="hidden sm:inline">{t("sign_out")}</span>
          </button>
        </div>
      </header>

      <nav className="flex border-b border-border bg-card overflow-x-auto sticky top-[45px] z-20">
        {tabs.map((t) => {
          const active = path === t.to || path.startsWith(t.to + "/");
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
              {useLangLabel(t.key)}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground text-center">
        {t("footer")}
      </footer>
    </div>
  );
}

function useLangLabel(key: "alerts" | "news_feed" | "map" | "my_ward" | "subscribe") {
  const { t } = useLang();
  return t(key);
}