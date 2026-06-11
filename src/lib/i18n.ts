// Lightweight i18n dictionary used across the app
export const DICT = {
  // Nav / shell
  alerts: { en: "Alerts", ta: "எச்சரிக்கைகள்" },
  news_feed: { en: "KovaiToday", ta: "கோவை இன்று" },
  map: { en: "Map", ta: "வரைபடம்" },
  my_ward: { en: "My Ward", ta: "என் வார்டு" },
  subscribe: { en: "Subscribe", ta: "சந்தா" },
  sign_in: { en: "Sign in", ta: "உள்நுழைக" },
  sign_out: { en: "Sign out", ta: "வெளியேறு" },
  sign_up: { en: "Sign up", ta: "பதிவு செய்க" },
  updated_ago: { en: "Updated 4 min ago", ta: "4 நிமிடம் முன்பு புதுப்பிக்கப்பட்டது" },
  footer: {
    en: "KovaiToday · Aggregating CCMC, TANGEDCO, news & community sources",
    ta: "கோவை இன்று · CCMC, TANGEDCO, செய்தி மற்றும் சமூக ஆதாரங்களின் தொகுப்பு",
  },

  // Filters
  type: { en: "Type", ta: "வகை" },
  area: { en: "Area", ta: "பகுதி" },
  sort: { en: "Sort", ta: "வரிசை" },
  all_types: { en: "All types", ta: "அனைத்து வகைகள்" },
  all_areas: { en: "All areas", ta: "அனைத்து பகுதிகள்" },
  latest_first: { en: "Latest first", ta: "புதியது முதலில்" },
  most_upvoted: { en: "Most upvoted", ta: "அதிக வாக்குகள்" },
  breaking_high: { en: "Breaking / high", ta: "முக்கியம் / உயர்" },
  showing: { en: "Showing", ta: "காட்டுகிறது" },
  of: { en: "of", ta: "/" },
  refreshing: { en: "Refreshing…", ta: "புதுப்பிக்கிறது…" },
  load_more: { en: "Load more", ta: "மேலும் ஏற்று" },
  loading: { en: "Loading…", ta: "ஏற்றுகிறது…" },
  no_alerts: { en: "No alerts for this area right now.", ta: "இந்த பகுதிக்கு தற்போது எச்சரிக்கைகள் இல்லை." },
  no_news: {
    en: "No fresh stories yet. The scraper runs every 15 minutes — check back shortly.",
    ta: "புதிய செய்திகள் இல்லை. 15 நிமிடங்களுக்கு ஒருமுறை புதுப்பிக்கப்படும்.",
  },
  retry: { en: "Retry", ta: "மீண்டும் முயற்சி" },
  cant_load_alerts: { en: "Couldn't load alerts.", ta: "எச்சரிக்கைகளை ஏற்ற முடியவில்லை." },
  cant_load_news: { en: "Couldn't load news.", ta: "செய்திகளை ஏற்ற முடியவில்லை." },

  // Sidebar
  weather: { en: "Coimbatore weather", ta: "கோவை வானிலை" },
  trending: { en: "Trending in Kovai", ta: "கோவையில் டிரெண்டிங்" },
  sources_active: { en: "Sources active now", ta: "செயலில் உள்ள ஆதாரங்கள்" },

  // News page
  news_subtitle: {
    en: "Deduplicated Coimbatore news · updated every 15 min",
    ta: "கோவை செய்திகள் · 15 நிமிடம் ஒருமுறை புதுப்பிப்பு",
  },
  also_reported: { en: "Also reported by", ta: "மேலும் செய்தி" },

  // Categories
  cat_all: { en: "All news", ta: "அனைத்தும்" },
  cat_civic: { en: "Civic", ta: "உள்ளாட்சி" },
  cat_politics: { en: "Politics", ta: "அரசியல்" },
  cat_crime: { en: "Crime", ta: "குற்றம்" },
  cat_traffic: { en: "Traffic", ta: "போக்குவரத்து" },
  cat_business: { en: "Business", ta: "வணிகம்" },
  cat_weather: { en: "Weather", ta: "வானிலை" },
  cat_health: { en: "Health", ta: "சுகாதாரம்" },
  cat_sports: { en: "Sports", ta: "விளையாட்டு" },

  // Auth / Landing
  landing_tag: { en: "Hyperlocal pulse of Coimbatore", ta: "கோவையின் உள்ளூர் துடிப்பு" },
  landing_hero: {
    en: "Power cuts, water cuts, traffic & news — before they reach you.",
    ta: "மின்தடை, தண்ணீர் தடை, போக்குவரத்து & செய்தி — உங்களை அடைவதற்கு முன்பே.",
  },
  get_started: { en: "Get started", ta: "தொடங்குக" },
  continue_with_google: { en: "Continue with Google", ta: "Google உடன் தொடரவும்" },
  email: { en: "Email", ta: "மின்னஞ்சல்" },
  password: { en: "Password", ta: "கடவுச்சொல்" },
  or: { en: "or", ta: "அல்லது" },
  already_have: { en: "Already have an account?", ta: "ஏற்கனவே கணக்கு உள்ளதா?" },
  need_account: { en: "Need an account?", ta: "புதிய கணக்கு தேவையா?" },
} as const;

export type DictKey = keyof typeof DICT;
export function tr(key: DictKey, lang: "en" | "ta"): string {
  return DICT[key][lang];
}