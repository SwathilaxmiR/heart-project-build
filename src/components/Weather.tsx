import { useQuery } from "@tanstack/react-query";
import { Sun, CloudRain, Cloud, CloudSun, CloudSnow, CloudLightning, CloudFog } from "lucide-react";
import { useLang } from "./LanguageContext";

type WeatherData = {
  current: { temperature_2m: number; relative_humidity_2m: number; weather_code: number };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };
};

function iconFor(code: number) {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code >= 45 && code <= 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 95) return CloudLightning;
  return Cloud;
}
function describe(code: number, lang: "en" | "ta"): string {
  const en = (
    code === 0 ? "Clear sky" :
    code <= 2 ? "Partly cloudy" :
    code === 3 ? "Overcast" :
    code <= 48 ? "Foggy" :
    code <= 57 ? "Drizzle" :
    code <= 67 ? "Rain" :
    code <= 77 ? "Snow" :
    code <= 82 ? "Rain showers" :
    code >= 95 ? "Thunderstorm" : "—"
  );
  if (lang === "en") return en;
  const map: Record<string, string> = {
    "Clear sky": "தெளிவான வானம்",
    "Partly cloudy": "ஓரளவு மேகமூட்டம்",
    "Overcast": "முழு மேகமூட்டம்",
    "Foggy": "மூடுபனி",
    "Drizzle": "தூறல்",
    "Rain": "மழை",
    "Snow": "பனி",
    "Rain showers": "மழைப்பொழிவு",
    "Thunderstorm": "இடிமழை",
  };
  return map[en] ?? en;
}

export function Weather() {
  const { lang, t } = useLang();
  const { data, isLoading } = useQuery<WeatherData>({
    queryKey: ["weather-coimbatore"],
    queryFn: async () => {
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=11.0168&longitude=76.9558" +
        "&current=temperature_2m,relative_humidity_2m,weather_code" +
        "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
        "&timezone=Asia%2FKolkata&forecast_days=2";
      const res = await fetch(url);
      if (!res.ok) throw new Error("weather failed");
      return res.json();
    },
    staleTime: 15 * 60_000,
    refetchInterval: 15 * 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="bg-secondary rounded-md p-2.5 text-center text-[11px] text-muted-foreground">
        {t("loading")}
      </div>
    );
  }
  const Icon = iconFor(data.current.weather_code);
  const high = Math.round(data.daily.temperature_2m_max[0]);
  const low = Math.round(data.daily.temperature_2m_min[0]);
  const pop = data.daily.precipitation_probability_max?.[0] ?? 0;
  return (
    <div className="bg-secondary rounded-md p-2.5 text-center">
      <Icon className="w-5 h-5 mx-auto text-warn mb-1" />
      <div className="text-[22px] font-medium">{Math.round(data.current.temperature_2m)}°C</div>
      <div className="text-[11px] text-muted-foreground">{describe(data.current.weather_code, lang)}</div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
        <span>H: {high}°</span>
        <span>L: {low}°</span>
        <span>{data.current.relative_humidity_2m}%</span>
      </div>
      {pop >= 40 && (
        <div className="flex items-center justify-center gap-1 text-[11px] text-cat-weather-fg mt-2">
          <CloudRain className="w-3 h-3" /> {lang === "ta" ? `மழை வாய்ப்பு (${pop}%)` : `Rain likely (${pop}%)`}
        </div>
      )}
    </div>
  );
}