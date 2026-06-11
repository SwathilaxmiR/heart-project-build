export const COIMBATORE_WARDS = [
  "RS Puram","Peelamedu","Singanallur","Gandhipuram","Saibaba Colony","Ramanathapuram",
  "Ukkadam","Podanur","Rathinapuri","Selvapuram","Kavundampalayam","Thudiyalur",
  "Kuniyamuthur","Kovaipudur","Ganapathy","Vadavalli","Ondipudur","Hopes College",
  "Pappanaickenpalayam","Race Course","Vilankurichi","Avinashi Road","Brookefields",
  "Lanka Corner","Saravanampatti","Trichy Road","Noyyal belt","SNR Stadium",
  "All wards","All Wards",
];

export const ALERT_TYPES = [
  { value: "power_cut", label: "Power cuts", icon: "⚡" },
  { value: "water_cut", label: "Water cuts", icon: "💧" },
  { value: "road_work", label: "Road works", icon: "🚧" },
  { value: "flooding", label: "Flooding", icon: "🌊" },
  { value: "traffic", label: "Traffic", icon: "🚦" },
  { value: "weather", label: "Weather", icon: "🌧️" },
  { value: "crime", label: "Crime / Safety", icon: "🛡️" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "civic", label: "Civic notices", icon: "🏛️" },
];

export const CATEGORIES: { value: string; label: string; ta: string; icon: string; key: string }[] = [
  { value: "all", label: "All news", ta: "அனைத்தும்", icon: "▤", key: "cat_all" },
  { value: "civic", label: "Civic", ta: "உள்ளாட்சி", icon: "⚡", key: "cat_civic" },
  { value: "politics", label: "Politics", ta: "அரசியல்", icon: "🏛", key: "cat_politics" },
  { value: "crime", label: "Crime", ta: "குற்றம்", icon: "🛡", key: "cat_crime" },
  { value: "traffic", label: "Traffic", ta: "போக்குவரத்து", icon: "🚧", key: "cat_traffic" },
  { value: "business", label: "Business", ta: "வணிகம்", icon: "💼", key: "cat_business" },
  { value: "weather", label: "Weather", ta: "வானிலை", icon: "🌧", key: "cat_weather" },
  { value: "health", label: "Health", ta: "சுகாதாரம்", icon: "🏥", key: "cat_health" },
  { value: "sports", label: "Sports", ta: "விளையாட்டு", icon: "🏏", key: "cat_sports" },
];

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function categoryClass(cat: string): string {
  const map: Record<string, string> = {
    civic: "bg-cat-civic-bg text-cat-civic-fg",
    politics: "bg-cat-politics-bg text-cat-politics-fg",
    crime: "bg-cat-crime-bg text-cat-crime-fg",
    weather: "bg-cat-weather-bg text-cat-weather-fg",
    traffic: "bg-cat-traffic-bg text-cat-traffic-fg",
    business: "bg-cat-business-bg text-cat-business-fg",
    health: "bg-cat-health-bg text-cat-health-fg",
    sports: "bg-cat-sports-bg text-cat-sports-fg",
  };
  return map[cat] ?? "bg-muted text-muted-foreground";
}