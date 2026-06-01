import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNews } from "@/lib/civic.functions";
import { timeAgo } from "@/lib/civic-data";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Kovai Today — Coimbatore news aggregator" },
      { name: "description", content: "Coimbatore news from The Hindu, Times of India, New Indian Express and more — deduplicated and updated every 15 minutes." },
      { property: "og:title", content: "Kovai Today — Coimbatore news aggregator" },
      { property: "og:description", content: "All Coimbatore news in one feed." },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const fetchNews = useServerFn(getNews);
  const { data: news = [], isLoading, isError } = useQuery({
    queryKey: ["news"],
    queryFn: () => fetchNews(),
    refetchInterval: 15 * 60_000,
  });
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2.5">
      <header className="mb-2">
        <h1 className="text-lg font-medium">Kovai Today</h1>
        <p className="text-[12px] text-muted-foreground">
          Live feed from Coimbatore news sources · updated every 15 minutes
        </p>
      </header>
      {isLoading && <p className="text-sm text-muted-foreground">Fetching latest news…</p>}
      {isError && (
        <p className="text-sm text-muted-foreground">
          Couldn't reach news feeds. Showing seeded alerts instead — try again shortly.
        </p>
      )}
      {news.map((n, i) => (
        <a
          key={i}
          href={n.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5 text-[11px] text-muted-foreground">
            <span className="font-medium">{n.source}</span>
            <span>·</span>
            <span>{n.published ? timeAgo(n.published) : ""}</span>
            {n.lang === "ta" && (
              <span className="ml-auto bg-accent text-accent-foreground px-1.5 py-0.5 rounded text-[10px]">
                தமிழ்
              </span>
            )}
          </div>
          <h3 className="text-[13px] font-medium leading-snug mb-1">{n.title}</h3>
          {n.summary && (
            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
              {n.summary}
            </p>
          )}
        </a>
      ))}
      {!isLoading && news.length === 0 && !isError && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No fresh stories from connected feeds right now.
        </p>
      )}
    </div>
  );
}