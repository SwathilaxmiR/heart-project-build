import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlerts } from "@/lib/civic.functions";
import { AlertCard } from "@/components/AlertCard";
import { COIMBATORE_WARDS } from "@/lib/civic-data";

export const Route = createFileRoute("/ward")({
  head: () => ({
    meta: [
      { title: "My Ward — CivicPulse Coimbatore" },
      { name: "description", content: "All historical and upcoming civic alerts for your Coimbatore ward." },
    ],
  }),
  component: WardPage,
});

function WardPage() {
  const fetchAlerts = useServerFn(getAlerts);
  const [ward, setWard] = useState<string>("Peelamedu");
  const { data } = useQuery({
    queryKey: ["alerts", "ward", ward],
    queryFn: () => fetchAlerts({ data: { area: ward, limit: 100 } }),
    refetchInterval: 5 * 60_000,
  });
  const wardAlerts = data?.items ?? [];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <header className="space-y-2">
        <h1 className="text-lg font-medium">My Ward</h1>
        <p className="text-[12px] text-muted-foreground">
          Pick a locality to see all civic alerts and notices for it.
        </p>
        <select
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          className="w-full md:w-72 text-[13px] px-2.5 py-1.5 border border-border rounded bg-card"
        >
          {COIMBATORE_WARDS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </header>
      <div className="text-[12px] text-muted-foreground">
        {wardAlerts.length} alert{wardAlerts.length === 1 ? "" : "s"} for {ward}
      </div>
      <div className="flex flex-col gap-2.5">
        {wardAlerts.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No alerts logged for {ward} yet — sources poll every 15 min.
          </p>
        )}
        {wardAlerts.map((a) => <AlertCard key={a.id} alert={a} />)}
      </div>
    </div>
  );
}