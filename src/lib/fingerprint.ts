// Stable per-browser fingerprint stored in localStorage. Cheap; not anti-fraud.
export function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "cp_fp";
  let fp = localStorage.getItem(KEY);
  if (fp) return fp;
  const seed = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    crypto.randomUUID(),
  ].join("|");
  // simple hash
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  fp = "fp_" + Math.abs(h).toString(36) + "_" + crypto.randomUUID().slice(0, 8);
  localStorage.setItem(KEY, fp);
  return fp;
}

export function hasVoted(itemId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cp_voted_" + itemId) === "1";
}

export function markVoted(itemId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cp_voted_" + itemId, "1");
}