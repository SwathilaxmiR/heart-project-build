import { useQuery } from "@tanstack/react-query";
import { Sun, CloudRain, Cloud, CloudSun, CloudSnow, CloudLightning, CloudFog } from "lucide-react";

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
function describe(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "—";
}

export function Weather() {
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
        Loading weather…
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
      <div className="text-[11px] text-muted-foreground">{describe(data.current.weather_code)}</div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
        <span>H: {high}°</span>
        <span>L: {low}°</span>
        <span>{data.current.relative_humidity_2m}%</span>
      </div>
      {pop >= 40 && (
        <div className="flex items-center justify-center gap-1 text-[11px] text-cat-weather-fg mt-2">
          <CloudRain className="w-3 h-3" /> Rain likely ({pop}%)
        </div>
      )}
    </div>
  );
}