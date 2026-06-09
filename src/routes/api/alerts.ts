import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/alerts")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const type = u.searchParams.get("type");
        const area = u.searchParams.get("area");
        const sort = u.searchParams.get("sort") ?? "latest";
        const limit = Math.min(parseInt(u.searchParams.get("limit") ?? "20", 10) || 20, 100);
        const offset = Math.max(parseInt(u.searchParams.get("offset") ?? "0", 10) || 0, 0);
        let q = supabaseAdmin.from("alerts").select("*", { count: "exact" });
        if (type && type !== "all") q = q.eq("type", type);
        if (area && area !== "all") q = q.contains("areas", [area]);
        if (sort === "upvotes") q = q.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
        else q = q.order("created_at", { ascending: false });
        q = q.range(offset, offset + limit - 1);
        const { data, count, error } = await q;
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
        return new Response(
          JSON.stringify({ items: data ?? [], total: count ?? 0, limit, offset }),
          { headers: { "Content-Type": "application/json", ...CORS } },
        );
      },
    },
  },
});