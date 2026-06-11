import { createFileRoute } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getNews } from "@/lib/civic.functions";
import { timeAgo } from "@/lib/civic-data";
import { UpvoteButton } from "@/components/UpvoteButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/LanguageContext";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/news")({
  head: () => ({
    meta: [
      { title: "KovaiToday — Coimbatore news" },
      { name: "description", content: "Coimbatore news aggregated and deduplicated, updated every 15 min." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const fetchNews = useServerFn(getNews);
  const { t, lang } = useLang();
  const [sort, setSort] = useState<"latest" | "upvotes">("latest");
  const { data: news = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["news", sort],
    queryFn: () => fetchNews({ data: { sort, limit: 40 } }),
    refetchInterval: 5 * 60_000,
    placeholderData: keepPreviousData,
  });
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2.5">
      <header className="mb-2 flex items-end gap-3">
        <div className="flex-1">
          <h1 className="text-lg font-medium">{t("news_feed")}</h1>
          <p className="text-[12px] text-muted-foreground">
            {t("news_subtitle")}{isFetching && !isLoading ? ` · ${t("refreshing")}` : ""}
          </p>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="text-[12px] px-1.5 py-1 border border-border rounded bg-card">
          <option value="latest">{t("latest_first")}</option>
          <option value="upvotes">{t("most_upvoted")}</option>
        </select>
      </header>
      {isLoading && [0,1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      {isError && (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-muted-foreground">{t("cant_load_news")}</p>
          <button onClick={() => refetch()} className="text-[12px] px-3 py-1.5 rounded bg-primary text-primary-foreground">{t("retry")}</button>
        </div>
      )}
      {news.map((n) => {
        const title = lang === "en" ? (n.title_en ?? n.title) : n.title;
        const summary = lang === "en" ? (n.summary_en ?? n.summary) : n.summary;
        const extraSources = (n.sources ?? []).filter((s) => s && s !== n.source);
        return (
          <article key={n.id} className="bg-card border border-border rounded-lg p-3 hover:border-foreground/40 hover:shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-1.5 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/80">{n.source}</span>
              <span>·</span>
              <span>{n.published_at ? timeAgo(n.published_at) : timeAgo(n.created_at)}</span>
              {n.lang === "ta" && lang === "en" && (
                <span className="bg-accent text-accent-foreground px-1.5 py-0.5 rounded text-[10px]">தமிழ் → EN</span>
              )}
              <span className="ml-auto" />
              <UpvoteButton itemId={n.id} itemType="news" count={n.upvotes ?? 0} />
            </div>
            <a href={n.source_url ?? "#"} target="_blank" rel="noopener noreferrer" className="block group">
              <h3 className="text-[13px] font-medium leading-snug mb-1 group-hover:text-primary inline-flex items-baseline gap-1">
                {title}
                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 translate-y-[1px]" />
              </h3>
              {summary && (
                <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{summary}</p>
              )}
            </a>
            {extraSources.length > 0 && (
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                {t("also_reported")}: {extraSources.slice(0, 4).join(", ")}
                {extraSources.length > 4 && ` +${extraSources.length - 4}`}
              </div>
            )}
          </article>
        );
      })}
      {!isLoading && news.length === 0 && !isError && (
        <p className="text-sm text-muted-foreground text-center py-8">{t("no_news")}</p>
      )}
    </div>
  );
}