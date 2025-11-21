import type { Post } from "../types";
import { toAssetUrl } from "./paths";
import {
  coercePublished,
  parseFrontMatter,
  fetchText,
  fetchJSON,
} from "./helpers";

function sourceFromUrl(u?: string): "medium" | "external" | "local" {
  if (!u) return "local";
  try {
    const host = new URL(u).hostname.toLowerCase();
    return host.includes("medium.com") ? "medium" : "external";
  } catch {
    return "external";
  }
}

function normalizePost(p: Partial<Post>): Post {
  const slug =
    p.slug ||
    (p.title
      ? p.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
      : crypto.randomUUID());

  return {
    id: p.id || slug || crypto.randomUUID(),
    title: p.title || slug || "Untitled",
    slug,
    tags: Array.isArray(p.tags) ? p.tags : [],
    dateISO: (p as any).date || p.dateISO || new Date().toISOString(),
    published: coercePublished(p.published),
    content: p.content || "",
    source: p.source || sourceFromUrl(p.url),
    url: p.url,
  };
}

export async function loadPosts(): Promise<Post[]> {
  if (Array.isArray((window as any).__POSTS__)) {
    return (window as any).__POSTS__
      .map(normalizePost)
      .filter((p: Post) => p.published)
      .sort(
        (a: Post, b: Post) =>
          new Date(b.dateISO).getTime() -
          new Date(a.dateISO).getTime()
      );
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
      } else if (item.url) {
        // url-only link-post
        out.push(
          normalizePost({
            title: item.title,
            url: item.url,
            tags: item.tags,
            published: item.published !== false,
            dateISO: item.date || item.dateISO,
            slug: item.slug,
            source: item.source || sourceFromUrl(item.url),
            content: "",
          })
        );
      }
    }
    return out
      .filter((p) => p.published)
      .sort(
        (a, b) =>
          new Date(b.dateISO).getTime() -
          new Date(a.dateISO).getTime()
      );
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
  [...posts].sort(
    (a, b) =>
      new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
  );

export function pickFeaturedPost(posts: Post[]): Post | null {
  if (!posts?.length) return null;
  const flagged = posts.find((p) => p.published !== false);
  if (flagged) return flagged;
  const tagged = posts.find(
    (p) =>
      p.published !== false &&
      (p.tags || []).some(
        (t) => t.toLowerCase() === "featured"
      )
  );
  const publishedSorted = [...posts]
    .filter((p) => p.published !== false)
    .sort(
      (a, b) =>
        new Date(b.dateISO).getTime() -
        new Date(a.dateISO).getTime()
    );
  return tagged || publishedSorted[0] || null;
}

// keep your mermaid helpers here unchanged:
// ensureMermaid, upgradeMermaidBlocks, renderMermaid...


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


// --- Advent-specific bits ---
