
-- 1. Upvotes column on alerts
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS upvotes integer NOT NULL DEFAULT 0;

-- 2. News articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  summary text NOT NULL DEFAULT '',
  summary_en text,
  lang text NOT NULL DEFAULT 'en',
  source text NOT NULL,
  source_url text,
  sources text[] NOT NULL DEFAULT '{}',
  source_urls text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'general',
  published_at timestamptz,
  upvotes integer NOT NULL DEFAULT 0,
  normalized_title text,
  embedding jsonb,
  is_duplicate boolean NOT NULL DEFAULT false,
  duplicate_of uuid REFERENCES public.news_articles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_articles TO anon, authenticated;
GRANT ALL ON public.news_articles TO service_role;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News publicly readable" ON public.news_articles FOR SELECT TO anon, authenticated USING (true);

-- 3. Upvote log
CREATE TABLE IF NOT EXISTS public.upvote_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('alert','news')),
  fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, item_type, fingerprint)
);
GRANT ALL ON public.upvote_log TO service_role;
ALTER TABLE public.upvote_log ENABLE ROW LEVEL SECURITY;
-- no public policies; only service_role (admin client) writes

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_upvotes ON public.alerts(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_upvotes ON public.news_articles(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_news_dup ON public.news_articles(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_news_norm_title ON public.news_articles(normalized_title);
