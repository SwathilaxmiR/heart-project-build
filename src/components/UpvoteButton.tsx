import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { upvote } from "@/lib/civic.functions";
import { getFingerprint, hasVoted, markVoted } from "@/lib/fingerprint";

export function UpvoteButton({
  itemId,
  itemType,
  count,
}: {
  itemId: string;
  itemType: "alert" | "news";
  count: number;
}) {
  const upvoteFn = useServerFn(upvote);
  const [voted, setVoted] = useState(false);
  const [n, setN] = useState(count);
  const [pulse, setPulse] = useState(false);

  useEffect(() => setVoted(hasVoted(itemId)), [itemId]);
  useEffect(() => setN(count), [count]);

  async function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (voted) return;
    const prev = n;
    setVoted(true);
    setN(prev + 1);
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
    try {
      const res = await upvoteFn({
        data: { item_id: itemId, item_type: itemType, fingerprint: getFingerprint() },
      });
      setN(res.upvotes);
      if (!res.already_voted || res.upvotes > prev) markVoted(itemId);
    } catch {
      setN(prev);
      setVoted(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={voted}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border transition-colors ${
        voted
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-secondary text-muted-foreground border-transparent hover:border-foreground/20"
      }`}
      aria-label="Upvote"
    >
      <ThumbsUp className={`w-3 h-3 ${voted ? "fill-current" : ""}`} />
      <span className={pulse ? "animate-pulse" : ""}>{n}</span>
    </button>
  );
}