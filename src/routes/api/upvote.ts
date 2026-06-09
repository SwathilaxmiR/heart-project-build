import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const Body = z.object({
  item_id: z.string().uuid(),
  item_type: z.enum(["alert", "news"]),
  fingerprint: z.string().min(8).max(200).optional(),
});

export const Route = createFileRoute("/api/upvote")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch (e) {
          return new Response(JSON.stringify({ error: (e as Error).message }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
        // Fallback fingerprint from IP + UA when client omits
        const fp =
          body.fingerprint ??
          (request.headers.get("x-forwarded-for") ?? "anon") +
            "|" +
            (request.headers.get("user-agent") ?? "unknown");
        const table = body.item_type === "alert" ? "alerts" : "news_articles";
        const { error: logErr } = await supabaseAdmin
          .from("upvote_log")
          .insert({ item_id: body.item_id, item_type: body.item_type, fingerprint: fp });
        if (logErr) {
          const { data: row } = await supabaseAdmin.from(table).select("upvotes").eq("id", body.item_id).single();
          return new Response(
            JSON.stringify({ already_voted: true, upvotes: row?.upvotes ?? 0 }),
            { headers: { "Content-Type": "application/json", ...CORS } },
          );
        }
        const { data: cur } = await supabaseAdmin.from(table).select("upvotes").eq("id", body.item_id).single();
        const next = (cur?.upvotes ?? 0) + 1;
        await supabaseAdmin.from(table).update({ upvotes: next }).eq("id", body.item_id);
        return new Response(
          JSON.stringify({ already_voted: false, upvotes: next }),
          { headers: { "Content-Type": "application/json", ...CORS } },
        );
      },
    },
  },
});