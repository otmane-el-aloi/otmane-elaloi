import { ArrowRight, BookOpen } from "lucide-react";
import type { Post } from "../../types";

function isFeatured(p: any): boolean {
  if (p?.published === false) return false;
  if (p?.featured === true) return true;
  return Array.isArray(p?.tags) && p.tags.some((t: string) => t?.toLowerCase() === "featured");
}

// is the post "new" (published within last 10 days)?
function isNew(p: any): boolean {
  const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
  const d = new Date(p?.dateISO ?? 0).getTime();
  if (!Number.isFinite(d)) return false;
  return Date.now() - d <= TEN_DAYS;
}

export default function BlogSpotlight({
  posts,
  onOpen,
  onViewAll,
  recentLimit = 3, // how many featured posts to show
}: {
  posts: Post[];
  onOpen: (p: Post) => void;
  onViewAll?: () => void;
  recentLimit?: number;
}) {
  const featuredList = (posts || [])
    .filter(isFeatured)
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
    .slice(0, Math.max(0, recentLimit || 3));

  if (!featuredList.length) return null;

  return (
    <section
      id="blog-spotlight"
      className="
        relative mx-auto mt-4 max-w-6xl overflow-hidden rounded-2xl border
        bg-gradient-to-br from-white via-neutral-50 to-neutral-50
        border-neutral-200
        dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900
        dark:border-neutral-800
      "
    >
      {/* animated glow accent */}
      <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 [mask-image:radial-gradient(55%_40%_at_30%_30%,black,transparent)]">
        <div className="h-full w-full animate-pulse bg-[radial-gradient(1000px_300px_at_0%_0%,rgba(37,99,235,0.15),transparent_60%)]" />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400/90">
          <BookOpen className="h-4 w-4" />
          Featured posts
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredList.map((p) => (
            <article
              key={p.id}
              className="
                relative flex flex-col justify-between rounded-xl border p-5
                bg-white/60 border-neutral-200
                dark:bg-black/30 dark:border-neutral-800
              "
            >
              {/* NEW badge for < 10 days old */}
              {isNew(p) && (
                <>
                  {/* corner NEW chip */}
                  <span
                    aria-label="New post"
                    className="
                      absolute -top-2 -right-2 z-10 select-none rounded-full bg-pink-600
                      px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg
                      ring-2 ring-white/60 dark:ring-black/40
                    "
                  >
                    New
                  </span>
                </>
              )}

              <div>
                <div className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                  {new Date(p.dateISO).toLocaleDateString()}
                </div>
                <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  {p.title}
                </h3>

                {!!p.tags?.length && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="
                          inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                          border border-blue-200 bg-blue-50 text-blue-700
                          dark:border-blue-300/20 dark:bg-blue-500/10 dark:text-blue-200
                        "
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => onOpen(p)}
                  className="
                    inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition
                    border-blue-600/30 bg-blue-600/10 text-blue-700 hover:bg-blue-600/15
                    dark:border-blue-400/30 dark:bg-blue-600/15 dark:text-blue-200 dark:hover:bg-blue-600/25
                  "
                >
                  Read <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {onViewAll && (
          <div className="mt-6">
            <a
              href="#blog"
              onClick={(e) => {
                e.preventDefault();
                onViewAll?.();
              }}
              className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline text-blue-700 dark:text-blue-300"
            >
              Explore all posts
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
