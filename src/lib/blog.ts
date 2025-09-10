import type { Post } from "../types";
import { toAssetUrl } from "./paths";

function coercePublished(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return !(s === "false" || s === "0" || s === "no" || s === "off");
  }
  return Boolean(v);
}

function parseFrontMatter(raw: string): { data: Record<string, any>; content: string } {
  const fmMatch = raw.match(/^---\s*[\r\n]+([\s\S]*?)\n---\s*[\r\n]+([\s\S]*)$/m);
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
        .map((s) => (s as string).trim().replace(/^['"]|['"]$/g, ""))
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

function normalizePost(p: Partial<Post>): Post {
  const slug =
    p.slug ||
    (p.title
      ? p.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
      : crypto.randomUUID());

  return {
    id: p.id || slug || crypto.randomUUID(),
    title: p.title || slug || "Untitled",
    slug,
    tags: Array.isArray(p.tags) ? p.tags : [],
    dateISO: (p as any).date || p.dateISO || new Date().toISOString(),
    published: coercePublished(p.published),
    content: p.content || "",
  };
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.text();
  } catch { return null; }
}
async function fetchJSON<T = any>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return (await res.json()) as T;
  } catch { return null; }
}

export async function loadPosts(): Promise<Post[]> {
  if (Array.isArray(window.__POSTS__)) {
    return window.__POSTS__
      .map(normalizePost)
      .filter((p) => p.published)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }

  const manifest = await fetchJSON<any[]>(toAssetUrl("posts/index.json"));
  if (Array.isArray(manifest) && manifest.length) {
    const out: Post[] = [];
    for (const item of manifest) {
      if (item.content) {
        out.push(normalizePost(item));
      } else if (item.path) {
        const raw = await fetchText(toAssetUrl(item.path));
        if (raw) {
          const { data, content } = parseFrontMatter(raw);
          out.push(normalizePost({ ...data, content }));
        }
      }
    }
    return out
      .filter((p) => p.published)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }

  // fallback
  return [
    normalizePost({
      title: "Hello, World (Sample Post)",
      slug: "hello-world",
      tags: ["Demo"],
      content: `# Welcome!\n\nAdd Markdown files under **/posts** and an optional **/posts/index.json** manifest.\n\nImages: place files in **/images/posts/hello-world/** and reference as:\n\n![Sample](/images/posts/hello-world/sample.png)`,
      published: true,
      dateISO: "1970-01-01",
    }),
  ];
}

export const sortByDateDesc = (posts: Post[]) =>
  [...posts].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

export function pickFeaturedPost(posts: Post[]): Post | null {
  if (!posts?.length) return null;
  const flagged = posts.find((p) => p.published !== false);
  if (flagged) return flagged;
  const tagged = posts.find(
    (p) => p.published !== false && (p.tags || []).some((t) => t.toLowerCase() === "featured")
  );
  const publishedSorted = [...posts]
    .filter((p) => p.published !== false)
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  return tagged || publishedSorted[0] || null;
}


let __mermaidInit: Promise<typeof import("mermaid")> | null = null;

async function ensureMermaid() {
  if (!__mermaidInit) {
    __mermaidInit = import("mermaid").then((m) => {
      const dark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      m.default.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: dark ? "dark" : "default",
      });
      // auto-switch on system theme change
      try {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener?.("change", () =>
          m.default.initialize({ startOnLoad: false, theme: mq.matches ? "dark" : "default" })
        );
      } catch {}
      return m;
    });
  }
  return __mermaidInit;
}

/** Convert ```mermaid code blocks into <div class="mermaid"> placeholders */
function upgradeMermaidBlocks(root: ParentNode): HTMLElement[] {
  const codeBlocks = Array.from(
    root.querySelectorAll<HTMLElement>(
      'pre > code.language-mermaid, pre > code[class*="language-mermaid"], code.mermaid'
    )
  );
  const out: HTMLElement[] = [];
  for (const code of codeBlocks) {
    const pre = code.parentElement?.tagName.toLowerCase() === "pre" ? code.parentElement! : code;
    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = code.textContent ?? "";
    pre.replaceWith(div);
    out.push(div);
  }
  // also include any existing <div class="mermaid">
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("div.mermaid"))) {
    if (!out.includes(el)) out.push(el);
  }
  return out;
}

/** Render Mermaid diagrams inside the given container AFTER markdown is mounted */
export async function renderMermaid(container: HTMLElement | null) {
  if (!container) return;
  const targets = upgradeMermaidBlocks(container);
  if (!targets.length) return;

  const mermaid = await ensureMermaid();

  await Promise.all(
    targets.map(async (el, i) => {
      try {
        const id = `mmd-${Date.now().toString(36)}-${i}`;
        const src = el.textContent || "";
        const { svg } = await mermaid.default.render(id, src);
        el.innerHTML = svg;
      } catch {
        // fall back to showing the text as a <pre>
        const pre = document.createElement("pre");
        pre.textContent = (el.textContent || "").trim();
        el.replaceWith(pre);
      }
    })
  );
}
