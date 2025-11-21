import type { Post } from "../types";

// If you also want this for posts, keep it here.
// Advent doesn’t need `published`, but posts do.
export function coercePublished(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return !(s === "false" || s === "0" || s === "no" || s === "off");
  }
  return Boolean(v);
}

export function parseFrontMatter(raw: string): {
  data: Record<string, any>;
  content: string;
} {
  const fmMatch = raw.match(
    /^---\s*[\r\n]+([\s\S]*?)\n---\s*[\r\n]+([\s\S]*)$/m
  );
  if (!fmMatch) return { data: {}, content: raw };
  const yaml = fmMatch[1];
  const content = fmMatch[2];
  const data: Record<string, any> = {};
  yaml.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!m) return;
    const key = m[1];
    let val: any = m[2].trim();
    if (/^\[.*\]$/.test(val)) {
      val = (val as string)
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map((s) =>
          (s as string).trim().replace(/^['"]|['"]$/g, "")
        )
        .filter(Boolean);
    } else if (/^(true|false)$/i.test(val)) {
      val = /^true$/i.test(val);
    } else if (/^['"].*['"]$/.test(val)) {
      val = (val as string).replace(/^['"]|['"]$/g, "");
    }
    (data as any)[key] = val;
  });
  return { data, content };
}

export async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.text();
  } catch {
    return null;
  }
}

export async function fetchJSON<T = any>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
