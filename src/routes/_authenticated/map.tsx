import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlerts } from "@/lib/civic.functions";
import { LeafletAlerts } from "@/components/LeafletAlerts";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({ meta: [{ title: "Map — KovaiToday" }] }),
  component: MapPage,
});

function MapPage() {
  const fetchAlerts = useServerFn(getAlerts);
  const { data } = useQuery({
    queryKey: ["alerts-map"],
    queryFn: () => fetchAlerts({ data: { limit: 100 } }),
    refetchInterval: 5 * 60_000,
  });
  return (
    <div className="h-[calc(100vh-91px)] w-full relative">
      <LeafletAlerts alerts={data?.items ?? []} />
    </div>
  );
}