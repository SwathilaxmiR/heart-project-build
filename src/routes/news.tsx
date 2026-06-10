import { createFileRoute } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getNews } from "@/lib/civic.functions";
import { timeAgo } from "@/lib/civic-data";
import { UpvoteButton } from "@/components/UpvoteButton";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "KovaiToday — Coimbatore news aggregator" },
      { name: "description", content: "Coimbatore news from The Hindu, Times of India, New Indian Express and more — deduplicated and updated every 15 minutes." },
      { property: "og:title", content: "KovaiToday — Coimbatore news aggregator" },
      { property: "og:description", content: "All Coimbatore news in one feed." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const fetchNews = useServerFn(getNews);
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
          <h1 className="text-lg font-medium">KovaiToday</h1>
          <p className="text-[12px] text-muted-foreground">
            Deduplicated Coimbatore news · updated every 15 min{isFetching && !isLoading ? " · refreshing…" : ""}
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="text-[12px] px-1.5 py-1 border border-border rounded bg-card"
        >
          <option value="latest">Latest first</option>
          <option value="upvotes">Most upvoted</option>
        </select>
      </header>
      {isLoading && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      {isError && (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-muted-foreground">Couldn't load news.</p>
          <button
            onClick={() => refetch()}
            className="text-[12px] px-3 py-1.5 rounded bg-primary text-primary-foreground"
          >
            Retry
          </button>
        </div>
      )}
      {news.map((n) => {
        const title = n.title_en ?? n.title;
        const summary = n.summary_en ?? n.summary;
        const extraSources = (n.sources ?? []).filter((s) => s && s !== n.source);
        return (
          <article key={n.id} className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center gap-2 mb-1.5 text-[11px] text-muted-foreground">
              <span className="font-medium">{n.source}</span>
              <span>·</span>
              <span>{n.published_at ? timeAgo(n.published_at) : timeAgo(n.created_at)}</span>
              {n.lang === "ta" && (
                <span className="bg-accent text-accent-foreground px-1.5 py-0.5 rounded text-[10px]">தமிழ்</span>
              )}
              <span className="ml-auto" />
              <UpvoteButton itemId={n.id} itemType="news" count={n.upvotes ?? 0} />
            </div>
            <a href={n.source_url ?? "#"} target="_blank" rel="noopener noreferrer" className="block">
              <h3 className="text-[13px] font-medium leading-snug mb-1">{title}</h3>
              {summary && (
                <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{summary}</p>
              )}
            </a>
            {extraSources.length > 0 && (
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                Also reported by: {extraSources.slice(0, 4).join(", ")}
                {extraSources.length > 4 && ` +${extraSources.length - 4} more`}
              </div>
            )}
          </article>
        );
      })}
      {!isLoading && news.length === 0 && !isError && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No fresh stories yet. The scraper runs every 15 minutes — check back shortly.
        </p>
      )}
    </div>
  );
}