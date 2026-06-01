import { MapPin } from "lucide-react";
import { categoryClass, timeAgo } from "@/lib/civic-data";
import { useLang } from "./LanguageContext";
import type { Alert } from "@/lib/civic.functions";

export function AlertCard({ alert, featured = false }: { alert: Alert; featured?: boolean }) {
  const { lang } = useLang();
  const title = lang === "ta" && alert.title_ta ? alert.title_ta : alert.title;
  const summary = lang === "ta" && alert.summary_ta ? alert.summary_ta : alert.summary;
  return (
    <article
      className={`bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors ${
        featured ? "border-l-2 border-l-primary" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide ${categoryClass(alert.category)}`}>
          {alert.category}
        </span>
        <span className="text-[11px] text-muted-foreground">{alert.source}</span>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {timeAgo(alert.created_at)}
        </span>
      </div>
      <h3 className="text-[13px] font-medium leading-snug mb-1">{title}</h3>
      <p className="text-[12px] text-muted-foreground leading-relaxed mb-2">{summary}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {alert.areas.slice(0, 3).map((a) => (
          <span
            key={a}
            className="text-[11px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded flex items-center gap-1"
          >
            <MapPin className="w-2.5 h-2.5" />
            {a}
          </span>
        ))}
        {alert.source_count > 1 && (
          <span className="text-[11px] text-muted-foreground ml-auto">
            +{alert.source_count - 1} source{alert.source_count > 2 ? "s" : ""}
          </span>
        )}
      </div>
    </article>
  );
}