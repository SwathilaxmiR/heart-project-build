import type { Alert } from "@/lib/civic.functions";
import { useLang } from "./LanguageContext";

export function BreakingBanner({ alert }: { alert: Alert }) {
  const { lang } = useLang();
  const text = lang === "ta" && alert.title_ta ? alert.title_ta : alert.title;
  return (
    <div className="bg-primary-soft border border-primary/40 rounded-md px-3 py-2 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
      <span className="text-[11px] font-medium text-primary-strong uppercase tracking-wider">
        Breaking
      </span>
      <span className="text-[12px] text-primary-strong flex-1">{text}</span>
    </div>
  );
}