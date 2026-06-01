import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { subscribe } from "@/lib/civic.functions";
import { ALERT_TYPES, COIMBATORE_WARDS } from "@/lib/civic-data";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/subscribe")({
  head: () => ({
    meta: [
      { title: "Subscribe — CivicPulse Coimbatore" },
      { name: "description", content: "Get WhatsApp or email alerts for civic events in your Coimbatore ward — power cuts, water cuts, road works and more." },
    ],
  }),
  component: SubscribePage,
});

function SubscribePage() {
  const sub = useServerFn(subscribe);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "email" | "both">("whatsapp");
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [areas, setAreas] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (data: {
      phone: string; email: string; areas: string[];
      alert_types: string[]; channel: "whatsapp"|"email"|"both"; language: "en"|"ta";
    }) => sub({ data }),
    onSuccess: () => {
      toast.success("Subscribed! You'll get alerts as soon as they're verified.");
      setPhone(""); setEmail(""); setAreas([]); setTypes([]);
    },
    onError: (e: Error) => toast.error(e.message ?? "Something went wrong"),
  });

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone && !email) { toast.error("Add a WhatsApp number or email."); return; }
    if (areas.length === 0) { toast.error("Pick at least one ward."); return; }
    if (types.length === 0) { toast.error("Pick at least one alert type."); return; }
    mutation.mutate({ phone, email, areas, alert_types: types, channel, language });
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Toaster />
      <header className="mb-4">
        <h1 className="text-lg font-medium">Subscribe to alerts</h1>
        <p className="text-[12px] text-muted-foreground">
          Pick the wards and alert types you care about — we'll WhatsApp/email you the moment something happens.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-5">
        <section>
          <h2 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            1 · Where should we reach you?
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            <input
              type="tel"
              placeholder="WhatsApp number (+91…)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-[13px] px-3 py-2 border border-border rounded bg-card"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-[13px] px-3 py-2 border border-border rounded bg-card"
            />
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(["whatsapp", "email", "both"] as const).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setChannel(c)}
                className={`text-[12px] px-2.5 py-1 rounded border ${
                  channel === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                {c === "whatsapp" ? "WhatsApp" : c === "email" ? "Email" : "Both"}
              </button>
            ))}
            <span className="text-[12px] text-muted-foreground ml-auto self-center">Language:</span>
            {(["en", "ta"] as const).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLanguage(l)}
                className={`text-[12px] px-2.5 py-1 rounded border ${
                  language === l ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                {l === "en" ? "English" : "தமிழ்"}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            2 · Which wards?
          </h2>
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2 border border-border rounded bg-card">
            {COIMBATORE_WARDS.map((w) => {
              const on = areas.includes(w);
              return (
                <button
                  type="button"
                  key={w}
                  onClick={() => toggle(areas, w, setAreas)}
                  className={`text-[12px] px-2 py-0.5 rounded border ${
                    on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                  }`}
                >{w}</button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{areas.length} selected</p>
        </section>

        <section>
          <h2 className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            3 · What alerts?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {ALERT_TYPES.map((t) => {
              const on = types.includes(t.value);
              return (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => toggle(types, t.value, setTypes)}
                  className={`text-[12px] px-2.5 py-1.5 rounded border flex items-center gap-1.5 ${
                    on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  <span>{t.icon}</span>{t.label}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full sm:w-auto bg-primary text-primary-foreground text-[13px] font-medium px-5 py-2.5 rounded hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? "Subscribing…" : "Subscribe to alerts"}
        </button>
        <p className="text-[11px] text-muted-foreground">
          By subscribing you agree to receive civic alerts. No marketing. Unsubscribe anytime by replying STOP.
        </p>
      </form>
    </div>
  );
}