import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Alert = {
  id: string;
  type: string;
  category: string;
  title: string;
  title_ta: string | null;
  summary: string;
  summary_ta: string | null;
  areas: string[];
  ward: string | null;
  severity: "low" | "medium" | "high" | "breaking";
  start_time: string | null;
  end_time: string | null;
  source: string;
  source_url: string | null;
  source_count: number;
  lat: number | null;
  lng: number | null;
  created_at: string;
  upvotes: number;
};

export type AlertsResponse = { items: Alert[]; total: number; hasMore: boolean };

export const getAlerts = createServerFn({ method: "GET" })
  .inputValidator(
    (d: {
      type?: string;
      category?: string;
      area?: string;
      limit?: number;
      offset?: number;
      sort?: "latest" | "upvotes" | "breaking";
    } | undefined) => d ?? {},
  )
  .handler(async ({ data }): Promise<AlertsResponse> => {
    const limit = Math.min(data.limit ?? 20, 100);
    const offset = data.offset ?? 0;
    let q = supabaseAdmin.from("alerts").select("*", { count: "exact" });
    if (data.type && data.type !== "all") q = q.eq("type", data.type);
    if (data.category && data.category !== "all") q = q.eq("category", data.category);
    if (data.area && data.area !== "all") q = q.contains("areas", [data.area]);
    if (data.sort === "upvotes") {
      q = q.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
    } else if (data.sort === "breaking") {
      q = q.in("severity", ["breaking", "high"]).order("created_at", { ascending: false });
    } else {
      q = q.order("created_at", { ascending: false });
    }
    q = q.range(offset, offset + limit - 1);
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);
    const items = (rows ?? []) as unknown as Alert[];
    return { items, total: count ?? items.length, hasMore: offset + items.length < (count ?? 0) };
  });

const SubscribeInput = z.object({
  phone: z.string().trim().regex(/^\+?[0-9 \-]{7,15}$/).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  areas: z.array(z.string().min(1).max(80)).min(1).max(50),
  alert_types: z.array(z.string().min(1).max(40)).min(1).max(20),
  channel: z.enum(["whatsapp", "email", "both"]),
  language: z.enum(["en", "ta"]),
});

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SubscribeInput.parse(d))
  .handler(async ({ data }) => {
    if (!data.phone && !data.email) {
      throw new Error("Provide a phone number or email.");
    }
    const { error } = await supabaseAdmin.from("subscriptions").insert({
      phone: data.phone || null,
      email: data.email || null,
      areas: data.areas,
      alert_types: data.alert_types,
      channel: data.channel,
      language: data.language,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// === News (read from DB; populated by /api/public/hooks/scrape) ===
export type NewsArticle = {
  id: string;
  title: string;
  title_en: string | null;
  summary: string;
  summary_en: string | null;
  lang: string;
  source: string;
  source_url: string | null;
  sources: string[];
  source_urls: string[];
  category: string;
  published_at: string | null;
  upvotes: number;
  created_at: string;
};

export const getNews = createServerFn({ method: "GET" })
  .inputValidator(
    (d: { sort?: "latest" | "upvotes"; limit?: number; offset?: number } | undefined) => d ?? {},
  )
  .handler(async ({ data }): Promise<NewsArticle[]> => {
    const limit = Math.min(data.limit ?? 40, 100);
    const offset = data.offset ?? 0;
    let q = supabaseAdmin.from("news_articles").select("*").eq("is_duplicate", false);
    if (data.sort === "upvotes") {
      q = q.order("upvotes", { ascending: false }).order("published_at", { ascending: false });
    } else {
      // Multi-source articles bubble up slightly (more confirmed)
      q = q.order("published_at", { ascending: false });
    }
    q = q.range(offset, offset + limit - 1);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const items = (rows ?? []) as unknown as NewsArticle[];
    // Boost multi-source items by a small amount when sorting by latest
    if (data.sort !== "upvotes") {
      items.sort((a, b) => {
        const sa = a.sources?.length ?? 1;
        const sb = b.sources?.length ?? 1;
        if (sa !== sb && (sa > 1 || sb > 1)) return sb - sa;
        return (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at);
      });
    }
    return items;
  });

// === Upvotes ===
const UpvoteInput = z.object({
  item_id: z.string().uuid(),
  item_type: z.enum(["alert", "news"]),
  fingerprint: z.string().min(8).max(200),
});

export const upvote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpvoteInput.parse(d))
  .handler(async ({ data }): Promise<{ already_voted: boolean; upvotes: number }> => {
    const table = data.item_type === "alert" ? "alerts" : "news_articles";
    // Try to insert into log; unique constraint blocks duplicates
    const { error: logErr } = await supabaseAdmin
      .from("upvote_log")
      .insert({ item_id: data.item_id, item_type: data.item_type, fingerprint: data.fingerprint });
    if (logErr) {
      // Duplicate vote — fetch current count
      const { data: row } = await supabaseAdmin.from(table).select("upvotes").eq("id", data.item_id).single();
      return { already_voted: true, upvotes: row?.upvotes ?? 0 };
    }
    // Increment count
    const { data: cur } = await supabaseAdmin.from(table).select("upvotes").eq("id", data.item_id).single();
    const next = (cur?.upvotes ?? 0) + 1;
    await supabaseAdmin.from(table).update({ upvotes: next }).eq("id", data.item_id);
    return { already_voted: false, upvotes: next };
  });
