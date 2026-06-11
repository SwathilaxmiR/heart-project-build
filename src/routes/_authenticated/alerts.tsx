import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlerts, type Alert } from "@/lib/civic.functions";
import { AlertCard } from "@/components/AlertCard";
import { BreakingBanner } from "@/components/BreakingBanner";
import { CategorySidebar, RightSidebar } from "@/components/Sidebar";
import { ALERT_TYPES, COIMBATORE_WARDS } from "@/lib/civic-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/components/LanguageContext";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Live alerts — KovaiToday" },
      { name: "description", content: "Live ward-level civic alerts for Coimbatore." },
    ],
  }),
  component: AlertsPage,
});

const PAGE_SIZE = 20;

function AlertsPage() {
  const fetchAlerts = useServerFn(getAlerts);
  const { t, lang } = useLang();
  const [category, setCategory] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [area, setArea] = useState<string>("all");
  const [sort, setSort] = useState<"latest" | "upvotes" | "breaking">("latest");
  const [pages, setPages] = useState(1);

  useEffect(() => setPages(1), [category, type, area, sort]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["alerts", category, type, area, sort, pages],
    queryFn: () => fetchAlerts({ data: { category, type, area, sort, limit: PAGE_SIZE * pages, offset: 0 } }),
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const items: Alert[] = data?.items ?? [];
  const hasMore = data?.hasMore ?? false;

  const { data: allData } = useQuery({
    queryKey: ["alerts-counts"],
    queryFn: () => fetchAlerts({ data: { limit: 100, offset: 0 } }),
    refetchInterval: 5 * 60_000,
  });
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allData?.total ?? 0 };
    for (const a of allData?.items ?? []) c[a.category] = (c[a.category] ?? 0) + 1;
    return c;
  }, [allData]);

  const breaking = items.find((a) => a.severity === "breaking");

  return (
    <div className="grid md:grid-cols-[176px_1fr] lg:grid-cols-[176px_1fr_208px]">
      <CategorySidebar active={category} counts={counts} onChange={setCategory} />
      <section className="flex flex-col min-w-0">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-secondary/60">
          <span className="text-[12px] text-muted-foreground">{t("type")}:</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="text-[12px] px-1.5 py-0.5 border border-border rounded bg-card">
            <option value="all">{t("all_types")}</option>
            {ALERT_TYPES.map((tp) => (<option key={tp.value} value={tp.value}>{tp.icon} {tp.label}</option>))}
          </select>
          <span className="text-[12px] text-muted-foreground ml-2">{t("area")}:</span>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="text-[12px] px-1.5 py-0.5 border border-border rounded bg-card max-w-[140px]">
            <option value="all">{t("all_areas")}</option>
            {COIMBATORE_WARDS.map((w) => (<option key={w} value={w}>{w}</option>))}
          </select>
          <span className="text-[12px] text-muted-foreground ml-2">{t("sort")}:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="text-[12px] px-1.5 py-0.5 border border-border rounded bg-card">
            <option value="latest">{t("latest_first")}</option>
            <option value="upvotes">{t("most_upvoted")}</option>
            <option value="breaking">{t("breaking_high")}</option>
          </select>
          <span className="ml-auto text-[12px] text-muted-foreground">
            {isFetching && !isLoading ? `${t("refreshing")} ` : ""}{t("showing")} {items.length} {t("of")} {data?.total ?? 0}
          </span>
        </div>
        <div className="p-3 md:p-4 flex flex-col gap-2.5">
          {breaking && category === "all" && type === "all" && <BreakingBanner alert={breaking} />}
          {isLoading && [0,1,2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          {isError && (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-muted-foreground">{t("cant_load_alerts")}</p>
              <button onClick={() => refetch()} className="text-[12px] px-3 py-1.5 rounded bg-primary text-primary-foreground">{t("retry")}</button>
            </div>
          )}
          {!isLoading && !isError && items.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("no_alerts")}</p>
          )}
          {items.map((a) => (<AlertCard key={a.id} alert={a} />))}
          {hasMore && !isLoading && (
            <button onClick={() => setPages((p) => p + 1)} disabled={isFetching} className="mx-auto mt-2 text-[12px] px-4 py-2 rounded-md border border-border bg-card hover:bg-secondary disabled:opacity-50">
              {isFetching ? t("loading") : t("load_more")}
            </button>
          )}
          <p className="sr-only">{lang}</p>
        </div>
      </section>
      <RightSidebar alerts={items} />
    </div>
  );
}