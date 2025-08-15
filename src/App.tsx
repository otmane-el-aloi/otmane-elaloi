/// <reference types="vite/client" />
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Github,
  Linkedin,
  Mail,
  Moon,
  Sun,
  ExternalLink,
  Calendar,
  Tag as TagIcon,
  ArrowRight,
  Download,
  Search,
  ChevronLeft,
  CheckCircle2,
  Database,
  Workflow,
  Rocket,
  Award,
  BookOpen,
  Home,
} from "lucide-react";

/* =============================
   Types
============================= */
interface Socials { github?: string; linkedin?: string; twitter?: string }
interface Profile { name: string; title: string; location?: string; headline: string; email: string; socials: Socials; resumeUrl?: string }
interface Skill { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; notes: string }
interface Cert { name: string; issuer: string; date: string; credentialUrl?: string; logo?: string }
interface Post { id: string; title: string; slug: string; tags: string[]; dateISO: string; published: boolean; content: string}
interface Project { title: string; summary: string; stack: string[]; link?: string }
type RouteName = "home" | "blog" | "post";
interface Route { name: RouteName; params?: { slug?: string } }

declare global {
  interface Window {
    __POSTS__?: Array<Partial<Post>>;
    __BASE__?: string;
  }
}

/* =============================
   CONFIG
============================= */
const PROFILE: Profile = {
  name: "Otmane EL ALOI",
  title: "Data Guy",
  location: "Paris, FR",
  headline:
    "Hi 👋, I am a Senior data engineer delivering reliable, scalable, cost-efficient data platforms across industries. My core focus is data engineering, with a background in data science & MLOps—and I’m currently learning something new.",
  email: "elaloi.otmane@gmail.com",
  socials: {
    github: "https://github.com/otmane-el-aloi",
    linkedin: "https://www.linkedin.com/in/otmane-elaloi/",
    twitter: "",
  },
  resumeUrl: "#",
};

const SKILLS: Skill[] = [
  { icon: Database, label: "Data Architecture & Modeling", notes: "Dimensional · Lakehouse · Data Contracts" },
  { icon: Workflow, label: "Batch & Streaming Pipelines", notes: "Idempotency · Exactly-once · Backfills" },
  { icon: Workflow, label: "Reliability & Orchestration", notes: "SLAs/SLOs · Retries · Backpressure" },
  { icon: CheckCircle2, label: "Data Quality & Testing", notes: "Assertions · Freshness · Lineage" },
  { icon: Rocket, label: "Cost & Performance", notes: "Clusters sizing · File layout · Query optimization" },
  { icon: Award, label: "Governance & Security", notes: "Access models · Privacy · Auditing" },
];

const CERTS: Cert[] = [
  {
    name: "Microsoft Certified: Azure Data Engineer Associate (DP-203)",
    issuer: "Microsoft",
    date: "2024-01-01",
    credentialUrl: "https://www.credly.com/badges/ceeeec1c-7365-4f2c-9115-a0a80e1cd68e/linked_in_profile",
    logo: "",
  },
  {
    name: "Microsoft Certified: Data Scientist Associate (DP-100)",
    issuer: "Microsoft",
    date: "2023-01-01",
    credentialUrl: "https://www.credly.com/badges/882b7bee-0b47-43e6-979f-195f73be5c0d/linked_in_profile",
    logo: "",
  },
  {
    name: "Databricks Certified Data Engineer Associate",
    issuer: "Databricks",
    date: "2023-01-01",
    credentialUrl: "https://credentials.databricks.com/14f726cd-2a98-483c-9e55-720345530281",
    logo: "",
  },
];

const SELECTED_WORK: Project[] = [
  {
    title: "La Poste · Finance — Spark/Scala pipelines",
    summary:
      "Migrated & optimized batch data platform. Spark/Scala jobs cut from ~5h to ~30m. Reworked Airflow orchestration for visibility & flexibility. Moved workloads to Cloudera Data Engineering on Kubernetes.",
    stack: ["Spark (Scala)", "Airflow", "Cloudera", "Kubernetes"],
  },
  {
    title: "Daher · Avion — Event-Driven on Azure",
    summary:
      "Reduced Azure data platform cost by ~10×. Stabilized ops with monitoring/logging dashboards. ETL on Databricks 3× faster. Ported ~150 flight-performance algos from Python to PySpark. Set up Dev/Qual/Prod and CI/CD.",
    stack: ["Azure", "Databricks", "PySpark", "Azure DevOps"],
  },
  {
    title: "AS24 — Serverless BI for Jira",
    summary:
      "Designed a serverless solution on Azure for tracking Jira support activity (run ~$5/month). Built Functions (time/blob/durable), Azure SQL model, and Power BI dashboards. IaC with Terraform + Azure DevOps.",
    stack: ["Azure Functions", "Azure SQL", "Power BI", "Terraform"],
  },
];

const SIDE_PROJECTS: Project[] = [
  {
    title: "Lakehouse TPC-DS Benchmark on Databricks",
    summary:
      "Benchmarked TPC-DS 1TB dataset on Databricks Photon vs standard Spark runtime. Tuned Delta caching, Z-Ordering, and file compaction for max throughput.",
    stack: ["Databricks", "Delta Lake", "Spark SQL", "Photon", "dbt"],
    link: "https://github.com/otmane-el-aloi/lakehouse-tpcds-benchmark",
  },
  {
    title: "Open-source Airflow DAG Templates for Medallion Architecture",
    summary:
      "Created a ready-to-use Airflow DAG library for Bronze → Silver → Gold pipelines with data quality checks and lineage.",
    stack: ["Airflow", "Great Expectations", "Spark", "Delta Lake"],
    link: "https://github.com/otmane-el-aloi/airflow-medallion-dags",
  },
  {
    title: "dbt + Spark CI/CD Pipeline",
    summary:
      "Automated dbt runs on Spark clusters with GitHub Actions. Includes slim CI, docs hosting, and test artifacts publishing.",
    stack: ["dbt", "Spark", "GitHub Actions", "Databricks CLI"],
    link: "https://github.com/otmane-el-aloi/dbt-spark-ci-cd",
  },
];

/* =============================
   PATH UTILS — handle GH Pages base
============================= */
function getBase(): string {
  try {
    const base = (import.meta as any)?.env?.BASE_URL as string | undefined;
    if (typeof base === "string" && base.length) return base;
  } catch { }
  if (typeof window !== "undefined" && typeof window.__BASE__ === "string") return window.__BASE__!;
  return "/";
}

function toAssetUrl(p?: string): string {
  if (!p) return "";
  if (/^(?:https?:)?\/\//i.test(p)) return p;
  const rel = p.startsWith("/") ? p.slice(1) : p;
  return getBase() + rel;
}

/* =============================
   BLOG LOADING (Vite-free, GH Pages-safe)
============================= */
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

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchJSON<T = any>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** published semantics */
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
    content: p.content || ""
  };
}

async function loadPosts(): Promise<Post[]> {
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

  return [
    normalizePost({
      title: "Hello, World (Sample Post)",
      slug: "hello-world",
      tags: ["Demo"],
      content:
        `# Welcome!\n\nAdd Markdown files under **/posts** and an optional **/posts/index.json** manifest.\n\nImages: place files in **/images/posts/hello-world/** and reference as:\n\n![Sample](/images/posts/hello-world/sample.png)`,
      published: true,
      dateISO: "1970-01-01",
    }),
  ];
}

function sortByDateDesc(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
}

/* =============================
   Theme (Light/Dark)
============================= */
const THEME_KEY = "ade_theme";
type Theme = "light" | "dark";

function useTheme(): [Theme, React.Dispatch<React.SetStateAction<Theme>>] {
  const getInitial = (): Theme => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null;
      if (saved === "light" || saved === "dark") return saved;
    } catch { }
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  };

  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    (root.style as any).colorScheme = isDark ? "dark" : "light";
    try { localStorage.setItem(THEME_KEY, theme); } catch { }
  }, [theme]);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;
    const onChange = () => {
      try {
        const saved = localStorage.getItem(THEME_KEY) as Theme | null;
        if (saved === "light" || saved === "dark") return;
      } catch { }
      setTheme(mql.matches ? "dark" : "light");
    };
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return [theme, setTheme];
}

function formatMonth(dateISO: string): string {
  try {
    return new Date(dateISO).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  } catch {
    return dateISO;
  }
}

/* =============================
   Framer Motion helpers
============================= */
const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const listContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* =============================
   UI Primitives (blue accents only)
============================= */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/30 dark:text-blue-200">
      {children}
    </span>
  );
}

/* Polymorphic Button */
type AnchorProps = React.ComponentPropsWithoutRef<"a">;
type NativeButtonProps = React.ComponentPropsWithoutRef<"button">;
type ButtonProps = {
  as?: "a" | "button" | React.ElementType;
  className?: string;
  children?: React.ReactNode;
} & Partial<AnchorProps & NativeButtonProps>;

function Button({ as: Comp = "button", className = "", children, ...props }: ButtonProps) {
  const Component: any = Comp;
  return (
    <Component
      className={
        "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium shadow-sm transition " +
        "bg-blue-600 text-white hover:bg-blue-700 border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 dark:border-blue-800 " +
        className
      }
      {...(props as any)}
    >
      {children}
    </Component>
  );
}

function Section({
  id, title, kicker, children,
}: { id?: string; title: string; kicker?: string; children?: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      className="mx-auto max-w-6xl px-4 py-12 sm:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
    >
      <div className="mb-8">
        {kicker && (
          <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {kicker}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

/* =============================
   Blog Components (read-only)
============================= */
function BlogList({
  posts, onOpen, query, setQuery, loading,
}: { posts: Post[]; onOpen: (p: Post) => void; query: string; setQuery: (q: string) => void; loading: boolean }) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) =>
        !q
          ? true
          : p.title.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      )
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }, [posts, query]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2 dark:border-neutral-800">
          <Search className="h-4 w-4" />
          <input
            placeholder="Search title or tag…"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            className="w-64 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {loading && (
        <div className="mb-4 text-sm text-neutral-500">Loading posts…</div>
      )}

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={listContainer}
      >
        {filtered.map((p) => (
          <motion.article
            key={p.id}
            className="rounded-2xl border p-4 transition hover:shadow dark:border-neutral-800"
            variants={listItem}
          >
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <time>{new Date(p.dateISO).toLocaleDateString()}</time>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Published</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
            <div className="mb-4 flex flex-wrap gap-2">
              {(p.tags || []).map((t) => (
                <Badge key={t}>
                  <TagIcon className="mr-1 h-3 w-3" /> {t}
                </Badge>
              ))}
            </div>
            <Button onClick={() => onOpen(p)}>
              Read <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.article>
        ))}
      </motion.div>

      {!loading && filtered.length === 0 && (
        <div className="mt-8 text-center text-sm text-neutral-500">No posts found.</div>
      )}
    </div>
  );
}

function BlogPost({ post, onBack }: { post: Post; onBack: () => void }) {
  return (
    <article className="prose max-w-none dark:prose-invert">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm">
        <ChevronLeft className="h-4 w-4" /> Back to blog
      </button>
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <time className="inline-flex items-center gap-1">
          <Calendar className="h-4 w-4" /> {new Date(post.dateISO).toLocaleDateString()}
        </time>
        <span>·</span>
        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((t) => (
            <Badge key={t}>
              <TagIcon className="mr-1 h-3 w-3" /> {t}
            </Badge>
          ))}
        </div>
      </div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
            const src = toAssetUrl(props.src || "");
            return (
              <img
                {...props}
                src={src}
                className="my-4 w-full rounded-xl border dark:border-neutral-800"
                loading="lazy"
              />
            );
          },
          a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a {...props} className="underline underline-offset-4" target="_blank" rel="noreferrer" />
          ),
        } as any}
      >
        {post.content}
      </ReactMarkdown>
    </article>
  );
}

function BlogCinemaBanner({
  posts,
  onPick,
  show = true,
}: {
  posts: Post[];
  onPick: (slug: string) => void;
  show?: boolean;
}) {
  if (!show || !posts?.length) return null;

  return (
    <>
      <style>{`
        @keyframes ticker-rtl {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .ticker:hover .ticker-content {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="
          ticker fixed inset-x-0 bottom-0 z-50
          w-full border-t border-neutral-800
          bg-black text-white
          shadow-[0_-6px_20px_rgba(0,0,0,0.4)]
          overflow-hidden flex items-center
        "
        style={{ height: "40px" }}
      >
        <div
          className="ticker-content flex items-center gap-4"
          style={{
            width: "max-content",
            animation: "ticker-rtl 30s linear infinite",
          }}
        >
          {[...posts].map((p, idx) => (
            <React.Fragment key={`${p.id}-${idx}`}>
              <button
                onClick={() => onPick(p.slug)}
                className="
                  px-4 py-1
                  uppercase font-mono tracking-[0.18em]
                  text-[11px] md:text-[12px]
                  text-white/90 hover:text-white
                  transition-colors
                "
              >
                {p.title.toUpperCase()}
              </button>
              <span
                aria-hidden="true"
                className="select-none text-white/40"
              >
                •
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}



function pickFeaturedPost(posts: Post[]): Post | null {
  if (!posts?.length) return null;
  const tagged = posts.find((p) => (p.tags || []).some(t => t.toLowerCase() === "featured"));
  return tagged || posts[0];
}

function BlogSpotlight({
  posts,
  onOpen,
}: {
  posts: Post[];
  onOpen: (p: Post) => void;
}) {
  if (!posts?.length) return null;

  const featured = pickFeaturedPost(posts)!;
  const recent = posts
    .filter((p) => p.id !== featured.id)
    .slice(0, 3);

  return (
    <section
      id="blog-spotlight"
      className="
        relative mx-auto mt-4 max-w-6xl overflow-hidden rounded-2xl border
        bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-900
        dark:border-neutral-800
      "
    >
      {/* animated glow accent */}
      <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 [mask-image:radial-gradient(55%_40%_at_30%_30%,black,transparent)]">
        <div className="h-full w-full animate-pulse bg-[radial-gradient(1000px_300px_at_0%_0%,rgba(37,99,235,0.15),transparent_60%)]" />
      </div>

      <div className="relative grid gap-0 p-6 md:grid-cols-[2fr,1fr] md:p-8">
        {/* Left: Featured card */}
        <div className="flex flex-col justify-between rounded-xl border bg-black/30 p-5 dark:border-neutral-800">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400/90">
            <BookOpen className="h-4 w-4" />
            From the blog
          </div>

          <h3 className="mb-3 text-2xl font-bold sm:text-3xl">{featured.title}</h3>

          <div className="mb-4 flex flex-wrap gap-2">
            {(featured.tags || []).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-blue-300/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-200"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-2 text-xs text-neutral-400">
            {new Date(featured.dateISO).toLocaleDateString()}
          </div>

          <div className="mt-5">
            <button
              onClick={() => onOpen(featured)}
              className="
                inline-flex items-center gap-2 rounded-lg border border-blue-400/30
                bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-200
                transition hover:bg-blue-600/25
              "
            >
              Read featured
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Recent list */}
        <div className="mt-6 space-y-3 md:mt-0 md:pl-6">
          {recent.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="
                group block w-full rounded-xl border p-4 text-left transition
                hover:bg-white/5 dark:border-neutral-800
              "
            >
              <div className="mb-1 text-[11px] uppercase tracking-wider text-neutral-400">
                {new Date(p.dateISO).toLocaleDateString()}
              </div>
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-white">
                  {p.title}
                </h4>
                <ArrowRight className="mt-0.5 h-4 w-4 text-blue-300/70 group-hover:text-blue-300" />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(p.tags || []).slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}

          {/* CTA to view all */}
          <div className="pt-1">
            <a
              href="#blog"
              onClick={(e) => {
                e.preventDefault();
                // send user to the blog route; your navigate() exists in App
                const el = document.getElementById("blog-spotlight");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 text-sm text-blue-300 underline-offset-4 hover:underline"
            >
              Explore all posts
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
/* =============================
   Main App
============================= */
export default function App(): React.ReactElement {
  const [theme, setTheme] = useTheme();
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    (async () => {
      const loaded = await loadPosts();
      setPosts(sortByDateDesc(loaded));
      setLoading(false);
    })();
  }, []);

  const latestPosts = useMemo(() => posts.slice(0, 3), [posts]);

  function navigate(name: RouteName, params?: Route["params"]) {
    setRoute({ name, params });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const currentPost = useMemo(() => {
    if (route.name !== "post") return null;
    const slug = route.params?.slug;
    return posts.find((p) => p.slug === slug) || null;
  }, [route, posts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900 dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-50">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate("home")} className="flex items-center gap-2 text-sm font-semibold">
            <Rocket className="h-5 w-5" /> {PROFILE.name || "Your Name"}
          </button>
          <nav className="hidden gap-6 sm:flex">
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                navigate("home");
                setTimeout(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }), 0);
              }}
              className="text-sm"
            >
              Collaborate
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                navigate("home");
                setTimeout(() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }), 0);
              }}
              className="text-sm"
            >
              Projects
            </a>
            <a
              href="#certs"
              onClick={(e) => {
                e.preventDefault();
                navigate("home");
                setTimeout(() => document.getElementById("certs")?.scrollIntoView({ behavior: "smooth" }), 0);
              }}
              className="text-sm"
            >
              Certifications
            </a>
            <a
              href="#blog"
              onClick={(e) => {
                e.preventDefault();
                navigate("blog");
              }}
              className="text-sm"
            >
              Blog
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                navigate("home");
                setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 0);
              }}
              className="text-sm"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {PROFILE.resumeUrl && PROFILE.resumeUrl !== "#" && (
              <Button as="a" href={PROFILE.resumeUrl} target="_blank" rel="noreferrer" className="bg-white text-blue-700 hover:bg-blue-50 border-blue-200">
                <Download className="h-4 w-4" /> Resume
              </Button>
            )}
            <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="bg-white text-blue-700 hover:bg-blue-50 border-blue-200">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Floating blog “cinema bars” banner */}
      <BlogCinemaBanner
        posts={posts}
        onPick={(slug) => navigate("post", { slug })}
        show={route.name !== "post"}
      />


      {/* HERO / HOME */}
      {route.name === "home" && (
        <main>
          <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:py-20">
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl font-bold sm:text-5xl">
              {PROFILE.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="max-w-2xl text-neutral-600 dark:text-neutral-300">
              {PROFILE.headline}
            </motion.p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button as="a" href={`mailto:${PROFILE.email}`}>
                <Mail className="h-4 w-4" /> Contact me
              </Button>
              <Button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                Let's collaborate <ArrowRight className="h-4 w-4" />
              </Button>
              <a href={PROFILE.socials.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a href={PROFILE.socials.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          </section>

           <BlogSpotlight
            posts={posts}
            onOpen={(p) => navigate("post", { slug: p.slug })}
          />

          <Section id="skills" title="Core Skills" kicker="Principles & capabilities">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {SKILLS.map(({ icon: Icon, label, notes }) => (
                <motion.div key={label} className="rounded-2xl border p-4 transition hover:shadow dark:border-neutral-800" variants={listItem}>
                  <div className="mb-1 inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-5 w-5" /> {label}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{notes}</div>
                </motion.div>
              ))}
            </motion.div>
          </Section>

          <Section id="services" title="Let’s collaborate" kicker="Open to new data challenges">
            <motion.div
              className="rounded-2xl border p-6 dark:border-neutral-800"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={sectionVariants}
            >
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                I’m open to exchange about data topics and to take on new challenges. If you have an idea, a tricky issue, or you just want a second pair of eyes—let’s talk.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <Badge key={s.label}>{s.label}</Badge>
                ))}
              </div>
              <div className="mt-4">
                <Button as="a" href={`mailto:${PROFILE.email}?subject=${encodeURIComponent("Collaboration inquiry")}`}>
                  Reach out <Mail className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </Section>

          <Section id="projects" title="Selected Work" kicker="Real-world impact">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {SELECTED_WORK.map((c) => (
                <motion.div key={c.title} className="rounded-2xl border p-4 dark:border-neutral-800" variants={listItem}>
                  <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
                  <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">{c.summary}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {c.stack.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  {c.link && (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
                    >
                      View details <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </Section>

          <Section id="side-projects" title="Side Projects" kicker="Exploration & Open Source">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {SIDE_PROJECTS.map((p) => (
                <motion.div key={p.title} className="rounded-2xl border p-4 dark:border-neutral-800" variants={listItem}>
                  <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
                  <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">{p.summary}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
                    >
                      View on GitHub <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </Section>

          <Section id="certs" title="Certifications" kicker="Validated expertise">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {CERTS.map((c) => (
                <motion.div key={c.name} className="rounded-2xl border p-5 dark:border-neutral-800" variants={listItem}>
                  <div className="mb-3 flex items-center gap-3">
                    {c.logo && <img src={c.logo} alt={c.issuer} className="h-10 w-10 rounded" />}
                    <div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{c.issuer}</div>
                      <h3 className="text-base font-semibold">{c.name}</h3>
                    </div>
                  </div>
                  <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">Issued {formatMonth(c.date)}</div>
                  <div className="flex items-center gap-2">
                    <Button as="a" href={c.credentialUrl} target="_blank" rel="noreferrer">
                      Verify credential <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Badge>
                      <Award className="mr-1 h-3 w-3" /> {c.issuer}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Section>

          <Section id="latest" title="Latest writing" kicker="From the blog">
            <motion.div
              className="grid gap-4 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {latestPosts.map((p) => (
                <motion.article key={p.id} className="rounded-2xl border p-4 transition hover:shadow dark:border-neutral-800" variants={listItem}>
                  <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(p.tags || []).map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                  <Button onClick={() => navigate("post", { slug: p.slug })}>
                    Read <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.article>
              ))}
            </motion.div>
            <div className="mt-6">
              <Button onClick={() => navigate("blog")}>Visit the blog</Button>
            </div>
          </Section>

          <Section id="contact" title="Contact" kicker="Let’s work together">
            <motion.div
              className="grid gap-6 md:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              <motion.div className="rounded-2xl border p-6 dark:border-neutral-800" variants={listItem}>
                <h3 className="mb-2 text-lg font-semibold">Get in touch</h3>
                <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
                  Send a quick note about your data stack and goals. I’ll reply within 24h.
                </p>
                <div className="flex flex-col gap-3 text-sm">
                  <a href={`mailto:${PROFILE.email}`} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                    <Mail className="h-4 w-4" /> {PROFILE.email}
                  </a>
                  <a href={PROFILE.socials.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                  <a href={PROFILE.socials.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                </div>
              </motion.div>

              <motion.div className="rounded-2xl border p-6 dark:border-neutral-800" variants={listItem}>
                <h3 className="mb-2 text-lg font-semibold">Typical stack</h3>
                <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                  <li>Azure: ADLS, Databricks, Functions/ADF, Synapse</li>
                  <li>Spark (Scala/PySpark) with Airflow orchestration</li>
                  <li>dbt for transforms + tests + docs</li>
                  <li>Power BI for BI/semantic models</li>
                  <li>Terraform + Azure DevOps for IaC/CI/CD</li>
                </ul>
              </motion.div>
            </motion.div>
          </Section>
        </main>
      )}

      {/* BLOG ROUTES */}
      {route.name === "blog" && (
        <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="" />
              <h1 className="text-2xl sm:text-3xl font-bold"> Blog</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate("home")}> <Home className="h-4 w-4" /> Home</Button>
            </div>
          </div>

          <BlogList
            posts={posts}
            onOpen={(p) => navigate("post", { slug: p.slug })}
            query={query}
            setQuery={setQuery}
            loading={loading}
          />
        </main>
      )}

      {route.name === "post" && currentPost && (
        <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <div className="mb-4 flex items-center gap-2">
            <Button onClick={() => navigate("blog")}>Back</Button>
          </div>
          <BlogPost post={currentPost} onBack={() => navigate("blog")} />
        </main>
      )}

      {/* FOOTER */}
      <footer className="mt-16 border-t py-8 text-center text-sm text-neutral-500 dark:border-neutral-900">
        <div className="mx-auto max-w-6xl px-4">
          © 2020 - {new Date().getFullYear()} {PROFILE.name || ""} · Data Realm · ❤️
        </div>
      </footer>
    </div>
  );
}
