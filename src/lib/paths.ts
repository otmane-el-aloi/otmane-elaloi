export function getBase(): string {
  try {
    const base = (import.meta as any)?.env?.BASE_URL as string | undefined;
    if (typeof base === "string" && base.length) return base;
  } catch {}
  if (typeof window !== "undefined" && typeof window.__BASE__ === "string") return window.__BASE__!;
  return "/";
}

export function toAssetUrl(p?: string): string {
  if (!p) return "";
  if (/^(?:https?:)?\/\//i.test(p)) return p;
  const rel = p.startsWith("/") ? p.slice(1) : p;
  return getBase() + rel;
}
