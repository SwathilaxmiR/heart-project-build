import { MapPin, ExternalLink } from "lucide-react";
import { categoryClass, timeAgo } from "@/lib/civic-data";
import { useLang } from "./LanguageContext";
import type { Alert } from "@/lib/civic.functions";
import { UpvoteButton } from "./UpvoteButton";

export function AlertCard({ alert }: { alert: Alert; featured?: boolean }) {
  const { lang } = useLang();
  const title = lang === "ta" && alert.title_ta ? alert.title_ta : alert.title;
  const summary = lang === "ta" && alert.summary_ta ? alert.summary_ta : alert.summary;
  const sevColor =
    alert.severity === "breaking" || alert.severity === "high"
      ? "bg-destructive/10 text-destructive"
      : alert.severity === "medium"
        ? "bg-warn/10 text-warn"
        : "bg-muted text-muted-foreground";
  return (
    <article className="bg-card border border-border rounded-lg p-3 hover:border-foreground/40 hover:shadow-sm transition-colors">
      <div className="flex items-center gap-2 mb-1.5 text-[11px] text-muted-foreground">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide ${categoryClass(alert.category)}`}>
          {alert.category}
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${sevColor}`}>
          {alert.severity}
        </span>
        <span className="font-medium text-foreground/80">{alert.source}</span>
        <span>·</span>
        <span>{timeAgo(alert.created_at)}</span>
        <span className="ml-auto" />
        <UpvoteButton itemId={alert.id} itemType="alert" count={alert.upvotes ?? 0} />
      </div>
      {alert.source_url ? (
        <a
          href={alert.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <h3 className="text-[13px] font-medium leading-snug mb-1 group-hover:text-primary inline-flex items-baseline gap-1">
            {title}
            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 translate-y-[1px]" />
          </h3>
          {summary && <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">{summary}</p>}
        </a>
      ) : (
        <>
          <h3 className="text-[13px] font-medium leading-snug mb-1">{title}</h3>
          {summary && <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">{summary}</p>}
        </>
      )}
      {(alert.start_time || alert.end_time) && (
        <div className="text-[11px] text-muted-foreground mb-2">
          {alert.start_time && <>From {new Date(alert.start_time).toLocaleString()}</>}
          {alert.end_time && <> · until {new Date(alert.end_time).toLocaleString()}</>}
        </div>
      )}
      {alert.areas.length > 0 && (
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
            <span className="ml-auto text-[11px] text-muted-foreground">
              +{alert.source_count - 1} source{alert.source_count > 2 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </article>
  );
}