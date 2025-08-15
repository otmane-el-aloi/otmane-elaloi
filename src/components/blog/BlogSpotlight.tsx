import { ArrowRight, BookOpen } from "lucide-react";
import type { Post } from "../../types";
import { pickFeaturedPost } from "../../lib/blog";

export default function BlogSpotlight({
  posts,
  onOpen,
  onViewAll,
  recentLimit = 3,
}: {
  posts: Post[];
  onOpen: (p: Post) => void;
  onViewAll?: () => void;
  recentLimit?: number;
}) {
  const published = (posts || []).filter((p) => p.published !== false);
  if (!published.length) return null;

  const featured = pickFeaturedPost(published);
  if (!featured) return null;

  const recent = published
    .filter((p) => p.id !== featured.id)
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
    .slice(0, recentLimit);

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

      <div className="relative grid gap-0 p-6 md:grid-cols-[2fr,1fr] md:p-8">
        {/* Left: Featured card */}
        <div
          className="
            flex flex-col justify-between rounded-xl border p-5
            bg-white/60 border-neutral-200
            dark:bg-black/30 dark:border-neutral-800
          "
        >
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400/90">
            <BookOpen className="h-4 w-4" />
            From the blog
          </div>

          <h3 className="mb-3 text-2xl font-bold sm:text-3xl text-neutral-900 dark:text-neutral-50">
            {featured.title}
          </h3>

          {!!featured.tags?.length && (
            <div className="mb-4 flex flex-wrap gap-2">
              {featured.tags.map((t) => (
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

          <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
            {new Date(featured.dateISO).toLocaleDateString()}
          </div>

          <div className="mt-5">
            <button
              onClick={() => onOpen(featured)}
              className="
                inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition
                border-blue-600/30 bg-blue-600/10 text-blue-700 hover:bg-blue-600/15
                dark:border-blue-400/30 dark:bg-blue-600/15 dark:text-blue-200 dark:hover:bg-blue-600/25
              "
            >
              Read featured
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Recent list */}
        {recent.length > 0 && (
          <div className="mt-6 space-y-3 md:mt-0 md:pl-6">
            {recent.map((p) => (
              <button
                key={p.id}
                onClick={() => onOpen(p)}
                className="
                  group block w-full rounded-xl border p-4 text-left transition
                  border-neutral-200 hover:bg-black/5
                  dark:border-neutral-800 dark:hover:bg-white/5
                "
              >
                <div className="mb-1 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {new Date(p.dateISO).toLocaleDateString()}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black dark:text-neutral-100 dark:group-hover:text-white">
                    {p.title}
                  </h4>
                  <ArrowRight className="mt-0.5 h-4 w-4 text-blue-600/70 group-hover:text-blue-600 dark:text-blue-300/70 dark:group-hover:text-blue-300" />
                </div>
                {!!p.tags?.length && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="
                          inline-flex items-center rounded-full px-2 py-0.5 text-[10px]
                          border border-neutral-300 text-neutral-700
                          dark:border-neutral-700 dark:text-neutral-300
                        "
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}

            <div className="pt-1">
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
          </div>
        )}
      </div>
    </section>
  );
}
