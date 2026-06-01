import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlerts } from "@/lib/civic.functions";
import { categoryClass } from "@/lib/civic-data";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Alert map — CivicPulse Coimbatore" },
      { name: "description", content: "See where civic alerts are happening across Coimbatore on a map." },
    ],
  }),
  component: MapPage,
});

// Coimbatore bbox approx
const LAT_MIN = 10.93, LAT_MAX = 11.10;
const LNG_MIN = 76.89, LNG_MAX = 77.07;

function project(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

function pinColor(type: string) {
  if (type === "power_cut") return "#EF4444";
  if (type === "water_cut") return "#3B82F6";
  if (type === "road_work" || type === "traffic") return "#F59E0B";
  if (type === "flooding" || type === "weather") return "#6366F1";
  return "#D85A30";
}

function MapPage() {
  const fetchAlerts = useServerFn(getAlerts);
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => fetchAlerts({ data: {} }),
  });
  const geoAlerts = alerts.filter((a) => a.lat && a.lng);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <header>
        <h1 className="text-lg font-medium">Alert map</h1>
        <p className="text-[12px] text-muted-foreground">
          {geoAlerts.length} alerts plotted across Coimbatore
        </p>
      </header>
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        {[
          ["Power cut", "#EF4444"],
          ["Water cut", "#3B82F6"],
          ["Road / traffic", "#F59E0B"],
          ["Weather / flood", "#6366F1"],
          ["Other", "#D85A30"],
        ].map(([label, c]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            {label}
          </span>
        ))}
      </div>
      <div className="relative w-full aspect-[4/3] bg-secondary border border-border rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "10% 10%",
          }}
        />
        <div className="absolute top-2 left-3 text-[10px] text-muted-foreground uppercase tracking-wider">
          Coimbatore
        </div>
        {geoAlerts.map((a) => {
          const { x, y } = project(a.lat!, a.lng!);
          return (
            <div
              key={a.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className="block w-3 h-3 rounded-full ring-2 ring-card"
                style={{ background: pinColor(a.type) }}
              />
              <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 w-56 bg-card border border-border rounded-md p-2 text-[11px] shadow-md z-10">
                <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase mb-1 ${categoryClass(a.category)}`}>
                  {a.category}
                </div>
                <div className="font-medium leading-snug">{a.title}</div>
                <div className="text-muted-foreground mt-0.5">{a.areas.join(", ")}</div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Hover any pin to see details. Tap an area on Subscribe to get WhatsApp alerts for that ward.
      </p>
    </div>
  );
}