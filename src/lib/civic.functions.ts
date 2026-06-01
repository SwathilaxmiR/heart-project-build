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
};

export const getAlerts = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string; area?: string; limit?: number } | undefined) => d ?? {})
  .handler(async ({ data }): Promise<Alert[]> => {
    let q = supabaseAdmin
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.category && data.category !== "all") q = q.eq("category", data.category);
    if (data.area) q = q.contains("areas", [data.area]);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as Alert[];
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

// Aggregated news from public Coimbatore RSS feeds — server-side fetch so CORS isn't an issue.
const FEEDS = [
  { name: "The Hindu Coimbatore", lang: "en", url: "https://www.thehindu.com/news/cities/coimbatore/feeder/default.rss" },
  { name: "Times of India Coimbatore", lang: "en", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128931755.cms" },
  { name: "New Indian Express TN", lang: "en", url: "https://www.newindianexpress.com/rss/india/tamilnadu.xml" },
];

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  lang: string;
  published: string | null;
  summary: string;
};

function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}
function pick(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return null;
  return stripTags(m[1].replace(/<!\[CDATA\[|\]\]>/g, ""));
}

export const getNews = createServerFn({ method: "GET" }).handler(async (): Promise<NewsItem[]> => {
  const all: NewsItem[] = [];
  await Promise.all(
    FEEDS.map(async (f) => {
      try {
        const res = await fetch(f.url, {
          headers: { "User-Agent": "CivicPulseCoimbatore/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const xml = await res.text();
        const items = xml.split(/<item[\s>]/i).slice(1, 16);
        for (const raw of items) {
          const chunk = "<item " + raw.split(/<\/item>/i)[0] + "</item>";
          const title = pick(chunk, "title") ?? "";
          if (!title) continue;
          const link = pick(chunk, "link") ?? "";
          const desc = pick(chunk, "description") ?? "";
          const pub = pick(chunk, "pubDate");
          // Coimbatore filter for the TN-wide feed
          if (f.url.includes("tamilnadu") && !/coimba|kovai|coimbatore/i.test(title + " " + desc)) continue;
          all.push({
            title,
            link,
            source: f.name,
            lang: f.lang,
            published: pub,
            summary: desc.slice(0, 240),
          });
        }
      } catch {
        /* feed failure is non-fatal */
      }
    }),
  );
  all.sort((a, b) => {
    const ad = a.published ? Date.parse(a.published) : 0;
    const bd = b.published ? Date.parse(b.published) : 0;
    return bd - ad;
  });
  return all.slice(0, 30);
});
