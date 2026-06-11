import { CATEGORIES } from "@/lib/civic-data";
import type { Alert } from "@/lib/civic.functions";
import { Weather } from "./Weather";
import { useLang } from "./LanguageContext";

export function CategorySidebar({
  active,
  counts,
  onChange,
}: {
  active: string;
  counts: Record<string, number>;
  onChange: (cat: string) => void;
}) {
  const { lang } = useLang();
  return (
    <aside className="md:w-44 md:border-r border-border bg-card md:py-3 md:sticky md:top-[91px] md:self-start">
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible px-2 md:px-0 py-2 md:py-0">
        {CATEGORIES.map((c) => {
          const isActive = active === c.value;
          return (
            <button
              key={c.value}
              onClick={() => onChange(c.value)}
              className={`flex items-center gap-2 px-3 md:px-3.5 py-1.5 text-[13px] rounded md:rounded-none md:border-l-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "text-primary md:border-l-primary bg-accent font-medium"
                  : "text-muted-foreground md:border-l-transparent hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="text-[14px] w-4 text-center">{c.icon}</span>
              <span>{lang === "ta" ? c.ta : c.label}</span>
              <span className="ml-auto text-[11px] bg-secondary px-1.5 py-0.5 rounded-md text-muted-foreground">
                {counts[c.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function RightSidebar({ alerts }: { alerts: Alert[] }) {
  const { t } = useLang();
  const sources = Array.from(new Set(alerts.map((a) => a.source))).slice(0, 6);
  const trending = alerts.slice(0, 5);
  return (
    <aside className="hidden lg:block w-52 border-l border-border p-3 space-y-4 sticky top-[91px] self-start">
      <section>
        <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          {t("weather")}
        </h4>
        <Weather />
      </section>
      <section>
        <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          {t("trending")}
        </h4>
        <ol className="space-y-1.5">
          {trending.map((t, i) => (
            <li key={t.id} className="flex gap-2 items-start text-[12px] border-b border-border pb-1.5 last:border-0">
              <span className="text-[11px] text-muted-foreground w-3.5">{i + 1}</span>
              <span className="text-muted-foreground leading-tight line-clamp-2">{t.title}</span>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          {t("sources_active")}
        </h4>
        <div className="space-y-1.5">
          {sources.map((s) => (
            <div key={s} className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{s}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-live" />
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}