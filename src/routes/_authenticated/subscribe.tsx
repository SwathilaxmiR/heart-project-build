import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribe } from "@/lib/civic.functions";
import { ALERT_TYPES, COIMBATORE_WARDS } from "@/lib/civic-data";
import { useLang } from "@/components/LanguageContext";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/subscribe")({
  head: () => ({ meta: [{ title: "Subscribe — KovaiToday" }] }),
  component: SubscribePage,
});

function SubscribePage() {
  const call = useServerFn(subscribe);
  const { t, lang } = useLang();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [areas, setAreas] = useState<string[]>(["All wards"]);
  const [types, setTypes] = useState<string[]>(ALERT_TYPES.map((t) => t.value));
  const [channel, setChannel] = useState<"whatsapp" | "email" | "both">("whatsapp");
  const [saving, setSaving] = useState(false);

  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await call({ data: { phone, email, areas, alert_types: types, channel, language: lang } });
      toast.success("Subscribed!");
      setPhone(""); setEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-lg font-medium">{t("subscribe")}</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-[13px] space-y-1">
          <span className="text-muted-foreground">WhatsApp / phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-2 py-1.5 border border-border rounded bg-card" />
        </label>
        <label className="text-[13px] space-y-1">
          <span className="text-muted-foreground">{t("email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-2 py-1.5 border border-border rounded bg-card" />
        </label>
      </div>
      <fieldset>
        <legend className="text-[12px] text-muted-foreground mb-1">{t("area")}</legend>
        <div className="flex flex-wrap gap-1.5">
          {COIMBATORE_WARDS.slice(0, 20).map((w) => (
            <button type="button" key={w} onClick={() => setAreas((a) => toggle(a, w))} className={`text-[11px] px-2 py-1 rounded border ${areas.includes(w) ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground"}`}>{w}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-[12px] text-muted-foreground mb-1">{t("type")}</legend>
        <div className="flex flex-wrap gap-1.5">
          {ALERT_TYPES.map((tp) => (
            <button type="button" key={tp.value} onClick={() => setTypes((a) => toggle(a, tp.value))} className={`text-[11px] px-2 py-1 rounded border ${types.includes(tp.value) ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground"}`}>{tp.icon} {tp.label}</button>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-3 text-[13px]">
        <span className="text-muted-foreground">Channel:</span>
        {(["whatsapp","email","both"] as const).map((c) => (
          <label key={c} className="flex items-center gap-1">
            <input type="radio" name="ch" checked={channel === c} onChange={() => setChannel(c)} /> {c}
          </label>
        ))}
      </div>
      <button disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] disabled:opacity-60">
        {saving ? t("loading") : t("subscribe")}
      </button>
    </form>
  );
}