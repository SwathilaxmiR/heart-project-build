// Server-only scraping helpers.
// Parses RSS in plain string ops to avoid xml libs in the Worker bundle.

export type ScrapedItem = {
  title: string;
  summary: string;
  link: string;
  published_at: string | null;
  source: string;
  lang: "en" | "ta";
};

export const FEEDS: { name: string; lang: "en" | "ta"; url: string; coimbatoreFilter?: boolean }[] = [
  { name: "The Hindu Coimbatore", lang: "en", url: "https://www.thehindu.com/news/cities/coimbatore/feeder/default.rss" },
  { name: "Times of India Coimbatore", lang: "en", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128931755.cms" },
  { name: "New Indian Express TN", lang: "en", url: "https://www.newindianexpress.com/rss/india/tamilnadu.xml", coimbatoreFilter: true },
  { name: "Dinamalar", lang: "ta", url: "https://www.dinamalar.com/rss/coimbatore_news.xml" },
  { name: "Dinamani", lang: "ta", url: "https://www.dinamani.com/tamil-nadu/coimbatore/rss" },
  { name: "Daily Thanthi", lang: "ta", url: "https://www.dailythanthi.com/rss/coimbatore" },
  { name: "Maalai Malar", lang: "ta", url: "https://www.maalaimalar.com/rss/tamilnadu", coimbatoreFilter: true },
];

const KEYWORDS = [
  "coimbatore","kovai","கோவை","கோயம்புத்தூர்","ccmc","peelamedu","gandhipuram",
  "singanallur","rs puram","saibaba colony","ukkadam","podanur","tidel park",
  "psg","brookefields","fun republic","coimbatore airport",
];

function stripTags(s: string) {
  return s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}
function pick(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? stripTags(m[1]) : null;
}

function matchesCoimbatore(text: string) {
  const t = text.toLowerCase();
  return KEYWORDS.some((k) => t.includes(k.toLowerCase()));
}

export async function fetchFeed(feed: typeof FEEDS[number]): Promise<ScrapedItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "CivicPulseCoimbatore/1.0 (+https://civicpulse.lovable.app)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const chunks = xml.split(/<item[\s>]/i).slice(1, 30);
    const items: ScrapedItem[] = [];
    for (const raw of chunks) {
      const chunk = "<item " + raw.split(/<\/item>/i)[0] + "</item>";
      const title = pick(chunk, "title");
      if (!title) continue;
      const desc = pick(chunk, "description") ?? "";
      const link = pick(chunk, "link") ?? "";
      const pub = pick(chunk, "pubDate");
      if (feed.coimbatoreFilter && !matchesCoimbatore(title + " " + desc)) continue;
      items.push({
        title,
        summary: desc.slice(0, 400),
        link,
        published_at: pub ? new Date(pub).toISOString() : null,
        source: feed.name,
        lang: feed.lang,
      });
    }
    return items;
  } catch {
    return [];
  }
}

// Thandoraa HTML scrape — lightweight regex pull of <article> blocks.
export async function fetchThandoraa(): Promise<ScrapedItem[]> {
  try {
    const res = await fetch("https://www.thandoraa.com/", {
      headers: { "User-Agent": "CivicPulseCoimbatore/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const articles = html.split(/<article[\s>]/i).slice(1, 20);
    const items: ScrapedItem[] = [];
    for (const raw of articles) {
      const chunk = "<article " + raw.split(/<\/article>/i)[0] + "</article>";
      // h2/h3 title + first <a href>
      const titleM = chunk.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
      const linkM = chunk.match(/<a[^>]+href=["']([^"']+)["']/i);
      const pM = chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const title = titleM ? stripTags(titleM[1]) : null;
      if (!title) continue;
      items.push({
        title,
        summary: pM ? stripTags(pM[1]).slice(0, 400) : "",
        link: linkM ? new URL(linkM[1], "https://www.thandoraa.com/").toString() : "https://www.thandoraa.com/",
        published_at: null,
        source: "Thandoraa",
        lang: "en",
      });
    }
    return items;
  } catch {
    return [];
  }
}

// --- Dedup helpers ---
const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","in","on","at","to","for","with","by","from","is","was","were","be","been","being","this","that","these","those","it","its","as","into","over","up","down","out","new","says","said","after","before","over","also",
]);

export function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join(" ")
    .trim();
}

function tokens(t: string): Set<string> {
  return new Set(normalizeTitle(t).split(" ").filter(Boolean));
}

export function jaccard(a: string, b: string): number {
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return inter / union;
}

// --- Keyword classification (cheap, deterministic) ---
// Maps an item to { category, alert_type, severity, areas }. Returns null when
// it's general news that should not be promoted to an alert.
const TYPE_RULES: { type: string; cat: string; words: string[] }[] = [
  { type: "power_cut", cat: "civic",   words: ["power cut", "power outage", "shutdown", "load shedding", "tangedco", "மின் தடை", "மின்வெட்டு", "மின்தடை"] },
  { type: "water_cut", cat: "civic",   words: ["water cut", "water supply", "pipeline", "no water", "குடிநீர் தடை", "தண்ணீர் தடை"] },
  { type: "road_work", cat: "traffic", words: ["road work", "pothole", "road closure", "diversion", "flyover", "சாலை பழுது", "சாலை மூடல்"] },
  { type: "flooding",  cat: "civic",   words: ["flood", "waterlogging", "inundation", "வெள்ளம்", "தண்ணீர் தேங்கல்"] },
  { type: "traffic",   cat: "traffic", words: ["traffic jam", "congestion", "accident", "blocked", "போக்குவரத்து", "விபத்து"] },
  { type: "weather",   cat: "weather", words: ["rain", "thunderstorm", "cyclone", "heatwave", "imd", "மழை", "புயல்", "வெப்ப அலை"] },
  { type: "crime",     cat: "crime",   words: ["arrested", "murder", "robbery", "theft", "police", "fraud", "கைது", "கொலை", "திருட்டு", "மோசடி"] },
  { type: "health",    cat: "health",  words: ["dengue", "covid", "outbreak", "hospital", "fever", "டெங்கு", "காய்ச்சல்"] },
  { type: "civic",     cat: "civic",   words: ["ccmc", "corporation", "mayor", "ward", "mla", "மாநகராட்சி", "வார்டு"] },
  { type: "other",     cat: "politics",words: ["election", "dmk", "aiadmk", "bjp", "minister", "தேர்தல்", "அமைச்சர்"] },
];

const WARD_KEYWORDS = [
  "RS Puram","Peelamedu","Singanallur","Gandhipuram","Saibaba Colony","Ramanathapuram",
  "Ukkadam","Podanur","Ganapathy","Vadavalli","Ondipudur","Brookefields","Saravanampatti",
  "Trichy Road","Avinashi Road","Hopes College","Selvapuram","Kuniyamuthur","Lanka Corner",
];

export type Classified = {
  category: string;
  alert_type: string | null;     // null => not an alert, news only
  severity: "low" | "medium" | "high" | "breaking";
  areas: string[];
};

export function classify(textEn: string, textOrig: string): Classified {
  const blob = (textEn + " " + textOrig).toLowerCase();
  let matched: typeof TYPE_RULES[number] | null = null;
  for (const rule of TYPE_RULES) {
    if (rule.words.some((w) => blob.includes(w.toLowerCase()))) { matched = rule; break; }
  }
  const areas = WARD_KEYWORDS.filter((w) => blob.includes(w.toLowerCase()));
  let severity: Classified["severity"] = "low";
  if (/breaking|urgent|emergency|red alert|severe/.test(blob)) severity = "breaking";
  else if (/heavy|major|widespread|warning/.test(blob)) severity = "high";
  else if (matched) severity = "medium";
  return {
    category: matched?.cat ?? "general",
    alert_type: matched && matched.type !== "other" ? matched.type : null,
    severity,
    areas,
  };
}

// --- Translation via Lovable AI (Gemini) ---
export async function translateBatch(texts: string[]): Promise<string[]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key || texts.length === 0) return texts;
  try {
    const prompt =
      "Translate the following Tamil news snippets to natural English. Return ONLY a JSON array of strings in the same order. Snippets:\n" +
      JSON.stringify(texts);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a precise translator. Respond with ONLY a JSON array, no prose." },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return texts;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    const m = content.match(/\[[\s\S]*\]/);
    if (!m) return texts;
    const parsed = JSON.parse(m[0]) as string[];
    if (!Array.isArray(parsed) || parsed.length !== texts.length) return texts;
    return parsed;
  } catch {
    return texts;
  }
}