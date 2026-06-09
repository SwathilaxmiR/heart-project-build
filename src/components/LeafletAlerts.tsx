import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import type { Alert } from "@/lib/civic.functions";

const TYPE_COLORS: Record<string, string> = {
  power_cut: "#D85A30",
  water_cut: "#378ADD",
  road_work: "#EF9F27",
  flooding: "#534AB7",
  traffic: "#EF9F27",
  weather: "#534AB7",
  other: "#888780",
};

function severityRadius(sev: string) {
  if (sev === "breaking" || sev === "high") return 11;
  if (sev === "medium") return 8;
  return 6;
}

function LocateMe() {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={() => {
        if (!navigator.geolocation) return;
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
            setLoading(false);
          },
          () => setLoading(false),
          { timeout: 8000 },
        );
      }}
      className="absolute bottom-20 right-3 bg-card border border-border rounded-md px-2 py-1 text-[11px] shadow-md z-[1000] hover:bg-secondary"
    >
      {loading ? "Locating…" : "📍 Locate me"}
    </button>
  );
}

export function LeafletAlerts({ alerts }: { alerts: Alert[] }) {
  // Avoid SSR hydration mismatch — only render in browser
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);
  if (!client) return null;

  return (
    <MapContainer
      center={[11.0168, 76.9558]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {alerts.map((a) => (
        <CircleMarker
          key={a.id}
          center={[a.lat!, a.lng!]}
          radius={severityRadius(a.severity)}
          pathOptions={{
            color: "#fff",
            weight: 2,
            fillColor: TYPE_COLORS[a.type] ?? TYPE_COLORS.other,
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                {a.areas.join(", ")}
              </div>
              {(a.start_time || a.end_time) && (
                <div style={{ fontSize: 11 }}>
                  {a.start_time && <>From {new Date(a.start_time).toLocaleString()}</>}
                  {a.end_time && <> · until {new Date(a.end_time).toLocaleString()}</>}
                </div>
              )}
              <div style={{ fontSize: 11, marginTop: 4, color: "#666" }}>Source: {a.source}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      <LocateMe />
      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: 8,
          fontSize: 11,
          zIndex: 1000,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Legend</div>
        {[
          ["Power cut", TYPE_COLORS.power_cut],
          ["Water cut", TYPE_COLORS.water_cut],
          ["Road / traffic", TYPE_COLORS.road_work],
          ["Flood / weather", TYPE_COLORS.flooding],
          ["Other", TYPE_COLORS.other],
        ].map(([label, c]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: c as string }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </MapContainer>
  );
}