/// <reference types="vite/client" />
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadAdventProblems, findAdventProblemByDay } from "../lib/advent";
import type { AdventProblem } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Calendar,
  ChevronLeft,
  Tag as TagIcon,
  Lock as LockIcon,
} from "lucide-react";

const ADVENT_YEAR = 2025;
const ADVENT_MONTH = 11; // 0-based: 11 = December

export default function AdventProblemPage() {
  const { day } = useParams();
  const navigate = useNavigate();

  const [problems, setProblems] = useState<AdventProblem[] | null>(null);

  useEffect(() => {
    loadAdventProblems().then(setProblems);
  }, []);

  if (!problems) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        Loading…
      </main>
    );
  }

  const d = parseInt(day || "", 10);
  const p = findAdventProblemByDay(problems, d);

  const unlockDate =
    !Number.isNaN(d) && d >= 1 && d <= 25
      ? new Date(Date.UTC(ADVENT_YEAR, ADVENT_MONTH, d))
      : null;

  const unlocked = !!unlockDate && unlockDate <= new Date();

  // Not found
  if (!p) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <button
          onClick={() => navigate("/advent")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to calendar
        </button>
        <h1 className="text-xl font-semibold">Problem not found</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          The challenge you’re looking for doesn’t exist or hasn’t been
          published yet.
        </p>
      </main>
    );
  }

  // Locked state
  if (!unlocked) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 flex flex-col items-center text-center">
        <button
          onClick={() => navigate("/advent")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to calendar
        </button>

        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <LockIcon className="h-7 w-7 text-neutral-500" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">
          This problem is still locked
        </h1>

        <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          Day {d} unlocks at <strong>00:00 UTC</strong> on{" "}
          {unlockDate?.toUTCString().slice(0, 16)}.{" "}
          Check back then to unwrap this challenge.
        </p>
      </main>
    );
  }

  const displayDate = unlockDate
    ? unlockDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // Prefer a specific markdown field if present; otherwise fall back to content
  const markdownContent = (p as any).markdown ?? (p as any).content ?? "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article className="prose max-w-none dark:prose-invert">
        {/* Back button */}
        <button
          onClick={() => navigate("/advent")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ChevronLeft className="h-4 w-4" /> Back to calendar
        </button>

        {/* Title */}
        <h1 className="mb-2 text-3xl font-bold">
          Day {p.day} — {p.title}
        </h1>

        {/* Meta row */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          {displayDate && (
            <time className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {displayDate}
            </time>
          )}
          {p.difficulty && (
            <>
              <span>·</span>
              <span className="text-xs rounded-full border border-neutral-300 px-2 py-0.5 uppercase tracking-wide dark:border-neutral-700">
                Difficulty: {p.difficulty}
              </span>
            </>
          )}
          {p.tags?.length ? (
            <>
              <span>·</span>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <TagIcon className="h-3 w-3" /> {t}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Markdown body */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: (props) => (
              <a
                {...props}
                className="underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              />
            ),
            img: (props) => (
              <img
                {...props}
                className="my-4 w-full rounded-xl border dark:border-neutral-800"
                loading="lazy"
              />
            ),
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </article>
    </main>
  );
}