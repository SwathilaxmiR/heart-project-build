import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  FEEDS,
  fetchFeed,
  fetchThandoraa,
  normalizeTitle,
  jaccard,
  translateBatch,
  classify,
  type ScrapedItem,
} from "@/lib/scrape.server";

export const Route = createFileRoute("/api/public/hooks/scrape")({
  server: {
    handlers: {
      GET: async () => handleScrape(),
      POST: async () => handleScrape(),
    },
  },
});

async function handleScrape() {
  const t0 = Date.now();
  // 1. Fetch all sources in parallel
  const results = await Promise.all([
    ...FEEDS.map((f) => fetchFeed(f)),
    fetchThandoraa(),
  ]);
  const all: ScrapedItem[] = results.flat();

  // 2. Translate Tamil items (batched per source)
  const taItems = all.filter((i) => i.lang === "ta");
  if (taItems.length > 0) {
    const titlesEn = await translateBatch(taItems.map((i) => i.title));
    const summariesEn = await translateBatch(taItems.map((i) => i.summary || ""));
    taItems.forEach((it, i) => {
      (it as ScrapedItem & { title_en?: string; summary_en?: string }).title_en = titlesEn[i];
      (it as ScrapedItem & { title_en?: string; summary_en?: string }).summary_en = summariesEn[i];
    });
  }

  // 3. Fetch recent articles (last 48h) to dedupe against
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data: existing } = await supabaseAdmin
    .from("news_articles")
    .select("id, title, title_en, normalized_title, sources, source_urls, source, published_at, created_at")
    .gte("created_at", since)
    .eq("is_duplicate", false);
  const existingArr = (existing ?? []) as Array<{
    id: string;
    title: string;
    title_en: string | null;
    normalized_title: string | null;
    sources: string[];
    source_urls: string[];
    source: string;
    published_at: string | null;
    created_at: string;
  }>;

  let inserted = 0;
  let merged = 0;
  let skipped = 0;
  let alertsInserted = 0;

  for (const it of all) {
    const enrich = it as ScrapedItem & { title_en?: string; summary_en?: string };
    const titleEn = enrich.title_en ?? (it.lang === "en" ? it.title : null);
    const summaryEn = enrich.summary_en ?? (it.lang === "en" ? it.summary : null);
    const norm = normalizeTitle(titleEn ?? it.title);
    if (norm.length < 5) {
      skipped++;
      continue;
    }
    // Step 1: exact normalized-title match
    let dup = existingArr.find((e) => e.normalized_title === norm);
    // Step 2: fuzzy Jaccard
    if (!dup) {
      for (const e of existingArr) {
        const eText = e.title_en ?? e.title;
        if (jaccard(titleEn ?? it.title, eText) >= 0.7) {
          dup = e;
          break;
        }
      }
    }
    if (dup) {
      // Merge source into primary if not already present
      if (!dup.sources.includes(it.source)) {
        const sources = [...dup.sources, it.source];
        const source_urls = [...dup.source_urls, it.link];
        await supabaseAdmin
          .from("news_articles")
          .update({ sources, source_urls })
          .eq("id", dup.id);
        dup.sources = sources;
        dup.source_urls = source_urls;
        merged++;
      } else {
        skipped++;
      }
      continue;
    }
    // New article
    const cls = classify(titleEn ?? it.title, it.title + " " + (it.summary ?? ""));
    const { data: ins, error } = await supabaseAdmin
      .from("news_articles")
      .insert({
        title: it.title,
        title_en: titleEn,
        summary: it.summary,
        summary_en: summaryEn,
        lang: it.lang,
        source: it.source,
        source_url: it.link,
        sources: [it.source],
        source_urls: [it.link],
        category: cls.category,
        published_at: it.published_at,
        normalized_title: norm,
        is_duplicate: false,
      })
      .select("id, title, title_en, normalized_title, sources, source_urls, source, published_at, created_at")
      .single();
    if (!error && ins) {
      inserted++;
      existingArr.push(ins as typeof existingArr[number]);

      // Promote to alerts when it's actionable
      if (cls.alert_type) {
        // Dedupe against existing alerts by normalized title
        const { data: dupAlert } = await supabaseAdmin
          .from("alerts")
          .select("id")
          .ilike("title", (titleEn ?? it.title).slice(0, 60) + "%")
          .limit(1)
          .maybeSingle();
        if (!dupAlert) {
          const { error: aErr } = await supabaseAdmin.from("alerts").insert({
            type: cls.alert_type,
            category: cls.category,
            title: titleEn ?? it.title,
            title_ta: it.lang === "ta" ? it.title : null,
            summary: summaryEn ?? it.summary ?? "",
            summary_ta: it.lang === "ta" ? (it.summary ?? null) : null,
            areas: cls.areas.length ? cls.areas : ["All wards"],
            severity: cls.severity,
            source: it.source,
            source_url: it.link,
            source_count: 1,
            verified: false,
          });
          if (!aErr) alertsInserted++;
        }
      }
    }
  }

  return Response.json({
    ok: true,
    elapsed_ms: Date.now() - t0,
    fetched: all.length,
    inserted,
    alerts_inserted: alertsInserted,
    merged,
    skipped,
  });
}