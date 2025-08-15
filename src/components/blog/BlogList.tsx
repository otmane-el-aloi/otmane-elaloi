import React, { useMemo } from "react";
import { ArrowRight, CheckCircle2, Search, Tag as TagIcon } from "lucide-react";
import type { Post } from "../../types";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { motion } from "framer-motion";
import { listContainer, listItem } from "../../lib/motion";

export default function BlogList({
  posts, onOpen, query, setQuery, loading,
}: { posts: Post[]; onOpen: (p: Post) => void; query: string; setQuery: (q: string) => void; loading: boolean }) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => !q ? true : p.title.toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q)))
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

      {loading && <div className="mb-4 text-sm text-neutral-500">Loading posts…</div>}

      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={listContainer}>
        {filtered.map((p) => (
          <motion.article key={p.id} className="rounded-2xl border p-4 transition hover:shadow dark:border-neutral-800" variants={listItem}>
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
