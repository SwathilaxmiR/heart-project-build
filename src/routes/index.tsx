import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlerts } from "@/lib/civic.functions";
import { AlertCard } from "@/components/AlertCard";
import { BreakingBanner } from "@/components/BreakingBanner";
import { CategorySidebar, RightSidebar } from "@/components/Sidebar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live alerts — CivicPulse Coimbatore" },
      { name: "description", content: "Live ward-level civic alerts for Coimbatore: power cuts, water cuts, road works, weather and more." },
      { property: "og:title", content: "Live alerts — CivicPulse Coimbatore" },
      { property: "og:description", content: "Live ward-level civic alerts for Coimbatore." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const fetchAlerts = useServerFn(getAlerts);
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => fetchAlerts({ data: {} }),
    refetchInterval: 60_000,
  });
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"latest" | "sources" | "breaking">("latest");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: alerts.length };
    for (const a of alerts) c[a.category] = (c[a.category] ?? 0) + 1;
    return c;
  }, [alerts]);

  const filtered = useMemo(() => {
    let list = category === "all" ? alerts : alerts.filter((a) => a.category === category);
    if (sort === "sources") list = [...list].sort((a, b) => b.source_count - a.source_count);
    if (sort === "breaking") list = list.filter((a) => a.severity === "breaking" || a.severity === "high");
    return list;
  }, [alerts, category, sort]);

  const breaking = alerts.find((a) => a.severity === "breaking");

  return (
    <div className="grid md:grid-cols-[176px_1fr] lg:grid-cols-[176px_1fr_208px]">
      <CategorySidebar active={category} counts={counts} onChange={setCategory} />
      <section className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/60">
          <span className="text-[12px] text-muted-foreground">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-[12px] px-1.5 py-0.5 border border-border rounded bg-card"
          >
            <option value="latest">Latest first</option>
            <option value="sources">Most sources</option>
            <option value="breaking">Breaking / high</option>
          </select>
          <span className="ml-auto text-[12px] text-muted-foreground">
            Showing {filtered.length} of {alerts.length}
          </span>
        </div>
        <div className="p-3 md:p-4 flex flex-col gap-2.5">
          {breaking && category === "all" && <BreakingBanner alert={breaking} />}
          {isLoading && <p className="text-sm text-muted-foreground">Loading live alerts…</p>}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">No alerts in this category yet.</p>
          )}
          {filtered.map((a, i) => (
            <AlertCard key={a.id} alert={a} featured={i === 0 && category === "all"} />
          ))}
        </div>
      </section>
      <RightSidebar alerts={alerts} />
    </div>
  );
}
