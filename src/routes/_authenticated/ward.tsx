import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlerts } from "@/lib/civic.functions";
import { AlertCard } from "@/components/AlertCard";
import { COIMBATORE_WARDS } from "@/lib/civic-data";
import { useLang } from "@/components/LanguageContext";

export const Route = createFileRoute("/_authenticated/ward")({
  head: () => ({ meta: [{ title: "My Ward — KovaiToday" }] }),
  component: WardPage,
});

function WardPage() {
  const fetchAlerts = useServerFn(getAlerts);
  const { t } = useLang();
  const [ward, setWard] = useState<string>(() => {
    if (typeof window === "undefined") return "RS Puram";
    return window.localStorage.getItem("kt_ward") || "RS Puram";
  });
  const onChange = (w: string) => { setWard(w); try { window.localStorage.setItem("kt_ward", w); } catch { /* noop */ } };

  const { data, isLoading } = useQuery({
    queryKey: ["ward-alerts", ward],
    queryFn: () => fetchAlerts({ data: { area: ward, limit: 50 } }),
  });
  const items = data?.items ?? [];
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <header>
        <h1 className="text-lg font-medium">{t("my_ward")}</h1>
        <div className="mt-2 flex items-center gap-2">
          <select value={ward} onChange={(e) => onChange(e.target.value)} className="text-[13px] px-2 py-1 border border-border rounded bg-card">
            {COIMBATORE_WARDS.map((w) => (<option key={w} value={w}>{w}</option>))}
          </select>
          <span className="text-[12px] text-muted-foreground">{items.length} {t("of")} {data?.total ?? 0}</span>
        </div>
      </header>
      {isLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
      {!isLoading && items.length === 0 && <p className="text-sm text-muted-foreground">{t("no_alerts")}</p>}
      <div className="flex flex-col gap-2.5">
        {items.map((a) => (<AlertCard key={a.id} alert={a} />))}
      </div>
    </div>
  );
}