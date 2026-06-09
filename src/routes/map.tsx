import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlerts, type Alert } from "@/lib/civic.functions";
import { ALERT_TYPES } from "@/lib/civic-data";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Alert map — CivicPulse Coimbatore" },
      { name: "description", content: "See where civic alerts are happening across Coimbatore on a map." },
    ],
  }),
  component: MapPage,
});

const TYPE_COLORS: Record<string, string> = {
  power_cut: "#D85A30",
  water_cut: "#378ADD",
  road_work: "#EF9F27",
  flooding: "#534AB7",
  traffic: "#EF9F27",
  weather: "#534AB7",
  other: "#888780",
};

function MapPage() {
  const fetchAlerts = useServerFn(getAlerts);
  const { data } = useQuery({
    queryKey: ["alerts", "map"],
    queryFn: () => fetchAlerts({ data: { limit: 100 } }),
    refetchInterval: 5 * 60_000,
  });
  const alerts: Alert[] = data?.items ?? [];
  const geoAlerts = alerts.filter((a) => a.lat && a.lng);

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALERT_TYPES.map((t) => [t.value, true])),
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <header className="flex items-end gap-3">
        <div className="flex-1">
          <h1 className="text-lg font-medium">Alert map</h1>
          <p className="text-[12px] text-muted-foreground">
            {geoAlerts.length} alerts plotted across Coimbatore · auto-refreshes every 5 min
          </p>
        </div>
      </header>
      <div className="relative w-full aspect-[4/3] bg-secondary border border-border rounded-lg overflow-hidden">
        {mounted ? (
          <LeafletMap alerts={geoAlerts.filter((a) => enabled[a.type] ?? true)} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[12px] text-muted-foreground">
            Loading map…
          </div>
        )}
        {/* Type toggle panel */}
        <div className="absolute top-3 right-3 bg-card/95 backdrop-blur border border-border rounded-md p-2 shadow-md text-[11px] z-[1000] max-h-[80%] overflow-y-auto">
          <div className="font-medium text-foreground mb-1">Layers</div>
          {ALERT_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-1.5 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled[t.value] ?? true}
                onChange={(e) => setEnabled((p) => ({ ...p, [t.value]: e.target.checked }))}
                className="w-3 h-3"
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: TYPE_COLORS[t.value] ?? TYPE_COLORS.other }}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Click any marker for details · use the layer panel to filter by type.
      </p>
    </div>
  );
}

function LeafletMap({ alerts }: { alerts: Alert[] }) {
  // Lazy-loaded so leaflet (which touches window) only runs client-side
  const [Comp, setComp] = useState<null | React.ComponentType<{ alerts: Alert[] }>>(null);
  useEffect(() => {
    let mounted = true;
    import("@/components/LeafletAlerts").then((m) => {
      if (mounted) setComp(() => m.LeafletAlerts);
    });
    return () => {
      mounted = false;
    };
  }, []);
  if (!Comp) return null;
  return <Comp alerts={alerts} />;
}